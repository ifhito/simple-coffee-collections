import Link from 'next/link'
import type { UserProfile } from '@/lib/types/user'

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
          <h1 className="text-2xl font-bold text-neutral-900 animate-slide-up">
            {displayName}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-neutral-600 animate-slide-up" style={{ animationDelay: '80ms' }}>
              {profile.bio}
            </p>
          )}
        </div>
        {isOwnProfile && (
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            プロフィールを編集
          </Link>
        )}
      </div>
    </div>
  )
}
