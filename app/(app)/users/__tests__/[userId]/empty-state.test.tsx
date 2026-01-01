import { render, screen } from '@testing-library/react'

const mockGetCoffeeEvaluationsWithUser = jest.fn()

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluationsWithUser: (...args: any[]) => mockGetCoffeeEvaluationsWithUser(...args),
}))

import { EvaluationsContainer } from '../../[userId]/_containers/evaluations-container'

describe('User profile evaluations empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows empty message when user has no public evaluations', async () => {
    mockGetCoffeeEvaluationsWithUser.mockResolvedValue([])

    const element = await EvaluationsContainer({ userId: 'user-123' })
    render(element)

    expect(screen.getByText('まだ公開評価がありません')).toBeInTheDocument()
  })
})
