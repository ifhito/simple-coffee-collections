'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { createCoffeeEvaluation, updateCoffeeEvaluation } from '@/lib/actions/coffee'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CoffeeSlider } from './shared/coffee-slider'
import { PublicToggle } from './shared/public-toggle'

export type EvaluationFormDefaultValues = {
  shop_name?: string | null
  bean_type?: string | null
  bean_name?: string | null
  roast_level?: string | null
  overall_rating?: number
  acidity?: number
  bitterness?: number
  aroma?: number
  is_public?: boolean
}

type EvaluationFormProps = {
  id?: string
  defaultValues?: EvaluationFormDefaultValues
}

type FieldErrors = {
  _form?: string
  bean_name?: string
}

const ratingFields = [
  { key: 'overall_rating', label: '総合評価' },
  { key: 'acidity', label: '酸味' },
  { key: 'bitterness', label: '苦味' },
  { key: 'aroma', label: '香り' },
] as const

const ROAST_LEVELS = [
  { value: '', label: '選択してください' },
  { value: 'light', label: 'ライト（浅煎り）' },
  { value: 'cinnamon', label: 'シナモン（浅中煎り）' },
  { value: 'medium', label: 'ミディアム（中煎り）' },
  { value: 'high', label: 'ハイ（中深煎り）' },
  { value: 'city', label: 'シティ（やや深煎り）' },
  { value: 'full_city', label: 'フルシティ（深煎り）' },
  { value: 'french', label: 'フレンチ（極深煎り）' },
]

export function EvaluationForm({ id, defaultValues }: EvaluationFormProps) {
  const [shopName, setShopName] = useState(defaultValues?.shop_name ?? '')
  const [beanType, setBeanType] = useState(defaultValues?.bean_type ?? '')
  const [beanName, setBeanName] = useState(defaultValues?.bean_name ?? '')
  const [roastLevel, setRoastLevel] = useState(defaultValues?.roast_level ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement | null>(null)

  const [ratings, setRatings] = useState(() => ({
    overall_rating: defaultValues?.overall_rating ?? 5,
    acidity: defaultValues?.acidity ?? 5,
    bitterness: defaultValues?.bitterness ?? 5,
    aroma: defaultValues?.aroma ?? 5,
  }))

  const isEditMode = Boolean(id)
  const buttonLabel = isPending ? '処理中...' : isEditMode ? '更新' : '保存'

  const handleValidation = () => {
    const nextErrors: FieldErrors = {}

    if (!beanName.trim()) {
      nextErrors.bean_name = '豆の名前は必須です'
    }

    setErrors(nextErrors)
    const isValid = Object.keys(nextErrors).length === 0

    return isValid
  }

  const buildFormData = () => {
    // Get FormData from form element to include PublicToggle's hidden input
    if (!formRef.current) return new FormData()
    const formData = new FormData(formRef.current)

    // Ensure controlled input values are up-to-date
    formData.set('shop_name', shopName.trim())
    formData.set('bean_type', beanType.trim())
    formData.set('bean_name', beanName.trim())
    formData.set('roast_level', roastLevel.trim())
    formData.set('acidity', ratings.acidity.toString())
    formData.set('bitterness', ratings.bitterness.toString())
    formData.set('aroma', ratings.aroma.toString())
    formData.set('overall_rating', ratings.overall_rating.toString())
    // is_public is automatically included from PublicToggle's hidden input
    return formData
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!handleValidation()) {
      return
    }

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
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="豆の名前"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          placeholder="例: エチオピア イルガチェフェ G1"
          required
          error={errors.bean_name}
        />
        <Input
          label="豆の産地"
          value={beanType}
          onChange={(e) => setBeanType(e.target.value)}
        />
        <Input
          label="店名"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="roast-level" className="text-sm font-medium text-neutral-800">
            焙煎度
          </label>
          <select
            id="roast-level"
            value={roastLevel}
            onChange={(e) => setRoastLevel(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            aria-label="焙煎度"
          >
            {ROAST_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{sliderRows}</div>
      <p className="text-xs text-neutral-500">
        スライダーは1〜10の範囲で入力できます（初期値は5）。後からいつでも編集できます。
      </p>

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
