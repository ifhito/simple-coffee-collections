'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserLlmSettingsRepository, getApiKeyEncryptor } from '@/lib/di/container'
import { GetLlmSettingsUseCase, SaveLlmSettingsUseCase, DeleteLlmSettingsUseCase } from '@/lib/application/llm-settings'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings'

export type ActionResult = { error: string } | { success: true }

export async function getLlmSettings(): Promise<LlmSettingsOutput | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const useCase = new GetLlmSettingsUseCase(getUserLlmSettingsRepository())
  return useCase.execute(user.id)
}

export async function saveLlmSettings(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const provider = formData.get('provider') as LlmProviderType | null
  if (!provider) return { error: 'プロバイダーは必須です' }

  const useCase = new SaveLlmSettingsUseCase(
    getUserLlmSettingsRepository(),
    getApiKeyEncryptor()
  )

  const result = await useCase.execute(user.id, {
    provider,
    providerTemplate: formData.get('provider_template') as string | null,
    apiUrl: formData.get('api_url') as string | null,
    modelName: (formData.get('model_name') as string) ?? '',
    apiKey: formData.get('api_key') as string | null,
  })

  if ('error' in result) return { error: result.error }
  return { success: true }
}

export async function deleteLlmSettings(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const useCase = new DeleteLlmSettingsUseCase(getUserLlmSettingsRepository())
  return useCase.execute(user.id)
}
