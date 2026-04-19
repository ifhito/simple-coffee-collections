'use client'

import React, { useTransition } from 'react'
import { signOut } from '@/lib/actions/auth'

type LogoutButtonProps = {
  variant?: 'button' | 'text'
}

export function LogoutButton({ variant = 'button' }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await signOut()
    })
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="text-sm font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition disabled:opacity-50"
      >
        {isPending ? 'ログアウト中...' : 'ログアウト'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-full border border-[var(--rule)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--background-2)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? '処理中...' : 'ログアウト'}
    </button>
  )
}
