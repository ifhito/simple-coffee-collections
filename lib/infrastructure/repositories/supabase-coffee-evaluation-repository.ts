/**
 * Supabase Implementation of CoffeeEvaluationRepository
 * 
 * Implements the domain repository interface using Supabase as the persistence layer.
 * Handles mapping between domain entities and database records.
 * 
 * @module lib/infrastructure/repositories/supabase-coffee-evaluation-repository
 */

import { createClient } from '../supabase/server'
import {
  CoffeeEvaluation,
  CoffeeEvaluationId,
  CoffeeEvaluationProps,
  CoffeeEvaluationRepository,
  EvaluationQueryParams,
  EvaluationSortOption,
  EvaluationWithDisplayName,
  EvaluationRatings,
  BeanInfo,
  ShopInfo,
  Visibility,
  Result,
  ok,
  fail,
  RatingValue,
} from '@/lib/domain'
import type { Database } from '@/lib/types/database.types'

type CoffeeEvaluationRow = Database['public']['Tables']['coffee_evaluations']['Row']
type CoffeeEvaluationInsert = Database['public']['Tables']['coffee_evaluations']['Insert']
type CoffeeEvaluationUpdate = Database['public']['Tables']['coffee_evaluations']['Update']
// shops JOIN を含む拡張行型。select('*, shops(name)') の実行時形状に合わせる
type CoffeeEvaluationRowWithShop = CoffeeEvaluationRow & {
  shops?: { name: string } | null
}
type RowRatings = {
  acidity: RatingValue
  bitterness: RatingValue
  aroma: RatingValue
  overallRating: RatingValue
}
type PersistedRowRatings = {
  [K in keyof RowRatings]: number | null
}
const COFFEE_TEXT_SEARCH_FIELDS = ['bean_type', 'bean_name', 'roast_level'] as const

function hasCompleteRatings(ratings: PersistedRowRatings): ratings is { [K in keyof RowRatings]: number } {
  return Object.values(ratings).every((value) => value !== null)
}

function extractRatingsFromRow(row: CoffeeEvaluationRow): EvaluationRatings | null {
  const ratings: PersistedRowRatings = {
    acidity: row.acidity,
    bitterness: row.bitterness,
    aroma: row.aroma,
    overallRating: row.overall_rating,
  }

  if (Object.values(ratings).every((value) => value === null)) {
    return null
  }

  if (!hasCompleteRatings(ratings)) {
    throw new Error('評価項目の永続化データが不正です')
  }

  return EvaluationRatings.fromPrimitive({
    acidity: ratings.acidity as RatingValue,
    bitterness: ratings.bitterness as RatingValue,
    aroma: ratings.aroma as RatingValue,
    overallRating: ratings.overallRating as RatingValue,
  })
}

/**
 * Maps a database row to a CoffeeEvaluation domain entity.
 * shop_name は shops JOIN から取得する。
 */
function mapRowToEntity(row: CoffeeEvaluationRowWithShop): CoffeeEvaluation {
  const shopName = row.shops?.name ?? ''
  const props: CoffeeEvaluationProps = {
    id: row.id,
    userId: row.user_id,
    shopInfo: ShopInfo.fromPrimitive(shopName, row.shop_id),
    beanInfo: BeanInfo.fromPrimitive(
      row.bean_name ?? '',
      row.bean_type ?? '',
      row.roast_level
    ),
    ratings: extractRatingsFromRow(row),
    visibility: Visibility.fromBoolean(row.is_public),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }

  return CoffeeEvaluation.reconstruct(props)
}

/**
 * Maps common writable fields from a CoffeeEvaluation entity
 */
function mapEntityToWritableFields(
  entity: CoffeeEvaluation
): Pick<
  CoffeeEvaluationInsert,
  'shop_id' | 'bean_type' | 'bean_name' | 'roast_level' | 'acidity' | 'bitterness' | 'aroma' | 'overall_rating' | 'is_public'
> {
  const {
    shop_id,
    bean_type,
    bean_name,
    roast_level,
    acidity,
    bitterness,
    aroma,
    overall_rating,
    is_public,
  } = entity.toPersistence()

  return {
    shop_id,
    bean_type,
    bean_name,
    roast_level,
    acidity,
    bitterness,
    aroma,
    overall_rating,
    is_public,
  }
}

/**
 * Maps a CoffeeEvaluation entity to database insert format
 */
function mapEntityToInsert(entity: CoffeeEvaluation): Omit<CoffeeEvaluationInsert, 'id'> {
  return {
    user_id: entity.userId,
    ...mapEntityToWritableFields(entity),
  }
}

/**
 * Maps a CoffeeEvaluation entity to database update format
 */
function mapEntityToUpdate(entity: CoffeeEvaluation): CoffeeEvaluationUpdate {
  return mapEntityToWritableFields(entity)
}

/**
 * Sort configuration for Supabase queries
 */
const SORT_CONFIG: Record<EvaluationSortOption, { column: string; ascending: boolean; nullsFirst?: boolean; referencedTable?: string }> = {
  created_at_desc: { column: 'created_at', ascending: false },
  created_at_asc: { column: 'created_at', ascending: true },
  rating_desc: { column: 'overall_rating', ascending: false, nullsFirst: false },
  rating_asc: { column: 'overall_rating', ascending: true, nullsFirst: false },
  shop_name_asc: { column: 'name', ascending: true, referencedTable: 'shops' },
  shop_name_desc: { column: 'name', ascending: false, referencedTable: 'shops' },
}

function buildCoffeeSearchFilter(searchTerm: string, shopIds: string[]): string {
  const pattern = `%${searchTerm}%`
  const textFilters = COFFEE_TEXT_SEARCH_FIELDS.map((field) => `${field}.ilike.${pattern}`)

  if (shopIds.length === 0) {
    return textFilters.join(',')
  }

  return [`shop_id.in.(${shopIds.join(',')})`, ...textFilters].join(',')
}

async function findMatchingShopIds(supabase: any, searchTerm: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .ilike('name', `%${searchTerm}%`)

  if (error) {
    throw new Error(`店舗検索に失敗しました: ${error.message}`)
  }

  return (data || []).map((row: { id: string }) => row.id)
}

async function resolveCoffeeSearchFilter(supabase: any, searchTerm: string) {
  const shopIds = await findMatchingShopIds(supabase, searchTerm)
  return buildCoffeeSearchFilter(searchTerm, shopIds)
}

/**
 * Supabase implementation of CoffeeEvaluationRepository
 */
export class SupabaseCoffeeEvaluationRepository implements CoffeeEvaluationRepository {
  /**
   * Find a single evaluation by ID
   */
  async findById(id: CoffeeEvaluationId): Promise<Result<CoffeeEvaluation | null, Error>> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('coffee_evaluations')
        .select('*, shops(name)')
        .eq('id', id)
        .single()

      // Handle "not found" error gracefully
      if (error) {
        if (error.code === 'PGRST116') {
          return ok(null)
        }
        return fail(new Error(`評価の取得に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data as CoffeeEvaluationRowWithShop))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Find evaluations matching the given criteria
   */
  async findMany(params?: EvaluationQueryParams): Promise<Result<CoffeeEvaluation[], Error>> {
    try {
      const supabase = await createClient()

      let query = supabase.from('coffee_evaluations').select('*, shops(name)')

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const searchFilter = await resolveCoffeeSearchFilter(supabase, params.search)
        query = query.or(searchFilter)
      }

      // Apply sorting
      const sortConfig = SORT_CONFIG[params?.sort ?? 'created_at_desc']
      query = query.order(sortConfig.column, {
        ascending: sortConfig.ascending,
        ...(sortConfig.nullsFirst !== undefined && { nullsFirst: sortConfig.nullsFirst }),
        ...(sortConfig.referencedTable !== undefined && { referencedTable: sortConfig.referencedTable }),
      })

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit)
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit ?? 100) - 1)
      }

      const { data, error } = await query

      if (error) {
        return fail(new Error(`評価一覧の取得に失敗しました: ${error.message}`))
      }

      return ok((data || []).map((row) => mapRowToEntity(row as CoffeeEvaluationRowWithShop)))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Find evaluations with user display names
   */
  async findManyWithDisplayName(
    params?: EvaluationQueryParams
  ): Promise<Result<EvaluationWithDisplayName[], Error>> {
    try {
      const supabase = await createClient()

      // First, try JOIN approach
      let query = supabase
        .from('coffee_evaluations')
        .select('*, user_profiles!inner(display_name), shops(name)')

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const searchFilter = await resolveCoffeeSearchFilter(supabase, params.search)
        query = query.or(searchFilter)
      }

      // Apply sorting
      const sortConfig = SORT_CONFIG[params?.sort ?? 'created_at_desc']
      query = query.order(sortConfig.column, {
        ascending: sortConfig.ascending,
        ...(sortConfig.nullsFirst !== undefined && { nullsFirst: sortConfig.nullsFirst }),
        ...(sortConfig.referencedTable !== undefined && { referencedTable: sortConfig.referencedTable }),
      })

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit)
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit ?? 100) - 1)
      }

      const { data, error } = await query

      if (error) {
        // Fallback to separate queries if JOIN fails
        return this.findManyWithDisplayNameFallback(params)
      }

      const results: EvaluationWithDisplayName[] = (data || []).map((row: any) => ({
        evaluation: mapRowToEntity(row as CoffeeEvaluationRowWithShop),
        displayName: row.user_profiles?.display_name ?? null,
      }))

      return ok(results)
    } catch (err) {
      // Fallback if JOIN approach throws
      return this.findManyWithDisplayNameFallback(params)
    }
  }

  /**
   * Fallback method when JOIN doesn't work
   */
  private async findManyWithDisplayNameFallback(
    params?: EvaluationQueryParams
  ): Promise<Result<EvaluationWithDisplayName[], Error>> {
    try {
      const supabase = await createClient()

      // Get evaluations first
      const evaluationsResult = await this.findMany(params)
      if (!evaluationsResult.ok) {
        return evaluationsResult as Result<never, Error>
      }

      const evaluations = evaluationsResult.value
      if (evaluations.length === 0) {
        return ok([])
      }

      // Get unique user IDs
      const userIds = [...new Set(evaluations.map((e) => e.userId))]

      // Fetch user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', userIds)

      if (profileError) {
        return fail(new Error(`プロフィールの取得に失敗しました: ${profileError.message}`))
      }

      // Build display name map
      const displayNameMap = new Map<string, string | null>()
      for (const profile of profiles || []) {
        displayNameMap.set(profile.id, profile.display_name ?? null)
      }

      // Combine results
      const results: EvaluationWithDisplayName[] = evaluations.map((evaluation) => ({
        evaluation,
        displayName: displayNameMap.get(evaluation.userId) ?? null,
      }))

      return ok(results)
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Save a new evaluation
   */
  async save(evaluation: CoffeeEvaluation): Promise<Result<CoffeeEvaluation, Error>> {
    try {
      const supabase = await createClient()

      const insertData = mapEntityToInsert(evaluation)

      const { data, error } = await supabase
        .from('coffee_evaluations')
        .insert(insertData)
        .select('*, shops(name)')
        .single()

      if (error) {
        return fail(new Error(`評価の保存に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data as CoffeeEvaluationRowWithShop))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Update an existing evaluation
   */
  async update(evaluation: CoffeeEvaluation): Promise<Result<CoffeeEvaluation, Error>> {
    try {
      const supabase = await createClient()

      const updateData = mapEntityToUpdate(evaluation)

      const { data, error } = await supabase
        .from('coffee_evaluations')
        .update(updateData)
        .eq('id', evaluation.id)
        .select('*, shops(name)')
        .single()

      if (error) {
        return fail(new Error(`評価の更新に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data as CoffeeEvaluationRowWithShop))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Delete an evaluation by ID
   */
  async delete(id: CoffeeEvaluationId): Promise<Result<void, Error>> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('coffee_evaluations')
        .delete()
        .eq('id', id)

      if (error) {
        return fail(new Error(`評価の削除に失敗しました: ${error.message}`))
      }

      return ok(undefined)
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Check if an evaluation exists
   */
  async exists(id: CoffeeEvaluationId): Promise<Result<boolean, Error>> {
    try {
      const supabase = await createClient()

      const { count, error } = await supabase
        .from('coffee_evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('id', id)

      if (error) {
        return fail(new Error(`評価の存在確認に失敗しました: ${error.message}`))
      }

      return ok((count ?? 0) > 0)
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  /**
   * Count evaluations matching the given criteria
   */
  async count(params?: EvaluationQueryParams): Promise<Result<number, Error>> {
    try {
      const supabase = await createClient()

      let query = supabase
        .from('coffee_evaluations')
        .select('*, shops!left(name)', { count: 'exact', head: true })

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const searchFilter = await resolveCoffeeSearchFilter(supabase, params.search)
        query = query.or(searchFilter)
      }

      const { count, error } = await query

      if (error) {
        return fail(new Error(`評価数の取得に失敗しました: ${error.message}`))
      }

      return ok(count ?? 0)
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }
}
