import type { Metadata } from 'next'
import { EvaluationForm } from '../_components/evaluation-form'

export const metadata: Metadata = {
  title: '新規コーヒー評価',
  description: 'コーヒーの評価を新規作成します。',
}

export default function NewCoffeeEvaluationPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">New</p>
        <h1 className="text-2xl font-bold text-neutral-900">コーヒー評価を作成</h1>
        <p className="text-sm text-neutral-600">
          香り・酸味・苦味・総合評価をスライダーで入力し、メモを残しましょう。
        </p>
      </header>

      <EvaluationForm />
    </section>
  )
}
