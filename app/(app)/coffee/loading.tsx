export default function CoffeeListLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-6 h-6 w-40 animate-pulse rounded-sm bg-[var(--rule)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-32 animate-pulse rounded-sm border border-[var(--rule)] bg-[var(--background-2)]"
          />
        ))}
      </div>
    </div>
  )
}
