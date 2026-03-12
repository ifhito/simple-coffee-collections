'use client'

import { useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { createCoffeeEvaluation, updateCoffeeEvaluation } from '@/lib/actions/coffee'
import { Button } from '@/components/ui/Button'
import { BeanInfoFields } from './shared/bean-info-fields'
import type { BeanInfoState } from './shared/bean-info-fields'
import { RatingSliders } from './shared/rating-sliders'
import type { RatingsState } from './shared/rating-sliders'
import { PublicToggle } from './shared/public-toggle'
import { CoffeeEvaluationValidation } from '@/lib/types/coffee'

export type EvaluationFormDefaultValues = {
  shop_name?: string | null
  shop_id?: string | null
  bean_type?: string | null
  bean_name?: string | null
  roast_level?: string | null
  notes?: string | null
  overall_rating?: number | null
  acidity?: number | null
  bitterness?: number | null
  aroma?: number | null
  is_public?: boolean
}

type EvaluationFormProps = {
  id?: string
  defaultValues?: EvaluationFormDefaultValues
}

type FieldErrors = {
  _form?: string
  bean_name?: string
  notes?: string
}

export function EvaluationForm({ id, defaultValues }: EvaluationFormProps) {
  const [beanInfo, setBeanInfo] = useState<BeanInfoState>({
    beanName: defaultValues?.bean_name ?? '',
    beanType: defaultValues?.bean_type ?? '',
    shopName: defaultValues?.shop_name ?? '',
    shopId: defaultValues?.shop_id ?? null,
    roastLevel: defaultValues?.roast_level ?? '',
  })

  const hasExistingRatings = defaultValues?.overall_rating != null
  const [skipEvaluation, setSkipEvaluation] = useState(
    id ? !hasExistingRatings : false
  )

  const [ratings, setRatings] = useState<RatingsState>({
    overall_rating: defaultValues?.overall_rating ?? 5,
    acidity: defaultValues?.acidity ?? 5,
    bitterness: defaultValues?.bitterness ?? 5,
    aroma: defaultValues?.aroma ?? 5,
  })
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')

  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement | null>(null)
  const normalizedNotesLength = notes.trim().length

  const isEditMode = Boolean(id)
  const buttonLabel = isPending ? '処理中...' : isEditMode ? '更新' : '保存'
  const showEvaluationFields = !skipEvaluation

  const handleValidation = () => {
    const nextErrors: FieldErrors = {}
    if (!beanInfo.beanName.trim()) {
      nextErrors.bean_name = '豆の名前は必須です'
    }
    if (
      showEvaluationFields &&
      normalizedNotesLength > CoffeeEvaluationValidation.notes.maxLength
    ) {
      nextErrors.notes = `感想は${CoffeeEvaluationValidation.notes.maxLength}文字以内で入力してください`
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildFormData = () => {
    if (!formRef.current) return new FormData()
    const formData = new FormData(formRef.current)

    formData.set('shop_name', beanInfo.shopName.trim())
    formData.set('shop_id', beanInfo.shopId ?? '')
    formData.set('bean_type', beanInfo.beanType.trim())
    formData.set('bean_name', beanInfo.beanName.trim())
    formData.set('roast_level', beanInfo.roastLevel.trim())
    formData.set('skip_evaluation', skipEvaluation ? 'true' : 'false')

    if (showEvaluationFields) {
      formData.set('notes', notes.trim())
      formData.set('acidity', ratings.acidity.toString())
      formData.set('bitterness', ratings.bitterness.toString())
      formData.set('aroma', ratings.aroma.toString())
      formData.set('overall_rating', ratings.overall_rating.toString())
    } else {
      formData.set('notes', '')
    }
    return formData
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!handleValidation()) return

    const formData = buildFormData()
    setErrors((prev) => ({ ...prev, _form: undefined }))

    startTransition(async () => {
      const response = isEditMode
        ? await updateCoffeeEvaluation(id!, formData)
        : await createCoffeeEvaluation(formData)

      if (response && 'error' in response) {
        setErrors((prev) => ({ ...prev, _form: response.error }))
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
      <BeanInfoFields
        values={beanInfo}
        onChange={setBeanInfo}
        errors={errors}
      />

      {(!isEditMode || !hasExistingRatings) && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={skipEvaluation}
            onChange={(e) => {
              setSkipEvaluation(e.target.checked)
              if (e.target.checked) {
                setErrors((prev) => ({ ...prev, notes: undefined }))
              }
            }}
            className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-neutral-700">評価は後で追加する</span>
        </label>
      )}

      {showEvaluationFields && (
        <>
          <label className="block text-sm font-medium text-neutral-800">
            感想
            <textarea
              value={notes}
              onChange={(event) => {
                const nextNotes = event.target.value
                setNotes(nextNotes)
                if (
                  errors.notes &&
                  nextNotes.trim().length <= CoffeeEvaluationValidation.notes.maxLength
                ) {
                  setErrors((prev) => ({ ...prev, notes: undefined }))
                }
              }}
              rows={4}
              maxLength={CoffeeEvaluationValidation.notes.maxLength}
              placeholder="例: 柑橘の香りが強く、後味がすっきりしていた"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              aria-label="感想"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-red-600" role={errors.notes ? 'alert' : undefined}>
                {errors.notes}
              </span>
              <span className="text-neutral-500">
                {normalizedNotesLength}/{CoffeeEvaluationValidation.notes.maxLength}
              </span>
            </div>
          </label>

          <RatingSliders values={ratings} onChange={setRatings} />
          <p className="text-xs text-neutral-500">
            スライダーは1〜10の範囲で入力できます（初期値は5）。後からいつでも編集できます。
          </p>
        </>
      )}

      <PublicToggle defaultChecked={defaultValues?.is_public ?? false} name="is_public" />

      {errors._form && (
        <p className="text-sm text-red-600" role="alert" aria-live="assertive">
          {errors._form}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isPending} disabled={isPending}>
          {buttonLabel}
        </Button>
      </div>
    </form>
  )
}
