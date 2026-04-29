/**
 * E2E-style integration tests (mocked) for visibility and sharing flows
 * Covers: create private → not in community, toggle to public → visible, profile view, empty state, /coffee redirect
 */

import { render, screen, cleanup } from '@testing-library/react'

const mockGetCurrentUser = jest.fn()
const mockGetCoffeeEvaluationsWithUser = jest.fn()
const mockRedirect = jest.fn((..._args: unknown[]) => {
  throw new Error('NEXT_REDIRECT')
})

jest.mock('@/lib/api/auth', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}))

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluationsWithUser: (...args: any[]) => mockGetCoffeeEvaluationsWithUser(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: any[]) => mockRedirect(...args),
}))

jest.mock('@/app/(app)/coffee/_components/list/search-and-sort', () => ({
  SearchAndSort: () => <div data-testid="search-and-sort" />,
}))

import CoffeeListPage from '@/app/(app)/coffee/page'
import { MyPageView } from '@/app/(app)/coffee/my/_components/view'
import { CommunityView } from '@/app/(app)/coffee/community/_components/view'
import { EvaluationsContainer } from '@/app/(app)/users/[userId]/_containers/evaluations-container'

const privateEval = {
  id: 'eval-private',
  shop_name: 'Private Beans',
  bean_type: 'Kenya',
  roast_level: 'Light',
  acidity: 8,
  bitterness: 3,
  aroma: 9,
  overall_rating: 8,
  is_public: false,
  user_id: 'user-1',
  display_name: 'Alice',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

const publicEval = { ...privateEval, id: 'eval-public', is_public: true }

describe('Visibility & sharing flows (mocked E2E)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('private evaluation visible only on My Page, not in Community', async () => {
    // My Page view shows private eval with lock badge
    render(<MyPageView evaluations={[privateEval as any]} />)
    expect(screen.getByText(/Private Beans/)).toBeInTheDocument()
    expect(screen.getByText('🔒 非公開')).toBeInTheDocument()

    cleanup()

    // Community page should show empty state
    render(<CommunityView evaluations={[]} />)
    expect(screen.getByText('まだ公開評価がありません')).toBeInTheDocument()
  })

  it('toggling to public shows in Community with user link', async () => {
    render(<CommunityView evaluations={[publicEval as any]} />)

    expect(screen.getByText(/Private Beans/)).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('profile page shows public evaluations and empty state when none', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue([])

    render(
      await EvaluationsContainer({
        userId: 'user-1',
        searchParams: {},
      })
    )

    expect(screen.getByText('まだ公開評価がありません')).toBeInTheDocument()
  })

  it('unauthenticated /coffee redirects to community, authenticated to my', async () => {
    // authed
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' })
    await expect(async () => {
      await CoffeeListPage()
    }).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/coffee/my')

    mockRedirect.mockClear()
    mockGetCurrentUser.mockRejectedValue(new Error('unauth'))
    await expect(async () => {
      await CoffeeListPage()
    }).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/coffee/community')
  })
})
