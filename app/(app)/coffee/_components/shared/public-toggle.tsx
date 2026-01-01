'use client'

/**
 * PublicToggle Component
 * Client Component: Interactive checkbox for toggling public/private status
 *
 * Used for:
 * - Coffee evaluation forms (create/edit)
 * - Allowing users to control visibility of their evaluations
 *
 * @example
 * ```tsx
 * <PublicToggle defaultChecked={false} name="is_public" />
 * ```
 */

import { useState, useId } from 'react'
import { getVisibilityText } from '@/lib/constants/visibility'

interface PublicToggleProps {
  defaultChecked: boolean
  name: string
}

export function PublicToggle({ defaultChecked, name }: PublicToggleProps) {
  const [isPublic, setIsPublic] = useState(defaultChecked)
  const id = useId()

  return (
    <div data-testid="public-toggle" className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        name={`${name}_checkbox`}
        checked={isPublic}
        onChange={(e) => setIsPublic(e.target.checked)}
        className="cursor-pointer h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        aria-label={getVisibilityText(isPublic)}
        aria-describedby={`${id}-description`}
      />
      <label htmlFor={id} className="cursor-pointer font-medium text-gray-900">
        {getVisibilityText(isPublic)}
      </label>
      <input type="hidden" name={name} value={isPublic.toString()} />
      <span id={`${id}-description`} className="sr-only">
        評価の公開設定を切り替えます
      </span>
    </div>
  )
}
