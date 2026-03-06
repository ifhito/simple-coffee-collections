import { LlmSettings } from '../llm-settings/value-objects/llm-settings'
import { LlmProvider } from '../llm-settings/value-objects/llm-provider'
import { UserLlmSettings } from '../llm-settings/entity'

describe('LlmProvider', () => {
  it('creates valid openai_compatible provider', () => {
    const p = LlmProvider.create('openai_compatible')
    expect(p).not.toBeNull()
    expect(p?.type).toBe('openai_compatible')
  })

  it('creates valid anthropic provider', () => {
    const p = LlmProvider.create('anthropic')
    expect(p?.type).toBe('anthropic')
  })

  it('creates valid ollama provider', () => {
    const p = LlmProvider.create('ollama')
    expect(p?.type).toBe('ollama')
  })

  it('returns null for unknown provider', () => {
    expect(LlmProvider.create('unknown')).toBeNull()
  })

  it('checks equality', () => {
    const a = LlmProvider.create('anthropic')!
    const b = LlmProvider.create('anthropic')!
    expect(a.equals(b)).toBe(true)
  })
})

describe('LlmSettings', () => {
  it('creates valid openai_compatible settings', () => {
    const result = LlmSettings.create({
      provider: 'openai_compatible',
      apiUrl: 'https://api.together.xyz/v1',
      modelName: 'meta-llama/Llama-Vision-Free',
      providerTemplate: 'together',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.provider.type).toBe('openai_compatible')
      expect(result.value.modelName).toBe('meta-llama/Llama-Vision-Free')
      expect(result.value.apiUrl).toBe('https://api.together.xyz/v1')
    }
  })

  it('fails openai_compatible without apiUrl', () => {
    const result = LlmSettings.create({
      provider: 'openai_compatible',
      modelName: 'some-model',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('URL')
    }
  })

  it('creates valid anthropic settings without apiUrl', () => {
    const result = LlmSettings.create({
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet-20241022',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.apiUrl).toBeNull()
    }
  })

  it('creates valid ollama settings with default url', () => {
    const result = LlmSettings.create({
      provider: 'ollama',
      modelName: 'llava',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.apiUrl).toBe('http://localhost:11434/api')
    }
  })

  it('fails without modelName', () => {
    const result = LlmSettings.create({
      provider: 'anthropic',
      modelName: '',
    })
    expect(result.ok).toBe(false)
  })

  it('fails with unknown provider', () => {
    const result = LlmSettings.create({
      provider: 'unknown' as 'anthropic',
      modelName: 'model',
    })
    expect(result.ok).toBe(false)
  })
})

describe('UserLlmSettings', () => {
  it('reports hasApiKey correctly', () => {
    const settings = LlmSettings.fromPrimitive('anthropic', null, null, 'claude-3')
    const entity = UserLlmSettings.reconstruct({
      id: 'uuid-1',
      userId: 'user-1',
      settings,
      encryptedApiKey: 'abc:def:ghi',
    })
    expect(entity.hasApiKey).toBe(true)
  })

  it('reports no apiKey when null', () => {
    const settings = LlmSettings.fromPrimitive('ollama', 'ollama', 'http://localhost:11434/api', 'llava')
    const entity = UserLlmSettings.reconstruct({
      id: 'uuid-2',
      userId: 'user-2',
      settings,
      encryptedApiKey: null,
    })
    expect(entity.hasApiKey).toBe(false)
  })
})
