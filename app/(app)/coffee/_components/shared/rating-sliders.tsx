'use client'

import { useMemo } from 'react'
import { CoffeeSlider } from './coffee-slider'

export type RatingsState = {
  overall_rating: number
  acidity: number
  bitterness: number
  aroma: number
}

type RatingSlidersProps = {
  values: RatingsState
  onChange: (values: RatingsState) => void
}

const ratingFields = [
  { key: 'overall_rating', label: '総合評価' },
  { key: 'acidity', label: '酸味' },
  { key: 'bitterness', label: '苦味' },
  { key: 'aroma', label: '香り' },
] as const

export function RatingSliders({ values, onChange }: RatingSlidersProps) {
  const sliders = useMemo(
    () =>
      ratingFields.map((field) => (
        <CoffeeSlider
          key={field.key}
          label={field.label}
          value={values[field.key]}
          onChange={(value) =>
            onChange({ ...values, [field.key]: value })
          }
          min={1}
          max={10}
          step={1}
        />
      )),
    [values, onChange]
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{sliders}</div>
  )
}
