import { memo } from 'react'

type RoastDotsProps = {
  level: number
  className?: string
}

const ROAST_LABEL: Record<number, string> = {
  1: 'Light',
  2: 'Light-Med',
  3: 'Medium',
  4: 'Med-Dark',
  5: 'Dark',
}

export function roastLabel(level: number | null | undefined): string {
  if (!level) return '—'
  return ROAST_LABEL[level] ?? 'Medium'
}

function RoastDotsComponent({ level, className }: RoastDotsProps) {
  const n = Math.min(5, Math.max(1, level || 3))
  return (
    <span
      className={`inline-flex items-center gap-1 ${className ?? ''}`}
      aria-label={`焙煎度 ${roastLabel(n)}`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= n
        const bg = filled
          ? `oklch(${0.6 - i * 0.08} 0.07 ${50 - i * 2})`
          : 'transparent'
        return (
          <span
            key={i}
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: bg,
              border: filled ? 'none' : '1px solid var(--rule)',
            }}
          />
        )
      })}
    </span>
  )
}

export const RoastDots = memo(RoastDotsComponent)
