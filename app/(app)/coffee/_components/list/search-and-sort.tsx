'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DEFAULT_SORT, SORT_OPTIONS } from './search-config'
const DEBOUNCE_MS = 300

export function SearchAndSort() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname() || '/coffee'

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [sort, setSort] = useState(() => searchParams.get('sort') ?? DEFAULT_SORT)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const initialState = useRef({
    search: searchParams.get('search') ?? '',
    sort: searchParams.get('sort') ?? DEFAULT_SORT,
    handled: false,
  })

  const buildUrl = useMemo(() => {
    return (nextSearch: string, nextSort: string) => {
      const params = new URLSearchParams()
      if (nextSearch) {
        params.set('search', nextSearch)
      }
      params.set('sort', nextSort || DEFAULT_SORT)
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    }
  }, [pathname])

  useEffect(() => {
    if (
      !initialState.current.handled &&
      search === initialState.current.search &&
      sort === initialState.current.sort
    ) {
      initialState.current.handled = true
      return
    }

    initialState.current.handled = true

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      router.push(buildUrl(search, sort))
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [search, sort, router, buildUrl])

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value
    setSort(nextSort)
    router.push(buildUrl(search, nextSort))
  }

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex w-full items-center gap-2 text-sm text-[var(--ink-2)] sm:max-w-md">
        <span className="font-mono-caps text-[11px] whitespace-nowrap text-[var(--ink-3)]">検索</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-sm border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30"
          placeholder="店名・豆・焙煎度で検索"
          aria-label="検索"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
        <span className="font-mono-caps text-[11px] whitespace-nowrap text-[var(--ink-3)]">並び順</span>
        <select
          value={sort}
          onChange={handleSortChange}
          className="rounded-sm border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30"
          aria-label="並び順"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
