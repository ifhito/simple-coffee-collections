/**
 * Shop Search Service Interface
 *
 * Defines the contract for shop search functionality.
 * Implementations handle searching shops from both database and external APIs.
 *
 * @module lib/domain/services/shop-search-service.interface
 */

import { ShopSearchResult } from '../value-objects/shop-search-result'

/**
 * Shop search service interface
 *
 * Expected behavior:
 * - Search existing shops from database first
 * - If database results < 3, supplement with external API (Nominatim)
 * - Deduplicate results by shop name (case-insensitive)
 * - Return maximum of maxResults items
 * - Handle errors gracefully (return empty array on failure)
 */
export interface IShopSearchService {
  /**
   * Search for shops by query string
   * @param query - Search query (shop name)
   * @param maxResults - Maximum number of results to return (default: 5)
   * @returns Promise resolving to array of ShopSearchResult
   */
  searchShops(query: string, maxResults?: number): Promise<ShopSearchResult[]>
}

/**
 * Search options for shop search
 */
export interface ShopSearchOptions {
  /** Country code for API search (default: 'jp') */
  countryCode?: string
  /** Minimum database results before calling external API (default: 3) */
  minDbResultsForApiSkip?: number
}
