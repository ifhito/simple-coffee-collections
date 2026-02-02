/**
 * Search Shop Use Case
 *
 * Orchestrates shop search from database and external API.
 * Implements the search priority: DB first, then conditional API call.
 *
 * @module lib/application/use-cases/search-shop-use-case
 */

import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'
import { IShopRepository } from '../../infrastructure/repositories/shop-repository.interface'
import { INominatimClient } from '../../infrastructure/nominatim/nominatim-types'

/**
 * Query validation constraints
 */
export const SEARCH_QUERY_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 100,
} as const

/**
 * Search configuration
 */
export interface SearchShopConfig {
  /** Maximum results to return (default: 5) */
  maxResults?: number
  /** Minimum DB results before skipping API call (default: 3) */
  minDbResultsForApiSkip?: number
}

const DEFAULT_CONFIG: Required<SearchShopConfig> = {
  maxResults: 5,
  minDbResultsForApiSkip: 3,
}

/**
 * Search Shop Use Case
 *
 * Orchestrates the shop search flow:
 * 1. Validate query
 * 2. Search database for existing shops
 * 3. If DB results < threshold, call Nominatim API
 * 4. Merge and deduplicate results
 * 5. Return top N results
 */
export class SearchShopUseCase {
  private readonly config: Required<SearchShopConfig>

  constructor(
    private readonly shopRepository: IShopRepository,
    private readonly nominatimClient: INominatimClient,
    config?: SearchShopConfig
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute the shop search
   * @param query - Search query (shop name)
   * @returns Array of ShopSearchResult
   * @throws Error if query is invalid
   */
  async execute(query: string): Promise<ShopSearchResult[]> {
    // Validate query
    const trimmedQuery = query.trim()
    this.validateQuery(trimmedQuery)

    // Step 1: Search database for existing shops
    const dbResults = await this.shopRepository.findExistingShops(
      trimmedQuery,
      this.config.maxResults
    )

    // Step 2: Conditionally call Nominatim API
    let apiResults: ShopSearchResult[] = []
    if (dbResults.length < this.config.minDbResultsForApiSkip) {
      const apiLimit = this.config.maxResults - dbResults.length
      apiResults = await this.nominatimClient.search(trimmedQuery, {
        limit: apiLimit,
        countrycodes: 'jp',
        'accept-language': 'ja',
      })
    }

    // Step 3: Merge results (DB first, then API)
    const mergedResults = [...dbResults, ...apiResults]

    // Step 4: Deduplicate by name (case-insensitive)
    const deduplicatedResults = this.deduplicateResults(mergedResults)

    // Step 5: Return top N results
    return deduplicatedResults.slice(0, this.config.maxResults)
  }

  /**
   * Validate the search query
   */
  private validateQuery(query: string): void {
    if (query.length < SEARCH_QUERY_CONSTRAINTS.MIN_LENGTH) {
      throw new Error(
        `検索クエリは${SEARCH_QUERY_CONSTRAINTS.MIN_LENGTH}文字以上で入力してください`
      )
    }

    if (query.length > SEARCH_QUERY_CONSTRAINTS.MAX_LENGTH) {
      throw new Error(
        `検索クエリは${SEARCH_QUERY_CONSTRAINTS.MAX_LENGTH}文字以内で入力してください`
      )
    }
  }

  /**
   * Deduplicate results by name (case-insensitive)
   * Prefers database results over API results
   */
  private deduplicateResults(results: ShopSearchResult[]): ShopSearchResult[] {
    const seenNames = new Set<string>()
    const uniqueResults: ShopSearchResult[] = []

    for (const result of results) {
      const normalizedName = result.name.toLowerCase()
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName)
        uniqueResults.push(result)
      }
    }

    return uniqueResults
  }
}
