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
    initialSettings?.providerTemplate ?? 'together'
  )
  const [provider, setProvider] = useState<LlmProviderType>(
    initialSettings?.provider ?? 'openai_compatible'
  )
  const [apiUrl, setApiUrl] = useState(initialSettings?.apiUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState(initialSettings?.modelName ?? '')
  const [modelOptions, setModelOptions] = useState<string[]>([])
  const [isSearchingModels, setIsSearchingModels] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const selectedProvider = KNOWN_PROVIDERS.find((p) => p.template === selectedTemplate)
  const showApiUrl = provider === 'openai_compatible' || provider === 'ollama'
  const showApiKey = selectedProvider?.requiresApiKey ?? true
  const hasExistingKey = initialSettings?.hasApiKey ?? false

  function handleProviderSelect(template: string) {
    const p = KNOWN_PROVIDERS.find((p) => p.template === template)
    if (!p) return
    setSelectedTemplate(template)
    setProvider(p.providerType)
    setApiUrl(p.baseUrl ?? '')
    setModelName(p.defaultModel)
    setModelOptions([])
    setError(null)
  }

  async function handleSearchModels() {
    setIsSearchingModels(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/models')
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'モデル一覧の取得に失敗しました')
        return
      }
      const json = await res.json()
      setModelOptions(json.models ?? [])
    } catch {
      setError('モデル一覧の取得に失敗しました')
    } finally {
      setIsSearchingModels(false)
    }
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
            placeholder="https://api.example.com/v1"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <p className="text-xs text-neutral-500">
            APIキーはAES-256-GCMで暗号化して保存されます
          </p>
        </div>
      )}

      {/* Model name + search */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800">
          モデル名
        </label>
        <div className="flex gap-2">
          {modelOptions.length > 0 ? (
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="例: meta-llama/Llama-Vision-Free"
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          )}
          <button
            type="button"
            onClick={handleSearchModels}
            disabled={isSearchingModels}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            {isSearchingModels ? '検索中...' : 'モデルを検索'}
          </button>
        </div>
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
