'use server'

/**
 * Shop Search API (cached)
 *
 * Provides a cached wrapper around the shop search Server Action.
 * Request-level memoization only (not time-based caching).
 */
import { cache } from 'react'
import { searchShopAction } from '@/lib/actions/shop-search'

/**
 * Cached version of searchShopAction
 */
export const cachedSearchShopAction = cache(searchShopAction)
