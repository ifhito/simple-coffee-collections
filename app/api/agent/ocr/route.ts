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
import { isHeicMimeType, isHeicExtension } from '@/lib/constants/image-formats'
import { convertHeicToJpeg } from '@/lib/infrastructure/ocr/heic-converter'

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

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
  let imageBuffer: Buffer
  let mimeType: string
  let inlineProviderTemplate: string | null = null
  let inlineApiUrl: string | null = null
  let inlineApiKey = ''
  let inlineModelName = ''
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: '画像ファイルが必要です' }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    imageBuffer = Buffer.from(arrayBuffer)
    const fallbackType = isHeicExtension(file.name) ? 'image/heic' : 'image/jpeg'
    mimeType = MIME_ALIASES[file.type.toLowerCase()] ?? (file.type.toLowerCase() || fallbackType)

    if (isHeicMimeType(mimeType)) {
      const converted = await convertHeicToJpeg(imageBuffer)
      if (!converted) {
        return NextResponse.json(
          { error: 'HEIC/HEIF画像の変換に失敗しました。JPEG/PNG/WEBP形式で再試行してください。' },
          { status: 400 }
        )
      }
      imageBuffer = converted
      mimeType = 'image/jpeg'
    }

    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: '未対応の画像形式です。JPEG/PNG/WEBP/HEIC/HEIF形式を使用してください。' },
        { status: 400 }
      )
    }

    inlineProviderTemplate = formData.get('inline_provider_template') as string | null
    inlineApiUrl = formData.get('inline_api_url') as string | null
    inlineApiKey = (formData.get('inline_api_key') as string) ?? ''
    inlineModelName = (formData.get('inline_model_name') as string) ?? ''
  } catch {
    return NextResponse.json({ error: 'ファイルの読み込みに失敗しました' }, { status: 400 })
  }

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
