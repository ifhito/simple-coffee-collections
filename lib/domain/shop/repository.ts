/**
 * Shop Repository Interface
 *
 * Defines the contract for shop persistence operations.
 *
 * @module lib/domain/shop/repository
 */

import type { Shop } from './entity'
import type { Result } from '../shared/result'

export type ShopRepository = {
  findById(id: string): Promise<Result<Shop | null, Error>>
  findOrCreate(name: string): Promise<Result<Shop, Error>>
}
