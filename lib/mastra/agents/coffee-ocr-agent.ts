import { Agent } from '@mastra/core/agent'
import type { AgentConfig } from '@mastra/core/agent'
import { CoffeeOcrOutputSchema, ROAST_LEVEL_VALUES } from '../tools/coffee-ocr-tool'

const ROAST_LEVEL_GUIDE = ROAST_LEVEL_VALUES.join(', ')

const SYSTEM_PROMPT = `あなたはコーヒーパッケージの画像解析の専門家です。
パッケージ画像から以下の情報を正確に抽出し、指定されたJSON形式で返してください。

## 抽出する情報
- **bean_name**: コーヒー豆の名前（例: エチオピア イルガチェフェ G1）
- **bean_type**: 産地・品種（例: エチオピア、アラビカ種）
- **roast_level**: 焙煎度。必ず以下のいずれかに正規化してください: ${ROAST_LEVEL_GUIDE}
  - 浅煎り → light
  - シナモン → cinnamon
  - 中煎り → medium
  - ハイ → high
  - シティ → city
  - フルシティ → full_city
  - フレンチ/イタリアン/極深煎り → french
- **shop_name**: ロースタリー名または販売店名
- **shop_address**: 住所（パッケージに記載がある場合のみ）
- **acidity**: 酸味の評価（1-10の整数。パッケージの記載や豆の特性から推定）
- **aroma**: 香りの評価（1-10の整数）
- **bitterness**: 苦味の評価（1-10の整数）
- **overall_rating**: 総合評価（1-10の整数）

## 評価スコアのガイドライン
- スコアは**必ず1-10の整数**で返してください
- パッケージに数値記載がある場合はそれを参考にしてください
- 記載がない場合は豆の特性・焙煎度から推定してください（推定値でOK）
- 情報が全くわからない場合はnullを返してください

## 注意事項
- 情報が読み取れない・不明な場合は null を返してください
- roast_level は必ず上記のリストの値に正規化してください
- 日本語・英語どちらの表記も対応してください`

type AgentModel = AgentConfig['model']

export function createCoffeeOcrAgent(model: AgentModel): Agent {
  return new Agent({
    id: 'coffee-ocr-agent',
    name: 'coffee-ocr-agent',
    instructions: SYSTEM_PROMPT,
    model,
  })
}

export { CoffeeOcrOutputSchema }
