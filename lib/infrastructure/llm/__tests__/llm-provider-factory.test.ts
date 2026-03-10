import { createLlmModel, createLlmModelFromPrimitives } from '../llm-provider-factory'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'

// Mock external AI SDK providers
jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(({ name }) => {
    const factory = jest.fn((modelName: string) => ({
      provider: name,
      modelId: modelName,
    }))
    return factory
  }),
}))

jest.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: jest.fn(() => {
    const factory = jest.fn((modelName: string) => ({
      provider: 'anthropic',
      modelId: modelName,
    }))
    return factory
  }),
}))

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => {
    const factory = jest.fn((modelName: string) => ({
      provider: 'google',
      modelId: modelName,
    }))
    return factory
  }),
}))

function makeEntity(
  providerType: 'openai_compatible' | 'anthropic' | 'ollama' | 'google',
  template: string | null,
  apiUrl: string | null,
  modelName: string
): UserLlmSettings {
  const settings = LlmSettings.fromPrimitive(providerType, template, apiUrl, modelName)
  return UserLlmSettings.reconstruct({
    id: 'uuid-1',
    userId: 'user-1',
    settings,
    encryptedApiKey: 'enc',
  })
}

describe('createLlmModel', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates OpenAI-compatible model', () => {
    const entity = makeEntity('openai_compatible', 'together', 'https://api.together.xyz/v1', 'llama-vision')
    const model = createLlmModel(entity, 'sk-key') as { provider: string; modelId: string }

    expect(model.provider).toBe('together')
    expect(model.modelId).toBe('llama-vision')
  })

  it('creates Anthropic model', () => {
    const entity = makeEntity('anthropic', 'anthropic', null, 'claude-3-5-sonnet')
    const model = createLlmModel(entity, 'sk-ant-key') as { provider: string; modelId: string }

    expect(model.provider).toBe('anthropic')
    expect(model.modelId).toBe('claude-3-5-sonnet')
  })

  it('creates Ollama model using OpenAI-compatible with /v1 suffix', () => {
    const { createOpenAICompatible } = require('@ai-sdk/openai-compatible')
    const entity = makeEntity('ollama', null, 'http://localhost:11434/api', 'llava')
    createLlmModel(entity, '')

    expect(createOpenAICompatible).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:11434/v1',
        name: 'ollama',
      })
    )
  })

  it('creates Google model', () => {
    const entity = makeEntity('google', 'gemini', null, 'gemini-2.0-flash')
    const model = createLlmModel(entity, 'AIza-key') as { provider: string; modelId: string }

    expect(model.provider).toBe('google')
    expect(model.modelId).toBe('gemini-2.0-flash')
  })
})

describe('createLlmModelFromPrimitives', () => {
  it('produces same result as createLlmModel for equivalent inputs', () => {
    const entity = makeEntity('anthropic', 'anthropic', null, 'claude-3-5-sonnet')
    const fromEntity = createLlmModel(entity, 'sk-key')
    const fromPrimitives = createLlmModelFromPrimitives(
      'anthropic', null, 'claude-3-5-sonnet', 'anthropic', 'sk-key'
    )

    expect(fromEntity).toEqual(fromPrimitives)
  })
})
