export const runtime = 'nodejs'
export const maxDuration = 60

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { NextResponse } from 'next/server'
import heicConvert from 'heic-convert'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { getUserLlmSettingsRepository, getApiKeyEncryptor } from '@/lib/di/container'
import { OcrCoffeeBeanUseCase } from '@/lib/application/ocr'
import { runCoffeeOcr } from '@/lib/application/ocr/run-ocr'
import { createLlmModelFromPrimitives } from '@/lib/infrastructure/llm/llm-provider-factory'
import { getProviderTypeByTemplate } from '@/lib/constants/llm-providers'

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
}

const OLLAMA_SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const HEIC_MIME_PATTERN = /^image\/(heic|heif)(?:[-+.\w]*)?$/
const execFileAsync = promisify(execFile)

function isHeicLikeMimeType(mimeType: string) {
  return HEIC_MIME_PATTERN.test(mimeType)
}

function toBuffer(data: Buffer | Uint8Array | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(data)) return data
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data)
}

async function convertHeicToJpeg(imageBuffer: Buffer): Promise<Buffer | null> {
  // First try sharp (works when libvips has HEIC/HEIF decoder support)
  try {
    return await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer()
  } catch {
    // Fall through to cross-platform converter.
  }

  // Cross-platform fallback via heic-convert (WASM-based decoder)
  try {
    const converted = await heicConvert({
      buffer: imageBuffer,
      format: 'JPEG',
      quality: 0.9,
    })
    const convertedBuffer = toBuffer(converted)
    if (convertedBuffer.length > 0) return convertedBuffer
  } catch {
    // Fall through to platform-specific converter.
  }

  // macOS fallback via sips (available on local dev machines by default)
  if (process.platform !== 'darwin') {
    return null
  }

  const id = randomUUID()
  const inputPath = join(tmpdir(), `ocr-heic-${id}.heic`)
  const outputPath = join(tmpdir(), `ocr-heic-${id}.jpg`)

  try {
    await fs.writeFile(inputPath, imageBuffer)
    await execFileAsync('/usr/bin/sips', ['-s', 'format', 'jpeg', inputPath, '--out', outputPath])
    const converted = await fs.readFile(outputPath)
    return converted.length > 0 ? converted : null
  } catch {
    return null
  } finally {
    await Promise.allSettled([
      fs.rm(inputPath, { force: true }),
      fs.rm(outputPath, { force: true }),
    ])
  }
}

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
    const fallbackType = /\.(heic|heif)$/i.test(file.name) ? 'image/heic' : 'image/jpeg'
    mimeType = MIME_ALIASES[file.type.toLowerCase()] ?? (file.type.toLowerCase() || fallbackType)

    if (isHeicLikeMimeType(mimeType)) {
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

    if (!OLLAMA_SUPPORTED_MIME_TYPES.has(mimeType)) {
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
  if (inlineProviderTemplate) {
    const providerType = getProviderTypeByTemplate(inlineProviderTemplate)
    const model = createLlmModelFromPrimitives(
      providerType,
      inlineApiUrl,
      inlineModelName,
      inlineProviderTemplate,
      inlineApiKey
    )
    result = await runCoffeeOcr(model, imageBuffer, mimeType)
  } else {
    const useCase = new OcrCoffeeBeanUseCase(
      getUserLlmSettingsRepository(),
      getApiKeyEncryptor()
    )
    result = await useCase.execute(user.id, imageBuffer, mimeType)
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ data: result.data })
}
