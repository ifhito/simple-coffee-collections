import Link from 'next/link'
import { memo } from 'react'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import { RatingStars } from '../shared/rating-stars'

type CoffeeCardProps = {
  evaluation: Pick<CoffeeEvaluation, 'id' | 'shop_name' | 'bean_type' | 'bean_name' | 'overall_rating' | 'created_at'>
}

const formatDate = (iso: string) => iso.slice(0, 10)

function CoffeeCardComponent({ evaluation }: CoffeeCardProps) {
  const { id, shop_name, bean_type, bean_name, overall_rating, created_at } = evaluation
  const displayBeanType = bean_name ? `${bean_type} - ${bean_name}` : bean_type

  return (
    <Link
      href={`/coffee/${id}`}
      className="block"
      aria-label={`${shop_name} の評価詳細へ`}
    >
      <article
        data-testid="coffee-card"
        className="group rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900">{shop_name}</h3>
            <p className="text-sm text-neutral-600">{displayBeanType}</p>
          </div>
          <RatingStars rating={overall_rating} size="md" />
        </div>
        <div className="mt-3 text-xs text-neutral-500">{formatDate(created_at)}</div>
      </article>
    </Link>
  )
}

export const CoffeeCard = memo(CoffeeCardComponent)
