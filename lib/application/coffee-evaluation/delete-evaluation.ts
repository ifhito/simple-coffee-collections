/**
 * Delete Evaluation Use Case
 * 
 * Handles deletion of coffee evaluations.
 * Validates ownership before deletion.
 * 
 * @module lib/application/coffee-evaluation/delete-evaluation
 */

import {
  CoffeeEvaluationRepository,
  CoffeeEvaluationId,
} from '@/lib/domain'
import { UseCaseResult } from './dto'

/**
 * Delete Evaluation Use Case
 * 
 * Orchestrates the deletion of an existing coffee evaluation.
 */
export class DeleteEvaluationUseCase {
  constructor(private readonly repository: CoffeeEvaluationRepository) {}

  /**
   * Execute the use case
   * 
   * @param userId - ID of the authenticated user (for ownership check)
   * @param evaluationId - ID of the evaluation to delete
   * @returns Success or error
   */
  async execute(
    userId: string,
    evaluationId: CoffeeEvaluationId
  ): Promise<UseCaseResult<void>> {
    // 1. Find existing evaluation
    const findResult = await this.repository.findById(evaluationId)

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

    // 3. Delete through repository
    const deleteResult = await this.repository.delete(evaluationId)

    if (!deleteResult.ok) {
      return { success: false, error: deleteResult.error.message }
    }

    return { success: true, data: undefined }
  }
}
