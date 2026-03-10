import { DefaultLlmModelFactory } from '../default-llm-model-factory'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'

jest.mock('../llm-provider-factory', () => ({
  createLlmModel: jest.fn(() => ({ provider: 'entity-model' })),
  createLlmModelFromPrimitives: jest.fn(() => ({ provider: 'inline-model' })),
}))

import { createLlmModel, createLlmModelFromPrimitives } from '../llm-provider-factory'

function makeEntity(): UserLlmSettings {
  const settings = LlmSettings.fromPrimitive(
    'openai_compatible',
    'together',
    'https://api.together.xyz/v1',
    'meta-llama/Llama-Vision-Free'
  )
  return UserLlmSettings.reconstruct({
    id: 'uuid-1',
    userId: 'user-1',
    settings,
    encryptedApiKey: 'enc',
  })
}

describe('DefaultLlmModelFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates createFromUserSettings to createLlmModel', () => {
    const factory = new DefaultLlmModelFactory()
    const entity = makeEntity()

    const model = factory.createFromUserSettings(entity, 'sk-key')

    expect(createLlmModel).toHaveBeenCalledWith(entity, 'sk-key')
    expect(model).toEqual({ provider: 'entity-model' })
  })

  it('delegates createFromInlineSettings to createLlmModelFromPrimitives', () => {
    const factory = new DefaultLlmModelFactory()

    const model = factory.createFromInlineSettings({
      providerType: 'google',
      apiUrl: null,
      modelName: 'gemini-2.0-flash',
      providerTemplate: 'gemini',
      apiKey: 'AIza-key',
    })

    expect(createLlmModelFromPrimitives).toHaveBeenCalledWith(
      'google',
      null,
      'gemini-2.0-flash',
      'gemini',
      'AIza-key'
    )
    expect(model).toEqual({ provider: 'inline-model' })
  })
})
