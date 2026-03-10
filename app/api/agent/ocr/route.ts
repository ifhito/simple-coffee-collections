export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserLlmSettingsRepository,
  getApiKeyEncryptor,
  getLlmModelFactory,
  getOcrExecutor,
} from '@/lib/di/container'
import { OcrCoffeeBeanUseCase, OcrInlineCoffeeBeanUseCase } from '@/lib/application/ocr'
import { getProviderTypeByTemplate } from '@/lib/constants/llm-providers'
import { parseOcrUpload } from '@/lib/infrastructure/ocr/ocr-upload-parser'

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // Parse multipart form data
  let parsed
  try {
    parsed = await parseOcrUpload(await request.formData())
  } catch {
    return NextResponse.json({ error: 'ファイルの読み込みに失敗しました' }, { status: 400 })
  }
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const {
    imageBuffer,
    mimeType,
    inlineProviderTemplate,
    inlineApiUrl,
    inlineApiKey,
    inlineModelName,
  } = parsed.value

  // Run OCR — inline path (no DB) or DB path
  let result
  const llmModelFactory = getLlmModelFactory()
  const ocrExecutor = getOcrExecutor()
  if (inlineProviderTemplate) {
    const providerType = getProviderTypeByTemplate(inlineProviderTemplate)
    const inlineUseCase = new OcrInlineCoffeeBeanUseCase(llmModelFactory, ocrExecutor)
    result = await inlineUseCase.execute({
      providerType,
      apiUrl: inlineApiUrl,
      modelName: inlineModelName,
      providerTemplate: inlineProviderTemplate,
      apiKey: inlineApiKey,
      imageBuffer,
      mimeType,
    })
  } else {
    const useCase = new OcrCoffeeBeanUseCase(
      getUserLlmSettingsRepository(),
      getApiKeyEncryptor(),
      llmModelFactory,
      ocrExecutor
    )
    result = await useCase.execute(user.id, imageBuffer, mimeType)
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ data: result.data })
}
