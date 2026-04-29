import { ShopListSkeleton, ShopSearchSkeleton } from './_components/shop-skeleton'

export default function ShopsLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:py-10">
      <header className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-sm bg-[var(--rule)]" />
        <div className="h-4 w-72 animate-pulse rounded-sm bg-[var(--rule)]" />
      </header>

      <ShopSearchSkeleton />

      <ShopListSkeleton />
    </section>
  )
}
