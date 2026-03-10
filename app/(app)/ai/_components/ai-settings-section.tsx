import { LlmSettingsPanel } from './llm-settings-panel'
import type { useAiSettingsController } from './use-ai-settings-controller'

type AiSettingsState = ReturnType<typeof useAiSettingsController>

type Props = {
  settings: AiSettingsState
  providerLabel: string
}

export function AiSettingsSection({ settings, providerLabel }: Props) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">AIプロバイダー設定</h2>

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
  )
}
