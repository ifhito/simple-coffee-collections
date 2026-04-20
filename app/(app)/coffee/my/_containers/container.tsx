import { headers } from 'next/headers'
import type { CoffeeEvaluationSearchParams } from '@/lib/types/coffee'
import { getCurrentUser } from '@/lib/api/auth'
import { getCoffeeEvaluations } from '@/lib/api/coffee'
import { buildProfileShareUrl } from '@/lib/utils/url'
import { MyPageView } from '../_components/view'

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
    const headerList = await headers()
    profileShareUrl = buildProfileShareUrl(user.id, headerList)
  } catch {
    profileShareUrl = buildProfileShareUrl(user.id)
  }

  // display_name is not rendered (showUserHeader=false) but FeedCard requires the field
  const evaluationsWithUser = evaluations.map((e) => ({ ...e, display_name: null }))

  return <MyPageView evaluations={evaluationsWithUser} profileShareUrl={profileShareUrl} />
}
