import { render } from '@testing-library/react'

const mockGetCoffeeEvaluation = jest.fn()
const mockEvaluationDetailView = jest.fn()
const mockNotFound = jest.fn()
const mockAuthGetUser = jest.fn()

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluation: (...args: any[]) => mockGetCoffeeEvaluation(...args),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockAuthGetUser,
      },
    })
  ),
}))

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

jest.mock('@/app/(app)/coffee/[id]/_components/evaluation/view', () => ({
  EvaluationDetailView: (props: any) => {
    mockEvaluationDetailView(props)
    return <div data-testid="evaluation-view" data-id={props.evaluation?.id} />
  },
}))

// Lazy import after mocks
import { CoffeeEvaluationContainer } from '../container'

const sampleEvaluation = {
  id: 'eval-123',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  user_id: 'owner-1',
  overall_rating: 8,
  created_at: '2025-01-02T12:00:00.000Z',
}

describe('CoffeeEvaluationContainer', () => {
  beforeEach(() => {
    mockGetCoffeeEvaluation.mockReset()
    mockEvaluationDetailView.mockReset()
    mockNotFound.mockReset()
    mockAuthGetUser.mockReset()
  })

  it('fetches evaluation by id and renders EvaluationDetailView with currentUserId', async () => {
    mockGetCoffeeEvaluation.mockResolvedValue(sampleEvaluation)
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'owner-1' } },
      error: null,
    })

    const ui = await CoffeeEvaluationContainer({ params: { id: sampleEvaluation.id } })
    render(ui)

    expect(mockGetCoffeeEvaluation).toHaveBeenCalledWith(sampleEvaluation.id)
    expect(mockEvaluationDetailView).toHaveBeenCalledWith(
      expect.objectContaining({
        evaluation: sampleEvaluation,
        currentUserId: 'owner-1',
      })
    )
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('passes undefined currentUserId when user is not authenticated', async () => {
    mockGetCoffeeEvaluation.mockResolvedValue(sampleEvaluation)
    mockAuthGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const ui = await CoffeeEvaluationContainer({ params: { id: sampleEvaluation.id } })
    render(ui)

    expect(mockEvaluationDetailView).toHaveBeenCalledWith(
      expect.objectContaining({
        evaluation: sampleEvaluation,
        currentUserId: undefined,
      })
    )
  })

  it('returns notFound() when evaluation is missing', async () => {
    mockGetCoffeeEvaluation.mockResolvedValue(null)
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'owner-1' } },
      error: null,
    })

    await CoffeeEvaluationContainer({ params: { id: 'missing-id' } })

    expect(mockNotFound).toHaveBeenCalled()
    expect(mockEvaluationDetailView).not.toHaveBeenCalled()
  })
})
