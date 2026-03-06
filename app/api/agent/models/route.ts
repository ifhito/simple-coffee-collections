import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserLlmSettingsRepository, getApiKeyEncryptor } from '@/lib/di/container'
import { fetchModelList } from '@/lib/infrastructure/llm/model-list-fetcher'

export async function GET() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // Load settings
  const repo = getUserLlmSettingsRepository()
  const settingsResult = await repo.findByUserId(user.id)
  if (!settingsResult.ok || !settingsResult.value) {
    return NextResponse.json({ error: 'LLM設定が未設定です' }, { status: 404 })
  }

  const entity = settingsResult.value
  const { apiUrl, provider, providerTemplate } = entity.settings

  if (provider.type !== 'openai_compatible' && provider.type !== 'ollama') {
    return NextResponse.json({ models: [] })
  }

  if (!apiUrl) {
    return NextResponse.json({ models: [] })
  }

  // Decrypt API key
  let decryptedApiKey = ''
  if (entity.hasApiKey && entity.encryptedApiKey) {
    try {
      decryptedApiKey = getApiKeyEncryptor().decrypt(entity.encryptedApiKey)
    } catch {
      return NextResponse.json({ error: 'APIキーの復号に失敗しました' }, { status: 500 })
    }
  }

  const models = await fetchModelList(apiUrl, decryptedApiKey, providerTemplate)
  return NextResponse.json({ models })
}
