import Link from 'next/link'
import { memo, type CSSProperties } from 'react'
import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'

type FeedCardProps = {
  evaluation: CoffeeEvaluationWithUser
}

const formatDate = (iso: string) => iso.slice(0, 10)

const clampFourLines: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

type RatingBadgeProps = {
  label: string
  value: number
  className: string
}

function RatingBadge({ label, value, className }: RatingBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
      <span className="font-semibold">{value}</span>
    </span>
  )
}

function FeedCardComponent({ evaluation }: FeedCardProps) {
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

  const displayBeanName = bean_name || (bean_type === 'Unknown' ? '産地不明' : bean_type)
  const hasRatings = acidity !== null || bitterness !== null || aroma !== null || overall_rating !== null

  return (
    <article
      data-testid="feed-card"
      className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header: user + date */}
      <div className="flex items-center justify-between">
        <Link
          href={`/users/${user_id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-amber-600 transition-colors"
        >
          <span aria-hidden>👤</span>
          <span>{display_name || '匿名ユーザー'}</span>
        </Link>
        <time className="text-xs text-neutral-400">{formatDate(created_at)}</time>
      </div>

      {/* Bean info */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-neutral-900">{displayBeanName}</h3>
        {roast_level && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            {roast_level}
          </span>
        )}
      </div>

      {/* Shop name */}
      {shop_name && (
        <p className="mt-0.5 text-sm text-neutral-500">{shop_name}</p>
      )}

      {/* Rating badges */}
      {hasRatings && (
        <div className="mt-3 flex flex-wrap gap-2">
          {acidity !== null && (
            <RatingBadge label="酸味" value={acidity} className="bg-blue-50 text-blue-700" />
          )}
          {bitterness !== null && (
            <RatingBadge label="苦味" value={bitterness} className="bg-orange-50 text-orange-700" />
          )}
          {aroma !== null && (
            <RatingBadge label="香り" value={aroma} className="bg-green-50 text-green-700" />
          )}
          {overall_rating !== null && (
            <RatingBadge label="総合" value={overall_rating} className="bg-amber-100 text-amber-800 font-semibold" />
          )}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <p style={clampFourLines} className="mt-3 text-sm leading-relaxed text-neutral-700">
          {notes}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-end">
        <Link
          href={`/coffee/${id}`}
          className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          詳細を見る →
        </Link>
      </div>
    </article>
  )
}

export const FeedCard = memo(FeedCardComponent)
