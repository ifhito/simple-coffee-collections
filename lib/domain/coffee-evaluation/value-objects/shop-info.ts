/**
 * ShopInfo Value Object
 * 
 * Represents cafe/shop information for a coffee evaluation.
 * Shop name is optional.
 * 
 * @module lib/domain/coffee-evaluation/value-objects/shop-info
 */

import { Result, ok, fail } from '../../shared/result'

/**
 * Shop info constraints
 */
export const SHOP_INFO_CONSTRAINTS = {
  SHOP_NAME_MAX_LENGTH: 255,
} as const

/**
 * ShopInfo Value Object
 * 
 * Encapsulates shop/cafe metadata with validation.
 * Shop name is optional and can be empty.
 */
export class ShopInfo {
  private constructor(private readonly _shopName: string) {
    Object.freeze(this)
  }

  /**
   * Factory method to create ShopInfo with validation
   * @param shopName - Optional shop name
   * @returns Result containing ShopInfo or validation error
   */
  static create(shopName?: string): Result<ShopInfo, string> {
    const trimmedName = shopName?.trim() ?? ''

    if (trimmedName.length > SHOP_INFO_CONSTRAINTS.SHOP_NAME_MAX_LENGTH) {
      return fail(
        `店名は${SHOP_INFO_CONSTRAINTS.SHOP_NAME_MAX_LENGTH}文字以内である必要があります`
      )
    }

    return ok(new ShopInfo(trimmedName))
  }

  /**
   * Create ShopInfo from primitive value (e.g., from database)
   * Skips validation for trusted sources
   */
  static fromPrimitive(shopName: string): ShopInfo {
    return new ShopInfo(shopName ?? '')
  }

  /**
   * Create empty ShopInfo (no shop specified)
   */
  static empty(): ShopInfo {
    return new ShopInfo('')
  }

  /**
   * Get the shop name
   */
  get shopName(): string {
    return this._shopName
  }

  /**
   * Check if shop name is specified
   */
  hasShopName(): boolean {
    return this._shopName.length > 0
  }

  /**
   * Check equality with another ShopInfo
   */
  equals(other: ShopInfo): boolean {
    return this._shopName === other._shopName
  }

  /**
   * Convert to primitive string for serialization
   */
  toPrimitive(): string {
    return this._shopName
  }

  /**
   * Get display string for the shop info
   * Returns placeholder if no shop name is set
   */
  toDisplayString(placeholder: string = '店舗未設定'): string {
    return this._shopName || placeholder
  }
}
