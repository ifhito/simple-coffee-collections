'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signIn } from '@/lib/actions/auth'

export function LoginForm() {
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleInputChange() {
    if (error) {
      setError('')
    }
  }

  return (
    <div className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="メールアドレス"
          placeholder="your-email@example.com"
          required
          autoComplete="email"
          onChange={handleInputChange}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="パスワード"
          placeholder="パスワードを入力"
          required
          autoComplete="current-password"
          onChange={handleInputChange}
        />

        {error && (
          <div role="alert" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isPending}
        >
          ログイン
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--ink-3)]">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-[var(--espresso)] hover:underline">
          アカウント作成はこちら
        </Link>
      </p>
    </div>
  )
}
