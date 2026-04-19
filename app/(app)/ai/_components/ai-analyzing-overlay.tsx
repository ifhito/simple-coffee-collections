'use client'

import { createPortal } from 'react-dom'

type Props = {
  isVisible: boolean
}

export function AiAnalyzingOverlay({ isVisible }: Props) {
  if (!isVisible || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex min-h-screen w-screen items-center justify-center bg-black/50 px-4">
      <div className="flex flex-col items-center gap-4 rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-10 py-8 shadow-xl">
        <svg
          className="h-10 w-10 animate-spin text-[var(--espresso)]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm font-medium text-[var(--ink-2)]">画像を解析中...</p>
      </div>
    </div>,
    document.body
  )
}
