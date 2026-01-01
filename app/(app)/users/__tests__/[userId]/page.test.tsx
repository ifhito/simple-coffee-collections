/**
 * Integration tests for User Profile Page (/users/[userId])
 * Tests profile display, public evaluations, edit button, and 404 handling
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockGetUserProfile = jest.fn()
const mockGetCurrentUser = jest.fn()
const mockGetCoffeeEvaluationsWithUser = jest.fn()
const mockNotFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
const mockRouterPush = jest.fn()

jest.mock('@/lib/api/user', () => ({
  getUserProfile: (...args: any[]) => mockGetUserProfile(...args),
}))

jest.mock('@/lib/api/auth', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}))

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluationsWithUser: (...args: any[]) => mockGetCoffeeEvaluationsWithUser(...args),
}))

jest.mock('next/navigation', () => ({
  notFound: (...args: any[]) => mockNotFound(...args),
  useRouter: () => ({
    push: mockRouterPush,
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/users/user-123',
}))

// Import containers to test server-side logic
import { ProfileContainer } from '../../[userId]/_containers/profile-container'
import { EvaluationsContainer } from '../../[userId]/_containers/evaluations-container'
import { SearchAndSort } from '../../../coffee/_components/list/search-and-sort'

// Wrapper component for testing that handles async containers
function UserProfilePage({ params }: { params: { userId: string } }) {
  const [profileContent, setProfileContent] = React.useState<React.ReactNode>(null)
  const [evaluationsContent, setEvaluationsContent] = React.useState<React.ReactNode>(null)
  const [searchParams, setSearchParams] = React.useState<any>(undefined)
  const [error, setError] = React.useState<Error | null>(null)

  // Listen for router.push calls and extract search params
  React.useEffect(() => {
    mockRouterPush.mockImplementation((url: string) => {
      const urlObj = new URL(url, 'http://localhost')
      const params: any = {}
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value
      })
      setSearchParams(params)
    })
  }, [])

  React.useEffect(() => {
    Promise.all([
      ProfileContainer({ userId: params.userId })
        .then(result => setProfileContent(result))
        .catch(err => setError(err)),
      EvaluationsContainer({ userId: params.userId, searchParams })
        .then(result => setEvaluationsContent(result))
        .catch(err => setError(err))
    ])
  }, [params.userId, searchParams])

  if (error) {
    return null
  }

  return (
    <>
      {profileContent}
      <SearchAndSort />
      {evaluationsContent}
    </>
  )
}

const sampleUserProfile = {
  id: 'user-123',
  display_name: '珈琲太郎',
  bio: 'コーヒー好きです',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

const sampleCurrentUser = {
  id: 'user-123',
  email: 'test@example.com',
}

const samplePublicEvaluations = [
  {
    id: 'eval-1',
    shop_name: 'Blue Bottle',
    bean_type: 'Ethiopia',
    roast_level: 'Medium',
    acidity: 8,
    bitterness: 4,
    aroma: 9,
    overall_rating: 8,
    is_public: true,
    user_id: 'user-123',
    display_name: '珈琲太郎',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
]

describe('User Profile Page (/users/[userId])', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays user profile with display_name and bio', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByText('珈琲太郎')).toBeInTheDocument()
      expect(screen.getByText('コーヒー好きです')).toBeInTheDocument()
    })
  })

  it('shows "匿名ユーザー" when display_name is null', async () => {
    mockGetUserProfile.mockResolvedValue({ ...sampleUserProfile, display_name: null })
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByText(/匿名ユーザー/i)).toBeInTheDocument()
    })
  })

  it('shows user\'s public evaluations only', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByText('Blue Bottle')).toBeInTheDocument()
    })

    // Verify API called with is_public: true and user_id filters
    expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123', is_public: true })
    )
  })

  it('shows "プロフィールを編集" button only for own profile', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser) // Same user
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /プロフィールを編集/i })).toBeInTheDocument()
    })
  })

  it('does NOT show "プロフィールを編集" button for other users', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue({ id: 'user-456', email: 'other@example.com' })
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /プロフィールを編集/i })).not.toBeInTheDocument()
    })
  })

  it('calls notFound() for invalid userId', async () => {
    // getUserProfile calls notFound() which throws
    mockGetUserProfile.mockImplementation(async () => {
      const { notFound } = require('next/navigation')
      notFound()
    })

    render(<UserProfilePage params={{ userId: 'invalid-user' }} />)

    await waitFor(() => {
      expect(mockNotFound).toHaveBeenCalled()
    })
  })

  it('shows empty state message when user has no public evaluations', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue([])

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByText(/まだ公開評価がありません/i)).toBeInTheDocument()
    })
  })

  it('displays search and sort functionality', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      // Search input should be present
      expect(screen.getByPlaceholderText(/検索/i)).toBeInTheDocument()
      
      // Sort dropdown should be present
      expect(screen.getByLabelText(/並び順/i)).toBeInTheDocument()
    })
  })

  it('filters evaluations based on search input', async () => {
    const user = userEvent.setup()
    mockGetUserProfile.mockResolvedValue(sampleUserProfile)
    mockGetCurrentUser.mockResolvedValue(sampleCurrentUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<UserProfilePage params={{ userId: 'user-123' }} />)

    await waitFor(() => {
      expect(screen.getByText('Blue Bottle')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/検索/i)
    await user.type(searchInput, 'Ethiopia')

    await waitFor(() => {
      expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Ethiopia', user_id: 'user-123', is_public: true })
      )
    })
  })
})
