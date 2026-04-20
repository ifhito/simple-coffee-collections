import type { Metadata } from 'next'
import { SearchAndSort } from '../_components/list/search-and-sort'
import { normalizeSearchParams, type SearchParams } from '../_components/list/search-config'
import { MyPageContainer } from './_containers/container'

export const metadata: Metadata = {
  title: 'マイページ',
  description: 'あなたのコーヒー評価一覧を確認できます。',
}

type MyPageProps = {
  searchParams?: Promise<SearchParams>
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const resolved = await searchParams
  const normalizedSearchParams = normalizeSearchParams(resolved)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl text-[var(--ink)] animate-slide-up">マイコレクション</h1>
          <p className="text-sm text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '80ms' }}>
            あなたの評価を管理しましょう。
          </p>
        </div>
      </div>
      <div className="mb-6">
        <SearchAndSort />
      </div>
      <MyPageContainer searchParams={normalizedSearchParams} />
    </section>
  )
}
