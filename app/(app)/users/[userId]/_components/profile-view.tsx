import Link from 'next/link'
import type { UserProfile } from '@/lib/types/coffee'

type ProfileViewProps = {
  profile: UserProfile
  isOwnProfile: boolean
}

export function ProfileView({ profile, isOwnProfile }: ProfileViewProps) {
  const displayName = profile.display_name || '匿名ユーザー'

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl text-[var(--ink)] animate-slide-up">
            {displayName}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-[var(--ink-3)] animate-slide-up" style={{ animationDelay: '80ms' }}>
              {profile.bio}
            </p>
          )}
        </div>
        {isOwnProfile && (
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)]"
          >
            プロフィールを編集
          </Link>
        )}
      </div>
    </div>
  )
}
