import type { useAiSettingsController } from './use-ai-settings-controller'

type AiSettingsState = ReturnType<typeof useAiSettingsController>

type Props = {
  settings: AiSettingsState
}

export function AiSaveConfirmDialog({ settings }: Props) {
  if (!settings.showSaveConfirm) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-confirm-title"
    >
      <div className="w-full max-w-md rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-xl">
        <h3 id="save-confirm-title" className="mb-3 text-base font-semibold text-[var(--ink)]">
          APIキーを保存する前にご確認ください
        </h3>
        <ul className="mb-4 space-y-2 text-sm text-[var(--ink-2)]">
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-[var(--espresso)]">⚠</span>
            <span>
              APIキーはサーバー側で暗号化して保存されますが、運用上のセキュリティリスクをゼロにはできません。第三者へのキーの漏洩等について、本アプリは一切の責任を負いません。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-[var(--ink-3)]">ℹ</span>
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
            className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
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
            className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] disabled:opacity-50"
          >
            {settings.isPending ? '保存中...' : '同意して保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
