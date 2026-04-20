'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUp } from '@/lib/actions/auth'

export function SignupForm() {
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await signUp(formData)
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
          placeholder="6文字以上"
          required
          autoComplete="new-password"
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
          アカウント作成
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--ink-3)]">
        既にアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-[var(--espresso)] hover:underline">
          ログインはこちら
        </Link>
      </p>
    </div>
  )
}
