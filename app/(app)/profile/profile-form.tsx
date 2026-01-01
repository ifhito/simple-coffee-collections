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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <Input
          label="表示名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <div className="flex justify-end text-xs text-neutral-500">{nameCount}/100</div>
      </div>
      <label className="block text-sm font-medium text-gray-700">
        自己紹介
        <textarea
          value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        rows={4}
        aria-label="自己紹介"
      />
      <div className="flex justify-end text-xs text-neutral-500">{bioCount}/500</div>
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600" role="status">
          保存しました
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        disabled={isPending}
      >
        保存
      </button>
    </form>
  )
}
