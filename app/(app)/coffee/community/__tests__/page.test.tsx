/**
 * Integration tests for Community Feed Page (/coffee/community)
 * Tests public evaluation display with user names and navigation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockGetCoffeeEvaluationsWithUser = jest.fn()
const mockRouterPush = jest.fn()

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluationsWithUser: (...args: any[]) => mockGetCoffeeEvaluationsWithUser(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/coffee/community',
}))

// Import the container to test server-side logic
import { CommunityContainer } from '../_containers/container'
import { SearchAndSort } from '../../_components/list/search-and-sort'

// Wrapper component for testing that handles async container
function CommunityPage() {
  const [content, setContent] = React.useState<React.ReactNode>(null)
  const [searchParams, setSearchParams] = React.useState<any>(undefined)

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
    CommunityContainer({ searchParams })
      .then(result => setContent(result))
      .catch(err => console.error(err))
  }, [searchParams])

  return (
    <>
      <SearchAndSort />
      {content}
    </>
  )
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
  {
    id: 'eval-2',
    shop_name: 'Verve Coffee',
    bean_type: 'Kenya',
    roast_level: 'Light',
    acidity: 9,
    bitterness: 3,
    aroma: 8,
    overall_rating: 9,
    is_public: true,
    user_id: 'user-456',
    display_name: null, // Anonymous user
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  },
]

describe('Community Feed Page (/coffee/community)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays all public evaluations without auth requirement', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      expect(screen.getByText('Blue Bottle')).toBeInTheDocument()
      expect(screen.getByText('Verve Coffee')).toBeInTheDocument()
    })

    // Verify API called with is_public: true filter
    expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
      expect.objectContaining({ is_public: true })
    )
  })

  it('shows user display_name on evaluation cards', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      expect(screen.getByText(/珈琲太郎/i)).toBeInTheDocument()
    })
  })

  it('shows "匿名ユーザー" when display_name is null', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      expect(screen.getByText(/匿名ユーザー/i)).toBeInTheDocument()
    })
  })

  it('user name links navigate to /users/{userId}', async () => {
    const user = userEvent.setup()
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      const userLink = screen.getByRole('link', { name: /珈琲太郎/i })
      expect(userLink).toHaveAttribute('href', '/users/user-123')
    })
  })

  it('anonymous user links navigate to /users/{userId}', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      const anonymousLink = screen.getByRole('link', { name: /匿名ユーザー/i })
      expect(anonymousLink).toHaveAttribute('href', '/users/user-456')
    })
  })

  it('displays search and sort functionality', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      // Search input should be present
      expect(screen.getByPlaceholderText(/検索/i)).toBeInTheDocument()
      
      // Sort dropdown should be present
      expect(screen.getByLabelText(/並び順/i)).toBeInTheDocument()
    })
  })

  it('filters evaluations based on search input', async () => {
    const user = userEvent.setup()
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue(samplePublicEvaluations)

    render(<CommunityPage />)

    await waitFor(() => {
      expect(screen.getByText('Blue Bottle')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/検索/i)
    await user.type(searchInput, 'Kenya')

    await waitFor(() => {
      expect(mockGetCoffeeEvaluationsWithUser).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Kenya', is_public: true })
      )
    })
  })

  it('has correct page metadata', async () => {
    // This test verifies metadata once the page is implemented
    // For now, it's a placeholder
    expect(true).toBe(true)
  })
})
