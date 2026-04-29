import type { Result } from '../shared/result'
import type { UserLlmSettings } from './entity'
import type { LlmSettings } from './value-objects/llm-settings'

export type UserLlmSettingsRepository = {
  findByUserId(userId: string): Promise<Result<UserLlmSettings | null, Error>>
  save(
    userId: string,
    settings: LlmSettings,
    encryptedApiKey: string | null
  ): Promise<Result<UserLlmSettings, Error>>
  delete(userId: string): Promise<Result<void, Error>>
}
