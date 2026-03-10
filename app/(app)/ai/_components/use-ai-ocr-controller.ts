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
    formData.append('image', selectedFile)

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
