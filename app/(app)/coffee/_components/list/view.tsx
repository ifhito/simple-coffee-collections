import Link from 'next/link'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import { CoffeeCard } from './card'

type CoffeeListViewProps = {
  evaluations: Pick<
    CoffeeEvaluation,
    'id' | 'shop_name' | 'bean_type' | 'bean_name' | 'overall_rating' | 'created_at'
  >[]
}

export function CoffeeListView({ evaluations }: CoffeeListViewProps) {
  if (!evaluations.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-700 animate-fade-in">
        <p className="mb-3">まだ評価がありません</p>
        <Link
          href="/coffee/new"
          className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
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
