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
  Rating,
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

/**
 * Maps a database row to a CoffeeEvaluation domain entity
 */
function mapRowToEntity(row: CoffeeEvaluationRow): CoffeeEvaluation {
  const props: CoffeeEvaluationProps = {
    id: row.id,
    userId: row.user_id,
    shopInfo: ShopInfo.fromPrimitive(row.shop_name),
    beanInfo: BeanInfo.fromPrimitive(
      row.bean_name ?? '',
      row.bean_type,
      row.roast_level
    ),
    ratings: {
      acidity: Rating.fromPrimitive(row.acidity as RatingValue),
      bitterness: Rating.fromPrimitive(row.bitterness as RatingValue),
      aroma: Rating.fromPrimitive(row.aroma as RatingValue),
      overallRating: Rating.fromPrimitive(row.overall_rating as RatingValue),
    },
    visibility: Visibility.fromBoolean(row.is_public),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }

  return CoffeeEvaluation.reconstruct(props)
}

/**
 * Maps a CoffeeEvaluation entity to database insert format
 */
function mapEntityToInsert(entity: CoffeeEvaluation): Omit<CoffeeEvaluationInsert, 'id'> {
  return {
    user_id: entity.userId,
    shop_name: entity.shopName,
    bean_type: entity.beanType,
    bean_name: entity.beanName,
    roast_level: entity.roastLevel,
    acidity: entity.acidity.value,
    bitterness: entity.bitterness.value,
    aroma: entity.aroma.value,
    overall_rating: entity.overallRating.value,
    is_public: entity.isPublic,
  }
}

/**
 * Maps a CoffeeEvaluation entity to database update format
 */
function mapEntityToUpdate(entity: CoffeeEvaluation): CoffeeEvaluationUpdate {
  return {
    shop_name: entity.shopName,
    bean_type: entity.beanType,
    bean_name: entity.beanName,
    roast_level: entity.roastLevel,
    acidity: entity.acidity.value,
    bitterness: entity.bitterness.value,
    aroma: entity.aroma.value,
    overall_rating: entity.overallRating.value,
    is_public: entity.isPublic,
  }
}

/**
 * Sort configuration for Supabase queries
 */
const SORT_CONFIG: Record<EvaluationSortOption, { column: string; ascending: boolean }> = {
  created_at_desc: { column: 'created_at', ascending: false },
  created_at_asc: { column: 'created_at', ascending: true },
  rating_desc: { column: 'overall_rating', ascending: false },
  rating_asc: { column: 'overall_rating', ascending: true },
  shop_name_asc: { column: 'shop_name', ascending: true },
  shop_name_desc: { column: 'shop_name', ascending: false },
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
        .select('*')
        .eq('id', id)
        .single()

      // Handle "not found" error gracefully
      if (error) {
        if (error.code === 'PGRST116') {
          return ok(null)
        }
        return fail(new Error(`評価の取得に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data))
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

      let query = supabase.from('coffee_evaluations').select('*')

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const pattern = `%${params.search}%`
        query = query.or(
          `shop_name.ilike.${pattern},bean_type.ilike.${pattern},bean_name.ilike.${pattern},roast_level.ilike.${pattern}`
        )
      }

      // Apply sorting
      const sortConfig = SORT_CONFIG[params?.sort ?? 'created_at_desc']
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending })

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

      return ok((data || []).map(mapRowToEntity))
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
        .select('*, user_profiles!inner(display_name)')

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const pattern = `%${params.search}%`
        query = query.or(
          `shop_name.ilike.${pattern},bean_type.ilike.${pattern},bean_name.ilike.${pattern},roast_level.ilike.${pattern}`
        )
      }

      // Apply sorting
      const sortConfig = SORT_CONFIG[params?.sort ?? 'created_at_desc']
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending })

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
        evaluation: mapRowToEntity(row),
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
        .select()
        .single()

      if (error) {
        return fail(new Error(`評価の保存に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data))
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
        .select()
        .single()

      if (error) {
        return fail(new Error(`評価の更新に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data))
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
        .select('*', { count: 'exact', head: true })

      // Apply filters
      if (params?.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic)
      }

      // Apply search
      if (params?.search) {
        const pattern = `%${params.search}%`
        query = query.or(
          `shop_name.ilike.${pattern},bean_type.ilike.${pattern},bean_name.ilike.${pattern},roast_level.ilike.${pattern}`
        )
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
