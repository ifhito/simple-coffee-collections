import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { AgentConfig } from '@mastra/core/agent'
import type { UserLlmSettings } from '@/lib/domain/llm-settings/entity'

type MastraModel = AgentConfig['model']

export function createLlmModel(settings: UserLlmSettings, decryptedApiKey: string): MastraModel {
  const { provider, apiUrl, modelName, providerTemplate } = settings.settings

  switch (provider.type) {
    case 'openai_compatible': {
      const compatible = createOpenAICompatible({
        baseURL: apiUrl!,
        apiKey: decryptedApiKey,
        name: providerTemplate ?? 'custom',
      })
      return compatible(modelName) as MastraModel
    }

    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey: decryptedApiKey })
      return anthropic(modelName) as MastraModel
    }

    case 'ollama': {
      // Ollama exposes an OpenAI-compatible API at /v1
      // Native /api endpoint uses v1 spec incompatible with AI SDK 5
      const ollamaBaseUrl = (apiUrl ?? 'http://localhost:11434').replace(/\/api\/?$/, '') + '/v1'
      const compatible = createOpenAICompatible({
        baseURL: ollamaBaseUrl,
        apiKey: 'ollama', // Ollama ignores the API key but the field is required
        name: 'ollama',
        // Enable schema-based response format for generateObject to avoid warnings.
        supportsStructuredOutputs: true,
      })
      return compatible(modelName) as MastraModel
    }
  }
}
