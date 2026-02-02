/**
 * ShopLocation Value Object
 *
 * Represents geographic coordinates (latitude/longitude) for a shop.
 * Used for map display and distance calculations.
 *
 * @module lib/domain/value-objects/shop-location
 */

import { Result, ok, fail } from '../shared/result'

/**
 * ShopLocation constraints
 */
export const SHOP_LOCATION_CONSTRAINTS = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
} as const

/**
 * Input for creating ShopLocation
 */
export interface ShopLocationInput {
  latitude: number
  longitude: number
}

/**
 * ShopLocation Value Object
 *
 * Encapsulates geographic coordinates with validation.
 * Latitude must be between -90 and 90.
 * Longitude must be between -180 and 180.
 */
export class ShopLocation {
  private constructor(
    private readonly _latitude: number,
    private readonly _longitude: number
  ) {
    Object.freeze(this)
  }

  /**
   * Factory method to create ShopLocation with validation
   * @param input - Coordinate input
   * @returns Result containing ShopLocation or validation error
   */
  static create(input: ShopLocationInput): Result<ShopLocation, string> {
    const { latitude, longitude } = input

    if (
      latitude < SHOP_LOCATION_CONSTRAINTS.LATITUDE_MIN ||
      latitude > SHOP_LOCATION_CONSTRAINTS.LATITUDE_MAX
    ) {
      return fail(
        `緯度は${SHOP_LOCATION_CONSTRAINTS.LATITUDE_MIN}から${SHOP_LOCATION_CONSTRAINTS.LATITUDE_MAX}の範囲で指定してください`
      )
    }

    if (
      longitude < SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MIN ||
      longitude > SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MAX
    ) {
      return fail(
        `経度は${SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MIN}から${SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MAX}の範囲で指定してください`
      )
    }

    return ok(new ShopLocation(latitude, longitude))
  }

  /**
   * Create ShopLocation from primitive values (e.g., from database)
   * Skips validation for trusted sources
   */
  static fromPrimitive(latitude: number, longitude: number): ShopLocation {
    return new ShopLocation(latitude, longitude)
  }

  /**
   * Get the latitude
   */
  get latitude(): number {
    return this._latitude
  }

  /**
   * Get the longitude
   */
  get longitude(): number {
    return this._longitude
  }

  /**
   * Check if the coordinates are valid
   */
  isValid(): boolean {
    return (
      this._latitude >= SHOP_LOCATION_CONSTRAINTS.LATITUDE_MIN &&
      this._latitude <= SHOP_LOCATION_CONSTRAINTS.LATITUDE_MAX &&
      this._longitude >= SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MIN &&
      this._longitude <= SHOP_LOCATION_CONSTRAINTS.LONGITUDE_MAX
    )
  }

  /**
   * Convert to string representation "latitude,longitude"
   */
  toString(): string {
    return `${this._latitude},${this._longitude}`
  }

  /**
   * Calculate distance to another ShopLocation using Haversine formula
   * @param other - Target ShopLocation
   * @returns Distance in kilometers
   */
  distanceTo(other: ShopLocation): number {
    const R = 6371 // Earth's radius in kilometers

    const lat1Rad = this.toRadians(this._latitude)
    const lat2Rad = this.toRadians(other._latitude)
    const deltaLat = this.toRadians(other._latitude - this._latitude)
    const deltaLon = this.toRadians(other._longitude - this._longitude)

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * Check equality with another ShopLocation
   */
  equals(other: ShopLocation): boolean {
    return this._latitude === other._latitude && this._longitude === other._longitude
  }

  /**
   * Convert to primitive object for serialization
   */
  toPrimitive(): { latitude: number; longitude: number } {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  }
}
