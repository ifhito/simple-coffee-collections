/**
 * ShopSearchResult Value Object
 *
 * Represents a search result for shop/cafe information.
 * Contains shop name, address, location, and source of the data.
 *
 * @module lib/domain/value-objects/shop-search-result
 */

import { Result, ok, fail } from '../shared/result'
import { ShopLocation } from './shop-location'

/**
 * Search source type
 * - 'database': Existing data from coffee_evaluations table
 * - 'nominatim': OpenStreetMap Nominatim API result
 */
export type SearchSource = 'database' | 'nominatim'

/**
 * Input for creating ShopSearchResult
 */
export interface ShopSearchResultInput {
  name: string
  address?: string | null
  location?: ShopLocation | null
  source: SearchSource
}

/**
 * ShopSearchResult Value Object
 *
 * Encapsulates shop search result data with validation.
 * Shop name is required and cannot be empty.
 */
export class ShopSearchResult {
  private constructor(
    private readonly _name: string,
    private readonly _address: string | null,
    private readonly _location: ShopLocation | null,
    private readonly _source: SearchSource
  ) {
    Object.freeze(this)
  }

  /**
   * Factory method to create ShopSearchResult with validation
   * @param input - Search result input
   * @returns Result containing ShopSearchResult or validation error
   */
  static create(input: ShopSearchResultInput): Result<ShopSearchResult, string> {
    const name = input.name.trim()

    if (!name) {
      return fail('店舗名は必須です')
    }

    return ok(
      new ShopSearchResult(
        name,
        input.address?.trim() || null,
        input.location ?? null,
        input.source
      )
    )
  }

  /**
   * Create ShopSearchResult from primitive values (e.g., from API/database)
   * Skips validation for trusted sources
   */
  static fromPrimitive(
    name: string,
    address: string | null,
    location: ShopLocation | null,
    source: SearchSource
  ): ShopSearchResult {
    return new ShopSearchResult(name, address, location, source)
  }

  /**
   * Get the shop name
   */
  get name(): string {
    return this._name
  }

  /**
   * Get the shop address
   */
  get address(): string | null {
    return this._address
  }

  /**
   * Get the shop location
   */
  get location(): ShopLocation | null {
    return this._location
  }

  /**
   * Get the search source
   */
  get source(): SearchSource {
    return this._source
  }

  /**
   * Get display text for the search result
   * Returns "name - address" if address exists, otherwise just "name"
   */
  get displayText(): string {
    if (this._address) {
      return `${this._name} - ${this._address}`
    }
    return this._name
  }

  /**
   * Check if address is available
   */
  hasAddress(): boolean {
    return this._address !== null && this._address.length > 0
  }

  /**
   * Check if location is available
   */
  hasLocation(): boolean {
    return this._location !== null
  }

  /**
   * Check equality with another ShopSearchResult
   * Two results are equal if they have the same name (case-insensitive)
   */
  equals(other: ShopSearchResult): boolean {
    return this._name.toLowerCase() === other._name.toLowerCase()
  }

  /**
   * Check if this result matches another by name (case-insensitive)
   * Used for deduplication
   */
  matchesByName(other: ShopSearchResult): boolean {
    return this._name.toLowerCase() === other._name.toLowerCase()
  }

  /**
   * Convert to primitive object for serialization
   */
  toPrimitive(): {
    name: string
    address: string | null
    location: { latitude: number; longitude: number } | null
    source: SearchSource
  } {
    return {
      name: this._name,
      address: this._address,
      location: this._location?.toPrimitive() ?? null,
      source: this._source,
    }
  }
}
