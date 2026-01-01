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
}

export function PublicBadge({ isPublic }: PublicBadgeProps) {
  const colorStyles = isPublic
    ? VISIBILITY_BADGE_STYLES.public
    : VISIBILITY_BADGE_STYLES.private

  return (
    <div
      data-testid="public-badge"
      role="status"
      aria-label={`公開設定: ${getVisibilityText(isPublic)}`}
      className={`absolute bottom-2 right-2 z-10 px-2 py-1 rounded text-xs font-medium ${colorStyles}`}
    >
      {getVisibilityText(isPublic)}
    </div>
  )
}
