import Link from 'next/link'
import { memo, type CSSProperties, type ReactNode } from 'react'
import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'
import { RadarChart } from '@/app/(app)/coffee/_components/shared/radar-chart'

type FeedCardProps = {
  evaluation: CoffeeEvaluationWithUser
  showUserHeader?: boolean
  badge?: ReactNode
}

const formatDate = (iso: string) => iso.slice(0, 10)

const ROAST_LEVEL_LABELS: Record<string, string> = {
  light: '浅煎り',
  cinnamon: '浅中煎り',
  medium: '中煎り',
  high: '中深煎り',
  city: 'やや深煎り',
  full_city: '深煎り',
  french: '極深煎り',
}

const formatRoastLevel = (value: string) =>
  ROAST_LEVEL_LABELS[value] ?? value

const clampFourLines: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

function AxisTick({
  label,
  value,
  color,
}: {
  label: string
  value: number | null
  color: string
}) {
  if (value === null) return null
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="font-mono-caps text-[10px] text-[var(--ink-3)]">
        {label}
      </span>
      <span className="font-mono-num text-sm font-semibold text-[var(--ink)]">
        {value}
      </span>
    </div>
  )
}

function FeedCardComponent({ evaluation, showUserHeader = true, badge }: FeedCardProps) {
  const {
    id,
    user_id,
    display_name,
    bean_name,
    bean_type,
    roast_level,
    shop_name,
    acidity,
    bitterness,
    aroma,
    overall_rating,
    notes,
    created_at,
  } = evaluation

  const displayBeanName =
    bean_name || (bean_type === 'Unknown' ? '産地不明' : bean_type)

  const hasAnyRating =
    acidity !== null ||
    bitterness !== null ||
    aroma !== null ||
    overall_rating !== null

  const radarValues = {
    overall: overall_rating,
    acidity: acidity,
    aroma: aroma,
    bitter: bitterness,
  }

  const userInitial = (display_name || '匿').trim().charAt(0).toUpperCase()

  return (
    <article
      data-testid="feed-card"
      className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6 transition-shadow hover:shadow-[0_16px_30px_-20px_rgba(60,30,10,0.25)]"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        {showUserHeader ? (
          <Link
            href={`/users/${user_id}`}
            className="group inline-flex items-center gap-2.5"
          >
            <span
              aria-hidden
              className="font-serif-display grid h-9 w-9 place-items-center rounded-full bg-[var(--espresso)] text-sm text-[var(--background)]"
            >
              {userInitial}
            </span>
            <span>
              <span className="font-mono-num block text-[12.5px] font-semibold text-[var(--ink)] group-hover:text-[var(--espresso)] transition-colors">
                {display_name || '匿名ユーザー'}
              </span>
              <span className="font-mono-caps block text-[10px] text-[var(--ink-3)]">
                {formatDate(created_at)}
                {shop_name ? ` · ${shop_name}` : ''}
              </span>
            </span>
          </Link>
        ) : (
          <span className="font-mono-caps text-[10px] text-[var(--ink-3)]">
            {formatDate(created_at)}
            {shop_name ? ` · ${shop_name}` : ''}
          </span>
        )}
        {badge && <div>{badge}</div>}
      </header>

      {/* Body */}
      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_200px] md:gap-6">
        <div>
          <h3 className="font-serif-display text-balance text-[28px] leading-[1.15] tracking-tight text-[var(--ink)]">
            {displayBeanName}
          </h3>
          <div className="mt-1 text-[12.5px] text-[var(--ink-3)]">
            {roast_level && `焙煎度: ${formatRoastLevel(roast_level)}`}
          </div>

          {notes && (
            <p
              style={clampFourLines}
              className="font-serif-display text-pretty mt-3 text-[17px] italic leading-[1.6] text-[var(--ink)]"
            >
              &ldquo;{notes}&rdquo;
            </p>
          )}

          {hasAnyRating && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <AxisTick label="総合" value={overall_rating} color="var(--rating-overall)" />
              <AxisTick label="酸味" value={acidity}        color="var(--rating-acidity)" />
              <AxisTick label="香り" value={aroma}          color="var(--rating-aroma)" />
              <AxisTick label="苦味" value={bitterness}     color="var(--rating-bitter)" />
            </div>
          )}
        </div>

        {hasAnyRating && (
          <div className="grid place-items-center">
            <RadarChart
              values={radarValues}
              size={190}
              color="var(--espresso)"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--rule-2)] pt-4">
        <span className="font-mono-caps text-[10.5px] text-[var(--ink-3)]">
          TASTING SHEET · #{String(id).slice(0, 6)}
        </span>
        <Link
          href={`/coffee/${id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink)] hover:text-[var(--espresso)] transition-colors"
        >
          シートを見る
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

export const FeedCard = memo(FeedCardComponent)
