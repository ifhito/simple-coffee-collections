/**
 * PublicBadge Component
 * Server Component: Displays public/private status badge
 *
 * Used for:
 * - Showing visibility status on coffee evaluation cards
 * - Visual indicator for public vs private content
 *
 * @example
 * ```tsx
 * <PublicBadge isPublic={true} />  // 🌐 公開
 * <PublicBadge isPublic={false} /> // 🔒 非公開
 * ```
 */

import { getVisibilityText, VISIBILITY_BADGE_STYLES } from '@/lib/constants/visibility'

interface PublicBadgeProps {
  isPublic: boolean
  className?: string
}

export function PublicBadge({ isPublic, className = '' }: PublicBadgeProps) {
  const colorStyles = isPublic
    ? VISIBILITY_BADGE_STYLES.public
    : VISIBILITY_BADGE_STYLES.private

  return (
    <div
      data-testid="public-badge"
      role="status"
      aria-label={`公開設定: ${getVisibilityText(isPublic)}`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-sm whitespace-nowrap leading-none ${colorStyles} ${className}`}
    >
      {getVisibilityText(isPublic)}
    </div>
  )
}
