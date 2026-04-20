'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { sendContactEmail } from '@/lib/actions/contact'

type ActionResult = { success: true } | { error: string }

const initialState: ActionResult | null = null

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactEmail, initialState)

  if (state && 'success' in state) {
    return (
      <div className="rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-6 text-center">
        <p className="font-medium text-[var(--ink)]">お問い合わせを送信しました。</p>
        <p className="mt-1 text-sm text-[var(--ink-3)]">返信までしばらくお待ちください。</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--ink-2)] mb-1">
          お名前 <span className="text-[var(--ink-3)] text-xs">（任意）</span>
        </label>
        <Input id="name" name="name" type="text" placeholder="山田 太郎" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--ink-2)] mb-1">
          メールアドレス <span className="text-red-500 text-xs">必須</span>
        </label>
        <Input id="email" name="email" type="email" placeholder="example@email.com" required />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[var(--ink-2)] mb-1">
          お問い合わせ内容 <span className="text-red-500 text-xs">必須</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="お問い合わせ内容をご記入ください..."
          required
          className="w-full rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30 resize-none"
        />
      </div>

      {state && 'error' in state && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}

      <Button type="submit" loading={isPending} variant="secondary">
        送信する
      </Button>
    </form>
  )
}
