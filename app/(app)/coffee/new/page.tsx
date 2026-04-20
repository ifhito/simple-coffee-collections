import type { Metadata } from 'next'
import type { EvaluationFormDefaultValues } from '../_components/evaluation-form'
import { NewEvaluationContainer } from './_components/new-evaluation-container'

export const metadata: Metadata = {
  title: '新規コーヒー評価',
  description: 'コーヒーの評価を新規作成します。',
}

export default async function NewCoffeeEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{
    bean_name?: string
    bean_type?: string
    roast_level?: string
    shop_name?: string
  }>
}) {
  const params = await searchParams
  const defaultValues: EvaluationFormDefaultValues | undefined =
    params.bean_name || params.roast_level || params.shop_name
      ? {
          bean_name: params.bean_name,
          bean_type: params.bean_type,
          roast_level: params.roast_level,
          shop_name: params.shop_name,
        }
      : undefined

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <p className="font-mono-caps text-[11px] text-[var(--espresso)]">NEW ENTRY</p>
        <h1 className="font-serif-display text-2xl text-[var(--ink)]">コーヒー評価を作成</h1>
        <p className="text-sm text-[var(--ink-3)]">
          香り・酸味・苦味・総合評価をスライダーで入力し、感想を残しましょう。
        </p>
      </header>

      <NewEvaluationContainer defaultValues={defaultValues} />
    </section>
  )
}
