/**
 * Supabase Shop Repository
 *
 * Searches existing shop data from coffee_evaluations table.
 * Uses ILIKE for case-insensitive partial matching.
 *
 * @module lib/infrastructure/repositories/supabase-shop-repository
 */

import { createClient } from '../supabase/server'
import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'
import { IShopRepository } from './shop-repository.interface'
import { ShopRepositoryMapper, ShopDbRecord } from './shop-repository-mapper'

/**
 * Supabase implementation of IShopRepository
 *
 * Searches coffee_evaluations table for existing shop names
 * using case-insensitive partial matching (ILIKE).
 */
export class SupabaseShopRepository implements IShopRepository {
  /**
   * Find existing shops matching the query
   * @param query - Search query (shop name)
   * @param limit - Maximum number of results to return
   * @returns Array of ShopSearchResult (empty on error)
   */
  async findExistingShops(
    query: string,
    limit: number
  ): Promise<ShopSearchResult[]> {
    try {
      const supabase = await createClient()

      // Search for distinct shop names matching the query
      // Note: shop_address, shop_latitude, shop_longitude may not exist yet
      // until the migration is applied
      const { data, error } = await supabase
        .from('coffee_evaluations')
        .select('shop_name, shop_address, shop_latitude, shop_longitude')
        .ilike('shop_name', `%${query}%`)
        .not('shop_name', 'eq', '')
        .order('created_at', { ascending: false })
        .limit(limit * 3) // Fetch more to account for deduplication

      if (error) {
        console.error('[SupabaseShopRepository] Query error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Deduplicate by shop_name (case-insensitive)
      const seenNames = new Set<string>()
      const uniqueRecords: ShopDbRecord[] = []

      for (const row of data) {
        const normalizedName = row.shop_name?.toLowerCase()
        if (normalizedName && !seenNames.has(normalizedName)) {
          seenNames.add(normalizedName)
          uniqueRecords.push({
            shop_name: row.shop_name,
            shop_address: row.shop_address ?? null,
            shop_latitude: row.shop_latitude ?? null,
            shop_longitude: row.shop_longitude ?? null,
          })

          if (uniqueRecords.length >= limit) {
            break
          }
        }
      }

      return ShopRepositoryMapper.toShopSearchResults(uniqueRecords)
    } catch (error) {
      console.error('[SupabaseShopRepository] Exception:', error)
      return []
    }
  }

  /**
   * Find existing shops with full location data (after migration)
   * This method will be used once the shop_address, shop_latitude, shop_longitude
   * columns are added to the database.
   */
  async findExistingShopsWithLocation(
    query: string,
    limit: number
  ): Promise<ShopSearchResult[]> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('coffee_evaluations')
        .select('shop_name, shop_address, shop_latitude, shop_longitude')
        .ilike('shop_name', `%${query}%`)
        .not('shop_name', 'eq', '')
        .order('created_at', { ascending: false })
        .limit(limit * 3)

      if (error) {
        console.error('[SupabaseShopRepository] Query error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Deduplicate by shop_name (case-insensitive)
      const seenNames = new Set<string>()
      const uniqueRecords: ShopDbRecord[] = []

      for (const row of data) {
        const normalizedName = row.shop_name?.toLowerCase()
        if (normalizedName && !seenNames.has(normalizedName)) {
          seenNames.add(normalizedName)
          uniqueRecords.push({
            shop_name: row.shop_name,
            shop_address: row.shop_address ?? null,
            shop_latitude: row.shop_latitude ?? null,
            shop_longitude: row.shop_longitude ?? null,
          })

          if (uniqueRecords.length >= limit) {
            break
          }
        }
      }

      return ShopRepositoryMapper.toShopSearchResults(uniqueRecords)
    } catch (error) {
      console.error('[SupabaseShopRepository] Exception:', error)
      return []
    }
  }
}
