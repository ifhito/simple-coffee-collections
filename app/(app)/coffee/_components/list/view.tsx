import Link from 'next/link'
import type { CoffeeEvaluationDisplay } from '@/lib/types/coffee'
import { CoffeeCard } from './card'

type CoffeeListViewProps = {
  evaluations: Pick<
    CoffeeEvaluationDisplay,
    'id' | 'shop_name' | 'bean_type' | 'bean_name' | 'overall_rating' | 'created_at'
  >[]
}

export function CoffeeListView({ evaluations }: CoffeeListViewProps) {
  if (!evaluations.length) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--rule)] bg-[var(--background-2)] p-6 text-center text-sm text-[var(--ink-2)] animate-fade-in">
        <p className="mb-3">まだ評価がありません</p>
        <Link
          href="/coffee/new"
          className="inline-flex items-center justify-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
        >
          新規作成
        </Link>
      </div>
    )
  }

  return (
    <div
      data-testid="coffee-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {evaluations.map((evaluation) => (
        <div key={evaluation.id} className="animate-card">
          <CoffeeCard evaluation={evaluation} />
        </div>
      ))}
    </div>
  )
}
