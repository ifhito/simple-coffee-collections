import { memo } from 'react'

export type RadarValues = {
  overall: number | null
  acidity: number | null
  bitter: number | null
  aroma: number | null
}

type RadarChartProps = {
  values: RadarValues
  size?: number
  showLabels?: boolean
  color?: string
  max?: number
}

const AXES: Array<{ key: keyof RadarValues; label: string }> = [
  { key: 'overall', label: '総合' },
  { key: 'acidity', label: '酸味' },
  { key: 'aroma', label: '香り' },
  { key: 'bitter', label: '苦味' },
]

/**
 * Pure-SVG radar chart for the 4 tasting axes (1-10 each).
 * No dependency on a chart lib. Deterministic; safe to render on the server.
 */
function RadarChartComponent({
  values,
  size = 220,
  showLabels = true,
  color = 'var(--espresso)',
  max = 10,
}: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - (showLabels ? 26 : 8)

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length

  const point = (i: number, v: number): [number, number] => {
    const a = angle(i)
    const r = (v / max) * R
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }

  const rings = [0.25, 0.5, 0.75, 1]

  const polyPoints = AXES.map((ax, i) => point(i, values[ax.key] ?? 0))
    .map((p) => p.join(','))
    .join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="テイスティング4軸レーダーチャート"
    >
      {/* Rings */}
      {rings.map((r, i) => {
        const pts = AXES.map((_, j) => {
          const a = angle(j)
          return [cx + Math.cos(a) * R * r, cy + Math.sin(a) * R * r].join(',')
        }).join(' ')
        return (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="var(--rule)"
            strokeWidth="0.75"
            strokeDasharray={i === rings.length - 1 ? '0' : '2 3'}
          />
        )
      })}

      {/* Axes */}
      {AXES.map((_, i) => {
        const [x, y] = point(i, max)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--rule-2)"
            strokeWidth="0.75"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {AXES.map((ax, i) => {
        const [x, y] = point(i, values[ax.key] ?? 0)
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />
      })}

      {/* Labels */}
      {showLabels &&
        AXES.map((ax, i) => {
          const [x, y] = point(i, max * 1.16)
          return (
            <g key={i}>
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-geist-mono, Geist Mono)"
                fill="var(--ink-3)"
                letterSpacing="0.08em"
              >
                {ax.label}
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--font-geist-mono, Geist Mono)"
                fontWeight="600"
                fill="var(--ink)"
              >
                {(values[ax.key] ?? 0).toFixed(1)}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export const RadarChart = memo(RadarChartComponent)
