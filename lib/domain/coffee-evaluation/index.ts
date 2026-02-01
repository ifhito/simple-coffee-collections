/**
 * Coffee Evaluation Domain Module
 * 
 * Exports all domain types, entities, value objects, and repository interfaces
 * for the coffee evaluation bounded context.
 * 
 * @module lib/domain/coffee-evaluation
 */

// Shared types
export type { Result, Success, Failure } from '../shared/result'
export { ok, fail, isOk, isFail, map, flatMap, unwrap, unwrapOr } from '../shared/result'

// Entity
export { CoffeeEvaluation } from './entity'
export type {
  CoffeeEvaluationId,
  EvaluationRatings,
  CreateCoffeeEvaluationInput,
  UpdateCoffeeEvaluationInput,
  CoffeeEvaluationProps,
} from './entity'

// Value Objects
export {
  Rating,
  RATING_CONSTRAINTS,
  BeanInfo,
  BEAN_INFO_CONSTRAINTS,
  ShopInfo,
  SHOP_INFO_CONSTRAINTS,
  Visibility,
  VISIBILITY_EMOJI,
  VISIBILITY_LABEL,
} from './value-objects'
export type { RatingValue, BeanInfoInput } from './value-objects'

// Repository Interface
export type {
  CoffeeEvaluationRepository,
  EvaluationSortOption,
  EvaluationQueryParams,
  EvaluationWithDisplayName,
} from './repository'
