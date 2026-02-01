/**
 * BeanInfo Value Object
 * 
 * Represents coffee bean information including name, type, and roast level.
 * Bean name is required; type and roast level are optional.
 * 
 * @module lib/domain/coffee-evaluation/value-objects/bean-info
 */

import { Result, ok, fail } from '../../shared/result'

/**
 * Bean info constraints
 */
export const BEAN_INFO_CONSTRAINTS = {
  BEAN_NAME_MAX_LENGTH: 255,
  BEAN_TYPE_MAX_LENGTH: 255,
  ROAST_LEVEL_MAX_LENGTH: 100,
} as const

/**
 * Input for creating BeanInfo
 */
export interface BeanInfoInput {
  beanName: string
  beanType?: string
  roastLevel?: string | null
}

/**
 * BeanInfo Value Object
 * 
 * Encapsulates coffee bean metadata with validation.
 * Bean name is required and must not be empty.
 */
export class BeanInfo {
  private constructor(
    private readonly _beanName: string,
    private readonly _beanType: string,
    private readonly _roastLevel: string | null
  ) {
    Object.freeze(this)
  }

  /**
   * Factory method to create BeanInfo with validation
   * @param input - Bean information input
   * @returns Result containing BeanInfo or validation error
   */
  static create(input: BeanInfoInput): Result<BeanInfo, string> {
    const beanName = input.beanName.trim()
    const beanType = input.beanType?.trim() ?? ''
    const roastLevel = input.roastLevel?.trim() || null

    // Validate required bean name
    if (!beanName) {
      return fail('コーヒー名は必須です')
    }

    if (beanName.length > BEAN_INFO_CONSTRAINTS.BEAN_NAME_MAX_LENGTH) {
      return fail(
        `コーヒー名は${BEAN_INFO_CONSTRAINTS.BEAN_NAME_MAX_LENGTH}文字以内である必要があります`
      )
    }

    // Validate optional bean type
    if (beanType.length > BEAN_INFO_CONSTRAINTS.BEAN_TYPE_MAX_LENGTH) {
      return fail(
        `産地は${BEAN_INFO_CONSTRAINTS.BEAN_TYPE_MAX_LENGTH}文字以内である必要があります`
      )
    }

    // Validate optional roast level
    if (roastLevel && roastLevel.length > BEAN_INFO_CONSTRAINTS.ROAST_LEVEL_MAX_LENGTH) {
      return fail(
        `焙煎度は${BEAN_INFO_CONSTRAINTS.ROAST_LEVEL_MAX_LENGTH}文字以内である必要があります`
      )
    }

    return ok(new BeanInfo(beanName, beanType, roastLevel))
  }

  /**
   * Create BeanInfo from primitive values (e.g., from database)
   * Skips validation for trusted sources
   */
  static fromPrimitive(
    beanName: string,
    beanType: string,
    roastLevel: string | null
  ): BeanInfo {
    return new BeanInfo(beanName, beanType ?? '', roastLevel)
  }

  /**
   * Get the bean name
   */
  get beanName(): string {
    return this._beanName
  }

  /**
   * Get the bean type (origin/variety)
   */
  get beanType(): string {
    return this._beanType
  }

  /**
   * Get the roast level
   */
  get roastLevel(): string | null {
    return this._roastLevel
  }

  /**
   * Check if bean type is specified
   */
  hasBeanType(): boolean {
    return this._beanType.length > 0
  }

  /**
   * Check if roast level is specified
   */
  hasRoastLevel(): boolean {
    return this._roastLevel !== null && this._roastLevel.length > 0
  }

  /**
   * Check equality with another BeanInfo
   */
  equals(other: BeanInfo): boolean {
    return (
      this._beanName === other._beanName &&
      this._beanType === other._beanType &&
      this._roastLevel === other._roastLevel
    )
  }

  /**
   * Convert to primitive object for serialization
   */
  toPrimitive(): {
    beanName: string
    beanType: string
    roastLevel: string | null
  } {
    return {
      beanName: this._beanName,
      beanType: this._beanType,
      roastLevel: this._roastLevel,
    }
  }

  /**
   * Get display string for the bean info
   */
  toDisplayString(): string {
    const parts = [this._beanName]
    
    if (this._beanType) {
      parts.push(`(${this._beanType})`)
    }
    
    if (this._roastLevel) {
      parts.push(`- ${this._roastLevel}`)
    }
    
    return parts.join(' ')
  }
}
