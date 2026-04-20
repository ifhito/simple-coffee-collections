import type { Metadata } from 'next'
import { getUserProfile } from '@/lib/api/user'
import { SearchAndSort } from '@/app/(app)/coffee/_components/list/search-and-sort'
import { normalizeSearchParams, type SearchParams } from '@/app/(app)/coffee/_components/list/search-config'
import { ProfileContainer } from './_containers/profile-container'
import { EvaluationsContainer } from './_containers/evaluations-container'

type UserProfilePageProps = {
  params: Promise<{ userId: string }>
  searchParams?: Promise<SearchParams>
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { userId } = await params
  const profile = await getUserProfile(userId)
  const displayName = profile.display_name || '匿名ユーザー'

  return {
    title: `${displayName}のプロフィール`,
    description: `${displayName}のコーヒー評価を見てみましょう。`,
  }
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { userId } = await params
  const resolved = await searchParams
  const normalizedSearchParams = normalizeSearchParams(resolved)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 animate-fade-in">
      <ProfileContainer userId={userId} />

      <div className="mt-8 mb-6">
        <h2 className="font-serif-display text-xl text-[var(--ink)] mb-4">公開評価</h2>
        <SearchAndSort />
      </div>

      <EvaluationsContainer userId={userId} searchParams={normalizedSearchParams} />
    </section>
  )
}
