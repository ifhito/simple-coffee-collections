import { getCoffeeEvaluationsWithUser } from '@/lib/api/coffee'
import { CommunityView } from '../_components/view'
import type { CoffeeEvaluationSearchParams } from '@/lib/types/coffee'

type CommunityContainerProps = {
  searchParams?: CoffeeEvaluationSearchParams
}

export async function CommunityContainer({ searchParams }: CommunityContainerProps) {
  // Fetch all public evaluations with user display names (no auth required)
  const evaluations = await getCoffeeEvaluationsWithUser({
    ...searchParams,
    is_public: true,
  })

  return <CommunityView evaluations={evaluations} />
}
