'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const DEBOUNCE_MS = 300

export function ShopSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname() || '/shops'

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const initialState = useRef({
    search: searchParams.get('search') ?? '',
    handled: false,
  })

  const buildUrl = useMemo(() => {
    return (nextSearch: string) => {
      const params = new URLSearchParams()
      if (nextSearch) {
        params.set('search', nextSearch)
      }
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    }
  }, [pathname])

  useEffect(() => {
    if (
      !initialState.current.handled &&
      search === initialState.current.search
    ) {
      initialState.current.handled = true
      return
    }

    initialState.current.handled = true

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      router.push(buildUrl(search))
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [search, router, buildUrl])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <label className="flex w-full items-center gap-2 text-sm text-neutral-700">
        <span className="whitespace-nowrap">検索</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder="店名で検索"
          aria-label="店舗検索"
        />
      </label>
    </div>
  )
}
