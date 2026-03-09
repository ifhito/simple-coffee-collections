import { useCallback, useRef, useState } from 'react'
import type { OcrExtractedData } from '@/lib/application/ocr'
import type { AiSettingsMode } from './ai-features-helpers'
import { buildOcrPrefillSearchParams } from './ai-features-helpers'

type Input = {
  mode: AiSettingsMode
  selectedTemplate: string
  apiUrl: string
  apiKey: string
  modelName: string
  onNavigate: (url: string) => void
}

const HEIC_MIME_PATTERN = /^image\/(heic|heif)(?:[-+.\w]*)?$/i
const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i

function isHeicLikeFile(file: File): boolean {
  const mimeType = file.type.toLowerCase()
  if (mimeType && HEIC_MIME_PATTERN.test(mimeType)) return true
  return HEIC_EXTENSION_PATTERN.test(file.name)
}

function toJpegFileName(fileName: string): string {
  if (HEIC_EXTENSION_PATTERN.test(fileName)) {
    return fileName.replace(HEIC_EXTENSION_PATTERN, '.jpg')
  }
  return `${fileName}.jpg`
}

async function convertHeicBlob(file: File): Promise<Blob | null> {
  try {
    const { default: heic2any } = await import('heic2any')
    const convertedJpeg = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    if (Array.isArray(convertedJpeg)) {
      return convertedJpeg[0] instanceof Blob ? convertedJpeg[0] : null
    }
    if (convertedJpeg instanceof Blob) return convertedJpeg
  } catch {
    // Fall through to PNG attempt.
  }

  try {
    const { default: heic2any } = await import('heic2any')
    const convertedPng = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 0.9,
    })
    if (Array.isArray(convertedPng)) {
      return convertedPng[0] instanceof Blob ? convertedPng[0] : null
    }
    return convertedPng instanceof Blob ? convertedPng : null
  } catch {
    return null
  }
}

export function useAiOcrController({
  mode,
  selectedTemplate,
  apiUrl,
  apiKey,
  modelName,
  onNavigate,
}: Input) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRequestIdRef = useRef(0)

  function handleFileChange(file: File | null) {
    setSelectedFile(file)
    setOcrError(null)
    setPreviewLoadFailed(false)

    previewRequestIdRef.current += 1
    const requestId = previewRequestIdRef.current

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    if (!file) return

    void (async () => {
      const previewBlob = isHeicLikeFile(file)
        ? (await convertHeicBlob(file)) ?? file
        : file
      const nextPreviewUrl = URL.createObjectURL(previewBlob)

      if (previewRequestIdRef.current !== requestId) {
        URL.revokeObjectURL(nextPreviewUrl)
        return
      }
      setPreviewUrl(nextPreviewUrl)
    })()
  }

  function openFilePicker() {
    if (isAnalyzing) return
    fileInputRef.current?.click()
  }

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return

    setOcrError(null)
    setIsAnalyzing(true)

    const formData = new FormData()
    if (isHeicLikeFile(selectedFile)) {
      const converted = await convertHeicBlob(selectedFile)
      if (converted) {
        formData.append('image', converted, toJpegFileName(selectedFile.name))
      } else {
        formData.append('image', selectedFile)
      }
    } else {
      formData.append('image', selectedFile)
    }

    if (mode === 'new') {
      formData.append('inline_provider_template', selectedTemplate)
      if (apiUrl) formData.append('inline_api_url', apiUrl)
      if (apiKey) formData.append('inline_api_key', apiKey)
      formData.append('inline_model_name', modelName)
    }

    try {
      const response = await fetch('/api/agent/ocr', { method: 'POST', body: formData })
      const json = await response.json()
      if (!response.ok || json.error) {
        setOcrError(json.error ?? '解析に失敗しました')
        return
      }

      const data: OcrExtractedData = json.data
      const params = buildOcrPrefillSearchParams(data)
      onNavigate(`/coffee/new?${params.toString()}`)
    } catch {
      setOcrError('通信エラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedFile, mode, selectedTemplate, apiUrl, apiKey, modelName, onNavigate])

  return {
    selectedFile,
    previewUrl,
    previewLoadFailed,
    isAnalyzing,
    ocrError,
    fileInputRef,
    handleFileChange,
    handlePreviewError: () => setPreviewLoadFailed(true),
    openFilePicker,
    handleAnalyze,
    isAnalyzeDisabled: !selectedFile || isAnalyzing,
  }
}
