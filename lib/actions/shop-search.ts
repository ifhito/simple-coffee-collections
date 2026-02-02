/**
 * Shop Search Server Action
 *
 * Server Action for searching shops from database and Nominatim API.
 * Uses SearchShopUseCase for business logic orchestration.
 *
 * @module lib/actions/shop-search
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { SearchShopUseCase, SEARCH_QUERY_CONSTRAINTS } from '@/lib/application/use-cases/search-shop-use-case'
import { SupabaseShopRepository } from '@/lib/infrastructure/repositories/supabase-shop-repository'
import { SupabaseRateLimiter } from '@/lib/infrastructure/rate-limiter/supabase-rate-limiter'
import { createNominatimClient } from '@/lib/infrastructure/nominatim/nominatim-client'
import type { ShopSearchResult } from '@/lib/domain/value-objects/shop-search-result'

/**
 * Server Action response type for shop search
 */
export type ShopSearchResponse =
  | { success: true; data: ShopSearchResultDTO[] }
  | { success: false; error: string }

/**
 * Data Transfer Object for ShopSearchResult
 * Serializable version for client transport
 */
export interface ShopSearchResultDTO {
  name: string
  address: string | null
  location: { latitude: number; longitude: number } | null
  source: 'database' | 'nominatim'
  displayText: string
}

/**
 * Convert ShopSearchResult to DTO
 */
function toDTO(result: ShopSearchResult): ShopSearchResultDTO {
  return {
    name: result.name,
    address: result.address,
    location: result.location?.toPrimitive() ?? null,
    source: result.source,
    displayText: result.displayText,
  }
}

/**
 * Create the use case with all dependencies
 */
async function createSearchShopUseCase(): Promise<SearchShopUseCase> {
  const supabase = await createClient()

  // Create dependencies
  const shopRepository = new SupabaseShopRepository()
  const rateLimiter = new SupabaseRateLimiter(supabase, {
    serviceName: 'nominatim',
    minIntervalMs: 1000,
  })
  const nominatimClient = createNominatimClient(rateLimiter)

  return new SearchShopUseCase(shopRepository, nominatimClient)
}

/**
 * Search for shops by query
 *
 * This is a Server Action that can be called from Client Components.
 * Uses React cache() for request-level memoization.
 *
 * @param query - Search query (shop name, minimum 3 characters)
 * @returns ShopSearchResponse with results or error
 */
export async function searchShopAction(
  query: string
): Promise<ShopSearchResponse> {
  try {
    // Quick validation before creating use case
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < SEARCH_QUERY_CONSTRAINTS.MIN_LENGTH) {
      return {
        success: false,
        error: `${SEARCH_QUERY_CONSTRAINTS.MIN_LENGTH}文字以上入力してください`,
      }
    }

    if (trimmedQuery.length > SEARCH_QUERY_CONSTRAINTS.MAX_LENGTH) {
      return {
        success: false,
        error: `${SEARCH_QUERY_CONSTRAINTS.MAX_LENGTH}文字以内で入力してください`,
      }
    }

    // Execute search
    const useCase = await createSearchShopUseCase()
    const results = await useCase.execute(trimmedQuery)

    // Convert to DTOs
    const dtos = results.map(toDTO)

    return {
      success: true,
      data: dtos,
    }
  } catch (error) {
    console.error('[searchShopAction] Error:', error)

    // Handle validation errors from use case
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: '検索中にエラーが発生しました',
    }
  }
}
