import type { Metadata } from 'next'
import { getLlmSettings } from '@/lib/actions/llm-settings'
import { LlmSettingsForm } from './_components/llm-settings-form'

export const metadata: Metadata = {
  title: 'AI設定',
  description: 'OCR解析に使用するLLMのAPIキーとモデルを設定します。',
}

export default async function LlmSettingsPage() {
  const settings = await getLlmSettings()

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900">AI設定</h1>
        <p className="text-sm text-neutral-600">
          コーヒーパッケージ画像の自動解析に使用するAI（LLM）のプロバイダーとAPIキーを設定します。
          APIキーはサーバー側で暗号化して保存されます。
        </p>
      </header>
      <LlmSettingsForm initialSettings={settings} />
    </section>
  )
}
