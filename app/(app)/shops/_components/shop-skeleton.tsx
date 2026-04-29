export function ShopSearchSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4">
      <div className="flex w-full items-center gap-2">
        <div className="h-4 w-8 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-9 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
      </div>
    </div>
  )
}

type ShopListSkeletonProps = {
  count?: number
}

export function ShopListSkeleton({ count = 6 }: ShopListSkeletonProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4"
        >
          <div className="h-5 w-3/4 animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>
      ))}
    </div>
  )
}
