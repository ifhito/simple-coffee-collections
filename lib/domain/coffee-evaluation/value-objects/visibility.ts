/**
 * Visibility Value Object
 * 
 * Represents the public/private visibility status of a coffee evaluation.
 * Encapsulates visibility-related behavior and display logic.
 * 
 * @module lib/domain/coffee-evaluation/value-objects/visibility
 */

/**
 * Emoji icons for visibility status
 */
export const VISIBILITY_EMOJI = {
  PUBLIC: '🌐',
  PRIVATE: '🔒',
} as const

/**
 * Display labels for visibility status
 */
export const VISIBILITY_LABEL = {
  PUBLIC: '公開',
  PRIVATE: '非公開',
  TOGGLE: '公開する',
} as const

/**
 * Visibility Value Object
 * 
 * Encapsulates public/private status with display logic.
 * Immutable and self-describing.
 */
export class Visibility {
  private constructor(private readonly _isPublic: boolean) {
    Object.freeze(this)
  }

  /**
   * Create a public visibility
   */
  static public(): Visibility {
    return new Visibility(true)
  }

  /**
   * Create a private visibility
   */
  static private(): Visibility {
    return new Visibility(false)
  }

  /**
   * Create from boolean value
   * @param isPublic - true for public, false for private
   */
  static fromBoolean(isPublic: boolean): Visibility {
    return new Visibility(isPublic)
  }

  /**
   * Check if public
   */
  get isPublic(): boolean {
    return this._isPublic
  }

  /**
   * Check if private
   */
  get isPrivate(): boolean {
    return !this._isPublic
  }

  /**
   * Check equality with another Visibility
   */
  equals(other: Visibility): boolean {
    return this._isPublic === other._isPublic
  }

  /**
   * Convert to boolean primitive for serialization
   */
  toPrimitive(): boolean {
    return this._isPublic
  }

  /**
   * Get the appropriate emoji for this visibility
   */
  getEmoji(): string {
    return this._isPublic ? VISIBILITY_EMOJI.PUBLIC : VISIBILITY_EMOJI.PRIVATE
  }

  /**
   * Get the display label for this visibility
   */
  getLabel(): string {
    return this._isPublic ? VISIBILITY_LABEL.PUBLIC : VISIBILITY_LABEL.PRIVATE
  }

  /**
   * Get full display text with emoji
   */
  toDisplayString(): string {
    return `${this.getEmoji()} ${this.getLabel()}`
  }

  /**
   * Get CSS class names for badge styling (Tailwind)
   */
  getBadgeStyles(): string {
    return this._isPublic
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  /**
   * Toggle visibility (returns new instance)
   */
  toggle(): Visibility {
    return new Visibility(!this._isPublic)
  }
}
