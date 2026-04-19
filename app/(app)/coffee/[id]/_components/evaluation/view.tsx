'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import type { CoffeeEvaluationDisplay } from '@/lib/types/coffee'
import { deleteCoffeeEvaluation } from '@/lib/actions/coffee'
import { RadarChart } from '@/app/(app)/coffee/_components/shared/radar-chart'

type EvaluationDetailViewProps = {
  evaluation: CoffeeEvaluationDisplay
  currentUserId?: string
}

const ratings = ['overall_rating', 'acidity', 'bitterness', 'aroma'] as const
const labelMap: Record<typeof ratings[number], string> = {
  overall_rating: '総合評価',
  acidity: '酸味',
  bitterness: '苦味',
  aroma: '香り',
}
const colorMap: Record<typeof ratings[number], string> = {
  overall_rating: 'var(--rating-overall)',
  acidity: 'var(--rating-acidity)',
  bitterness: 'var(--rating-bitter)',
  aroma: 'var(--rating-aroma)',
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
    <article className="space-y-6 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="font-serif-display text-2xl text-[var(--ink)] animate-slide-up">{evaluation.bean_name}</h1>
        <p className="text-sm text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '60ms' }}>
          {evaluation.shop_name}
        </p>
        <p className="text-xs text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '90ms' }}>
          {displayBeanType}
        </p>
        {evaluation.roast_level && (
          <p className="text-xs text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '120ms' }}>
            {evaluation.roast_level}
          </p>
        )}
      </header>

      {evaluation.overall_rating !== null ? (
        <section className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Radar chart */}
          <div className="flex justify-center md:justify-start">
            <RadarChart
              values={{
                overall: evaluation.overall_rating,
                acidity: evaluation.acidity,
                aroma: evaluation.aroma,
                bitter: evaluation.bitterness,
              }}
              size={220}
              color="var(--espresso)"
            />
          </div>

          {/* Numeric ratings */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {ratings.map((key) => (
              <div
                key={key}
                className="rounded-sm border border-[var(--rule)] p-3 animate-slide-up"
                style={{ animationDelay: `${ratings.indexOf(key) * 40}ms` }}
              >
                <p className="font-mono-caps text-[10px] text-[var(--ink-3)]">{labelMap[key]}</p>
                <p
                  className="font-mono-num mt-1 text-3xl"
                  style={{ color: colorMap[key] }}
                >
                  {evaluation[key]!.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4 animate-fade-in">
          <p className="text-sm text-[var(--ink-3)]">まだ評価されていません</p>
          {isOwner && (
            <Link
              href={`/coffee/${evaluation.id}/evaluate`}
              className="mt-2 inline-flex items-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
            >
              評価する
            </Link>
          )}
        </section>
      )}

      {evaluation.notes && (
        <section className="rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4 animate-fade-in">
          <h2 className="font-mono-caps text-[10px] text-[var(--ink-3)]">感想</h2>
          <p className="mt-2 text-sm text-[var(--ink-2)]">{evaluation.notes}</p>
        </section>
      )}

      {isOwner && (
        <div className="flex gap-2">
          <Link
            href={`/coffee/${evaluation.id}/edit`}
            className="inline-flex items-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center rounded-sm border border-red-200 bg-[var(--paper)] px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? '削除中...' : '削除'}
          </button>
        </div>
      )}
    </article>
  )
}
