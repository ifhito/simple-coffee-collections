import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShopSearch } from './_components/shop-search'
import { ShopList } from './_components/shop-list'

export const metadata: Metadata = {
  title: '店舗一覧',
  description: '登録されている店舗を検索・閲覧できます。',
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:py-10">
      <header className="space-y-1">
        <h1 className="font-serif-display text-2xl text-[var(--ink)]">店舗一覧</h1>
        <p className="text-sm text-[var(--ink-3)]">
          コーヒー評価に登録された店舗を検索できます。
        </p>
      </header>

      <Suspense fallback={null}>
        <ShopSearch />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-[var(--ink-3)]">読み込み中...</p>}>
        <ShopList search={search} />
      </Suspense>
    </section>
  )
}
