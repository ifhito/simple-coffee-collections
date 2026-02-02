/**
 * Rate Limiter Interface
 *
 * Defines the contract for rate limiting external API calls.
 * Used to comply with Nominatim's 1 request per second policy.
 *
 * Serverless Considerations:
 * - Must work across multiple Vercel instances
 * - State must be shared (database or Redis)
 * - In-memory state is NOT sufficient for serverless
 *
 * @module lib/infrastructure/rate-limiter/rate-limiter.interface
 */

/**
 * Rate limiter interface
 *
 * Implementations must ensure:
 * - 1 request per second maximum (Nominatim policy)
 * - Thread-safe/concurrent-safe operations
 * - Shared state across serverless instances
 */
export interface IRateLimiter {
  /**
   * Check if a request can be made now
   * Returns true if enough time has passed since the last request
   *
   * @returns Promise resolving to boolean indicating if request is allowed
   */
  canMakeRequest(): Promise<boolean>

  /**
   * Record that a request was made
   * Updates the last request timestamp
   *
   * @returns Promise resolving when timestamp is updated
   */
  recordRequest(): Promise<void>

  /**
   * Wait until a request can be made
   * Blocks until the rate limit allows the next request
   *
   * @returns Promise resolving when ready to make request
   */
  waitUntilReady(): Promise<void>
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /** Service name for identifying rate limit state (e.g., 'nominatim') */
  serviceName: string
  /** Minimum interval between requests in milliseconds (default: 1000ms) */
  minIntervalMs?: number
  /** Polling interval for waitUntilReady in milliseconds (default: 100ms) */
  pollingIntervalMs?: number
}

/**
 * Rate limiter state stored in database
 */
export interface RateLimiterState {
  /** Service name */
  service: string
  /** Timestamp of last request */
  last_request_at: Date
  /** Last update timestamp */
  updated_at: Date
}
