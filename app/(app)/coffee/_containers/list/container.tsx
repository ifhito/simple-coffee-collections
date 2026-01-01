import { getCoffeeEvaluations } from '@/lib/api/coffee'
import { CoffeeListView } from '@/app/(app)/coffee/_components/list/view'
import type { CoffeeEvaluationSearchParams } from '@/lib/types/coffee'

type CoffeeListContainerProps = {
  searchParams?: CoffeeEvaluationSearchParams
}

export async function CoffeeListContainer(props: CoffeeListContainerProps = {}) {
  const { searchParams = {} } = props
  const evaluations = await getCoffeeEvaluations(searchParams)
  return <CoffeeListView evaluations={evaluations} />
}
