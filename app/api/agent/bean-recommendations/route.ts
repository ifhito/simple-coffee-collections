export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { RecommendBeansForFriendUseCase } from '@/lib/application/bean-recommendation'
import {
  getApiKeyEncryptor,
  getBeanRecommendationExecutor,
  getBeanRecommendationRepository,
  getLlmModelFactory,
  getUserLlmSettingsRepository,
} from '@/lib/di/container'
import { createClient } from '@/lib/supabase/server'

type RequestBody = {
  friendPreferenceText?: unknown
  limit?: unknown
}

function parseLimit(value: unknown): { limit: number } | { error: string } {
  if (value === undefined || value === null) return { limit: 3 }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
    return { error: 'limitは1〜5の整数で指定してください' }
  }
  return { limit: value }
}

const MAX_FRIEND_PREFERENCE_TEXT_LENGTH = 1000

async function parseJson(request: Request): Promise<RequestBody | null> {
  try {
    return (await request.json()) as RequestBody
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await parseJson(request)
  if (!body) {
    return NextResponse.json({ error: 'リクエストJSONの読み込みに失敗しました' }, { status: 400 })
  }

  if (typeof body.friendPreferenceText !== 'string' || body.friendPreferenceText.trim().length === 0) {
    return NextResponse.json({ error: '友達の好みを入力してください' }, { status: 400 })
  }
  const friendPreferenceText = body.friendPreferenceText.trim()
  if (friendPreferenceText.length > MAX_FRIEND_PREFERENCE_TEXT_LENGTH) {
    return NextResponse.json({ error: `友達の好みは${MAX_FRIEND_PREFERENCE_TEXT_LENGTH}文字以内で入力してください` }, { status: 400 })
  }
  const parsedLimit = parseLimit(body.limit)
  if ('error' in parsedLimit) {
    return NextResponse.json({ error: parsedLimit.error }, { status: 400 })
  }

  const settingsResult = await getUserLlmSettingsRepository().findByUserId(user.id)
  if (!settingsResult.ok) {
    return NextResponse.json({ error: 'LLM設定の取得に失敗しました' }, { status: 422 })
  }
  if (!settingsResult.value) {
    return NextResponse.json(
      { error: 'LLM設定が未設定です。プロフィールのAI設定からAPIキーを設定してください。' },
      { status: 422 }
    )
  }

  let decryptedApiKey = ''
  if (settingsResult.value.hasApiKey && settingsResult.value.encryptedApiKey) {
    try {
      decryptedApiKey = getApiKeyEncryptor().decrypt(settingsResult.value.encryptedApiKey)
    } catch {
      return NextResponse.json({ error: 'APIキーの復号に失敗しました' }, { status: 422 })
    }
  }

  const model = getLlmModelFactory().createFromUserSettings(settingsResult.value, decryptedApiKey)
  const useCase = new RecommendBeansForFriendUseCase(
    getBeanRecommendationRepository(),
    getBeanRecommendationExecutor()
  )

  const result = await useCase.execute({
    userId: user.id,
    model,
    friendPreferenceText,
    limit: parsedLimit.limit,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ data: result.data })
}
