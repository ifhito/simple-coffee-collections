import { generateObject } from 'ai'
import { createCoffeeOcrAgent, CoffeeOcrOutputSchema } from '@/lib/mastra/agents/coffee-ocr-agent'
import { createLlmModel } from '@/lib/infrastructure/llm/llm-provider-factory'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor } from '@/lib/infrastructure/crypto/api-key-encryptor.interface'
import type { OcrExtractedData } from './dto'

export type OcrCoffeeBeanResult =
  | { success: true; data: OcrExtractedData }
  | { error: string }

export class OcrCoffeeBeanUseCase {
  constructor(
    private readonly repo: UserLlmSettingsRepository,
    private readonly encryptor: ApiKeyEncryptor
  ) {}

  async execute(
    userId: string,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<OcrCoffeeBeanResult> {
    // 1. Load user's LLM settings
    const settingsResult = await this.repo.findByUserId(userId)
    if (!settingsResult.ok) {
      return { error: 'LLM設定の取得に失敗しました' }
    }
    if (!settingsResult.value) {
      return {
        error:
          'LLM設定が未設定です。プロフィールのAI設定からAPIキーを設定してください。',
      }
    }

    const entity = settingsResult.value

    // 2. Decrypt API key (Ollama doesn't need one)
    let decryptedApiKey = ''
    if (entity.hasApiKey && entity.encryptedApiKey) {
      try {
        decryptedApiKey = this.encryptor.decrypt(entity.encryptedApiKey)
      } catch {
        return { error: 'APIキーの復号に失敗しました' }
      }
    }

    // 3. Create LLM model + agent
    const model = createLlmModel(entity, decryptedApiKey)
    const agent = createCoffeeOcrAgent(model)

    // 4. Run OCR via structured output
    try {
      const instructions = await agent.getInstructions()

      const result = await generateObject({
        // Bridge Mastra model type to Vercel AI SDK LanguageModel at runtime
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
                // Pass binary data directly and include mediaType for model-side decoding.
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
}
