/**
 * Coffee Evaluation Application Module
 * 
 * Exports all use cases and DTOs for the coffee evaluation feature.
 * 
 * @module lib/application/coffee-evaluation
 */

// DTOs
export type {
  CreateEvaluationInput,
  UpdateEvaluationInput,
  ListEvaluationsQuery,
  EvaluationOutput,
  EvaluationWithUserOutput,
  UseCaseResult,
} from './dto'
export { toEvaluationOutput } from './dto'

// Command Use Cases
export { CreateEvaluationUseCase } from './create-evaluation'
export { UpdateEvaluationUseCase } from './update-evaluation'
export { DeleteEvaluationUseCase } from './delete-evaluation'

// Query Use Cases
export {
  GetEvaluationUseCase,
  ListEvaluationsUseCase,
  GetUserEvaluationsUseCase,
} from './get-evaluations'
