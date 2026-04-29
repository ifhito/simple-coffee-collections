/**
 * 合成サンプル fixture 画像を生成するスクリプト。
 * 著作権配慮で実コーヒーパッケージは使わず、SVG ベタ書きの架空ラベルを PNG 化する。
 *
 * 実行: pnpm tsx evals/fixtures/_generate-sample.ts
 * 出力: evals/fixtures/sample-001-ethiopia.png
 *      evals/fixtures/sample-002-french-roast.png
 */
import sharp from 'sharp'
import { join } from 'node:path'

const OUT_DIR = join(process.cwd(), 'evals', 'fixtures')

type Sample = {
  id: string
  bg: string
  ink: string
  lines: { y: number; size: number; weight?: 'normal' | 'bold'; text: string }[]
}

const samples: Sample[] = [
  {
    id: 'sample-001-ethiopia',
    bg: '#f4ead8',
    ink: '#2b1d10',
    lines: [
      { y: 110, size: 26, text: 'TEST COFFEE ROASTERS' },
      { y: 230, size: 64, weight: 'bold', text: 'ETHIOPIA' },
      { y: 300, size: 44, text: 'Yirgacheffe G1' },
      { y: 380, size: 28, text: 'Washed Process' },
      { y: 470, size: 36, weight: 'bold', text: '中煎り / Medium' },
      { y: 700, size: 22, text: '架空のテスト用パッケージ' },
      { y: 730, size: 18, text: '123 Sample St, Test City' },
    ],
  },
  {
    id: 'sample-002-french-roast',
    bg: '#1f1812',
    ink: '#f1e6d4',
    lines: [
      { y: 110, size: 26, text: 'KOBAN FAKE COFFEE' },
      { y: 230, size: 60, weight: 'bold', text: 'COLOMBIA' },
      { y: 300, size: 44, text: 'Huila Supremo' },
      { y: 380, size: 28, text: 'Natural Process' },
      { y: 470, size: 36, weight: 'bold', text: 'フレンチ / French Roast' },
      { y: 700, size: 22, text: '架空のテスト用パッケージ' },
    ],
  },
]

function buildSvg(s: Sample): string {
  const text = s.lines
    .map(
      (l) =>
        `<text x="50" y="${l.y}" font-family="Helvetica, Arial, sans-serif" font-size="${l.size}" font-weight="${l.weight ?? 'normal'}" fill="${s.ink}">${l.text}</text>`
    )
    .join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="${s.bg}"/>
  ${text}
</svg>`
}

async function main() {
  for (const s of samples) {
    const out = join(OUT_DIR, `${s.id}.png`)
    await sharp(Buffer.from(buildSvg(s))).png().toFile(out)
    console.log(`generated: ${out}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
