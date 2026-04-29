/**
 * Data Transfer Objects for Coffee Evaluation Use Cases
 * 
 * DTOs are used to transfer data between layers.
 * They are simple data structures without behavior.
 * 
 * @module lib/application/coffee-evaluation/dto
 */

import type { RatingValue, EvaluationSortOption } from '@/lib/domain'

/**
 * Input DTO for creating a new coffee evaluation
 */
export type CreateEvaluationInput = {
  /** Shop/cafe name (optional) */
  shopName?: string
  /** Shop entity ID (optional) */
  shopId?: string | null
  /** Coffee bean name (required) */
  beanName: string
  /** Bean type/origin (optional) */
  beanType?: string
  /** Roast level (optional) */
  roastLevel?: string | null
  /** Acidity rating 1-10 */
  acidity: number
  /** Bitterness rating 1-10 */
  bitterness: number
  /** Aroma rating 1-10 */
  aroma: number
  /** Overall rating 1-10 */
  overallRating: number
  /** Public visibility */
  isPublic: boolean
}

/**
 * Input DTO for updating an existing coffee evaluation
 */
export type UpdateEvaluationInput = {
  /** Evaluation ID */
  id: string
  /** Shop/cafe name */
  shopName?: string
  /** Shop entity ID */
  shopId?: string | null
  /** Coffee bean name */
  beanName?: string
  /** Bean type/origin */
  beanType?: string
  /** Roast level */
  roastLevel?: string | null
  /** Acidity rating 1-10 */
  acidity?: number
  /** Bitterness rating 1-10 */
  bitterness?: number
  /** Aroma rating 1-10 */
  aroma?: number
  /** Overall rating 1-10 */
  overallRating?: number
  /** Public visibility */
  isPublic?: boolean
}

/**
 * Query parameters for listing evaluations
 */
export type ListEvaluationsQuery = {
  /** Filter by user ID */
  userId?: string
  /** Filter by public/private status */
  isPublic?: boolean
  /** Search keyword */
  search?: string
  /** Sort order */
  sort?: EvaluationSortOption
  /** Pagination limit */
  limit?: number
  /** Pagination offset */
  offset?: number
  /** Include user display names */
  includeUserInfo?: boolean
}

/**
 * Output DTO for a coffee evaluation
 */
export type EvaluationOutput = {
  id: string
  userId: string
  shopName: string
  shopId: string | null
  beanName: string
  beanType: string
  roastLevel: string | null
  acidity: RatingValue | null
  bitterness: RatingValue | null
  aroma: RatingValue | null
  overallRating: RatingValue | null
  isPublic: boolean
  isEvaluated: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Output DTO for evaluation with user display name
 */
export type EvaluationWithUserOutput = {
  displayName: string | null
} & EvaluationOutput

/**
 * Use case result type
 */
export type UseCaseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Convert domain entity to output DTO
 */
export function toEvaluationOutput(entity: {
  id: string
  userId: string
  shopName: string
  shopId: string | null
  beanName: string
  beanType: string
  roastLevel: string | null
  acidity: { value: RatingValue } | null
  bitterness: { value: RatingValue } | null
  aroma: { value: RatingValue } | null
  overallRating: { value: RatingValue } | null
  isPublic: boolean
  isEvaluated: boolean
  createdAt: Date
  updatedAt: Date
}): EvaluationOutput {
  return {
    id: entity.id,
    userId: entity.userId,
    shopName: entity.shopName,
    shopId: entity.shopId,
    beanName: entity.beanName,
    beanType: entity.beanType,
    roastLevel: entity.roastLevel,
    acidity: entity.acidity?.value ?? null,
    bitterness: entity.bitterness?.value ?? null,
    aroma: entity.aroma?.value ?? null,
    overallRating: entity.overallRating?.value ?? null,
    isPublic: entity.isPublic,
    isEvaluated: entity.isEvaluated,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}
