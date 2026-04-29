import { generateObject } from 'ai'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { extname, join } from 'node:path'
import {
  CoffeeOcrOutputSchema,
  type CoffeeOcrOutput,
} from '@/lib/mastra/tools/coffee-ocr-tool'
import { judge, type JudgeResult } from '../judges/llm-judge'
import { targetModel, visionModel } from '../_shared/model'

type DatasetCase = {
  id: string
  scenario: string
  /** OCR 後テキストのマッピングを評価する text-mode のとき必須 */
  input_text?: string
  /** evals/ からの相対パス。指定すると image-mode で実 OCR を評価する */
  image_path?: string
  tags: string[]
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
}

function detectMime(path: string): string {
  return MIME_BY_EXT[extname(path).toLowerCase()] ?? 'application/octet-stream'
}

type CaseReport = {
  caseId: string
  scenario: string
  durationMs: number
  modelOutput: CoffeeOcrOutput | null
  judge: JudgeResult | null
  error: string | null
}

const CONCURRENCY = Number(process.env.EVAL_CONCURRENCY ?? 4)
const PASS_THRESHOLD = Number(process.env.EVAL_PASS_THRESHOLD ?? 0.9)

function loadDataset(): DatasetCase[] {
  const raw = readFileSync(join(process.cwd(), 'evals/dataset.jsonl'), 'utf-8')
  return raw
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as DatasetCase)
}

function loadSystemPrompt(): string {
  const path = join(process.cwd(), 'lib/mastra/prompts/coffee-ocr.md')
  const raw = readFileSync(path, 'utf-8')
  return raw.replace(
    '{{ROAST_LEVEL_GUIDE}}',
    'light, cinnamon, medium, high, city, full_city, french'
  )
}

async function generateForCase(c: DatasetCase): Promise<{ object: CoffeeOcrOutput; mode: 'text' | 'image' }> {
  if (c.image_path) {
    const imagePath = join(process.cwd(), 'evals', c.image_path)
    const buffer = readFileSync(imagePath)
    const { object } = await generateObject({
      model: visionModel(),
      schema: CoffeeOcrOutputSchema,
      messages: [
        { role: 'system', content: loadSystemPrompt() },
        {
          role: 'user',
          content: [
            {
              type: 'image' as const,
              image: new Uint8Array(buffer),
              mediaType: detectMime(c.image_path),
            },
            {
              type: 'text' as const,
              text: 'このコーヒーパッケージの画像から情報を抽出してください。',
            },
          ],
        },
      ],
    })
    return { object, mode: 'image' }
  }

  const { object } = await generateObject({
    model: targetModel(),
    schema: CoffeeOcrOutputSchema,
    messages: [
      { role: 'system', content: loadSystemPrompt() },
      {
        role: 'user',
        content: [
          'OCR でこのコーヒーパッケージから読み取られたテキストです。',
          'スキーマに沿って情報を抽出してください。',
          '',
          c.input_text ?? '(no text detected)',
        ].join('\n'),
      },
    ],
  })
  return { object, mode: 'text' }
}

async function runOne(c: DatasetCase): Promise<CaseReport> {
  const start = Date.now()
  try {
    const { object, mode } = await generateForCase(c)

    const judgement = await judge({
      caseId: c.id,
      scenario: c.scenario,
      inputText: c.input_text ?? `(image: ${c.image_path})`,
      modelOutput: object,
      targetCriteria: c.tags,
    })

    return {
      caseId: c.id,
      scenario: `${mode === 'image' ? '[image] ' : ''}${c.scenario}`,
      durationMs: Date.now() - start,
      modelOutput: object,
      judge: judgement,
      error: null,
    }
  } catch (err) {
    return {
      caseId: c.id,
      scenario: c.scenario,
      durationMs: Date.now() - start,
      modelOutput: null,
      judge: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function runInPool<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  size: number
): Promise<U[]> {
  const results: U[] = []
  let i = 0
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx])
    }
  })
  await Promise.all(workers)
  return results
}

function parseFlags() {
  const args = process.argv.slice(2)
  return {
    smoke: args.includes('--smoke'),
    only: args.find((a) => a.startsWith('--only='))?.replace('--only=', ''),
    tag: args.find((a) => a.startsWith('--tag='))?.replace('--tag=', ''),
  }
}

async function main() {
  const flags = parseFlags()
  let cases = loadDataset()
  if (flags.only) cases = cases.filter((c) => c.id === flags.only)
  if (flags.tag) cases = cases.filter((c) => c.tags.includes(flags.tag!))
  if (flags.smoke) cases = cases.slice(0, 3)

  if (cases.length === 0) {
    console.log('No cases match the filter. Exiting.')
    process.exit(0)
  }

  console.log(`Running ${cases.length} eval case(s) (concurrency=${CONCURRENCY})...`)
  const reports = await runInPool(cases, runOne, CONCURRENCY)

  const passed = reports.filter((r) => r.judge?.overallPass).length
  const errored = reports.filter((r) => r.error).length
  const total = reports.length
  const passRate = total > 0 ? passed / total : 0

  const outDir = join(process.cwd(), 'evals/reports')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = join(outDir, `report-${ts}.jsonl`)
  writeFileSync(outPath, reports.map((r) => JSON.stringify(r)).join('\n') + '\n')

  console.log('')
  console.log('## Eval Summary')
  console.log(`Total:    ${total}`)
  console.log(`Passed:   ${passed}`)
  console.log(`Errored:  ${errored}`)
  console.log(`Pass rate: ${(passRate * 100).toFixed(1)}% (threshold ${(PASS_THRESHOLD * 100).toFixed(0)}%)`)
  console.log(`Report:   ${outPath}`)

  for (const r of reports) {
    if (r.judge?.overallPass) continue
    console.log('')
    console.log(`❌ ${r.caseId} — ${r.scenario}`)
    if (r.error) {
      console.log(`   error: ${r.error}`)
      continue
    }
    for (const j of r.judge?.judgments ?? []) {
      const marker = j.pass ? '✅' : '❌'
      console.log(`   ${marker} ${j.criterionId}: ${j.reason}`)
    }
  }

  if (passRate < PASS_THRESHOLD) {
    console.error(`\nPass rate below threshold (${(PASS_THRESHOLD * 100).toFixed(0)}%). Failing.`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
