import type { Metadata } from 'next'
import { SearchAndSort } from '../_components/list/search-and-sort'
import { normalizeSearchParams, type SearchParams } from '../_components/list/search-config'
import { CommunityContainer } from './_containers/container'

export const metadata: Metadata = {
  title: 'コミュニティフィード',
  description: 'みんなのコーヒー評価を見てみましょう。',
}

type CommunityPageProps = {
  searchParams?: Promise<SearchParams>
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const resolved = await searchParams
  const normalizedSearchParams = normalizeSearchParams(resolved)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl text-[var(--ink)] animate-slide-up">Community</h1>
          <p className="text-sm text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '80ms' }}>
            みんなの評価をチェックしましょう。
          </p>
        </div>
      </div>
      <div className="mb-6">
        <SearchAndSort />
      </div>
      <CommunityContainer searchParams={normalizedSearchParams} />
    </section>
  )
}
