import { createClient } from '../supabase/server'
import type { BeanRecommendationRepository, RatedBeanForRecommendation } from '@/lib/domain/bean-recommendation'
import { fail, ok, type Result } from '@/lib/domain/shared/result'
import type { Database } from '@/lib/types/database.types'

type CoffeeEvaluationRow = Pick<
  Database['public']['Tables']['coffee_evaluations']['Row'],
  | 'id'
  | 'bean_name'
  | 'bean_type'
  | 'roast_level'
  | 'acidity'
  | 'bitterness'
  | 'aroma'
  | 'overall_rating'
  | 'notes'
  | 'created_at'
> & {
  shops?: { name: string } | { name: string }[] | null
}

function hasCompleteRatings(row: CoffeeEvaluationRow): row is CoffeeEvaluationRow & {
  acidity: number
  bitterness: number
  aroma: number
  overall_rating: number
} {
  return row.acidity !== null && row.bitterness !== null && row.aroma !== null && row.overall_rating !== null
}

function shopNameFromJoin(shops: CoffeeEvaluationRow['shops']): string | null {
  if (!shops) return null
  if (Array.isArray(shops)) return shops[0]?.name ?? null
  return shops.name
}

function mapRowToRatedBean(row: CoffeeEvaluationRow): RatedBeanForRecommendation | null {
  if (!hasCompleteRatings(row)) {
    return null
  }

  return {
    evaluationId: row.id,
    beanName: row.bean_name,
    beanType: row.bean_type,
    roastLevel: row.roast_level,
    shopName: shopNameFromJoin(row.shops),
    acidity: row.acidity,
    bitterness: row.bitterness,
    aroma: row.aroma,
    overallRating: row.overall_rating,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export class SupabaseBeanRecommendationRepository implements BeanRecommendationRepository {
  async findRatedBeansByUserId(
    userId: string,
    limit = 100
  ): Promise<Result<RatedBeanForRecommendation[], Error>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('coffee_evaluations')
        .select(
          'id, bean_name, bean_type, roast_level, acidity, bitterness, aroma, overall_rating, notes, created_at, shops(name)'
        )
        .eq('user_id', userId)
        .not('overall_rating', 'is', null)
        .order('overall_rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return fail(new Error(`おすすめ候補の取得に失敗しました: ${error.message}`))
      }

      const beans = ((data ?? []) as unknown as CoffeeEvaluationRow[])
        .map(mapRowToRatedBean)
        .filter((bean): bean is RatedBeanForRecommendation => bean !== null)

      return ok(beans)
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('おすすめ候補の取得に失敗しました'))
    }
  }
}
