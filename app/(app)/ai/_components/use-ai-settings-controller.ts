import { useState, useTransition } from 'react'
import { saveLlmSettings, deleteLlmSettings } from '@/lib/actions/llm-settings'
import { KNOWN_PROVIDERS } from '@/lib/constants/llm-providers'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings'
import { getInitialProvider, getInitialTemplate, type AiSettingsMode } from './ai-features-helpers'

export function useAiSettingsController(initialSettings: LlmSettingsOutput | null) {
  const [mode, setMode] = useState<AiSettingsMode>(initialSettings ? 'view' : 'new')
  const [currentSettings, setCurrentSettings] = useState<LlmSettingsOutput | null>(initialSettings)
  const [selectedTemplate, setSelectedTemplate] = useState(getInitialTemplate(initialSettings))
  const [provider, setProvider] = useState<LlmProviderType>(getInitialProvider(initialSettings))
  const [apiUrl, setApiUrl] = useState(initialSettings?.apiUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState(initialSettings?.modelName ?? '')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  function handleProviderSelect(template: string) {
    const found = KNOWN_PROVIDERS.find((item) => item.template === template)
    if (!found) return

    setSelectedTemplate(template)
    setProvider(found.providerType)
    setApiUrl(found.baseUrl ?? '')
    setModelName(found.defaultModel)
  }

  function handleEnterEdit() {
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

  function openSaveConfirm() {
    setShowSaveConfirm(true)
  }

  function closeSaveConfirm() {
    setShowSaveConfirm(false)
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
    if (!confirm('AIプロバイダー設定を削除してもよいですか？')) return

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

  return {
    mode,
    currentSettings,
    selectedTemplate,
    provider,
    apiUrl,
    apiKey,
    modelName,
    actionError,
    isPending,
    showSaveConfirm,
    setApiUrl,
    setApiKey,
    setModelName,
    handleProviderSelect,
    handleEnterEdit,
    handleCancelEdit,
    handleSaveSettings,
    handleDeleteSettings,
    openSaveConfirm,
    closeSaveConfirm,
  }
}
