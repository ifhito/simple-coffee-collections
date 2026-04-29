type FeedCardSkeletonProps = {
  showUserHeader?: boolean
}

function FeedCardSkeleton({ showUserHeader = true }: FeedCardSkeletonProps) {
  return (
    <article className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
      <header className="flex items-center justify-between">
        {showUserHeader ? (
          <div className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--rule)]" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded-sm bg-[var(--rule)]" />
              <div className="h-2.5 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
            </div>
          </div>
        ) : (
          <div className="h-2.5 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
        )}
        <div className="h-5 w-12 animate-pulse rounded-full bg-[var(--rule)]" />
      </header>

      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_200px] md:gap-6">
        <div>
          <div className="h-7 w-3/4 animate-pulse rounded-sm bg-[var(--background-2)]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded-sm bg-[var(--rule)]" />

          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded-sm bg-[var(--rule)]" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-[var(--rule)]" />
            <div className="h-4 w-11/12 animate-pulse rounded-sm bg-[var(--rule)]" />
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-[var(--rule)]" />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--rule)]" />
                <div className="h-3 w-8 animate-pulse rounded-sm bg-[var(--rule)]" />
                <div className="h-3 w-5 animate-pulse rounded-sm bg-[var(--rule)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid place-items-center">
          <div className="h-[190px] w-[190px] animate-pulse rounded-full bg-[var(--background-2)]" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--rule-2)] pt-4">
        <div className="h-3 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-3 w-20 animate-pulse rounded-sm bg-[var(--rule)]" />
      </div>
    </article>
  )
}

type FeedListSkeletonProps = {
  showUserHeader?: boolean
  count?: number
}

export function FeedListSkeleton({
  showUserHeader = true,
  count = 3,
}: FeedListSkeletonProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <FeedCardSkeleton key={idx} showUserHeader={showUserHeader} />
      ))}
    </div>
  )
}

export function SearchAndSortSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center gap-2 sm:max-w-md">
        <div className="h-3 w-8 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-9 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-12 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-9 w-32 animate-pulse rounded-sm bg-[var(--background-2)]" />
      </div>
    </div>
  )
}
