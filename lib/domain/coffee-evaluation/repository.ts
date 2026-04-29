/**
 * CoffeeEvaluation Repository Interface
 * 
 * Defines the contract for coffee evaluation persistence.
 * Infrastructure layer implements this interface.
 * 
 * This follows the Repository pattern from DDD:
 * - Domain layer defines WHAT operations are needed (this interface)
 * - Infrastructure layer defines HOW they are implemented (Supabase, etc.)
 * 
 * @module lib/domain/coffee-evaluation/repository
 */

import { Result } from '../shared/result'
import { CoffeeEvaluation, CoffeeEvaluationId } from './entity'

/**
 * Sort options for listing evaluations
 */
export type EvaluationSortOption =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'rating_desc'
  | 'rating_asc'
  | 'shop_name_asc'
  | 'shop_name_desc'

/**
 * Filter parameters for querying evaluations
 */
export type EvaluationQueryParams = {
  /** Filter by user ID */
  userId?: string
  /** Filter by public/private status */
  isPublic?: boolean
  /** Search keyword (matches shop name, bean name, bean type, roast level) */
  search?: string
  /** Sort order */
  sort?: EvaluationSortOption
  /** Pagination limit */
  limit?: number
  /** Pagination offset */
  offset?: number
}

/**
 * Evaluation with display name (for list views with user info)
 */
export type EvaluationWithDisplayName = {
  evaluation: CoffeeEvaluation
  displayName: string | null
}

/**
 * Repository Interface for CoffeeEvaluation
 * 
 * Abstracts data access for the CoffeeEvaluation aggregate.
 * Implementations must handle:
 * - Mapping between domain entities and persistence format
 * - Query building and execution
 * - Error handling and translation
 */
export type CoffeeEvaluationRepository = {
  /**
   * Find a single evaluation by ID
   * @param id - Evaluation ID
   * @returns The evaluation if found, null if not found, or error
   */
  findById(id: CoffeeEvaluationId): Promise<Result<CoffeeEvaluation | null, Error>>

  /**
   * Find evaluations matching the given criteria
   * @param params - Query parameters for filtering and sorting
   * @returns Array of matching evaluations
   */
  findMany(params?: EvaluationQueryParams): Promise<Result<CoffeeEvaluation[], Error>>

  /**
   * Find evaluations with user display names
   * Used for community feed and list views
   * @param params - Query parameters for filtering and sorting
   * @returns Array of evaluations with display names
   */
  findManyWithDisplayName(
    params?: EvaluationQueryParams
  ): Promise<Result<EvaluationWithDisplayName[], Error>>

  /**
   * Save a new evaluation
   * @param evaluation - The evaluation entity to save
   * @returns The saved evaluation with generated ID
   */
  save(evaluation: CoffeeEvaluation): Promise<Result<CoffeeEvaluation, Error>>

  /**
   * Update an existing evaluation
   * @param evaluation - The evaluation entity with updated values
   * @returns The updated evaluation
   */
  update(evaluation: CoffeeEvaluation): Promise<Result<CoffeeEvaluation, Error>>

  /**
   * Delete an evaluation by ID
   * @param id - Evaluation ID to delete
   * @returns Success or error
   */
  delete(id: CoffeeEvaluationId): Promise<Result<void, Error>>

  /**
   * Check if an evaluation exists
   * @param id - Evaluation ID
   * @returns true if exists, false otherwise
   */
  exists(id: CoffeeEvaluationId): Promise<Result<boolean, Error>>

  /**
   * Count evaluations matching the given criteria
   * @param params - Query parameters for filtering
   * @returns Count of matching evaluations
   */
  count(params?: EvaluationQueryParams): Promise<Result<number, Error>>
}
