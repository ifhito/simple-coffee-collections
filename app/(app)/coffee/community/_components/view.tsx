import Link from 'next/link'
import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'
import { CoffeeCard } from '../../_components/list/card'
import { EmptyState } from '../../_components/shared/empty-state'

type CommunityViewProps = {
  evaluations: CoffeeEvaluationWithUser[]
}

export function CommunityView({ evaluations }: CommunityViewProps) {
  if (!evaluations.length) {
    return <EmptyState message="まだ公開評価がありません" />
  }

  return (
    <div
      data-testid="coffee-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {evaluations.map((evaluation) => (
        <div key={evaluation.id} className="animate-card">
          <div className="mb-2">
            <Link
              href={`/users/${evaluation.user_id}`}
              className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-amber-600 transition-colors"
            >
              <span>👤</span>
              <span>{evaluation.display_name || '匿名ユーザー'}</span>
            </Link>
          </div>
          <CoffeeCard evaluation={evaluation} />
        </div>
      ))}
    </div>
  )
}
