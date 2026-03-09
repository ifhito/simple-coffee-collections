'use client'

import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { LlmSettingsPanel } from './llm-settings-panel'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import { getProviderLabel } from './ai-features-helpers'
import { useAiSettingsController } from './use-ai-settings-controller'
import { useAiOcrController } from './use-ai-ocr-controller'

type Props = {
  initialSettings: LlmSettingsOutput | null
}

export function AiFeaturesClient({ initialSettings }: Props) {
  const router = useRouter()

  const settings = useAiSettingsController(initialSettings)
  const ocr = useAiOcrController({
    mode: settings.mode,
    selectedTemplate: settings.selectedTemplate,
    apiUrl: settings.apiUrl,
    apiKey: settings.apiKey,
    modelName: settings.modelName,
    onNavigate: (url) => router.push(url),
  })

  const providerLabel = getProviderLabel(settings.currentSettings)

  return (
    <div className="space-y-8">
      {/* ── AI設定セクション ── */}
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">AI設定</h2>

        {settings.mode === 'view' && settings.currentSettings && (
          <div className="space-y-4">
            <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <p>
                <span className="font-medium">プロバイダー:</span> {providerLabel}
              </p>
              <p>
                <span className="font-medium">モデル:</span> {settings.currentSettings.modelName}
              </p>
              <p>
                <span className="font-medium">APIキー:</span>{' '}
                {settings.currentSettings.hasApiKey ? '設定済み' : '未設定'}
              </p>
            </div>
            {settings.actionError && <p className="text-sm text-red-600">{settings.actionError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={settings.handleEnterEdit}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                変更する
              </button>
              <button
                type="button"
                onClick={settings.handleDeleteSettings}
                disabled={settings.isPending}
                className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                削除する
              </button>
            </div>
          </div>
        )}

        {settings.mode === 'edit' && (
          <div className="space-y-5">
            <LlmSettingsPanel
              selectedTemplate={settings.selectedTemplate}
              provider={settings.provider}
              apiUrl={settings.apiUrl}
              apiKey={settings.apiKey}
              modelName={settings.modelName}
              hasExistingKey={settings.currentSettings?.hasApiKey ?? false}
              onProviderSelect={settings.handleProviderSelect}
              onApiUrlChange={settings.setApiUrl}
              onApiKeyChange={settings.setApiKey}
              onModelNameChange={settings.setModelName}
            />
            {settings.actionError && <p className="text-sm text-red-600">{settings.actionError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={settings.handleSaveSettings}
                disabled={settings.isPending}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {settings.isPending ? '保存中...' : '保存する'}
              </button>
              <button
                type="button"
                onClick={settings.handleCancelEdit}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {settings.mode === 'new' && (
          <div className="space-y-5">
            <LlmSettingsPanel
              selectedTemplate={settings.selectedTemplate}
              provider={settings.provider}
              apiUrl={settings.apiUrl}
              apiKey={settings.apiKey}
              modelName={settings.modelName}
              hasExistingKey={false}
              onProviderSelect={settings.handleProviderSelect}
              onApiUrlChange={settings.setApiUrl}
              onApiKeyChange={settings.setApiKey}
              onModelNameChange={settings.setModelName}
            />
            {settings.actionError && <p className="text-sm text-red-600">{settings.actionError}</p>}
            <p className="text-sm text-neutral-500">
              設定を保存しなくても、このまま解析ボタンを押して一時利用できます。
            </p>
            <button
              type="button"
              onClick={settings.openSaveConfirm}
              disabled={settings.isPending}
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

        <div
          className={`mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition ${
            ocr.isAnalyzing
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40'
          }`}
          role="button"
          tabIndex={ocr.isAnalyzing ? -1 : 0}
          aria-disabled={ocr.isAnalyzing}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (ocr.isAnalyzing) return
            const file = e.dataTransfer.files[0] ?? null
            ocr.handleFileChange(file)
          }}
          onClick={ocr.openFilePicker}
          onKeyDown={(e) => {
            if (ocr.isAnalyzing) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              ocr.openFilePicker()
            }
          }}
        >
          {ocr.previewUrl ? (
            <img
              src={ocr.previewUrl}
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
            ref={ocr.fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => ocr.handleFileChange(e.target.files?.[0] ?? null)}
            disabled={ocr.isAnalyzing}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={ocr.handleAnalyze}
            disabled={ocr.isAnalyzeDisabled}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            {ocr.isAnalyzing ? '解析中...' : '解析する'}
          </button>
        </div>

        {ocr.ocrError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {ocr.ocrError}
          </p>
        )}
      </section>

      {ocr.isAnalyzing && typeof document !== 'undefined' && createPortal(
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

      {settings.showSaveConfirm && (
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
                onClick={settings.closeSaveConfirm}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                キャンセル（保存しない）
              </button>
              <button
                type="button"
                onClick={() => {
                  settings.closeSaveConfirm()
                  settings.handleSaveSettings()
                }}
                disabled={settings.isPending}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {settings.isPending ? '保存中...' : '同意して保存する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
