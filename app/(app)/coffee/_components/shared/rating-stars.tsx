import type { ReactNode } from 'react'
import { memo, useId } from 'react'

type RatingStarsProps = {
  rating: number // 1-10 scale
  size?: 'sm' | 'md' | 'lg'
}

const sizeClassMap: Record<NonNullable<RatingStarsProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const clampToFiveScale = (rating: number) => {
  const fiveScale = rating / 2
  if (fiveScale < 0) return 0
  if (fiveScale > 5) return 5
  return fiveScale
}

type StarState = 'full' | 'half' | 'empty'

const getStarState = (fiveScale: number, index: number): StarState => {
  const starNumber = index + 1
  if (fiveScale >= starNumber) return 'full'
  if (fiveScale >= starNumber - 0.5) return 'half'
  return 'empty'
}

function StarIcon({
  state,
  sizeClass,
  gradientId,
}: {
  state: StarState
  sizeClass: string
  gradientId?: string
}): ReactNode {
  const base =
    'text-amber-500 drop-shadow-sm transition-colors duration-150'
  const classes = `${sizeClass} ${base}`

  const starPath = "M12 3.5l2.8 5.68 6.2.9-4.5 4.35 1.06 6.17L12 17.9l-5.56 2.9L7.5 14.4 3 10.08l6.2-.9z"

  if (state === 'half') {
    return (
      <div className={`relative ${sizeClass}`} data-testid="rating-star" data-state="half">
        {/* Background star (outline) */}
        <svg
          className={`absolute inset-0 ${classes}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d={starPath} />
        </svg>
        {/* Foreground star (filled, clipped to 50%) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <svg
            className={`${classes} fill-current`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d={starPath} />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <svg
      data-testid="rating-star"
      data-state={state}
      className={classes}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={state === 'full' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d={starPath} />
    </svg>
  )
}

function RatingStarsComponent({ rating, size = 'md' }: RatingStarsProps) {
  const id = useId()
  const gradientId = `${id}-half-fill`
  const clamped = clampToFiveScale(rating)
  const ariaLabel = `${clamped} out of 5 stars`
  const sizeClass = sizeClassMap[size]

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="flex items-center gap-1"
      data-testid="rating-stars"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const state = getStarState(clamped, index)
        return (
          <StarIcon
            key={index}
            state={state}
            sizeClass={sizeClass}
            gradientId={gradientId}
          />
        )
      })}
    </div>
  )
}

export const RatingStars = memo(RatingStarsComponent)
