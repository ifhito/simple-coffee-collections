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

function toConvertedFileName(fileName: string, mimeType: string): string {
  const ext = mimeType === 'image/png' ? '.png' : '.jpg'
  if (HEIC_EXTENSION_PATTERN.test(fileName)) {
    return fileName.replace(HEIC_EXTENSION_PATTERN, ext)
  }
  return `${fileName}${ext}`
}

function toBlob(data: Blob | ArrayBuffer, mimeType: string): Blob {
  if (data instanceof Blob) return data
  return new Blob([data], { type: mimeType })
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
      const first = convertedJpeg[0]
      if (!first) return null
      return toBlob(first as Blob | ArrayBuffer, 'image/jpeg')
    }
    return toBlob(convertedJpeg as Blob | ArrayBuffer, 'image/jpeg')
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
      const first = convertedPng[0]
      if (!first) return null
      return toBlob(first as Blob | ArrayBuffer, 'image/png')
    }
    return toBlob(convertedPng as Blob | ArrayBuffer, 'image/png')
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

  function handleFileChange(file: File | null) {
    setSelectedFile(file)
    setOcrError(null)
    setPreviewLoadFailed(false)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    if (!file) return

    const nextPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(nextPreviewUrl)
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
        const fileName = toConvertedFileName(selectedFile.name, converted.type)
        formData.append('image', converted, fileName)
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
