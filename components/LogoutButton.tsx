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
        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
      >
        {isPending ? 'ログアウト中...' : 'ログアウト'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? '処理中...' : 'ログアウト'}
    </button>
  )
}
