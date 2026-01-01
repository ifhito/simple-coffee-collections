'use client'

import type { ChangeEvent, KeyboardEvent } from 'react'
import { memo, useId } from 'react'

type CoffeeSliderProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function CoffeeSliderComponent({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
}: CoffeeSliderProps) {
  const id = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = clamp(parseInt(event.currentTarget.value, 10), min, max)
    if (!Number.isNaN(nextValue) && nextValue !== value) {
      onChange(nextValue)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      const nextValue = clamp(value + step, min, max)
      if (nextValue !== value) {
        event.preventDefault()
        onChange(nextValue)
      }
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      const nextValue = clamp(value - step, min, max)
      if (nextValue !== value) {
        event.preventDefault()
        onChange(nextValue)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
        <span className="text-sm font-semibold text-amber-600">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        role="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className="w-full accent-amber-600"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export const CoffeeSlider = memo(CoffeeSliderComponent)
