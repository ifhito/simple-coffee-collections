/**
 * Get Evaluations Use Cases
 * 
 * Query use cases for retrieving coffee evaluations.
 * Handles single evaluation lookup and list queries.
 * 
 * @module lib/application/coffee-evaluation/get-evaluations
 */

import {
  CoffeeEvaluationRepository,
  CoffeeEvaluationId,
} from '@/lib/domain'
import {
  EvaluationOutput,
  EvaluationWithUserOutput,
  ListEvaluationsQuery,
  UseCaseResult,
  toEvaluationOutput,
} from './dto'

/**
 * Get Single Evaluation Use Case
 * 
 * Retrieves a single evaluation by ID with access control.
 */
export class GetEvaluationUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param evaluationId - ID of the evaluation to retrieve
   * @param userId - ID of the requesting user (null for anonymous)
   * @returns Evaluation or error (including access denied)
   */
  async execute(
    evaluationId: CoffeeEvaluationId,
    userId: string | null
  ): Promise<UseCaseResult<EvaluationOutput | null>> {
    const findResult = await this.repository.findById(evaluationId)

    if (!findResult.ok) {
      return { success: false, error: findResult.error.message }
    }

    const evaluation = findResult.value

    if (!evaluation) {
      return { success: true, data: null }
    }

    // Check if user can view this evaluation
    if (!evaluation.isViewableBy(userId)) {
      return { success: false, error: '権限がありません' }
    }

    return {
      success: true,
      data: toEvaluationOutput(evaluation),
    }
  }
}

/**
 * List Evaluations Use Case
 * 
 * Retrieves a list of evaluations with optional filtering and sorting.
 */
export class ListEvaluationsUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param query - Query parameters for filtering and sorting
   * @returns List of evaluations or error
   */
  async execute(
    query: ListEvaluationsQuery
  ): Promise<UseCaseResult<EvaluationOutput[] | EvaluationWithUserOutput[]>> {
    if (query.includeUserInfo) {
      return this.executeWithUserInfo(query)
    }

    const findResult = await this.repository.findMany({
      userId: query.userId,
      isPublic: query.isPublic,
      search: query.search,
      sort: query.sort,
      limit: query.limit,
      offset: query.offset,
    })

    if (!findResult.ok) {
      return { success: false, error: findResult.error.message }
    }

    return {
      success: true,
      data: findResult.value.map(toEvaluationOutput),
    }
  }

  /**
   * Execute with user display name information
   */
  private async executeWithUserInfo(
    query: ListEvaluationsQuery
  ): Promise<UseCaseResult<EvaluationWithUserOutput[]>> {
    const findResult = await this.repository.findManyWithDisplayName({
      userId: query.userId,
      isPublic: query.isPublic,
      search: query.search,
      sort: query.sort,
      limit: query.limit,
      offset: query.offset,
    })

    if (!findResult.ok) {
      return { success: false, error: findResult.error.message }
    }

    return {
      success: true,
      data: findResult.value.map(({ evaluation, displayName }) => ({
        ...toEvaluationOutput(evaluation),
        displayName,
      })),
    }
  }
}

/**
 * Get User's Evaluations Use Case
 * 
 * Convenience use case for getting evaluations for a specific user.
 * Returns both public and private evaluations if the user is viewing their own.
 */
export class GetUserEvaluationsUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param targetUserId - ID of the user whose evaluations to retrieve
   * @param requestingUserId - ID of the requesting user (null for anonymous)
   * @param query - Additional query parameters
   * @returns List of evaluations
   */
  async execute(
    targetUserId: string,
    requestingUserId: string | null,
    query?: Omit<ListEvaluationsQuery, 'userId' | 'isPublic'>
  ): Promise<UseCaseResult<EvaluationOutput[]>> {
    // If viewing own profile, show all evaluations
    // Otherwise, only show public ones
    const isOwnProfile = targetUserId === requestingUserId
    
    const findResult = await this.repository.findMany({
      userId: targetUserId,
      isPublic: isOwnProfile ? undefined : true,
      search: query?.search,
      sort: query?.sort,
      limit: query?.limit,
      offset: query?.offset,
    })

    if (!findResult.ok) {
      return { success: false, error: findResult.error.message }
    }

    return {
      success: true,
      data: findResult.value.map(toEvaluationOutput),
    }
  }
}
