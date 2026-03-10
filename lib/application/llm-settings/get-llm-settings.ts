import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { LlmSettingsOutput } from './dto'

export class GetLlmSettingsUseCase {
  constructor(private readonly repo: UserLlmSettingsRepository) {}

  async execute(userId: string): Promise<LlmSettingsOutput | null> {
    const result = await this.repo.findByUserId(userId)
    if (!result.ok || !result.value) return null

    const entity = result.value
    return {
      provider: entity.settings.provider.type,
      providerTemplate: entity.settings.providerTemplate,
      apiUrl: entity.settings.apiUrl,
      modelName: entity.settings.modelName,
      hasApiKey: entity.hasApiKey,
    }
  }
}
