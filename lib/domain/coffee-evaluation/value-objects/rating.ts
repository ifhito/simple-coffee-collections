/**
 * Rating Value Object
 * 
 * Represents a rating value on a 1-10 scale.
 * Immutable and self-validating.
 * 
 * @module lib/domain/coffee-evaluation/value-objects/rating
 */

import { Result, ok, fail } from '../../shared/result'

/**
 * Valid rating values (1-10 scale)
 */
export type RatingValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Rating constraints
 */
export const RATING_CONSTRAINTS = {
  MIN: 1,
  MAX: 10,
} as const

/**
 * Rating Value Object
 * 
 * Encapsulates a rating value with validation.
 * Use Rating.create() to instantiate with validation.
 */
export class Rating {
  private constructor(private readonly _value: RatingValue) {
    // Private constructor ensures creation only through factory method
    Object.freeze(this)
  }

  /**
   * Factory method to create a Rating with validation
   * @param value - Numeric value to create rating from
   * @returns Result containing Rating or validation error
   */
  static create(value: number): Result<Rating, string> {
    if (!Number.isInteger(value)) {
      return fail('評価値は整数である必要があります')
    }

    if (value < RATING_CONSTRAINTS.MIN || value > RATING_CONSTRAINTS.MAX) {
      return fail(
        `評価値は${RATING_CONSTRAINTS.MIN}〜${RATING_CONSTRAINTS.MAX}の範囲である必要があります`
      )
    }

    return ok(new Rating(value as RatingValue))
  }

  /**
   * Create Rating from a known valid value (e.g., from database)
   * Skips validation for trusted sources
   * @param value - Known valid rating value
   */
  static fromPrimitive(value: RatingValue): Rating {
    return new Rating(value)
  }

  /**
   * Get the primitive rating value
   */
  get value(): RatingValue {
    return this._value
  }

  /**
   * Check equality with another Rating
   */
  equals(other: Rating): boolean {
    return this._value === other._value
  }

  /**
   * Convert to primitive for serialization
   */
  toPrimitive(): RatingValue {
    return this._value
  }

  /**
   * Get display text for the rating
   */
  toDisplayString(): string {
    return `${this._value}/10`
  }

  /**
   * Check if this rating is considered "high" (7 or above)
   */
  isHigh(): boolean {
    return this._value >= 7
  }

  /**
   * Check if this rating is considered "low" (3 or below)
   */
  isLow(): boolean {
    return this._value <= 3
  }
}
