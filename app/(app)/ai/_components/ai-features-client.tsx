'use client'

import { useRouter } from 'next/navigation'
import type { LlmSettingsOutput } from '@/lib/application/llm-settings'
import { getProviderLabel } from './ai-features-helpers'
import { useAiSettingsController } from './use-ai-settings-controller'
import { useAiOcrController } from './use-ai-ocr-controller'
import { useBeanRecommendationController } from './use-bean-recommendation-controller'
import { AiSettingsSection } from './ai-settings-section'
import { AiOcrSection } from './ai-ocr-section'
import { AiBeanRecommendationSection } from './ai-bean-recommendation-section'
import { AiAnalyzingOverlay } from './ai-analyzing-overlay'
import { AiSaveConfirmDialog } from './ai-save-confirm-dialog'

type Props = {
  initialSettings: LlmSettingsOutput | null
}

export function AiFeaturesClient({ initialSettings }: Props) {
  const router = useRouter()

  const settings = useAiSettingsController(initialSettings)
  const recommendation = useBeanRecommendationController()
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
      <AiSettingsSection settings={settings} providerLabel={providerLabel} />
      <AiOcrSection ocr={ocr} />
      <AiBeanRecommendationSection recommendation={recommendation} />
      <AiAnalyzingOverlay isVisible={ocr.isAnalyzing} />
      <AiSaveConfirmDialog settings={settings} />
    </div>
  )
}
