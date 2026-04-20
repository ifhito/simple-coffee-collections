'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Input } from '@/components/ui/Input'

type ProfileFormProps = {
  initialDisplayName?: string | null
  initialBio?: string | null
}

export function ProfileForm({ initialDisplayName, initialBio }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '')
  const [bio, setBio] = useState(initialBio ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const nameCount = displayName.length
  const bioCount = bio.length

  const validate = () => {
    if (displayName.length > 100) {
      setError('表示名は100文字以内で入力してください')
      setSuccess(false)
      return false
    }
    if (bio.length > 500) {
      setError('自己紹介は500文字以内で入力してください')
      setSuccess(false)
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append('display_name', displayName)
    formData.append('bio', bio)

    startTransition(async () => {
    setSuccess(false)
      const res = await updateProfile(formData)
      if ('error' in res) {
        setError(res.error)
        setSuccess(false)
      } else {
        setSuccess(true)
        setError(null)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
      <div className="space-y-1">
        <Input
          label="表示名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <div className="flex justify-end text-xs text-[var(--ink-3)]">{nameCount}/100</div>
      </div>
      <label className="block text-sm font-medium text-[var(--ink-2)]">
        自己紹介
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30"
          rows={4}
          aria-label="自己紹介"
        />
        <div className="flex justify-end text-xs text-[var(--ink-3)]">{bioCount}/500</div>
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-[var(--espresso)]" role="status">
          保存しました
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] disabled:opacity-50"
        disabled={isPending}
      >
        保存
      </button>
    </form>
  )
}
