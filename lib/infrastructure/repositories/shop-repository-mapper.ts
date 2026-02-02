/**
 * Shop Repository Mapper
 *
 * Converts database records to domain value objects.
 * Handles nullable columns for address and location.
 *
 * @module lib/infrastructure/repositories/shop-repository-mapper
 */

import { ShopLocation } from '../../domain/value-objects/shop-location'
import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'

/**
 * Database record type for shop search
 */
export interface ShopDbRecord {
  shop_name: string
  shop_address?: string | null
  shop_latitude?: number | null
  shop_longitude?: number | null
}

/**
 * Mapper class for converting database records to domain objects
 */
export class ShopRepositoryMapper {
  /**
   * Convert a database record to a ShopSearchResult
   * @param data - Database record with shop information
   * @returns ShopSearchResult value object with source='database'
   */
  static toShopSearchResult(data: ShopDbRecord): ShopSearchResult {
    // Create ShopLocation if both coordinates are present
    const location = this.createLocation(data.shop_latitude, data.shop_longitude)

    return ShopSearchResult.fromPrimitive(
      data.shop_name,
      data.shop_address ?? null,
      location,
      'database'
    )
  }

  /**
   * Convert multiple database records to ShopSearchResult array
   * @param records - Array of database records
   * @returns Array of ShopSearchResult value objects
   */
  static toShopSearchResults(records: ShopDbRecord[]): ShopSearchResult[] {
    return records.map((record) => this.toShopSearchResult(record))
  }

  /**
   * Create a ShopLocation from nullable coordinates
   * Returns null if either coordinate is null or invalid
   */
  private static createLocation(
    latitude: number | null | undefined,
    longitude: number | null | undefined
  ): ShopLocation | null {
    // Both coordinates must be present
    if (latitude == null || longitude == null) {
      return null
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.warn(
        `[ShopRepositoryMapper] Invalid coordinates: lat=${latitude}, lon=${longitude}`
      )
      return null
    }

    return ShopLocation.fromPrimitive(latitude, longitude)
  }
}
