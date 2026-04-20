import { memo } from 'react'

type ScoreBarProps = {
  label: string
  value: number | null
  /** CSS color. Use one of the --rating-* vars from globals.css */
  color: string
  max?: number
}

function ScoreBarComponent({ label, value, color, max = 10 }: ScoreBarProps) {
  const v = value ?? 0
  const pct = Math.min(100, Math.max(0, (v / max) * 100))
  return (
    <div className="grid items-center gap-2.5" style={{ gridTemplateColumns: '68px 1fr 40px' }}>
      <span className="font-mono-caps text-[11px] text-[var(--ink-3)]">{label}</span>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--rule-2)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono-num text-right text-xs font-semibold text-[var(--ink)]">
        {value === null ? '—' : value}
      </span>
    </div>
  )
}

export const ScoreBar = memo(ScoreBarComponent)
