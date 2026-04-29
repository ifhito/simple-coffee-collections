/**
 * Shop Search Provider Port
 *
 * @module lib/application/ports/shop-search-provider
 */

export type ShopSearchResult = {
  id: string
  name: string
}

export type ShopSearchProvider = {
  search(query: string, limit?: number): Promise<ShopSearchResult[]>
}
