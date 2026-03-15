'use client'

import { useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { addEvaluation } from '@/lib/actions/coffee'
import { Button } from '@/components/ui/Button'
import { RatingSliders } from './shared/rating-sliders'
import type { RatingsState } from './shared/rating-sliders'
import { CoffeeEvaluationValidation } from '@/lib/types/coffee'

type EvaluateFormProps = {
  evaluationId: string
  defaultValues?: {
    overall_rating?: number
    acidity?: number
    bitterness?: number
    aroma?: number
    notes?: string | null
  }
}

export function EvaluateForm({ evaluationId, defaultValues }: EvaluateFormProps) {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement | null>(null)

  const [ratings, setRatings] = useState<RatingsState>({
    overall_rating: defaultValues?.overall_rating ?? 5,
    acidity: defaultValues?.acidity ?? 5,
    bitterness: defaultValues?.bitterness ?? 5,
    aroma: defaultValues?.aroma ?? 5,
  })
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')
  const normalizedNotesLength = notes.trim().length

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(undefined)

    const formData = new FormData()
    formData.set('acidity', ratings.acidity.toString())
    formData.set('bitterness', ratings.bitterness.toString())
    formData.set('aroma', ratings.aroma.toString())
    formData.set('overall_rating', ratings.overall_rating.toString())
    formData.set('notes', notes.trim())

    startTransition(async () => {
      const response = await addEvaluation(evaluationId, formData)
      if (response && 'error' in response) {
        setError(response.error)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      noValidate
      className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      aria-live="polite"
    >
      <RatingSliders values={ratings} onChange={setRatings} />
      <p className="text-xs text-neutral-500">
        スライダーは1〜10の範囲で入力できます。
      </p>

      <label className="block text-sm font-medium text-neutral-800">
        感想
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={CoffeeEvaluationValidation.notes.maxLength}
          placeholder="感想を入力してください（任意）"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          aria-label="感想"
        />
        <div className="mt-1 flex justify-end text-xs text-neutral-500">
          {normalizedNotesLength}/{CoffeeEvaluationValidation.notes.maxLength}
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isPending} disabled={isPending}>
          {isPending ? '処理中...' : '評価を保存'}
        </Button>
      </div>
    </form>
  )
}
