import {
  FeedListSkeleton,
  SearchAndSortSkeleton,
} from '../_components/list/feed-skeleton'

export default function MyPageLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-4 w-56 animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>
      </div>
      <div className="mb-6">
        <SearchAndSortSkeleton />
      </div>
      <FeedListSkeleton showUserHeader={false} />
    </section>
  )
}
