'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import { RatingStars } from '@/app/(app)/coffee/_components/shared/rating-stars'
import { deleteCoffeeEvaluation } from '@/lib/actions/coffee'

type EvaluationDetailViewProps = {
  evaluation: CoffeeEvaluation
  currentUserId?: string
}

const ratings = ['overall_rating', 'acidity', 'bitterness', 'aroma'] as const
const labelMap: Record<typeof ratings[number], string> = {
  overall_rating: '総合評価',
  acidity: '酸味',
  bitterness: '苦味',
  aroma: '香り',
}

export function EvaluationDetailView({ evaluation, currentUserId }: EvaluationDetailViewProps) {
  const isOwner = evaluation.user_id === currentUserId
  const [isPending, startTransition] = useTransition()
  const displayBeanType = evaluation.bean_type === 'Unknown' ? '産地不明' : evaluation.bean_type

  const handleDelete = () => {
    const confirmed = window.confirm('本当に削除しますか？')
    if (!confirmed) return

    startTransition(async () => {
      await deleteCoffeeEvaluation(evaluation.id)
    })
  }

  return (
    <article className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900 animate-slide-up">{evaluation.bean_name}</h1>
        <p className="text-sm text-neutral-600 animate-slide-up" style={{ animationDelay: '60ms' }}>
          {evaluation.shop_name}
        </p>
        <p className="text-xs text-neutral-500 animate-slide-up" style={{ animationDelay: '90ms' }}>
          {displayBeanType}
        </p>
        {evaluation.roast_level && (
          <p className="text-xs text-neutral-500 animate-slide-up" style={{ animationDelay: '120ms' }}>
            {evaluation.roast_level}
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ratings.map((key) => (
          <div
            key={key}
            className="rounded-md border border-neutral-100 p-3 animate-slide-up"
            style={{ animationDelay: `${ratings.indexOf(key) * 40}ms` }}
          >
            <p className="text-xs text-neutral-500">{labelMap[key]}</p>
            <RatingStars rating={evaluation[key]} size="md" />
          </div>
        ))}
      </section>

      {evaluation.notes && (
        <section className="rounded-md border border-neutral-100 bg-neutral-50 p-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-neutral-800">メモ</h2>
          <p className="mt-2 text-sm text-neutral-700">{evaluation.notes}</p>
        </section>
      )}

      {isOwner && (
        <div className="flex gap-2">
          <Link
            href={`/coffee/${evaluation.id}/edit`}
            className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? '削除中...' : '削除'}
          </button>
        </div>
      )}
    </article>
  )
}
