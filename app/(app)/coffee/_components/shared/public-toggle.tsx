'use client'

import { useState, useId } from 'react'

type PublicToggleProps = {
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
        className="cursor-pointer h-4 w-4 rounded-sm border-[var(--rule)] accent-[var(--espresso)] focus:ring-2 focus:ring-[var(--espresso)]/30"
        aria-label="公開する"
        aria-describedby={`${id}-description`}
      />
      <label htmlFor={id} className="cursor-pointer text-sm font-medium text-[var(--ink)]">
        公開する
      </label>
      <input type="hidden" name={name} value={isPublic.toString()} />
      <span id={`${id}-description`} className="sr-only">
        評価の公開設定を切り替えます
      </span>
    </div>
  )
}
