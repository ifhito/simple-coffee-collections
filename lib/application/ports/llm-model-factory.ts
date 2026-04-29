import type { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'
import type { AgentConfig } from '@mastra/core/agent'

export type OcrModel = AgentConfig['model']

export type InlineLlmModelInput = {
  providerType: LlmProviderType
  apiUrl: string | null
  modelName: string
  providerTemplate: string | null
  apiKey: string
}

export type LlmModelFactory = {
  createFromUserSettings(
    settings: UserLlmSettings,
    decryptedApiKey: string
  ): OcrModel
  createFromInlineSettings(input: InlineLlmModelInput): OcrModel
}
