import type { CoffeeEvaluationSortOption } from '@/lib/types/coffee'

export const SORT_OPTIONS = [
  { value: 'created_at_desc', label: '新しい順' },
  { value: 'created_at_asc', label: '古い順' },
  { value: 'rating_desc', label: '評価が高い順' },
  { value: 'rating_asc', label: '評価が低い順' },
  { value: 'shop_name_asc', label: '店名 A-Z' },
  { value: 'shop_name_desc', label: '店名 Z-A' },
]

export const DEFAULT_SORT = 'created_at_desc'

export type SearchParams = {
  search?: string
  sort?: CoffeeEvaluationSortOption
}

/**
 * Normalize incoming search params so downstream data-fetching receives
 * stable values and empty strings are stripped.
 */
export function normalizeSearchParams(searchParams?: SearchParams): SearchParams {
  const search = searchParams?.search?.trim() ?? ''
  const rawSort = searchParams?.sort?.trim()
  const sort = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as CoffeeEvaluationSortOption)
    : DEFAULT_SORT

  return {
    search: search || undefined,
    sort,
  }
}
