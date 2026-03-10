import { KNOWN_PROVIDERS } from '@/lib/constants/llm-providers'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings'
import type { OcrExtractedData } from '@/lib/application/ocr'

export type AiSettingsMode = 'view' | 'edit' | 'new'

export function getInitialTemplate(settings: LlmSettingsOutput | null): string {
  return settings?.providerTemplate ?? 'gemini'
}

export function getInitialProvider(settings: LlmSettingsOutput | null): LlmProviderType {
  return settings?.provider ?? 'google'
}

export function getProviderLabel(settings: LlmSettingsOutput | null): string {
  return KNOWN_PROVIDERS.find((p) => p.template === settings?.providerTemplate)?.label
    ?? settings?.provider
    ?? ''
}

export function buildOcrPrefillSearchParams(data: OcrExtractedData): URLSearchParams {
  const params = new URLSearchParams()
  if (data.bean_name) params.set('bean_name', data.bean_name)
  if (data.bean_type) params.set('bean_type', data.bean_type)
  if (data.roast_level) params.set('roast_level', data.roast_level)
  if (data.shop_name) params.set('shop_name', data.shop_name)
  if (data.shop_address) params.set('shop_address', data.shop_address)
  return params
}
