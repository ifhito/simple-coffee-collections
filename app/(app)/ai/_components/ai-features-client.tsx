'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { saveLlmSettings, deleteLlmSettings } from '@/lib/actions/llm-settings'
import { LlmSettingsPanel } from './llm-settings-panel'
import { KNOWN_PROVIDERS } from '@/lib/constants/llm-providers'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings'
import type { OcrExtractedData } from '@/lib/application/ocr'

type Mode = 'view' | 'edit' | 'new'

type Props = {
  initialSettings: LlmSettingsOutput | null
}

function getInitialTemplate(settings: LlmSettingsOutput | null): string {
  return settings?.providerTemplate ?? 'gemini'
}

function getInitialProvider(settings: LlmSettingsOutput | null): LlmProviderType {
  return settings?.provider ?? 'google'
}

export function AiFeaturesClient({ initialSettings }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialSettings ? 'view' : 'new')
  const [currentSettings, setCurrentSettings] = useState<LlmSettingsOutput | null>(initialSettings)

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState(getInitialTemplate(initialSettings))
  const [provider, setProvider] = useState<LlmProviderType>(getInitialProvider(initialSettings))
  const [apiUrl, setApiUrl] = useState(initialSettings?.apiUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState(initialSettings?.modelName ?? '')
  // Action state
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // OCR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleProviderSelect(template: string) {
    const p = KNOWN_PROVIDERS.find((p) => p.template === template)
    if (!p) return
    setSelectedTemplate(template)
    setProvider(p.providerType)
    setApiUrl(p.baseUrl ?? '')
    setModelName(p.defaultModel)
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(file)
    setOcrError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  function openCameraPicker() {
    if (isAnalyzing) return
    cameraInputRef.current?.click()
  }

  function openFilePicker() {
    if (isAnalyzing) return
    fileInputRef.current?.click()
  }

  function handleEnterEdit() {
    // Initialize edit form with current saved values
    setSelectedTemplate(currentSettings?.providerTemplate ?? 'gemini')
    setProvider(currentSettings?.provider ?? 'google')
    setApiUrl(currentSettings?.apiUrl ?? '')
    setApiKey('')
    setModelName(currentSettings?.modelName ?? '')
    setActionError(null)
    setMode('edit')
  }

  function handleCancelEdit() {
    setActionError(null)
    setMode('view')
  }

  function handleSaveSettings() {
    setActionError(null)
    const formData = new FormData()
    formData.set('provider', provider)
    formData.set('provider_template', selectedTemplate)
    formData.set('api_url', apiUrl)
    formData.set('model_name', modelName)
    if (apiKey.trim()) formData.set('api_key', apiKey.trim())

    startTransition(async () => {
      const result = await saveLlmSettings(formData)
      if ('error' in result) {
        setActionError(result.error)
        return
      }
      // Update local settings snapshot and switch to view mode
      setCurrentSettings({
        provider,
        providerTemplate: selectedTemplate,
        apiUrl: apiUrl || null,
        modelName,
        hasApiKey: !!(apiKey.trim()) || (currentSettings?.hasApiKey ?? false),
      })
      setApiKey('')
      setMode('view')
    })
  }

  function handleDeleteSettings() {
    if (!confirm('AI設定を削除してもよいですか？')) return
    startTransition(async () => {
      const result = await deleteLlmSettings()
      if (result.error) {
        setActionError(result.error)
        return
      }
      setCurrentSettings(null)
      setSelectedTemplate('gemini')
      setProvider('google')
      setApiUrl('')
      setApiKey('')
      setModelName('gemini-flash-latest')
      setMode('new')
    })
  }

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return
    setOcrError(null)
    setIsAnalyzing(true)

    const formData = new FormData()
    formData.append('image', selectedFile)

    // Inline path: no DB settings → send form fields
    if (mode === 'new') {
      formData.append('inline_provider_template', selectedTemplate)
      if (apiUrl) formData.append('inline_api_url', apiUrl)
      if (apiKey) formData.append('inline_api_key', apiKey)
      formData.append('inline_model_name', modelName)
    }

    try {
      const res = await fetch('/api/agent/ocr', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || json.error) {
        setOcrError(json.error ?? '解析に失敗しました')
        return
      }
      const data: OcrExtractedData = json.data
      const params = new URLSearchParams()
      if (data.bean_name) params.set('bean_name', data.bean_name)
      if (data.bean_type) params.set('bean_type', data.bean_type)
      if (data.roast_level) params.set('roast_level', data.roast_level)
      if (data.shop_name) params.set('shop_name', data.shop_name)
      if (data.shop_address) params.set('shop_address', data.shop_address)
      router.push(`/coffee/new?${params.toString()}`)
    } catch {
      setOcrError('通信エラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedFile, mode, selectedTemplate, apiUrl, apiKey, modelName, router])

  const isAnalyzeDisabled = !selectedFile || isAnalyzing

  const providerLabel = KNOWN_PROVIDERS.find((p) => p.template === currentSettings?.providerTemplate)?.label
    ?? currentSettings?.provider
    ?? ''

  return (
    <div className="space-y-8">
      {/* ── AI設定セクション ── */}
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">AI設定</h2>

        {/* View mode */}
        {mode === 'view' && currentSettings && (
          <div className="space-y-4">
            <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <p>
                <span className="font-medium">プロバイダー:</span> {providerLabel}
              </p>
              <p>
                <span className="font-medium">モデル:</span> {currentSettings.modelName}
              </p>
              <p>
                <span className="font-medium">APIキー:</span>{' '}
                {currentSettings.hasApiKey ? '設定済み' : '未設定'}
              </p>
            </div>
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleEnterEdit}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                変更する
              </button>
              <button
                type="button"
                onClick={handleDeleteSettings}
                disabled={isPending}
                className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                削除する
              </button>
            </div>
          </div>
        )}

        {/* Edit mode */}
        {mode === 'edit' && (
          <div className="space-y-5">
            <LlmSettingsPanel
              selectedTemplate={selectedTemplate}
              provider={provider}
              apiUrl={apiUrl}
              apiKey={apiKey}
              modelName={modelName}
              hasExistingKey={currentSettings?.hasApiKey ?? false}
              onProviderSelect={handleProviderSelect}
              onApiUrlChange={setApiUrl}
              onApiKeyChange={setApiKey}
              onModelNameChange={setModelName}
            />
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isPending}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {isPending ? '保存中...' : '保存する'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* New mode (no DB settings) */}
        {mode === 'new' && (
          <div className="space-y-5">
            <LlmSettingsPanel
              selectedTemplate={selectedTemplate}
              provider={provider}
              apiUrl={apiUrl}
              apiKey={apiKey}
              modelName={modelName}
              hasExistingKey={false}
              onProviderSelect={handleProviderSelect}
              onApiUrlChange={setApiUrl}
              onApiKeyChange={setApiKey}
              onModelNameChange={setModelName}
            />
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <p className="text-sm text-neutral-500">
              設定を保存しなくても、このまま解析ボタンを押して一時利用できます。
            </p>
            <button
              type="button"
              onClick={() => setShowSaveConfirm(true)}
              disabled={isPending}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              この設定を保存する
            </button>
          </div>
        )}
      </section>

      {/* ── AI画像分析セクション ── */}
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-neutral-900">AI画像分析</h2>
        <p className="mb-4 text-sm text-neutral-500">
          コーヒーパッケージの画像を解析して、フォームへ自動入力します。
        </p>

        {/* Drop zone */}
        <div
          className={`mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition ${
            isAnalyzing
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40'
          }`}
          role="button"
          tabIndex={isAnalyzing ? -1 : 0}
          aria-disabled={isAnalyzing}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (isAnalyzing) return
            const file = e.dataTransfer.files[0] ?? null
            handleFileChange(file)
          }}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (isAnalyzing) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openFilePicker()
            }
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="プレビュー"
              className="max-h-48 max-w-full rounded-md object-contain"
            />
          ) : (
            <>
              <svg
                className="mb-2 h-10 w-10 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-neutral-500">画像をドロップ、またはクリックして選択</p>
              <p className="mt-1 text-xs text-neutral-400">JPEG / PNG / WEBP / HEIC 対応</p>
            </>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            disabled={isAnalyzing}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            disabled={isAnalyzing}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openCameraPicker}
            disabled={isAnalyzing}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            カメラ起動
          </button>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isAnalyzing}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            ファイル選択
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            {isAnalyzing ? '解析中...' : '解析する'}
          </button>
        </div>

        {ocrError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {ocrError}
          </p>
        )}
      </section>

      {/* 解析中ローディングモーダル */}
      {isAnalyzing && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex min-h-screen w-screen items-center justify-center bg-black/50 px-4">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-10 py-8 shadow-xl">
            <svg
              className="h-10 w-10 animate-spin text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm font-medium text-neutral-700">画像を解析中...</p>
          </div>
        </div>,
        document.body
      )}

      {/* 保存確認モーダル */}
      {showSaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-confirm-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 id="save-confirm-title" className="mb-3 text-base font-semibold text-neutral-900">
              APIキーを保存する前にご確認ください
            </h3>
            <ul className="mb-4 space-y-2 text-sm text-neutral-700">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-500">⚠</span>
                <span>
                  APIキーはサーバー側で暗号化して保存されますが、運用上のセキュリティリスクをゼロにはできません。第三者へのキーの漏洩等について、本アプリは一切の責任を負いません。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-blue-500">ℹ</span>
                <span>
                  <strong>保存しなくても利用できます。</strong>
                  設定を保存せずにキャンセルしても、このページで入力した値をそのまま使って解析を実行できます。
                </span>
              </li>
            </ul>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                キャンセル（保存しない）
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveConfirm(false)
                  handleSaveSettings()
                }}
                disabled={isPending}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {isPending ? '保存中...' : '同意して保存する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
