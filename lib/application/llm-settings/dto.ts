import type { LlmProviderType } from '@/lib/domain/llm-settings'

/**
 * Input DTO for saving LLM settings (includes plain-text API key from form)
 */
export interface LlmSettingsInput {
  provider: LlmProviderType
  providerTemplate?: string | null
  apiUrl?: string | null
  modelName: string
  /** Plain-text API key from form. If empty/undefined, existing key is kept. */
  apiKey?: string | null
}

/**
 * Output DTO for reading LLM settings (never exposes the raw API key)
 */
export interface LlmSettingsOutput {
  provider: LlmProviderType
  providerTemplate: string | null
  apiUrl: string | null
  modelName: string
  hasApiKey: boolean
}
