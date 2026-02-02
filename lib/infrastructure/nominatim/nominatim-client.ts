/**
 * Nominatim API Client
 *
 * Client for interacting with OpenStreetMap Nominatim API.
 * Implements rate limiting and error handling per Nominatim usage policy.
 *
 * Usage Policy Compliance:
 * - Maximum 1 request per second (enforced by IRateLimiter)
 * - Valid User-Agent header required
 * - No client-side autocomplete (server-side only)
 *
 * @see https://nominatim.org/release-docs/latest/api/Search/
 * @see https://operations.osmfoundation.org/policies/nominatim/
 *
 * @module lib/infrastructure/nominatim/nominatim-client
 */

import { ShopSearchResult } from '../../domain/value-objects/shop-search-result'
import { IRateLimiter } from '../rate-limiter/rate-limiter.interface'
import { NominatimMapper } from './nominatim-mapper'
import {
  INominatimClient,
  NominatimPlace,
  NominatimSearchOptions,
} from './nominatim-types'

/**
 * Configuration for NominatimAPIClient
 */
export interface NominatimClientConfig {
  /** Base URL for Nominatim API */
  baseUrl?: string
  /** User-Agent header (required by Nominatim) */
  userAgent: string
  /** Referer header */
  referer?: string
}

const DEFAULT_BASE_URL = 'https://nominatim.openstreetmap.org'

/**
 * Nominatim API Client implementation
 *
 * Handles API communication with rate limiting and error handling.
 * Returns empty array on errors (no retry) to ensure UX is not degraded.
 */
export class NominatimAPIClient implements INominatimClient {
  private readonly baseUrl: string
  private readonly userAgent: string
  private readonly referer: string

  constructor(
    private readonly rateLimiter: IRateLimiter,
    config: NominatimClientConfig
  ) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
    this.userAgent = config.userAgent
    this.referer = config.referer ?? ''
  }

  /**
   * Search for places matching the query
   * @param query - Search query string
   * @param options - Search options
   * @returns Array of ShopSearchResult (empty on error)
   */
  async search(
    query: string,
    options?: Partial<NominatimSearchOptions>
  ): Promise<ShopSearchResult[]> {
    // Check rate limit before making request
    const canMake = await this.rateLimiter.canMakeRequest()
    if (!canMake) {
      console.log(
        `[NominatimClient] Rate limit hit, skipping request for query: ${query}`
      )
      return []
    }

    try {
      // Build URL with search parameters
      const url = this.buildSearchUrl(query, options)

      // Make the request with required headers
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
          ...(this.referer && { Referer: this.referer }),
        },
      })

      // Record the request timestamp
      await this.rateLimiter.recordRequest()

      // Handle rate limit errors (429, 503)
      if (response.status === 429 || response.status === 503) {
        console.warn(
          `[NominatimClient] Rate limit error (${response.status}) for query: ${query}`
        )
        return []
      }

      // Handle other errors
      if (!response.ok) {
        console.error(
          `[NominatimClient] API error (${response.status}) for query: ${query}`
        )
        return []
      }

      // Parse response
      const places: NominatimPlace[] = await response.json()

      // Convert to domain objects
      return NominatimMapper.toShopSearchResults(places)
    } catch (error) {
      console.error(`[NominatimClient] Exception for query: ${query}`, error)
      // Return empty array on any error (no retry)
      return []
    }
  }

  /**
   * Check if a request can be made now
   */
  async canMakeRequest(): Promise<boolean> {
    return this.rateLimiter.canMakeRequest()
  }

  /**
   * Build the search URL with query parameters
   */
  private buildSearchUrl(
    query: string,
    options?: Partial<NominatimSearchOptions>
  ): URL {
    const url = new URL('/search', this.baseUrl)

    // Required parameters
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'json')

    // Default options for cafe/restaurant search in Japan
    url.searchParams.set('countrycodes', options?.countrycodes ?? 'jp')
    url.searchParams.set('limit', String(options?.limit ?? 5))
    url.searchParams.set('accept-language', options?.['accept-language'] ?? 'ja')
    url.searchParams.set('addressdetails', '1')

    // Filter for cafe/restaurant amenities
    if (options?.amenity) {
      url.searchParams.set('amenity', options.amenity)
    }

    // Optional parameters
    if (options?.extratags) {
      url.searchParams.set('extratags', '1')
    }

    return url
  }
}

/**
 * Create a NominatimAPIClient with default configuration
 */
export function createNominatimClient(
  rateLimiter: IRateLimiter
): NominatimAPIClient {
  return new NominatimAPIClient(rateLimiter, {
    userAgent:
      process.env.NOMINATIM_USER_AGENT ?? 'SimpleCoffeeCollections/1.0',
    referer: process.env.NEXT_PUBLIC_APP_URL,
    baseUrl: process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL,
  })
}
