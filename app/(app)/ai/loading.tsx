export default function AiLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-2">
        <div className="h-3 w-6 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-7 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-4 w-80 animate-pulse rounded-sm bg-[var(--rule)]" />
      </header>

      <div className="space-y-8">
        <div className="space-y-4 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
          <div className="h-5 w-40 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-sm bg-[var(--rule)]" />
                <div className="h-10 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--rule)]" />
          </div>
        </div>

        <div className="space-y-4 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
          <div className="h-5 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
          <div className="h-32 w-full animate-pulse rounded-sm bg-[var(--background-2)]" />
          <div className="flex justify-end">
            <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--rule)]" />
          </div>
        </div>
      </div>
    </section>
  )
}
