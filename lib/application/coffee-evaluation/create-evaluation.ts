/**
 * Create Evaluation Use Case
 * 
 * Handles the creation of new coffee evaluations.
 * Validates input, creates domain entity, and persists through repository.
 * 
 * @module lib/application/coffee-evaluation/create-evaluation
 */

import {
  CoffeeEvaluation,
  CoffeeEvaluationRepository,
} from '@/lib/domain'
import {
  CreateEvaluationInput,
  EvaluationOutput,
  UseCaseResult,
  toEvaluationOutput,
} from './dto'

/**
 * Create Evaluation Use Case
 * 
 * Orchestrates the creation of a new coffee evaluation.
 */
export class CreateEvaluationUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param userId - ID of the authenticated user
   * @param input - Evaluation creation data
   * @returns Created evaluation or error
   */
  async execute(
    userId: string,
    input: CreateEvaluationInput
  ): Promise<UseCaseResult<EvaluationOutput>> {
    // 1. Create domain entity with validation
    const entityResult = CoffeeEvaluation.create({
      userId,
      shopName: input.shopName,
      beanName: input.beanName,
      beanType: input.beanType,
      roastLevel: input.roastLevel,
      acidity: input.acidity,
      bitterness: input.bitterness,
      aroma: input.aroma,
      overallRating: input.overallRating,
      isPublic: input.isPublic,
    })

    if (!entityResult.ok) {
      return { success: false, error: entityResult.error }
    }

    // 2. Persist through repository
    const saveResult = await this.repository.save(entityResult.value)

    if (!saveResult.ok) {
      return { success: false, error: saveResult.error.message }
    }

    // 3. Return output DTO
    return {
      success: true,
      data: toEvaluationOutput(saveResult.value),
    }
  }
}
