import {
  FeedListSkeleton,
  SearchAndSortSkeleton,
} from '@/app/(app)/coffee/_components/list/feed-skeleton'

export default function UserProfileLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-4 w-64 animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>
      </div>

      <div className="mt-8 mb-6">
        <div className="mb-4 h-6 w-24 animate-pulse rounded-sm bg-[var(--rule)]" />
        <SearchAndSortSkeleton />
      </div>

      <FeedListSkeleton showUserHeader={false} count={3} />
    </section>
  )
}
