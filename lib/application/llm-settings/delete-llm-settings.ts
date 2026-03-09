import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'

export class DeleteLlmSettingsUseCase {
  constructor(private readonly repo: UserLlmSettingsRepository) {}

  async execute(userId: string): Promise<{ error?: string }> {
    const result = await this.repo.delete(userId)
    if (!result.ok) {
      return { error: result.error.message }
    }
    return {}
  }
}
