import type { Metadata } from 'next'
import { getLlmSettings } from '@/lib/actions/llm-settings'
import { AiFeaturesClient } from './_components/ai-features-client'

export const metadata: Metadata = {
  title: 'AI機能',
  description: 'AIプロバイダー設定とコーヒーパッケージ画像解析',
}

export default async function AiPage() {
  const settings = await getLlmSettings()
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <p className="font-mono-caps text-[11px] text-[var(--espresso)]">AI</p>
        <h1 className="font-serif-display text-2xl text-[var(--ink)]">AI機能</h1>
        <p className="text-sm text-[var(--ink-3)]">
          AIプロバイダーを設定して、コーヒーパッケージ画像を自動解析します。
        </p>
      </header>
      <AiFeaturesClient initialSettings={settings} />
    </section>
  )
}
