/**
 * Result Type for Domain Operations
 * 
 * A discriminated union type for handling success/failure outcomes
 * without throwing exceptions in the domain layer.
 * 
 * @module lib/domain/shared/result
 */

/**
 * Represents a successful operation result
 */
export type Success<T> = {
  readonly ok: true
  readonly value: T
}

/**
 * Represents a failed operation result
 */
export type Failure<E = Error> = {
  readonly ok: false
  readonly error: E
}

/**
 * Result type - either Success or Failure
 * Use this for operations that can fail in a predictable way
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Create a successful result
 */
export function ok<T>(value: T): Success<T> {
  return { ok: true, value }
}

/**
 * Create a failed result
 */
export function fail<E = Error>(error: E): Failure<E> {
  return { ok: false, error }
}

/**
 * Type guard to check if result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is Success<T> {
  return result.ok
}

/**
 * Type guard to check if result is a failure
 */
export function isFail<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.ok
}

/**
 * Map over a successful result, leaving failures unchanged
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value))
  }
  return result
}

/**
 * FlatMap (bind) for chaining operations that return Results
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value)
  }
  return result
}

/**
 * Extract value from Result or throw error
 * Use sparingly - prefer pattern matching with ok/fail
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value
  }
  throw result.error
}

/**
 * Extract value from Result or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.value
  }
  return defaultValue
}
