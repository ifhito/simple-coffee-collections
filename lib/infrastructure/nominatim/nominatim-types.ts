/**
 * Nominatim API Type Definitions
 *
 * Types for OpenStreetMap Nominatim API requests and responses.
 * Based on Nominatim API documentation: https://nominatim.org/release-docs/latest/api/Search/
 *
 * @module lib/infrastructure/nominatim/nominatim-types
 */

/**
 * Nominatim address details
 */
export interface NominatimAddress {
  /** Shop/establishment name */
  shop?: string
  /** Cafe name */
  cafe?: string
  /** Restaurant name */
  restaurant?: string
  /** Road/street name */
  road?: string
  /** Neighbourhood */
  neighbourhood?: string
  /** Suburb */
  suburb?: string
  /** City/town */
  city?: string
  /** Town */
  town?: string
  /** Village */
  village?: string
  /** Municipality */
  municipality?: string
  /** State/province */
  state?: string
  /** Postcode */
  postcode?: string
  /** Country */
  country?: string
  /** Country code (ISO 3166-1 alpha-2) */
  country_code?: string
}

/**
 * Nominatim place result
 * Represents a single search result from Nominatim API
 */
export interface NominatimPlace {
  /** Unique place ID */
  place_id: number
  /** License information */
  licence?: string
  /** OSM type (node, way, relation) */
  osm_type?: string
  /** OSM ID */
  osm_id?: number
  /** Latitude as string */
  lat: string
  /** Longitude as string */
  lon: string
  /** Place class (e.g., "amenity") */
  class: string
  /** Place type (e.g., "cafe", "restaurant") */
  type: string
  /** Importance score */
  importance?: number
  /** Icon URL */
  icon?: string
  /** Full display name */
  display_name: string
  /** Place name (may not always be present) */
  name?: string
  /** Address details (when addressdetails=1) */
  address?: NominatimAddress
  /** Bounding box [south, north, west, east] */
  boundingbox?: string[]
  /** Extra tags (when extratags=1) */
  extratags?: Record<string, string>
}

/**
 * Nominatim search options
 * Query parameters for Nominatim search API
 */
export interface NominatimSearchOptions {
  /** Free-form query string */
  q?: string
  /** Amenity type filter (e.g., "cafe,restaurant") */
  amenity?: string
  /** Country codes to restrict search (comma-separated, e.g., "jp") */
  countrycodes?: string
  /** Maximum number of results */
  limit?: number
  /** Output format */
  format?: 'json' | 'jsonv2' | 'geojson' | 'geocodejson'
  /** Preferred language for results */
  'accept-language'?: string
  /** Include address breakdown (0 or 1) */
  addressdetails?: 0 | 1
  /** Include extra tags (0 or 1) */
  extratags?: 0 | 1
  /** Include name details (0 or 1) */
  namedetails?: 0 | 1
  /** Output geometry as GeoJSON */
  polygon_geojson?: 0 | 1
}

import type { ShopSearchResult } from '../../domain/value-objects/shop-search-result'

/**
 * Nominatim client interface
 * Defines the contract for Nominatim API interactions
 */
export interface INominatimClient {
  /**
   * Search for places matching the query
   * @param query - Search query string
   * @param options - Search options
   * @returns Promise resolving to array of ShopSearchResult (converted from NominatimPlace)
   */
  search(query: string, options?: Partial<NominatimSearchOptions>): Promise<ShopSearchResult[]>

  /**
   * Check if a request can be made (rate limit check)
   * @returns Promise resolving to boolean indicating if request is allowed
   */
  canMakeRequest(): Promise<boolean>
}
