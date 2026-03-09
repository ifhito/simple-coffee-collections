'use client'

import { KNOWN_PROVIDERS } from '@/lib/constants/llm-providers'
import type { LlmProviderType } from '@/lib/domain/llm-settings'

type Props = {
  selectedTemplate: string
  provider: LlmProviderType
  apiUrl: string
  apiKey: string
  modelName: string
  hasExistingKey: boolean
  onProviderSelect: (template: string) => void
  onApiUrlChange: (value: string) => void
  onApiKeyChange: (value: string) => void
  onModelNameChange: (value: string) => void
}

export function LlmSettingsPanel({
  selectedTemplate,
  provider,
  apiUrl,
  apiKey,
  modelName,
  hasExistingKey,
  onProviderSelect,
  onApiUrlChange,
  onApiKeyChange,
  onModelNameChange,
}: Props) {
  const selectedProvider = KNOWN_PROVIDERS.find((p) => p.template === selectedTemplate)
  const showApiUrl = provider === 'openai_compatible'
  const showApiKey = selectedProvider?.requiresApiKey ?? true

  return (
    <div className="space-y-5">
      {/* Provider selection */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-800">プロバイダーを選択</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KNOWN_PROVIDERS.map((p) => (
            <button
              key={p.template}
              type="button"
              onClick={() => onProviderSelect(p.template)}
              className={`rounded-lg border p-3 text-left transition ${
                selectedTemplate === p.template
                  ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-400'
                  : 'border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <p className="text-xs font-semibold text-neutral-800">{p.label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* API URL */}
      {showApiUrl && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-800">API URL</label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => onApiUrlChange(e.target.value)}
            placeholder={
              selectedTemplate === 'custom'
                ? 'http://localhost:11434/v1（Ollama）または https://api.example.com/v1'
                : 'https://api.example.com/v1'
            }
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
      )}

      {/* API Key */}
      {showApiKey && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-800">APIキー</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={hasExistingKey ? '設定済み（変更する場合のみ入力）' : 'sk-...'}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <p className="text-xs text-neutral-500">
            {selectedTemplate === 'custom'
              ? 'Ollama等APIキー不要のサービスは入力不要。クラウドAPIの場合は入力してください。'
              : 'APIキーはAES-256-GCMで暗号化して保存されます'}
          </p>
        </div>
      )}

      {/* Model name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800">モデル名</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => onModelNameChange(e.target.value)}
          placeholder="例: meta-llama/Llama-Vision-Free"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
    </div>
  )
}
