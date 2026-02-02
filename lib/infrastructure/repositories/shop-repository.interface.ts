/**
 * Shop Repository Interface
 *
 * Defines the contract for searching existing shop data.
 * Implementations search the coffee_evaluations table for shop names.
 *
 * @module lib/infrastructure/repositories/shop-repository.interface
 */

import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'

/**
 * Shop repository interface
 *
 * Expected behavior:
 * - Search coffee_evaluations table for shop_name partial matches
 * - Use case-insensitive search (ILIKE)
 * - Return distinct shop names (deduplicated)
 * - Include address and location if available
 */
export interface IShopRepository {
  /**
   * Find existing shops matching the query
   * Searches coffee_evaluations.shop_name using ILIKE for partial match
   *
   * @param query - Search query (shop name)
   * @param limit - Maximum number of results to return
   * @returns Promise resolving to array of ShopSearchResult with source='database'
   */
  findExistingShops(query: string, limit: number): Promise<ShopSearchResult[]>
}
