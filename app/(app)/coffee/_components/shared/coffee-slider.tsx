'use client'

import type { ChangeEvent, KeyboardEvent, CSSProperties } from 'react'
import { memo, useId } from 'react'

export type CoffeeSliderAxis = 'overall' | 'acidity' | 'bitter' | 'aroma'

type CoffeeSliderProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /**
   * Tasting axis — controls the accent color via --rating-* CSS variables.
   * Defaults to 'overall'.
   */
  axis?: CoffeeSliderAxis
  /** Optional short hint shown in mono caps next to the label */
  hint?: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const AXIS_COLOR: Record<CoffeeSliderAxis, string> = {
  overall: 'var(--rating-overall)',
  acidity: 'var(--rating-acidity)',
  bitter: 'var(--rating-bitter)',
  aroma: 'var(--rating-aroma)',
}

function CoffeeSliderComponent({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  axis = 'overall',
  hint,
}: CoffeeSliderProps) {
  const id = useId()
  const color = AXIS_COLOR[axis]

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

  const pct = ((value - min) / (max - min)) * 100
  const trackStyle: CSSProperties = {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--rule-2) ${pct}%, var(--rule-2) 100%)`,
    ['--slider-color' as string]: color,
  }

  return (
    <div className="flex flex-col gap-2 rounded bg-[var(--paper)] border border-[var(--rule)] px-4 py-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <label
            htmlFor={id}
            className="font-serif-display text-xl text-[var(--ink)]"
          >
            {label}
          </label>
          {hint && (
            <span className="font-mono-caps text-[10.5px] text-[var(--ink-3)]">
              {hint}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-serif-display text-3xl leading-none tracking-tight text-[var(--ink)]">
            {value}
          </span>
          <span className="font-mono-num text-[11px] text-[var(--ink-3)]">
            /{max}
          </span>
        </div>
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
        className="w-full h-2 appearance-none rounded-full cursor-pointer outline-none"
        style={trackStyle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-between px-0.5">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((i) => (
          <span
            key={i}
            className="font-mono-num text-[9px] text-[var(--ink-3)]"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  )
}

export const CoffeeSlider = memo(CoffeeSliderComponent)
