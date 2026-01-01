/**
 * Visibility Constants
 * Shared constants for public/private status display
 *
 * Used by:
 * - PublicBadge component (visual indicator)
 * - PublicToggle component (form control)
 */

/**
 * Emoji icons for visibility status
 */
export const VISIBILITY_EMOJI = {
  public: '🌐',
  private: '🔒',
} as const

/**
 * Display labels for visibility status
 */
export const VISIBILITY_LABEL = {
  public: '公開',
  private: '非公開',
  toggle: '公開する',
} as const

/**
 * Get full display text with emoji for a given visibility status
 */
export function getVisibilityText(isPublic: boolean): string {
  return isPublic
    ? `${VISIBILITY_EMOJI.public} ${VISIBILITY_LABEL.public}`
    : `${VISIBILITY_EMOJI.private} ${VISIBILITY_LABEL.private}`
}

/**
 * Get toggle label with emoji
 */
export function getToggleLabel(): string {
  return `${VISIBILITY_EMOJI.public} ${VISIBILITY_LABEL.toggle}`
}

/**
 * Tailwind CSS classes for badge styling by visibility status
 */
export const VISIBILITY_BADGE_STYLES = {
  public: 'bg-green-100 text-green-800',
  private: 'bg-gray-100 text-gray-800',
} as const
