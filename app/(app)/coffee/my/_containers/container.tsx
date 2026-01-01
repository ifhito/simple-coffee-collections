import { getCurrentUser } from '@/lib/api/auth'
import { getCoffeeEvaluations } from '@/lib/api/coffee'
import { buildProfileShareUrl } from '@/lib/utils/url'
import { headers } from 'next/headers'
import { MyPageView } from '../_components/view'
import type { CoffeeEvaluationSearchParams } from '@/lib/types/coffee'

type MyPageContainerProps = {
  searchParams?: CoffeeEvaluationSearchParams
}

export async function MyPageContainer({ searchParams }: MyPageContainerProps) {
  // getCurrentUser will redirect to /login if not authenticated
  const user = await getCurrentUser()

  // Fetch all evaluations for the current user (both public and private)
  const evaluations = await getCoffeeEvaluations({
    ...searchParams,
    user_id: user.id,
  })

  let profileShareUrl: string | undefined
  try {
    profileShareUrl = buildProfileShareUrl(user.id, headers())
  } catch {
    profileShareUrl = buildProfileShareUrl(user.id)
  }

  return <MyPageView evaluations={evaluations} profileShareUrl={profileShareUrl} />
}
