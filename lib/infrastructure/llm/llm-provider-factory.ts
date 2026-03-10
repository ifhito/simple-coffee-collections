import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AgentConfig } from '@mastra/core/agent'
import type { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'

type MastraModel = AgentConfig['model']

function createModelForProvider(
  providerType: LlmProviderType,
  apiUrl: string | null,
  modelName: string,
  providerTemplate: string | null,
  apiKey: string
): MastraModel {
  switch (providerType) {
    case 'openai_compatible': {
      const compatible = createOpenAICompatible({
        baseURL: apiUrl!,
        apiKey,
        name: providerTemplate ?? 'custom',
      })
      return compatible(modelName) as MastraModel
    }

    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey })
      return anthropic(modelName) as MastraModel
    }

    case 'ollama': {
      const ollamaBaseUrl = (apiUrl ?? 'http://localhost:11434').replace(/\/api\/?$/, '') + '/v1'
      const compatible = createOpenAICompatible({
        baseURL: ollamaBaseUrl,
        apiKey: 'ollama',
        name: 'ollama',
        supportsStructuredOutputs: true,
      })
      return compatible(modelName) as MastraModel
    }

    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey })
      return google(modelName) as MastraModel
    }
  }
}

export function createLlmModel(settings: UserLlmSettings, decryptedApiKey: string): MastraModel {
  const { provider, apiUrl, modelName, providerTemplate } = settings.settings
  return createModelForProvider(provider.type, apiUrl, modelName, providerTemplate, decryptedApiKey)
}

export function createLlmModelFromPrimitives(
  providerType: LlmProviderType,
  apiUrl: string | null,
  modelName: string,
  providerTemplate: string | null,
  apiKey: string
): MastraModel {
  return createModelForProvider(providerType, apiUrl, modelName, providerTemplate, apiKey)
}
