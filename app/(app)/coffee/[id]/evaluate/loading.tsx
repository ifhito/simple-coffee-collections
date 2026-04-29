export default function EvaluateLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-6 space-y-3">
        <div className="h-7 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="space-y-2 rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4">
          <div className="h-5 w-3/4 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-4 w-1/2 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-3 w-1/3 animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>
      </div>

      <div className="space-y-6 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded-sm bg-[var(--rule)]" />
              <div className="h-6 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-24 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--rule)]" />
        </div>
      </div>
    </section>
  )
}
