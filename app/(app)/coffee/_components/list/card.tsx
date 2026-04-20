import Link from 'next/link'
import { memo, type CSSProperties, type ReactNode } from 'react'
import type { CoffeeEvaluationDisplay } from '@/lib/types/coffee'
import { RadarChart } from '@/app/(app)/coffee/_components/shared/radar-chart'

type CoffeeCardEvaluation = Pick<
  CoffeeEvaluationDisplay,
  'id' | 'shop_name' | 'bean_type' | 'bean_name' | 'created_at'
> & {
  overall_rating: number | null
  acidity?: number | null
  bitterness?: number | null
  aroma?: number | null
}

type CoffeeCardProps = {
  evaluation: CoffeeCardEvaluation
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
  const {
    id,
    shop_name,
    bean_type,
    bean_name,
    overall_rating,
    acidity,
    bitterness,
    aroma,
    created_at,
  } = evaluation
  const displayName =
    bean_name || (bean_type === 'Unknown' ? '産地不明' : bean_type)
  const hasRatings =
    acidity !== undefined && acidity !== null &&
    bitterness !== undefined && bitterness !== null &&
    aroma !== undefined && aroma !== null &&
    overall_rating !== null

  return (
    <article
      data-testid="coffee-card"
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-[var(--rule)] bg-[var(--paper)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-20px_rgba(60,30,10,0.35)]"
    >
      {meta ? (
        <div className="border-b border-[var(--rule-2)] bg-[var(--background-2)] px-4 py-2 text-xs text-[var(--ink-3)]">
          {meta}
        </div>
      ) : null}
      <Link
        href={`/coffee/${id}`}
        className="flex flex-1 flex-col p-5"
        aria-label={`${displayName} の評価詳細へ`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3
              style={clampTwoLines}
              className="font-serif-display text-[21px] leading-[1.2] tracking-tight text-[var(--ink)] break-words"
            >
              {displayName}
            </h3>
            <p
              style={clampTwoLines}
              className="text-sm text-[var(--ink-3)] break-words"
            >
              {shop_name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {overall_rating !== null ? (
              <>
                <div className="font-serif-display text-[34px] leading-none tracking-tight text-[var(--ink)]">
                  {overall_rating}
                </div>
                <div className="font-mono-caps mt-0.5 text-[9.5px] text-[var(--ink-3)]">
                  OVERALL
                </div>
              </>
            ) : (
              <span className="inline-block rounded-full border border-[var(--rule)] px-2.5 py-0.5 text-xs text-[var(--ink-3)]">
                未評価
              </span>
            )}
          </div>
        </div>

        {hasRatings && (
          <div className="mt-3 flex justify-center border-t border-[var(--rule-2)] pt-3">
            <RadarChart
              values={{
                overall: overall_rating,
                acidity: acidity ?? null,
                aroma: aroma ?? null,
                bitter: bitterness ?? null,
              }}
              size={110}
              showLabels={false}
              color="var(--espresso)"
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-mono-num text-[11px] text-[var(--ink-3)]">
            {formatDate(created_at)}
          </span>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
      </Link>
    </article>
  )
}

export const CoffeeCard = memo(CoffeeCardComponent)
