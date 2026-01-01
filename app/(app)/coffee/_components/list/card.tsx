import Link from 'next/link'
import { memo, type CSSProperties, type ReactNode } from 'react'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import { RatingStars } from '../shared/rating-stars'

type CoffeeCardProps = {
  evaluation: Pick<CoffeeEvaluation, 'id' | 'shop_name' | 'bean_type' | 'bean_name' | 'overall_rating' | 'created_at'>
  badge?: ReactNode
  meta?: ReactNode
}

const formatDate = (iso: string) => iso.slice(0, 10)
const clampTwoLines: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

function CoffeeCardComponent({ evaluation, badge, meta }: CoffeeCardProps) {
  const { id, shop_name, bean_type, bean_name, overall_rating, created_at } = evaluation
  const displayBeanType = bean_name ? `${bean_type} - ${bean_name}` : bean_type

  return (
    <article
      data-testid="coffee-card"
      className="group flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md"
    >
      {meta ? <div className="mb-3 text-sm text-neutral-600">{meta}</div> : null}
      <Link
        href={`/coffee/${id}`}
        className="flex flex-1 flex-col"
        aria-label={`${shop_name} の評価詳細へ`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 style={clampTwoLines} className="text-lg font-semibold text-neutral-900 break-words">
              {shop_name}
            </h3>
            <p style={clampTwoLines} className="text-sm text-neutral-600 break-words">
              {displayBeanType}
            </p>
          </div>
          <div className="shrink-0">
            <RatingStars rating={overall_rating} size="md" />
          </div>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>{formatDate(created_at)}</span>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
      </Link>
    </article>
  )
}

export const CoffeeCard = memo(CoffeeCardComponent)
