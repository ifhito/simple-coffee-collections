/**
 * CoffeeEvaluation Entity (Aggregate Root)
 * 
 * Represents a coffee evaluation record with all its associated value objects.
 * This is the aggregate root for the coffee evaluation bounded context.
 * 
 * @module lib/domain/coffee-evaluation/entity
 */

import { Result, ok, fail, flatMap } from '../shared/result'
import { Rating, RatingValue } from './value-objects/rating'
import { BeanInfo, BeanInfoInput } from './value-objects/bean-info'
import { ShopInfo } from './value-objects/shop-info'
import { Visibility } from './value-objects/visibility'

/**
 * Unique identifier for CoffeeEvaluation
 */
export type CoffeeEvaluationId = string

/**
 * Rating fields for a coffee evaluation
 */
export interface EvaluationRatings {
  acidity: Rating
  bitterness: Rating
  aroma: Rating
  overallRating: Rating
}

/**
 * Input for creating a new CoffeeEvaluation (with ratings)
 */
export interface CreateCoffeeEvaluationInput {
  userId: string
  shopName?: string
  beanName: string
  beanType?: string
  roastLevel?: string | null
  acidity: number
  bitterness: number
  aroma: number
  overallRating: number
  isPublic: boolean
}

/**
 * Input for creating a bean-only CoffeeEvaluation (without ratings)
 */
export interface CreateBeanOnlyInput {
  userId: string
  shopName?: string
  beanName: string
  beanType?: string
  roastLevel?: string | null
  isPublic: boolean
}

/**
 * Input for updating an existing CoffeeEvaluation
 */
export interface UpdateCoffeeEvaluationInput {
  shopName?: string
  beanName?: string
  beanType?: string
  roastLevel?: string | null
  acidity?: number
  bitterness?: number
  aroma?: number
  overallRating?: number
  isPublic?: boolean
}

/**
 * Properties for reconstructing a CoffeeEvaluation from persistence
 */
export interface CoffeeEvaluationProps {
  id: CoffeeEvaluationId
  userId: string
  shopInfo: ShopInfo
  beanInfo: BeanInfo
  ratings: EvaluationRatings | null
  visibility: Visibility
  createdAt: Date
  updatedAt: Date
}

/**
 * CoffeeEvaluation Entity (Aggregate Root)
 * 
 * Represents a user's evaluation of a coffee experience.
 * Contains shop info, bean info, ratings, and visibility settings.
 */
export class CoffeeEvaluation {
  private constructor(
    private readonly _id: CoffeeEvaluationId,
    private readonly _userId: string,
    private _shopInfo: ShopInfo,
    private _beanInfo: BeanInfo,
    private _ratings: EvaluationRatings | null,
    private _visibility: Visibility,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  // =========================================================================
  // Factory Methods
  // =========================================================================

  /**
   * Create a new CoffeeEvaluation with validation
   * @param input - Creation input data
   * @returns Result containing CoffeeEvaluation or validation error
   */
  static create(input: CreateCoffeeEvaluationInput): Result<CoffeeEvaluation, string> {
    // Validate shop info
    const shopInfoResult = ShopInfo.create(input.shopName)
    if (!shopInfoResult.ok) return shopInfoResult

    // Validate bean info
    const beanInfoResult = BeanInfo.create({
      beanName: input.beanName,
      beanType: input.beanType,
      roastLevel: input.roastLevel,
    })
    if (!beanInfoResult.ok) return beanInfoResult

    // Validate ratings
    const ratingsResult = CoffeeEvaluation.validateRatings({
      acidity: input.acidity,
      bitterness: input.bitterness,
      aroma: input.aroma,
      overallRating: input.overallRating,
    })
    if (!ratingsResult.ok) return ratingsResult

    const now = new Date()
    
    return ok(new CoffeeEvaluation(
      '', // ID will be assigned by repository
      input.userId,
      shopInfoResult.value,
      beanInfoResult.value,
      ratingsResult.value,
      Visibility.fromBoolean(input.isPublic),
      now,
      now
    ))
  }

  /**
   * Create a bean-only CoffeeEvaluation without ratings
   * @param input - Bean info input data (no ratings)
   * @returns Result containing CoffeeEvaluation or validation error
   */
  static createBeanOnly(input: CreateBeanOnlyInput): Result<CoffeeEvaluation, string> {
    const shopInfoResult = ShopInfo.create(input.shopName)
    if (!shopInfoResult.ok) return shopInfoResult

    const beanInfoResult = BeanInfo.create({
      beanName: input.beanName,
      beanType: input.beanType,
      roastLevel: input.roastLevel,
    })
    if (!beanInfoResult.ok) return beanInfoResult

    const now = new Date()

    return ok(new CoffeeEvaluation(
      '',
      input.userId,
      shopInfoResult.value,
      beanInfoResult.value,
      null,
      Visibility.fromBoolean(input.isPublic),
      now,
      now
    ))
  }

  /**
   * Reconstruct a CoffeeEvaluation from persistence (no validation)
   * @param props - Properties from database
   */
  static reconstruct(props: CoffeeEvaluationProps): CoffeeEvaluation {
    return new CoffeeEvaluation(
      props.id,
      props.userId,
      props.shopInfo,
      props.beanInfo,
      props.ratings,
      props.visibility,
      props.createdAt,
      props.updatedAt
    )
  }

  /**
   * Validate rating values and create Rating objects
   */
  private static validateRatings(input: {
    acidity: number
    bitterness: number
    aroma: number
    overallRating: number
  }): Result<EvaluationRatings, string> {
    const acidityResult = Rating.create(input.acidity)
    if (!acidityResult.ok) return fail(`酸味: ${acidityResult.error}`)

    const bitternessResult = Rating.create(input.bitterness)
    if (!bitternessResult.ok) return fail(`苦味: ${bitternessResult.error}`)

    const aromaResult = Rating.create(input.aroma)
    if (!aromaResult.ok) return fail(`香り: ${aromaResult.error}`)

    const overallRatingResult = Rating.create(input.overallRating)
    if (!overallRatingResult.ok) return fail(`総合評価: ${overallRatingResult.error}`)

    return ok({
      acidity: acidityResult.value,
      bitterness: bitternessResult.value,
      aroma: aromaResult.value,
      overallRating: overallRatingResult.value,
    })
  }

  // =========================================================================
  // Getters
  // =========================================================================

  get id(): CoffeeEvaluationId {
    return this._id
  }

  get userId(): string {
    return this._userId
  }

  get shopInfo(): ShopInfo {
    return this._shopInfo
  }

  get beanInfo(): BeanInfo {
    return this._beanInfo
  }

  get ratings(): EvaluationRatings | null {
    return this._ratings
  }

  get isEvaluated(): boolean {
    return this._ratings !== null
  }

  get visibility(): Visibility {
    return this._visibility
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  // Convenience getters for common access patterns
  get shopName(): string {
    return this._shopInfo.shopName
  }

  get beanName(): string {
    return this._beanInfo.beanName
  }

  get beanType(): string {
    return this._beanInfo.beanType
  }

  get roastLevel(): string | null {
    return this._beanInfo.roastLevel
  }

  get acidity(): Rating | null {
    return this._ratings?.acidity ?? null
  }

  get bitterness(): Rating | null {
    return this._ratings?.bitterness ?? null
  }

  get aroma(): Rating | null {
    return this._ratings?.aroma ?? null
  }

  get overallRating(): Rating | null {
    return this._ratings?.overallRating ?? null
  }

  get isPublic(): boolean {
    return this._visibility.isPublic
  }

  // =========================================================================
  // Domain Methods
  // =========================================================================

  /**
   * Check if this evaluation belongs to the specified user
   */
  isOwnedBy(userId: string): boolean {
    return this._userId === userId
  }

  /**
   * Check if this evaluation is viewable by the specified user
   * (either owned by them or public)
   */
  isViewableBy(userId: string | null): boolean {
    if (this._visibility.isPublic) return true
    if (!userId) return false
    return this._userId === userId
  }

  /**
   * Add or update ratings on this evaluation
   * Works for both unevaluated → evaluated transition and re-evaluation
   * @param input - Rating values to set
   * @returns Result with updated entity or validation error
   */
  evaluate(input: {
    acidity: number
    bitterness: number
    aroma: number
    overallRating: number
  }): Result<CoffeeEvaluation, string> {
    const ratingsResult = CoffeeEvaluation.validateRatings(input)
    if (!ratingsResult.ok) return ratingsResult

    return ok(new CoffeeEvaluation(
      this._id,
      this._userId,
      this._shopInfo,
      this._beanInfo,
      ratingsResult.value,
      this._visibility,
      this._createdAt,
      new Date()
    ))
  }

  /**
   * Update the evaluation with new values
   * @param input - Update input data
   * @returns Result with updated entity or validation error
   */
  update(input: UpdateCoffeeEvaluationInput): Result<CoffeeEvaluation, string> {
    // Validate and create new shop info if provided
    let newShopInfo = this._shopInfo
    if (input.shopName !== undefined) {
      const result = ShopInfo.create(input.shopName)
      if (!result.ok) return result
      newShopInfo = result.value
    }

    // Validate and create new bean info if any field is provided
    let newBeanInfo = this._beanInfo
    if (input.beanName !== undefined || input.beanType !== undefined || input.roastLevel !== undefined) {
      const result = BeanInfo.create({
        beanName: input.beanName ?? this._beanInfo.beanName,
        beanType: input.beanType ?? this._beanInfo.beanType,
        roastLevel: input.roastLevel !== undefined ? input.roastLevel : this._beanInfo.roastLevel,
      })
      if (!result.ok) return result
      newBeanInfo = result.value
    }

    // Validate and create new ratings if any field is provided
    let newRatings = this._ratings
    if (
      input.acidity !== undefined ||
      input.bitterness !== undefined ||
      input.aroma !== undefined ||
      input.overallRating !== undefined
    ) {
      // When current ratings are null, all four values must be provided
      const currentAcidity = this._ratings?.acidity.value
      const currentBitterness = this._ratings?.bitterness.value
      const currentAroma = this._ratings?.aroma.value
      const currentOverall = this._ratings?.overallRating.value

      const acidity = input.acidity ?? currentAcidity
      const bitterness = input.bitterness ?? currentBitterness
      const aroma = input.aroma ?? currentAroma
      const overallRating = input.overallRating ?? currentOverall

      if (acidity === undefined || bitterness === undefined || aroma === undefined || overallRating === undefined) {
        return fail('未評価の豆に対しては、全ての評価値を指定してください')
      }

      const result = CoffeeEvaluation.validateRatings({
        acidity,
        bitterness,
        aroma,
        overallRating,
      })
      if (!result.ok) return result
      newRatings = result.value
    }

    // Update visibility if provided
    let newVisibility = this._visibility
    if (input.isPublic !== undefined) {
      newVisibility = Visibility.fromBoolean(input.isPublic)
    }

    return ok(new CoffeeEvaluation(
      this._id,
      this._userId,
      newShopInfo,
      newBeanInfo,
      newRatings,
      newVisibility,
      this._createdAt,
      new Date() // Update timestamp
    ))
  }

  /**
   * Toggle visibility (public ↔ private)
   */
  toggleVisibility(): CoffeeEvaluation {
    return new CoffeeEvaluation(
      this._id,
      this._userId,
      this._shopInfo,
      this._beanInfo,
      this._ratings,
      this._visibility.toggle(),
      this._createdAt,
      new Date()
    )
  }

  // =========================================================================
  // Serialization
  // =========================================================================

  /**
   * Convert to primitive object for persistence
   */
  toPersistence(): {
    id: string
    user_id: string
    shop_name: string
    bean_type: string
    bean_name: string
    roast_level: string | null
    acidity: RatingValue | null
    bitterness: RatingValue | null
    aroma: RatingValue | null
    overall_rating: RatingValue | null
    is_public: boolean
    created_at: string
    updated_at: string
  } {
    return {
      id: this._id,
      user_id: this._userId,
      shop_name: this._shopInfo.shopName,
      bean_type: this._beanInfo.beanType,
      bean_name: this._beanInfo.beanName,
      roast_level: this._beanInfo.roastLevel,
      acidity: this._ratings?.acidity.value ?? null,
      bitterness: this._ratings?.bitterness.value ?? null,
      aroma: this._ratings?.aroma.value ?? null,
      overall_rating: this._ratings?.overallRating.value ?? null,
      is_public: this._visibility.isPublic,
      created_at: this._createdAt.toISOString(),
      updated_at: this._updatedAt.toISOString(),
    }
  }
}
