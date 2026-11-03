import { KNOWN_PROVIDERS } from '../llm-providers'

const findProvider = (template: string) => {
  const provider = KNOWN_PROVIDERS.find((p) => p.template === template)
  if (!provider) throw new Error(`provider template not found: ${template}`)
  return provider
}

// Models that have been retired by their providers. A template defaulting to
// one of these makes OCR fail immediately for anyone who keeps the default.
const RETIRED_MODELS = [
  'claude-3-5-sonnet-20241022', // Anthropic: retired
  'meta-llama/llama-4-scout-17b-16e-instruct', // Groq: shut down 2026-07-17
  'qwen/qwen2.5-vl-72b-instruct:free', // OpenRouter: :free variant removed
]

describe('KNOWN_PROVIDERS default models', () => {
  it.each(RETIRED_MODELS)('does not default to retired model %s', (model) => {
    const defaults = KNOWN_PROVIDERS.map((p) => p.defaultModel)
    expect(defaults).not.toContain(model)
  })

  it('defaults Anthropic to a current vision-capable Claude model', () => {
    const anthropic = findProvider('anthropic')
    expect(anthropic.defaultModel).toBe('claude-haiku-5-5')
    expect(anthropic.description).not.toMatch(/3\.5/)
  })

  it('defaults Groq to a current multimodal model', () => {
    expect(findProvider('groq').defaultModel).toBe('qwen/qwen3.8-27b')
  })

  it('defaults OpenRouter to a currently free vision model', () => {
    const model = findProvider('openrouter').defaultModel
    expect(model).toBe('nvidia/nemotron-3.5-super-vl:free')
    expect(model.endsWith(':free')).toBe(true)
  })

  it('keeps Gemini on the gemini-flash-latest alias', () => {
    expect(findProvider('gemini').defaultModel).toBe('gemini-flash-latest')
  })

  it('gives every non-custom template a default model', () => {
    KNOWN_PROVIDERS.filter((p) => p.template !== 'custom').forEach((p) => {
      expect(p.defaultModel).not.toBe('')
    })
  })
})
