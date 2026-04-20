import Link from 'next/link'
import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'
import { FeedCard } from '../../community/_components/feed-card'
import { PublicBadge } from '../../_components/shared/public-badge'
import { EmptyState } from '../../_components/shared/empty-state'
import { CopyProfileLinkButton } from './copy-profile-link-button'

type MyPageViewProps = {
  evaluations: CoffeeEvaluationWithUser[]
  profileShareUrl?: string
}

export function MyPageView({ evaluations, profileShareUrl }: MyPageViewProps) {
  if (!evaluations.length) {
    return (
      <EmptyState
        message="まだ評価がありません"
        action={
          <Link
            href="/coffee/new"
            className="inline-flex items-center justify-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
          >
            新規評価
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {profileShareUrl && (
        <div className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">プロフィールを共有</p>
              <p className="text-xs text-[var(--ink-3)]">あなたのプロフィールURLをコピーして共有できます。</p>
            </div>
            <CopyProfileLinkButton url={profileShareUrl} />
          </div>
        </div>
      )}

      <div
        data-testid="coffee-grid"
        className="mx-auto flex max-w-2xl flex-col gap-6"
      >
        {evaluations.map((evaluation) => (
          <FeedCard
            key={evaluation.id}
            evaluation={evaluation}
            showUserHeader={false}
            badge={<PublicBadge isPublic={evaluation.is_public} />}
          />
        ))}
      </div>
    </div>
  )
}
