'use client'

import { useState, useTransition } from 'react'
import { saveLlmSettings } from '@/lib/actions/llm-settings'
import { KNOWN_PROVIDERS } from '@/lib/constants/llm-providers'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings'

type Props = {
  initialSettings: LlmSettingsOutput | null
}

export function LlmSettingsForm({ initialSettings }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialSettings?.providerTemplate ?? 'gemini'
  )
  const [provider, setProvider] = useState<LlmProviderType>(
    initialSettings?.provider ?? 'google'
  )
  const [apiUrl, setApiUrl] = useState(initialSettings?.apiUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState(initialSettings?.modelName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const selectedProvider = KNOWN_PROVIDERS.find((p) => p.template === selectedTemplate)
  const showApiUrl = provider === 'openai_compatible'
  // google and anthropic use SDK-native auth, no URL needed
  const showApiKey = selectedProvider?.requiresApiKey ?? true
  const hasExistingKey = initialSettings?.hasApiKey ?? false

  function handleProviderSelect(template: string) {
    const p = KNOWN_PROVIDERS.find((p) => p.template === template)
    if (!p) return
    setSelectedTemplate(template)
    setProvider(p.providerType)
    setApiUrl(p.baseUrl ?? '')
    setModelName(p.defaultModel)
    setError(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.set('provider', provider)
    formData.set('provider_template', selectedTemplate)
    formData.set('api_url', apiUrl)
    formData.set('model_name', modelName)
    if (apiKey.trim()) formData.set('api_key', apiKey.trim())

    startTransition(async () => {
      const result = await saveLlmSettings(formData)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
        setApiKey('')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
    >
      {/* Provider selection */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-800">プロバイダーを選択</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KNOWN_PROVIDERS.map((p) => (
            <button
              key={p.template}
              type="button"
              onClick={() => handleProviderSelect(p.template)}
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
          <label className="text-sm font-medium text-neutral-800">
            API URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
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
          <label className="text-sm font-medium text-neutral-800">
            APIキー
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
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
        <label className="text-sm font-medium text-neutral-800">
          モデル名
        </label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="例: meta-llama/Llama-Vision-Free"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600" role="status">
          AI設定を保存しました
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
      >
        {isPending ? '保存中...' : '設定を保存'}
      </button>
    </form>
  )
}
