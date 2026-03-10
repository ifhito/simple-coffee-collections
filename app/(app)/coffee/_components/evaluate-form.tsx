'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { addEvaluation } from '@/lib/actions/coffee'
import { Button } from '@/components/ui/Button'
import { CoffeeSlider } from './shared/coffee-slider'

type EvaluateFormProps = {
  evaluationId: string
  defaultValues?: {
    overall_rating?: number
    acidity?: number
    bitterness?: number
    aroma?: number
  }
}

const ratingFields = [
  { key: 'overall_rating', label: '総合評価' },
  { key: 'acidity', label: '酸味' },
  { key: 'bitterness', label: '苦味' },
  { key: 'aroma', label: '香り' },
] as const

export function EvaluateForm({ evaluationId, defaultValues }: EvaluateFormProps) {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement | null>(null)

  const [ratings, setRatings] = useState(() => ({
    overall_rating: defaultValues?.overall_rating ?? 5,
    acidity: defaultValues?.acidity ?? 5,
    bitterness: defaultValues?.bitterness ?? 5,
    aroma: defaultValues?.aroma ?? 5,
  }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(undefined)

    const formData = new FormData()
    formData.set('acidity', ratings.acidity.toString())
    formData.set('bitterness', ratings.bitterness.toString())
    formData.set('aroma', ratings.aroma.toString())
    formData.set('overall_rating', ratings.overall_rating.toString())

    startTransition(async () => {
      const response = await addEvaluation(evaluationId, formData)
      if (response && 'error' in response) {
        setError(response.error)
      }
    })
  }

  const sliderRows = useMemo(
    () =>
      ratingFields.map((field) => (
        <CoffeeSlider
          key={field.key}
          label={field.label}
          value={ratings[field.key]}
          onChange={(value) =>
            setRatings((prev) => ({ ...prev, [field.key]: value }))
          }
          min={1}
          max={10}
          step={1}
        />
      )),
    [ratings]
  )

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      noValidate
      className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      aria-live="polite"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{sliderRows}</div>
      <p className="text-xs text-neutral-500">
        スライダーは1〜10の範囲で入力できます。
      </p>

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
