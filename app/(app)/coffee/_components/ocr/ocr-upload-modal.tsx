'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { OcrExtractedData } from '@/lib/application/ocr'

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/jpg',
  'image/pjpeg',
])

const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']

type OcrModalState =
  | { status: 'uploading' }
  | { status: 'analyzing' }

type Props = {
  state: OcrModalState
  onAnalyzeStateChange?: (isAnalyzing: boolean) => void
  onComplete: (data: OcrExtractedData) => void
  onClose: () => void
}

export function OcrUploadModal({ state, onAnalyzeStateChange, onComplete, onClose }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localAnalyzing, setLocalAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAnalyzing = state.status === 'analyzing' || localAnalyzing

  function isSupportedImage(file: File) {
    const normalizedType = file.type.toLowerCase()
    if (normalizedType && SUPPORTED_IMAGE_MIME_TYPES.has(normalizedType)) {
      return true
    }
    const lowerName = file.name.toLowerCase()
    return SUPPORTED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  }

  function handleFileChange(file: File) {
    if (!isSupportedImage(file)) {
      setError('未対応の画像形式です。JPEG/PNG/WEBP/HEIC/HEIF形式を使用してください。')
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileChange(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  async function handleAnalyze() {
    if (!selectedFile) return
    setError(null)
    setLocalAnalyzing(true)
    onAnalyzeStateChange?.(true)

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await fetch('/api/agent/ocr', {
        method: 'POST',
        body: formData,
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error ?? 'OCR解析に失敗しました')
        return
      }
      onComplete(json.data as OcrExtractedData)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLocalAnalyzing(false)
      onAnalyzeStateChange?.(false)
    }
  }

  if (isAnalyzing) {
    const analyzingDialog = (
      <div
        className="fixed inset-0 z-[200] flex min-h-screen w-screen items-center justify-center bg-black/60"
        role="dialog"
        aria-modal="true"
        aria-label="OCR解析中"
      >
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <h2 className="mb-2 text-lg font-bold text-neutral-900">画像を解析中です</h2>
          <p className="text-sm text-neutral-600">しばらくお待ちください。AIがコーヒー情報を抽出しています。</p>
        </div>
      </div>
    )

    if (typeof document === 'undefined') return analyzingDialog
    return createPortal(analyzingDialog, document.body)
  }

  const uploadDialog = (
    <div
      className="fixed inset-0 z-[200] flex min-h-screen w-screen items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="画像からコーヒー情報を入力"
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isAnalyzing}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700 disabled:opacity-50"
          aria-label="閉じる"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 text-lg font-bold text-neutral-900">画像から入力</h2>
        <p className="mb-4 text-sm text-neutral-600">
          コーヒーパッケージの写真をアップロードすると、AIが豆の情報を自動抽出します。
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          className={`mb-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition ${
            selectedFile
              ? 'border-amber-400 bg-amber-50'
              : 'border-neutral-300 hover:border-amber-400'
          } ${isAnalyzing ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="選択した画像"
              className="max-h-32 max-w-full rounded object-contain"
            />
          ) : (
            <>
              <svg className="mb-2 h-10 w-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-neutral-500">クリックまたはドラッグ&ドロップ</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          className="hidden"
          onChange={handleInputChange}
          disabled={isAnalyzing}
        />

        {error && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Analyzing indicator */}
        {isAnalyzing && (
          <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2">
            <svg className="h-4 w-4 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-sm font-medium text-amber-700">AIが解析中...</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            解析する
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>

        <p className="mt-3 text-xs text-neutral-400">
          ※ AI設定が必要です。
          <a href="/profile/llm-settings" className="text-amber-600 underline">
            AI設定ページ
          </a>
          でAPIキーを設定してください。
        </p>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return uploadDialog
  return createPortal(uploadDialog, document.body)
}
