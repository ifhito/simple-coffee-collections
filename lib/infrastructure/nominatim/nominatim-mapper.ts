/**
 * Nominatim Mapper
 *
 * Converts Nominatim API responses to domain value objects.
 * Handles address formatting and coordinate validation.
 *
 * @module lib/infrastructure/nominatim/nominatim-mapper
 */

import { ShopLocation } from '../../domain/value-objects/shop-location'
import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'
import { NominatimPlace, NominatimAddress } from './nominatim-types'

/**
 * Mapper class for converting Nominatim API data to domain objects
 */
export class NominatimMapper {
  /**
   * Convert a NominatimPlace to a ShopSearchResult
   * @param data - Nominatim API response place object
   * @returns ShopSearchResult value object
   */
  static toShopSearchResult(data: NominatimPlace): ShopSearchResult {
    // Extract shop name from various fields
    const name = this.extractName(data)

    // Format address from address components
    const address = this.formatAddress(data.address)

    // Create ShopLocation if coordinates are valid
    const location = this.createLocation(data.lat, data.lon)

    return ShopSearchResult.fromPrimitive(name, address, location, 'nominatim')
  }

  /**
   * Convert multiple NominatimPlace objects to ShopSearchResult array
   * @param places - Array of Nominatim API response place objects
   * @returns Array of ShopSearchResult value objects
   */
  static toShopSearchResults(places: NominatimPlace[]): ShopSearchResult[] {
    return places.map((place) => this.toShopSearchResult(place))
  }

  /**
   * Extract the best name from a NominatimPlace
   * Prioritizes: name > address.shop/cafe/restaurant > display_name
   */
  private static extractName(data: NominatimPlace): string {
    // First, try the name field
    if (data.name && data.name.trim()) {
      return data.name.trim()
    }

    // Then, try address fields for shop/cafe/restaurant names
    if (data.address) {
      const shopName =
        data.address.shop || data.address.cafe || data.address.restaurant
      if (shopName && shopName.trim()) {
        return shopName.trim()
      }
    }

    // Fallback to display_name (may be long, so truncate if needed)
    if (data.display_name) {
      // Extract first part before comma for a cleaner name
      const firstPart = data.display_name.split(',')[0]
      return firstPart.trim()
    }

    return 'Unknown Shop'
  }

  /**
   * Format address from Nominatim address components
   * Creates a readable address string from road, city, country
   */
  static formatAddress(address: NominatimAddress | undefined): string | null {
    if (!address) {
      return null
    }

    const parts: string[] = []

    // Add road/street
    if (address.road) {
      parts.push(address.road)
    }

    // Add neighbourhood or suburb
    if (address.neighbourhood) {
      parts.push(address.neighbourhood)
    } else if (address.suburb) {
      parts.push(address.suburb)
    }

    // Add city/town/village
    const city = address.city || address.town || address.village || address.municipality
    if (city) {
      parts.push(city)
    }

    // Add state/prefecture (for Japan)
    if (address.state) {
      parts.push(address.state)
    }

    // For Japanese addresses, we typically don't include country
    // as it's obvious from context

    if (parts.length === 0) {
      return null
    }

    // Join with Japanese-style comma
    return parts.join('、')
  }

  /**
   * Create a ShopLocation from coordinate strings
   * Returns null if coordinates are invalid
   */
  private static createLocation(
    latStr: string,
    lonStr: string
  ): ShopLocation | null {
    if (!latStr || !lonStr) {
      return null
    }

    const latitude = parseFloat(latStr)
    const longitude = parseFloat(lonStr)

    // Check for NaN
    if (isNaN(latitude) || isNaN(longitude)) {
      return null
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.warn(
        `[NominatimMapper] Invalid coordinates: lat=${latitude}, lon=${longitude}`
      )
      return null
    }

    return ShopLocation.fromPrimitive(latitude, longitude)
  }
}
