import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor, LlmModelFactory, OcrExecutor } from '@/lib/application/ports'
import type { OcrExtractedData } from './dto'

export type OcrCoffeeBeanResult =
  | { success: true; data: OcrExtractedData }
  | { error: string }

export class OcrCoffeeBeanUseCase {
  constructor(
    private readonly repo: UserLlmSettingsRepository,
    private readonly encryptor: ApiKeyEncryptor,
    private readonly llmModelFactory: LlmModelFactory,
    private readonly ocrExecutor: OcrExecutor
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

    // 3. Create LLM model + run OCR
    const model = this.llmModelFactory.createFromUserSettings(entity, decryptedApiKey)
    return this.ocrExecutor.execute(model, imageBuffer, mimeType)
  }
}
