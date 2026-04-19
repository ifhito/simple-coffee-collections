import { LlmSettingsPanel } from './llm-settings-panel'
import type { useAiSettingsController } from './use-ai-settings-controller'

type AiSettingsState = ReturnType<typeof useAiSettingsController>

type Props = {
  settings: AiSettingsState
  providerLabel: string
}

export function AiSettingsSection({ settings, providerLabel }: Props) {
  return (
    <section className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--ink)]">AIプロバイダー設定</h2>

      {settings.mode === 'view' && settings.currentSettings && (
        <div className="space-y-4">
          <div className="rounded-sm bg-[var(--background-2)] px-4 py-3 text-sm text-[var(--ink-2)]">
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
              className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
            >
              変更する
            </button>
            <button
              type="button"
              onClick={settings.handleDeleteSettings}
              disabled={settings.isPending}
              className="rounded-sm border border-red-200 bg-[var(--paper)] px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
              className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] disabled:opacity-50"
            >
              {settings.isPending ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={settings.handleCancelEdit}
              className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
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
          <p className="text-sm text-[var(--ink-3)]">
            設定を保存しなくても、このまま解析ボタンを押して一時利用できます。
          </p>
          <button
            type="button"
            onClick={settings.openSaveConfirm}
            disabled={settings.isPending}
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:bg-[var(--espresso)] disabled:opacity-50"
          >
            この設定を保存する
          </button>
        </div>
      )}
    </section>
  )
}
