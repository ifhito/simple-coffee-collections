/**
 * Coffee Evaluation Data Fetching Layer
 * Refactored for better maintainability and error handling
 *
 * All functions are wrapped with React cache() for request memoization
 * in Server Components to prevent duplicate database queries within the same request.
 *
 * @module lib/api/coffee
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  CoffeeEvaluation,
  CoffeeEvaluationDisplay,
  CoffeeEvaluationWithUser,
  CoffeeEvaluationSearchParams,
} from '@/lib/types/coffee'

const COFFEE_TEXT_SEARCH_FIELDS = ['bean_type', 'bean_name', 'roast_level'] as const

/**
 * Handle Supabase query errors consistently
 * @param error - Supabase error object
 * @param context - Context where the error occurred for better error messages
 * @throws Error with descriptive message
 */
function handleDatabaseError(error: any, context: string): never {
  const message = error?.message || 'データベースエラーが発生しました'
  throw new Error(`${context}: ${message}`)
}

function buildCoffeeSearchFilter(searchTerm: string, shopIds: string[]): string {
  const pattern = `%${searchTerm}%`
  const textFilters = COFFEE_TEXT_SEARCH_FIELDS.map((field) => `${field}.ilike.${pattern}`)

  if (shopIds.length === 0) {
    return textFilters.join(',')
  }

  return [`shop_id.in.(${shopIds.join(',')})`, ...textFilters].join(',')
}

async function findMatchingShopIds(
  supabase: any,
  searchTerm: string,
  context: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .ilike('name', `%${searchTerm}%`)

  if (error) {
    handleDatabaseError(error, context)
  }

  return (data || []).map((row: { id: string }) => row.id)
}

async function resolveCoffeeSearchFilter(
  supabase: any,
  searchTerm: string,
  context: string
) {
  const shopIds = await findMatchingShopIds(supabase, searchTerm, context)
  return buildCoffeeSearchFilter(searchTerm, shopIds)
}

/**
 * Fetch all coffee evaluations with optional filtering, search, and sorting
 *
 * @param params - Optional search parameters for filtering and sorting
 * @param params.user_id - Filter by user ID
 * @param params.is_public - Filter by public/private status
 * @param params.sort - Sort order (defaults to 'created_at_desc')
 * @returns Array of coffee evaluations matching the criteria
 * @throws Error if database query fails
 *
 * @example
 * ```ts
 * // Get all public evaluations sorted by rating
 * const evaluations = await getCoffeeEvaluations({
 *   is_public: true,
 *   sort: 'rating_desc'
 * })
 * ```
 */
export const getCoffeeEvaluations = cache(
  async (
    params?: CoffeeEvaluationSearchParams
  ): Promise<CoffeeEvaluationDisplay[]> => {
    const supabase = await createClient()

    // Start building query
    let query = supabase.from('coffee_evaluations').select('*, shops!left(name)')

    // Apply filters
    if (params?.user_id) {
      query = query.eq('user_id', params.user_id)
    }

    if (params?.is_public !== undefined) {
      query = query.eq('is_public', params.is_public)
    }

    // Apply search across text fields
    if (params?.search) {
      const searchFilter = await resolveCoffeeSearchFilter(
        supabase,
        params.search,
        'コーヒー評価の取得'
      )
      query = query.or(searchFilter)
    }

    // Apply sorting based on sort parameter
    query = applySortOrder(query, params?.sort)

    const { data, error } = await query

    if (error) {
      handleDatabaseError(error, 'コーヒー評価の取得')
    }

    return (data || []).map((row: any) => ({ ...row, shop_name: row.shops?.name ?? null }))
  }
)

/**
 * Apply sort order to a Supabase query
 * @param query - Supabase query builder
 * @param sort - Sort option
 * @returns Query with sort order applied
 */
function applySortOrder(query: any, sort?: string) {
  const sortOption = sort || 'created_at_desc'

  const sortMap: Record<string, { column: string; ascending: boolean; nullsFirst?: boolean; referencedTable?: string }> = {
    created_at_asc: { column: 'created_at', ascending: true },
    created_at_desc: { column: 'created_at', ascending: false },
    rating_desc: { column: 'overall_rating', ascending: false, nullsFirst: false },
    rating_asc: { column: 'overall_rating', ascending: true, nullsFirst: false },
    shop_name_asc: { column: 'name', ascending: true, referencedTable: 'shops' },
    shop_name_desc: { column: 'name', ascending: false, referencedTable: 'shops' },
  }

  const config = sortMap[sortOption] || sortMap.created_at_desc

  return query.order(config.column, {
    ascending: config.ascending,
    ...(config.nullsFirst !== undefined && { nullsFirst: config.nullsFirst }),
    ...(config.referencedTable !== undefined && { referencedTable: config.referencedTable }),
  })
}

/**
 * Fetch a single coffee evaluation by ID
 *
 * @param id - UUID of the coffee evaluation
 * @returns Coffee evaluation object if found, null if not found
 * @throws Error if database query fails (excluding "not found" errors)
 *
 * @example
 * ```ts
 * const evaluation = await getCoffeeEvaluation('123e4567-e89b-12d3-a456-426614174000')
 * if (!evaluation) {
 *   notFound() // Next.js 404
 * }
 * ```
 */
export const getCoffeeEvaluation = cache(
  async (id: string): Promise<CoffeeEvaluationDisplay | null> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('coffee_evaluations')
      .select('*, shops!left(name)')
      .eq('id', id)
      .single()

    // Handle "not found" error gracefully (PGRST116 = no rows returned)
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      handleDatabaseError(error, 'コーヒー評価の取得')
    }

    if (!data) return null
    return { ...(data as any), shop_name: (data as any).shops?.name ?? null }
  }
)

/**
 * Search coffee evaluations by keyword
 *
 * Performs case-insensitive partial match search across:
 * - shop_name (店名)
 * - bean_type (豆の種類)
 * - roast_level (焙煎度)
 *
 * @param searchTerm - Search keyword
 * @returns Array of matching coffee evaluations, sorted by newest first
 * @throws Error if database query fails
 *
 * @example
 * ```ts
 * // Search for "エチオピア" in all text fields
 * const results = await searchCoffeeEvaluations('エチオピア')
 * ```
 */
export const searchCoffeeEvaluations = cache(
  async (searchTerm: string): Promise<CoffeeEvaluationDisplay[]> => {
    const supabase = await createClient()

    let query = supabase.from('coffee_evaluations').select('*, shops!left(name)')
    const searchFilter = await resolveCoffeeSearchFilter(
      supabase,
      searchTerm,
      'コーヒー評価の検索'
    )
    query = query.or(searchFilter)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      handleDatabaseError(error, 'コーヒー評価の検索')
    }

    return (data || []).map((row: any) => ({ ...row, shop_name: row.shops?.name ?? null }))
  }
)

/**
 * Fetch coffee evaluations with user display names (JOIN query)
 * Used for community feed and user profile pages
 *
 * @param params - Optional search parameters for filtering and sorting
 * @param params.user_id - Filter by user ID
 * @param params.is_public - Filter by public/private status
 * @param params.search - Search keyword
 * @param params.sort - Sort order
 * @returns Array of coffee evaluations with user display names
 * @throws Error if database query fails
 *
 * @example
 * ```ts
 * // Get all public evaluations with user names
 * const evaluations = await getCoffeeEvaluationsWithUser({
 *   is_public: true,
 *   sort: 'newest'
 * })
 * ```
 */
export const getCoffeeEvaluationsWithUser = cache(
  async (
    params?: CoffeeEvaluationSearchParams
  ): Promise<CoffeeEvaluationWithUser[]> => {
    const supabase = await createClient()

    const buildBaseQuery = async () => {
      let query = supabase.from('coffee_evaluations').select('*, shops!left(name)')

      if (params?.user_id) {
        query = query.eq('user_id', params.user_id)
      }

      if (params?.is_public !== undefined) {
        query = query.eq('is_public', params.is_public)
      }

      if (params?.search) {
        const searchFilter = await resolveCoffeeSearchFilter(
          supabase,
          params.search,
          'ユーザー情報付きコーヒー評価の取得'
        )
        query = query.or(searchFilter)
      }

      query = applySortOrder(query, params?.sort)
      return query
    }

    const fetchWithJoin = async () => {
      let query = supabase
        .from('coffee_evaluations')
        .select('*, shops!left(name), user_profiles!inner(display_name)')

      if (params?.user_id) {
        query = query.eq('user_id', params.user_id)
      }

      if (params?.is_public !== undefined) {
        query = query.eq('is_public', params.is_public)
      }

      if (params?.search) {
        const searchFilter = await resolveCoffeeSearchFilter(
          supabase,
          params.search,
          'ユーザー情報付きコーヒー評価の取得'
        )
        query = query.or(searchFilter)
      }

      query = applySortOrder(query, params?.sort)

      return query
    }

    const mapJoinResponse = (data: any[]) => {
      return (data || []).map((item: any) => ({
        ...item,
        shop_name: item.shops?.name ?? null,
        display_name: item.user_profiles?.display_name ?? item.display_name ?? null,
      })) as CoffeeEvaluationWithUser[]
    }

    try {
      const { data, error } = await fetchWithJoin()

      if (error) {
        handleDatabaseError(error, 'ユーザー情報付きコーヒー評価の取得')
      }

      return mapJoinResponse((data || []) as any[])
    } catch (error: any) {
      const message = error?.message || ''
      const relationshipMissing = message.includes('relationship between')

      if (!relationshipMissing) {
        throw error
      }

      // Fallback when relationship metadata is missing: fetch evaluations, then user profiles separately
      const { data: evaluations, error: evalError } = await buildBaseQuery()
      if (evalError) {
        handleDatabaseError(evalError, 'ユーザー情報付きコーヒー評価の取得(フォールバック)')
      }

      const userIds = Array.from(new Set((evaluations || []).map((item: any) => item.user_id)))

      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', userIds)

      if (profileError) {
        handleDatabaseError(profileError, 'ユーザープロフィール取得(フォールバック)')
      }

      const displayNameMap = new Map<string, string | null>()
      for (const profile of profiles || []) {
        displayNameMap.set(profile.id, profile.display_name ?? null)
      }

      return (evaluations || []).map((item: any) => ({
        ...item,
        shop_name: item.shops?.name ?? null,
        display_name: displayNameMap.get(item.user_id) ?? null,
      })) as CoffeeEvaluationWithUser[]
    }
  }
)
