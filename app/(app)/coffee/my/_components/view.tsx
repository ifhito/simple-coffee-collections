import Link from 'next/link'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import { CoffeeCard } from '../../_components/list/card'
import { PublicBadge } from '../../_components/shared/public-badge'
import { EmptyState } from '../../_components/shared/empty-state'
import { CopyProfileLinkButton } from './copy-profile-link-button'

type MyPageViewProps = {
  evaluations: CoffeeEvaluation[]
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
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            新規作成
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {profileShareUrl && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">プロフィールを共有</p>
              <p className="text-xs text-neutral-600">あなたのプロフィールURLをコピーして共有できます。</p>
            </div>
            <CopyProfileLinkButton url={profileShareUrl} />
          </div>
        </div>
      )}

      <div
        data-testid="coffee-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="relative animate-card">
            <PublicBadge isPublic={evaluation.is_public} />
            <CoffeeCard evaluation={evaluation} />
          </div>
        ))}
      </div>
    </div>
  )
}
