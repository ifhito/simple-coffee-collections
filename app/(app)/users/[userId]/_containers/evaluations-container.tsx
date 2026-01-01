import { getCoffeeEvaluationsWithUser } from '@/lib/api/coffee'
import { CoffeeCard } from '@/app/(app)/coffee/_components/list/card'
import { EmptyState } from '@/app/(app)/coffee/_components/shared/empty-state'
import type { CoffeeEvaluationSearchParams } from '@/lib/types/coffee'

type EvaluationsContainerProps = {
  userId: string
  searchParams?: CoffeeEvaluationSearchParams
}

export async function EvaluationsContainer({ userId, searchParams }: EvaluationsContainerProps) {
  // Fetch only public evaluations for this user
  const evaluations = await getCoffeeEvaluationsWithUser({
    ...searchParams,
    user_id: userId,
    is_public: true,
  })

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
          <CoffeeCard evaluation={evaluation} />
        </div>
      ))}
    </div>
  )
}
