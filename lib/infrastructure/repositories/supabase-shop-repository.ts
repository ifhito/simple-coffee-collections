/**
 * Supabase Implementation of ShopRepository
 *
 * Implements shop persistence and search using Supabase.
 *
 * @module lib/infrastructure/repositories/supabase-shop-repository
 */

import { createClient } from '../supabase/server'
import type { ShopRepository } from '@/lib/domain/shop/repository'
import { Shop } from '@/lib/domain/shop/entity'
import type { ShopSearchProvider, ShopSearchResult } from '@/lib/application/ports/shop-search-provider'
import { ok, fail } from '@/lib/domain'
import type { Result } from '@/lib/domain'
import type { Database } from '@/lib/types/database.types'

type ShopRow = Database['public']['Tables']['shops']['Row']

function mapRowToShop(row: ShopRow): Shop {
  return Shop.reconstruct({
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  })
}

export class SupabaseShopRepository implements ShopRepository, ShopSearchProvider {
  async findById(id: string): Promise<Result<Shop | null, Error>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return ok(null)
        return fail(new Error(`店舗の取得に失敗しました: ${error.message}`))
      }

      return ok(mapRowToShop(data))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  async search(query: string, limit: number = 10): Promise<ShopSearchResult[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('shops')
      .select('id, name')
      .ilike('name', `%${query}%`)
      .limit(limit)

    if (error || !data) return []

    return data.map((row) => ({ id: row.id, name: row.name }))
  }

  async findOrCreate(name: string): Promise<Result<Shop, Error>> {
    try {
      const trimmed = name.trim()
      if (!trimmed) {
        return fail(new Error('店舗名は空にできません'))
      }

      const supabase = await createClient()

      // Try insert (ON CONFLICT DO NOTHING via upsert with ignoreDuplicates)
      await supabase
        .from('shops')
        .insert({ name: trimmed })
        .select()
        .single()

      // Whether insert succeeded or conflicted, select by normalized name
      const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ')
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('normalized_name', normalized)
        .single()

      if (error || !data) {
        return fail(new Error(`店舗の取得/作成に失敗しました: ${error?.message ?? 'not found'}`))
      }

      return ok(mapRowToShop(data))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }
}
