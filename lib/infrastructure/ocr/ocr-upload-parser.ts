import { isHeicExtension, isHeicMimeType } from '@/lib/constants/image-formats'
import { convertHeicToJpeg } from './heic-converter'

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export type ParsedOcrUpload = {
  imageBuffer: Buffer
  mimeType: string
  inlineProviderTemplate: string | null
  inlineApiUrl: string | null
  inlineApiKey: string
  inlineModelName: string
}

export type OcrUploadParseResult =
  | { ok: true; value: ParsedOcrUpload }
  | { ok: false; status: number; error: string }

export async function parseOcrUpload(formData: FormData): Promise<OcrUploadParseResult> {
  const file = formData.get('image') as File | null
  if (!file) {
    return { ok: false, status: 400, error: '画像ファイルが必要です' }
  }

  let imageBuffer: Buffer
  try {
    const arrayBuffer = await file.arrayBuffer()
    imageBuffer = Buffer.from(arrayBuffer)
  } catch {
    return { ok: false, status: 400, error: 'ファイルの読み込みに失敗しました' }
  }

  const fallbackType = isHeicExtension(file.name) ? 'image/heic' : 'image/jpeg'
  let mimeType = MIME_ALIASES[file.type.toLowerCase()] ?? (file.type.toLowerCase() || fallbackType)

  if (isHeicMimeType(mimeType)) {
    const converted = await convertHeicToJpeg(imageBuffer)
    if (!converted) {
      return {
        ok: false,
        status: 400,
        error: 'HEIC/HEIF画像の変換に失敗しました。JPEG/PNG/WEBP形式で再試行してください。',
      }
    }
    imageBuffer = converted
    mimeType = 'image/jpeg'
  }

  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    return {
      ok: false,
      status: 400,
      error: '未対応の画像形式です。JPEG/PNG/WEBP/HEIC/HEIF形式を使用してください。',
    }
  }

  return {
    ok: true,
    value: {
      imageBuffer,
      mimeType,
      inlineProviderTemplate: formData.get('inline_provider_template') as string | null,
      inlineApiUrl: formData.get('inline_api_url') as string | null,
      inlineApiKey: (formData.get('inline_api_key') as string) ?? '',
      inlineModelName: (formData.get('inline_model_name') as string) ?? '',
    },
  }
}
