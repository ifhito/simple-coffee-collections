import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getCoffeeEvaluation } from '@/lib/api/coffee'
import { createClient } from '@/lib/supabase/server'
import { EvaluateForm } from '@/app/(app)/coffee/_components/evaluate-form'

export const metadata: Metadata = {
  title: '評価を追加',
  description: 'コーヒー豆の評価を追加します。',
}

export default async function EvaluatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const evaluation = await getCoffeeEvaluation(id)

  if (!evaluation) {
    notFound()
  }

  if (evaluation.user_id !== user.id) {
    notFound()
  }

  const isReEvaluation = evaluation.overall_rating !== null

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="font-serif-display text-2xl text-[var(--ink)]">
          {isReEvaluation ? '再評価' : '評価を追加'}
        </h1>
        <div className="rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4">
          <p className="text-lg font-semibold text-[var(--ink)]">{evaluation.bean_name}</p>
          {evaluation.shop_name && (
            <p className="text-sm text-[var(--ink-3)]">{evaluation.shop_name}</p>
          )}
          {evaluation.roast_level && (
            <p className="text-xs text-[var(--ink-3)]">{evaluation.roast_level}</p>
          )}
        </div>
      </div>
      <EvaluateForm
        evaluationId={id}
        defaultValues={
          isReEvaluation
            ? {
                overall_rating: evaluation.overall_rating ?? undefined,
                acidity: evaluation.acidity ?? undefined,
                bitterness: evaluation.bitterness ?? undefined,
                aroma: evaluation.aroma ?? undefined,
                notes: evaluation.notes,
              }
            : {
                notes: evaluation.notes,
              }
        }
      />
    </section>
  )
}
