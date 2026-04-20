export default function CoffeeDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="space-y-6 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-4 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2 rounded-sm border border-[var(--rule)] p-3">
              <div className="h-3 w-16 animate-pulse rounded-sm bg-[var(--rule)]" />
              <div className="h-8 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4">
          <div className="h-4 w-20 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-16 w-full animate-pulse rounded-sm bg-[var(--rule)]" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--rule)]" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--rule)]" />
        </div>
      </div>
    </section>
  )
}
