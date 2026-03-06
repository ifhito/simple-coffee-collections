import { LlmSettings } from '@/lib/domain/llm-settings'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor } from '@/lib/infrastructure/crypto/api-key-encryptor.interface'
import type { LlmSettingsInput, LlmSettingsOutput } from './dto'

export type SaveLlmSettingsResult =
  | { success: true; data: LlmSettingsOutput }
  | { error: string }

export class SaveLlmSettingsUseCase {
  constructor(
    private readonly repo: UserLlmSettingsRepository,
    private readonly encryptor: ApiKeyEncryptor
  ) {}

  async execute(
    userId: string,
    input: LlmSettingsInput
  ): Promise<SaveLlmSettingsResult> {
    // Validate domain settings
    const settingsResult = LlmSettings.create({
      provider: input.provider,
      providerTemplate: input.providerTemplate,
      apiUrl: input.apiUrl,
      modelName: input.modelName,
    })

    if (!settingsResult.ok) {
      return { error: settingsResult.error }
    }

    const settings = settingsResult.value

    // Determine encrypted API key
    let encryptedApiKey: string | null = null
    if (input.apiKey && input.apiKey.trim()) {
      try {
        encryptedApiKey = this.encryptor.encrypt(input.apiKey.trim())
      } catch {
        return { error: 'APIキーの暗号化に失敗しました' }
      }
    } else {
      // Keep existing key if no new key provided
      const existing = await this.repo.findByUserId(userId)
      if (existing.ok && existing.value) {
        encryptedApiKey = existing.value.encryptedApiKey
      }
    }

    const saveResult = await this.repo.save(userId, settings, encryptedApiKey)
    if (!saveResult.ok) {
      return { error: saveResult.error.message }
    }

    const entity = saveResult.value
    return {
      success: true,
      data: {
        provider: entity.settings.provider.type,
        providerTemplate: entity.settings.providerTemplate,
        apiUrl: entity.settings.apiUrl,
        modelName: entity.settings.modelName,
        hasApiKey: entity.hasApiKey,
      },
    }
  }
}
