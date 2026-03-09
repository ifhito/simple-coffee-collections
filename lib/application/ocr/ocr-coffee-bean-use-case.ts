import { createLlmModel } from '@/lib/infrastructure/llm/llm-provider-factory'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor } from '@/lib/infrastructure/crypto/api-key-encryptor.interface'
import type { OcrExtractedData } from './dto'
import { runCoffeeOcr } from './run-ocr'

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

    // 3. Create LLM model + run OCR
    const model = createLlmModel(entity, decryptedApiKey)
    return runCoffeeOcr(model, imageBuffer, mimeType)
  }
}
