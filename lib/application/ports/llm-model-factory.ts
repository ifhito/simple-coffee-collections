import type { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'

export type OcrModel = unknown

export type InlineLlmModelInput = {
  providerType: LlmProviderType
  apiUrl: string | null
  modelName: string
  providerTemplate: string | null
  apiKey: string
}

export interface LlmModelFactory {
  createFromUserSettings(
    settings: UserLlmSettings,
    decryptedApiKey: string
  ): OcrModel
  createFromInlineSettings(input: InlineLlmModelInput): OcrModel
}
