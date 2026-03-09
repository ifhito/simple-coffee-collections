import { generateObject } from 'ai'
import { createCoffeeOcrAgent, CoffeeOcrOutputSchema } from '@/lib/mastra/agents/coffee-ocr-agent'
import type { AgentConfig } from '@mastra/core/agent'
import type { OcrExtractedData } from './dto'

type MastraModel = AgentConfig['model']

export type OcrCoffeeBeanResult =
  | { success: true; data: OcrExtractedData }
  | { error: string }

export async function runCoffeeOcr(
  model: MastraModel,
  imageBuffer: Buffer,
  mimeType: string
): Promise<OcrCoffeeBeanResult> {
  const agent = createCoffeeOcrAgent(model)

  try {
    const instructions = await agent.getInstructions()

    const result = await generateObject({
      model: agent.model as Parameters<typeof generateObject>[0]['model'],
      schema: CoffeeOcrOutputSchema,
      messages: [
        {
          role: 'system' as const,
          content: typeof instructions === 'string' ? instructions : '',
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'image' as const,
              image: new Uint8Array(imageBuffer),
              mediaType: mimeType,
            },
            {
              type: 'text' as const,
              text: 'このコーヒーパッケージの画像から情報を抽出してください。',
            },
          ],
        },
      ],
    })

    return {
      success: true,
      data: result.object as OcrExtractedData,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'OCR処理中にエラーが発生しました'
    return { error: `OCR解析に失敗しました: ${message}` }
  }
}
