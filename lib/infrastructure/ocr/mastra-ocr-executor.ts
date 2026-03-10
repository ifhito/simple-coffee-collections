import { generateObject } from 'ai'
import type { OcrExecutor, OcrExecutionResult, OcrModel } from '@/lib/application/ports'
import { createCoffeeOcrAgent, CoffeeOcrOutputSchema } from '@/lib/mastra/agents/coffee-ocr-agent'

type MastraGenerateModel = Parameters<typeof generateObject>[0]['model']

export class MastraOcrExecutor implements OcrExecutor {
  async execute(
    model: OcrModel,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<OcrExecutionResult> {
    const agent = createCoffeeOcrAgent(model)

    try {
      const instructions = await agent.getInstructions()

      const result = await generateObject({
        model: agent.model as MastraGenerateModel,
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
        data: result.object,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'OCR処理中にエラーが発生しました'
      return { error: `OCR解析に失敗しました: ${message}` }
    }
  }
}
