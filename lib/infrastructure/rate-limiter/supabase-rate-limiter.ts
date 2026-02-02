/**
 * Supabase Rate Limiter
 *
 * Rate limiter implementation using Supabase PostgreSQL for shared state.
 * Uses row locking (SELECT FOR UPDATE) to ensure 1 req/sec across serverless instances.
 *
 * @module lib/infrastructure/rate-limiter/supabase-rate-limiter
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IRateLimiter, RateLimiterConfig } from './rate-limiter.interface'

const DEFAULT_CONFIG: Required<Omit<RateLimiterConfig, 'serviceName'>> = {
  minIntervalMs: 1000,
  pollingIntervalMs: 100,
}

/**
 * Supabase-based rate limiter for serverless environments
 *
 * Uses PostgreSQL row locking to ensure rate limits are enforced
 * across multiple Vercel instances.
 */
export class SupabaseRateLimiter implements IRateLimiter {
  private readonly serviceName: string
  private readonly minIntervalMs: number
  private readonly pollingIntervalMs: number

  constructor(
    private readonly supabaseClient: SupabaseClient,
    config: RateLimiterConfig
  ) {
    this.serviceName = config.serviceName
    this.minIntervalMs = config.minIntervalMs ?? DEFAULT_CONFIG.minIntervalMs
    this.pollingIntervalMs = config.pollingIntervalMs ?? DEFAULT_CONFIG.pollingIntervalMs
  }

  /**
   * Check if a request can be made now
   * Uses SELECT FOR UPDATE to lock the row and prevent race conditions
   */
  async canMakeRequest(): Promise<boolean> {
    try {
      // Use raw SQL query with FOR UPDATE to lock the row
      const { data, error } = await this.supabaseClient.rpc('check_rate_limit', {
        p_service: this.serviceName,
        p_min_interval_ms: this.minIntervalMs,
      })

      if (error) {
        console.error('[SupabaseRateLimiter] Error checking rate limit:', error)
        // On error, conservatively return false and wait
        return false
      }

      return data === true
    } catch (error) {
      console.error('[SupabaseRateLimiter] Exception checking rate limit:', error)
      // On error, conservatively return false
      return false
    }
  }

  /**
   * Record that a request was made
   * Updates the last_request_at timestamp
   */
  async recordRequest(): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('rate_limiter_state')
        .update({ last_request_at: new Date().toISOString() })
        .eq('service', this.serviceName)

      if (error) {
        console.error('[SupabaseRateLimiter] Error recording request:', error)
      }
    } catch (error) {
      console.error('[SupabaseRateLimiter] Exception recording request:', error)
    }
  }

  /**
   * Wait until a request can be made
   * Polls the database until the rate limit allows the next request
   */
  async waitUntilReady(): Promise<void> {
    const maxAttempts = Math.ceil((this.minIntervalMs * 2) / this.pollingIntervalMs)
    let attempts = 0

    while (attempts < maxAttempts) {
      const canMake = await this.canMakeRequest()
      if (canMake) {
        return
      }

      await this.sleep(this.pollingIntervalMs)
      attempts++
    }

    // If we've waited too long, proceed anyway but log a warning
    console.warn('[SupabaseRateLimiter] Max wait time exceeded, proceeding with request')
  }

  /**
   * Simple check without locking - for display purposes only
   * Returns milliseconds until next request is allowed
   */
  async getTimeUntilReady(): Promise<number> {
    try {
      const { data, error } = await this.supabaseClient
        .from('rate_limiter_state')
        .select('last_request_at')
        .eq('service', this.serviceName)
        .single()

      if (error || !data) {
        return 0
      }

      const lastRequestAt = new Date(data.last_request_at).getTime()
      const now = Date.now()
      const elapsed = now - lastRequestAt
      const remaining = this.minIntervalMs - elapsed

      return remaining > 0 ? remaining : 0
    } catch {
      return 0
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Create a simple in-memory rate limiter for testing
 * NOT suitable for production serverless environments
 */
export class InMemoryRateLimiter implements IRateLimiter {
  private lastRequestAt: number = 0
  private readonly minIntervalMs: number

  constructor(minIntervalMs: number = 1000) {
    this.minIntervalMs = minIntervalMs
  }

  async canMakeRequest(): Promise<boolean> {
    const now = Date.now()
    return now - this.lastRequestAt >= this.minIntervalMs
  }

  async recordRequest(): Promise<void> {
    this.lastRequestAt = Date.now()
  }

  async waitUntilReady(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestAt
    const remaining = this.minIntervalMs - elapsed

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }
  }
}
