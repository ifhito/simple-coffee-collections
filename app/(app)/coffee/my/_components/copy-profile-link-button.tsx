'use client'

import { useCallback, useRef, useState } from 'react'

type CopyState = 'idle' | 'success' | 'error'

type CopyProfileLinkButtonProps = {
  url: string
  className?: string
}

export function CopyProfileLinkButton({ url, className }: CopyProfileLinkButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const fallbackRef = useRef<HTMLInputElement | null>(null)

  const copyToClipboard = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setState('success')
        return
      }
      throw new Error('clipboard unavailable')
    } catch {
      setState('error')
      if (fallbackRef.current) {
        fallbackRef.current.focus()
        fallbackRef.current.select()
      }
    }
  }, [url])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      copyToClipboard()
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-label="プロフィールリンクをコピー"
        onClick={copyToClipboard}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-2 rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30 focus:ring-offset-1 ${className ?? ''}`}
      >
        プロフィールリンクをコピー
      </button>

      {state === 'success' && (
        <p className="text-sm text-[var(--espresso)]" role="status">
          コピーしました
        </p>
      )}

      {state === 'error' && (
        <div className="space-y-1">
          <p className="text-sm text-red-700" role="status">
            コピーできませんでした。下のリンクを手動でコピーしてください。
          </p>
          <input
            ref={fallbackRef}
            type="text"
            readOnly
            value={url}
            className="w-full rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
          />
        </div>
      )}
    </div>
  )
}
