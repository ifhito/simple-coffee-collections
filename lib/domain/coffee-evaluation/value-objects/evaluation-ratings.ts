/**
 * EvaluationRatings Value Object
 *
 * Represents the set of 4 rating values for a coffee evaluation.
 * Immutable and self-validating. All-or-nothing: either all 4 ratings
 * exist as a unit, or none (represented by null at the entity level).
 *
 * @module lib/domain/coffee-evaluation/value-objects/evaluation-ratings
 */

import { Result, ok, fail } from '../../shared/result'
import { Rating, RatingValue } from './rating'

/**
 * Input for creating EvaluationRatings from raw numbers
 */
export interface EvaluationRatingsInput {
  acidity: number
  bitterness: number
  aroma: number
  overallRating: number
}

/**
 * EvaluationRatings Value Object
 *
 * A cohesive unit of 4 ratings that is created, replaced, or removed as a whole.
 * Use EvaluationRatings.create() to instantiate with validation.
 */
export class EvaluationRatings {
  private constructor(
    private readonly _acidity: Rating,
    private readonly _bitterness: Rating,
    private readonly _aroma: Rating,
    private readonly _overallRating: Rating
  ) {
    Object.freeze(this)
  }

  /**
   * Factory method to create EvaluationRatings with validation
   * @param input - Raw numeric rating values
   * @returns Result containing EvaluationRatings or validation error
   */
  static create(input: EvaluationRatingsInput): Result<EvaluationRatings, string> {
    const acidityResult = Rating.create(input.acidity)
    if (!acidityResult.ok) return fail(`酸味: ${acidityResult.error}`)

    const bitternessResult = Rating.create(input.bitterness)
    if (!bitternessResult.ok) return fail(`苦味: ${bitternessResult.error}`)

    const aromaResult = Rating.create(input.aroma)
    if (!aromaResult.ok) return fail(`香り: ${aromaResult.error}`)

    const overallRatingResult = Rating.create(input.overallRating)
    if (!overallRatingResult.ok) return fail(`総合評価: ${overallRatingResult.error}`)

    return ok(
      new EvaluationRatings(
        acidityResult.value,
        bitternessResult.value,
        aromaResult.value,
        overallRatingResult.value
      )
    )
  }

  /**
   * Create from known valid Rating objects (e.g., from database)
   * Skips validation for trusted sources
   */
  static fromRatings(
    acidity: Rating,
    bitterness: Rating,
    aroma: Rating,
    overallRating: Rating
  ): EvaluationRatings {
    return new EvaluationRatings(acidity, bitterness, aroma, overallRating)
  }

  /**
   * Create from primitive values (e.g., from database)
   * Skips validation for trusted sources
   */
  static fromPrimitive(values: {
    acidity: RatingValue
    bitterness: RatingValue
    aroma: RatingValue
    overallRating: RatingValue
  }): EvaluationRatings {
    return new EvaluationRatings(
      Rating.fromPrimitive(values.acidity),
      Rating.fromPrimitive(values.bitterness),
      Rating.fromPrimitive(values.aroma),
      Rating.fromPrimitive(values.overallRating)
    )
  }

  get acidity(): Rating {
    return this._acidity
  }

  get bitterness(): Rating {
    return this._bitterness
  }

  get aroma(): Rating {
    return this._aroma
  }

  get overallRating(): Rating {
    return this._overallRating
  }

  /**
   * Check equality with another EvaluationRatings
   */
  equals(other: EvaluationRatings): boolean {
    return (
      this._acidity.equals(other._acidity) &&
      this._bitterness.equals(other._bitterness) &&
      this._aroma.equals(other._aroma) &&
      this._overallRating.equals(other._overallRating)
    )
  }

  /**
   * Convert to primitive object for serialization
   */
  toPrimitive(): {
    acidity: RatingValue
    bitterness: RatingValue
    aroma: RatingValue
    overallRating: RatingValue
  } {
    return {
      acidity: this._acidity.toPrimitive(),
      bitterness: this._bitterness.toPrimitive(),
      aroma: this._aroma.toPrimitive(),
      overallRating: this._overallRating.toPrimitive(),
    }
  }

  /**
   * Convert to persistence format (snake_case keys)
   */
  toPersistence(): RatingsPersistence {
    return {
      acidity: this._acidity.toPrimitive(),
      bitterness: this._bitterness.toPrimitive(),
      aroma: this._aroma.toPrimitive(),
      overall_rating: this._overallRating.toPrimitive(),
    }
  }

  /**
   * Null persistence representation for unevaluated beans
   */
  static readonly NULL_PERSISTENCE: NullRatingsPersistence = {
    acidity: null,
    bitterness: null,
    aroma: null,
    overall_rating: null,
  }
}

export type RatingsPersistence = {
  acidity: RatingValue
  bitterness: RatingValue
  aroma: RatingValue
  overall_rating: RatingValue
}

export type NullRatingsPersistence = {
  [K in keyof RatingsPersistence]: null
}
