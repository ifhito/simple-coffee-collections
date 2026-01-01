import { getUserProfile } from '@/lib/api/user'
import { getCurrentUser } from '@/lib/api/auth'
import { ProfileView } from '../_components/profile-view'

type ProfileContainerProps = {
  userId: string
}

export async function ProfileContainer({ userId }: ProfileContainerProps) {
  // Fetch user profile (calls notFound() if user doesn't exist)
  const profile = await getUserProfile(userId)

  // Check if viewing own profile (getCurrentUser may throw if not authenticated)
  let isOwnProfile = false
  try {
    const currentUser = await getCurrentUser()
    isOwnProfile = currentUser.id === userId
  } catch {
    // Not authenticated or error - not own profile
    isOwnProfile = false
  }

  return <ProfileView profile={profile} isOwnProfile={isOwnProfile} />
}
