export type ShopSuggestion = {
  id: string
  name: string
}

const SEARCH_LIMIT = 10

export function buildShopSearchUrl(query: string) {
  return `/api/shops/search?q=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}`
}

export function getNextActiveIndex(
  currentIndex: number,
  suggestionCount: number,
  direction: 'next' | 'previous'
) {
  if (suggestionCount <= 0) return -1

  if (direction === 'next') {
    return currentIndex < suggestionCount - 1 ? currentIndex + 1 : 0
  }

  return currentIndex > 0 ? currentIndex - 1 : suggestionCount - 1
}

export function shouldShowSuggestions(query: string, suggestionCount: number) {
  return query.trim().length > 0 && suggestionCount > 0
}
