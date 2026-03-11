/**
 * Shop Search Provider Port
 *
 * @module lib/application/ports/shop-search-provider
 */

export interface ShopSearchResult {
  id: string
  name: string
}

export interface ShopSearchProvider {
  search(query: string, limit?: number): Promise<ShopSearchResult[]>
}
