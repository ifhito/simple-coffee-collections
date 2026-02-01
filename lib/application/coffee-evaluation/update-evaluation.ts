/**
 * Update Evaluation Use Case
 * 
 * Handles updating existing coffee evaluations.
 * Validates ownership, updates domain entity, and persists changes.
 * 
 * @module lib/application/coffee-evaluation/update-evaluation
 */

import {
  CoffeeEvaluationRepository,
} from '@/lib/domain'
import {
  UpdateEvaluationInput,
  EvaluationOutput,
  UseCaseResult,
  toEvaluationOutput,
} from './dto'

/**
 * Update Evaluation Use Case
 * 
 * Orchestrates the update of an existing coffee evaluation.
 */
export class UpdateEvaluationUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param userId - ID of the authenticated user (for ownership check)
   * @param input - Evaluation update data
   * @returns Updated evaluation or error
   */
  async execute(
    userId: string,
    input: UpdateEvaluationInput
  ): Promise<UseCaseResult<EvaluationOutput>> {
    // 1. Find existing evaluation
    const findResult = await this.repository.findById(input.id)

    if (!findResult.ok) {
      return { success: false, error: findResult.error.message }
    }

    if (!findResult.value) {
      return { success: false, error: '評価が見つかりません' }
    }

    const evaluation = findResult.value

    // 2. Check ownership
    if (!evaluation.isOwnedBy(userId)) {
      return { success: false, error: '権限がありません' }
    }

    // 3. Update domain entity with validation
    const updateResult = evaluation.update({
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

    if (!updateResult.ok) {
      return { success: false, error: updateResult.error }
    }

    // 4. Persist through repository
    const saveResult = await this.repository.update(updateResult.value)

    if (!saveResult.ok) {
      return { success: false, error: saveResult.error.message }
    }

    // 5. Return output DTO
    return {
      success: true,
      data: toEvaluationOutput(saveResult.value),
    }
  }
}
