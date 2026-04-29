import { generateObject } from 'ai'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CoffeeOcrOutput } from '@/lib/mastra/tools/coffee-ocr-tool'
import { judgeModel } from '../_shared/model'

export type Judgment = {
  criterionId: string
  pass: boolean
  reason: string
}

export type JudgeResult = {
  caseId: string
  judgments: Judgment[]
  overallPass: boolean
}

const JudgeOutputSchema = z.object({
  judgments: z.array(
    z.object({
      criterionId: z.string(),
      pass: z.boolean(),
      reason: z.string().min(1).max(300),
    })
  ),
})

let cachedCriteria: string | null = null
function loadCriteria(): string {
  if (cachedCriteria) return cachedCriteria
  cachedCriteria = readFileSync(
    join(process.cwd(), 'evals/criteria.md'),
    'utf-8'
  )
  return cachedCriteria
}

/**
 * LLM-as-judge.
 * Receives the model output and the criteria the case targets.
 * Does NOT receive the dataset's expected/gold output (leak prevention).
 */
export async function judge(args: {
  caseId: string
  scenario: string
  inputText: string
  modelOutput: CoffeeOcrOutput
  targetCriteria: string[]
}): Promise<JudgeResult> {
  const { caseId, scenario, inputText, modelOutput, targetCriteria } = args
  const criteriaDoc = loadCriteria()

  const result = await generateObject({
    model: judgeModel(),
    schema: JudgeOutputSchema,
    messages: [
      {
        role: 'system',
        content: [
          'あなたはコーヒーパッケージ OCR 出力の評価者です。',
          '以下の criteria.md に書かれた観点のうち、指定された criterionId のみについて、',
          '出力 JSON が観点を満たしているか pass/fail で判定し、1〜2 文の理由を述べてください。',
          '正解ラベルは渡されません。観点と入力テキストと出力 JSON のみで判断してください。',
          '',
          '## criteria.md',
          criteriaDoc,
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          `case_id: ${caseId}`,
          `scenario: ${scenario}`,
          `target_criteria: ${JSON.stringify(targetCriteria)}`,
          '',
          '## 入力テキスト（OCR で読まれた想定）',
          inputText || '(empty)',
          '',
          '## モデル出力 JSON',
          JSON.stringify(modelOutput, null, 2),
          '',
          'target_criteria の各 id について、pass / fail と理由を返してください。',
        ].join('\n'),
      },
    ],
  })

  const judgments = result.object.judgments.filter((j) =>
    targetCriteria.includes(j.criterionId)
  )

  return {
    caseId,
    judgments,
    overallPass:
      judgments.length === targetCriteria.length &&
      judgments.every((j) => j.pass),
  }
}
