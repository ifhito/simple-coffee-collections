import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCoffeeEvaluation } from '@/lib/api/coffee'
import { createClient } from '@/lib/supabase/server'
import { EvaluationForm } from '../../_components/evaluation-form'

export const metadata: Metadata = {
  title: 'コーヒー評価を編集',
  description: '既存のコーヒー評価を編集します。',
}

export default async function EditCoffeeEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const evaluation = await getCoffeeEvaluation(id)
  if (!evaluation) {
    return notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || evaluation.user_id !== user.id) {
    throw new Error('権限がありません')
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Edit</p>
        <h1 className="text-2xl font-bold text-neutral-900">コーヒー評価を編集</h1>
        <p className="text-sm text-neutral-600">
          以前の評価内容を見直し、スライダーやテキストを更新できます。
        </p>
      </header>

      <EvaluationForm initialData={evaluation} />
    </section>
  )
}
