import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'
import { EmptyState } from '../../_components/shared/empty-state'
import { FeedCard } from './feed-card'

type CommunityViewProps = {
  evaluations: CoffeeEvaluationWithUser[]
}

export function CommunityView({ evaluations }: CommunityViewProps) {
  if (!evaluations.length) {
    return <EmptyState message="まだ公開評価がありません" />
  }

  return (
    <div
      data-testid="community-feed"
      className="mx-auto flex max-w-2xl flex-col gap-6"
    >
      {evaluations.map((evaluation) => (
        <div key={evaluation.id} className="animate-card">
          <FeedCard evaluation={evaluation} />
        </div>
      ))}
    </div>
  )
}
