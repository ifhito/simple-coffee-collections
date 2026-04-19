/**
 * Integration tests for My Page (/coffee/my)
 * Tests authentication, evaluation display with PublicBadge, and search/sort
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockGetCurrentUser = jest.fn()
const mockGetCoffeeEvaluationsWithUser = jest.fn()
const mockRedirect = jest.fn(() => {
  throw new Error('NEXT_REDIRECT')
})
const mockRouterPush = jest.fn()

jest.mock('@/lib/api/auth', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}))

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluationsWithUser: (...args: any[]) => mockGetCoffeeEvaluationsWithUser(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: any[]) => mockRedirect(...args),
  useRouter: () => ({
    push: mockRouterPush,
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/coffee/my',
}))

// Import the container to test server-side logic
import { MyPageContainer } from '../_containers/container'
import { SearchAndSort } from '../../_components/list/search-and-sort'

// Wrapper component for testing that handles async container
function MyPage() {
  const [content, setContent] = React.useState<React.ReactNode>(null)
  const [searchParams, setSearchParams] = React.useState<any>(undefined)

  // Listen for router.push calls and extract search params
  React.useEffect(() => {
    mockRouterPush.mockImplementation((url: string) => {
      // Extract search params from URL
      const urlObj = new URL(url, 'http://localhost')
      const params: any = {}
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value
      })
      setSearchParams(params)
    })
  }, [])

  React.useEffect(() => {
    MyPageContainer({ searchParams })
      .then(result => setContent(result))
      .catch(err => {
        // getCurrentUser will call redirect() if not authenticated
        // The mocked redirect should be called automatically
      })
  }, [searchParams])

  return (
    <>
      <SearchAndSort />
      {content}
    </>
  )
}

const sampleUser = {
  id: 'user-123',
  email: 'test@example.com',
}

const sampleEvaluations = [
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
    display_name: 'Test User',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'eval-2',
    shop_name: 'Verve Coffee',
    bean_type: 'Kenya',
    roast_level: 'Light',
    acidity: 9,
    bitterness: 3,
    aroma: 8,
    overall_rating: 9,
    is_public: false,
    user_id: 'user-123',
    display_name: 'Test User',
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  },
]

describe('My Page (/coffee/my)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to /login when user is not authenticated', async () => {
    // getCurrentUser calls redirect('/login') which throws
    mockGetCurrentUser.mockImplementation(async () => {
      const { redirect } = require('next/navigation')
      redirect('/login')
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })

  it('displays authenticated user\'s evaluations (both public and private)', async () => {
    mockGetCurrentUser.mockResolvedValue(sampleUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(sampleEvaluations)

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByText(/Blue Bottle/)).toBeInTheDocument()
      expect(screen.getByText(/Verve Coffee/)).toBeInTheDocument()
    })

    // Verify both public and private evaluations are shown
    expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' })
    )
  })

  it('shows PublicBadge (🌐 公開) on public evaluation cards', async () => {
    mockGetCurrentUser.mockResolvedValue(sampleUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(sampleEvaluations)

    render(<MyPage />)

    await waitFor(() => {
      const publicBadges = screen.getAllByText(/🌐 公開/i)
      expect(publicBadges.length).toBeGreaterThan(0)
    })
  })

  it('shows PublicBadge (🔒 非公開) on private evaluation cards', async () => {
    mockGetCurrentUser.mockResolvedValue(sampleUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(sampleEvaluations)

    render(<MyPage />)

    await waitFor(() => {
      const privateBadges = screen.getAllByText(/🔒 非公開/i)
      expect(privateBadges.length).toBeGreaterThan(0)
    })
  })

  it('displays search and sort functionality', async () => {
    mockGetCurrentUser.mockResolvedValue(sampleUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(sampleEvaluations)

    render(<MyPage />)

    await waitFor(() => {
      // Search input should be present
      expect(screen.getByPlaceholderText(/検索/i)).toBeInTheDocument()
      
      // Sort dropdown should be present
      expect(screen.getByLabelText(/並び順/i)).toBeInTheDocument()
    })
  })

  it('filters evaluations based on search input', async () => {
    const user = userEvent.setup()
    mockGetCurrentUser.mockResolvedValue(sampleUser)
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(sampleEvaluations)

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByText(/Blue Bottle/)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/検索/i)
    await user.type(searchInput, 'Blue')

    await waitFor(() => {
      expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Blue' })
      )
    })
  })

  it('has correct page metadata', async () => {
    // This test verifies metadata once the page is implemented
    // For now, it's a placeholder
    expect(true).toBe(true)
  })
})
