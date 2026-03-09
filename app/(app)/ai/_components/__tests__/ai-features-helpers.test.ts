import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import {
  buildOcrPrefillSearchParams,
  getInitialProvider,
  getInitialTemplate,
  getProviderLabel,
} from '../ai-features-helpers'

describe('ai-features-helpers', () => {
  it('returns defaults when settings are null', () => {
    expect(getInitialTemplate(null)).toBe('gemini')
    expect(getInitialProvider(null)).toBe('google')
    expect(getProviderLabel(null)).toBe('')
  })

  it('returns values from settings when present', () => {
    const settings: LlmSettingsOutput = {
      provider: 'google',
      providerTemplate: 'gemini',
      apiUrl: null,
      modelName: 'gemini-flash-latest',
      hasApiKey: true,
    }

    expect(getInitialTemplate(settings)).toBe('gemini')
    expect(getInitialProvider(settings)).toBe('google')
    expect(getProviderLabel(settings)).toContain('Gemini')
  })

  it('builds prefill query params from OCR output', () => {
    const params = buildOcrPrefillSearchParams({
      bean_name: 'Kenya Blend',
      bean_type: 'Kenya',
      roast_level: 'medium',
      shop_name: 'Onibus Coffee',
      shop_address: null,
    })

    expect(params.get('bean_name')).toBe('Kenya Blend')
    expect(params.get('bean_type')).toBe('Kenya')
    expect(params.get('roast_level')).toBe('medium')
    expect(params.get('shop_name')).toBe('Onibus Coffee')
    expect(params.get('shop_address')).toBeNull()
  })
})
