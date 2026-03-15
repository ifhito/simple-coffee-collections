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
        <h1 className="text-2xl font-bold text-neutral-900">
          {isReEvaluation ? '再評価' : '評価を追加'}
        </h1>
        <div className="rounded-md border border-neutral-100 bg-neutral-50 p-4">
          <p className="text-lg font-semibold text-neutral-900">{evaluation.bean_name}</p>
          {evaluation.shop_name && (
            <p className="text-sm text-neutral-600">{evaluation.shop_name}</p>
          )}
          {evaluation.roast_level && (
            <p className="text-xs text-neutral-500">{evaluation.roast_level}</p>
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
