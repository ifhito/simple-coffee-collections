export default function EditCoffeeLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6 space-y-2">
        <div className="h-3 w-12 animate-pulse rounded bg-amber-200" />
        <div className="h-7 w-56 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-neutral-200" />
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
              <div className="h-10 w-full animate-pulse rounded bg-neutral-100" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
              <div className="h-6 w-full animate-pulse rounded bg-amber-100" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </section>
  )
}
