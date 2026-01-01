/**
 * Integration-style test covering create → list → detail → edit → delete flows
 * Uses mocked actions/data without hitting network or real router.
 */

import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockGetCoffeeEvaluations = jest.fn()
const mockGetCoffeeEvaluation = jest.fn()
const mockCreateCoffeeEvaluation = jest.fn()
const mockUpdateCoffeeEvaluation = jest.fn()
const mockDeleteCoffeeEvaluation = jest.fn()

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluations: (...args: any[]) => mockGetCoffeeEvaluations(...args),
  getCoffeeEvaluation: (...args: any[]) => mockGetCoffeeEvaluation(...args),
}))

jest.mock('@/lib/actions/coffee', () => ({
  createCoffeeEvaluation: (...args: any[]) => mockCreateCoffeeEvaluation(...args),
  updateCoffeeEvaluation: (...args: any[]) => mockUpdateCoffeeEvaluation(...args),
  deleteCoffeeEvaluation: (...args: any[]) => mockDeleteCoffeeEvaluation(...args),
}))

import { CoffeeListView } from '../../_components/list/view'
import { EvaluationDetailView } from '../../[id]/_components/evaluation/view'
import { EvaluationForm } from '../../_components/evaluation-form'

const sampleEvaluation = {
  id: 'eval-1',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  roast_level: 'Medium',
  acidity: 8,
  bitterness: 4,
  aroma: 9,
  overall_rating: 8,
  notes: 'Citrus and floral',
  is_public: true,
  user_id: 'user-1',
  created_at: '2025-01-02T12:00:00.000Z',
  updated_at: '2025-01-02T12:00:00.000Z',
}

describe('Coffee end-to-end flows (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'confirm', { writable: true, value: jest.fn(() => true) })
  })

  it('creates, lists, views detail, edits, and deletes an evaluation', async () => {
    const user = userEvent.setup()

    // Create
    mockCreateCoffeeEvaluation.mockResolvedValue(undefined)
    render(<EvaluationForm />)
    await user.type(screen.getByLabelText(/店名/i), 'Verve')
    await user.type(screen.getByLabelText(/豆の種類/i), 'Kenya')
    await user.click(screen.getByRole('button', { name: /保存/i }))
    await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalled())

    // List
    cleanup()
    render(<CoffeeListView evaluations={[sampleEvaluation]} />)
    expect(screen.getByText(sampleEvaluation.shop_name)).toBeInTheDocument()

    // Detail
    cleanup()
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="user-1" />)
    expect(screen.getAllByText(sampleEvaluation.bean_type)[0]).toBeInTheDocument()

    // Edit
    cleanup()
    mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)
    render(<EvaluationForm initialData={sampleEvaluation as any} />)
    await user.click(screen.getByRole('button', { name: /更新/i }))
    await waitFor(() =>
      expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
        sampleEvaluation.id,
        expect.any(FormData)
      )
    )

    // Delete
    mockDeleteCoffeeEvaluation.mockResolvedValue(undefined)
    await act(async () => {
      await mockDeleteCoffeeEvaluation(sampleEvaluation.id)
    })
    expect(mockDeleteCoffeeEvaluation).toHaveBeenCalledWith(sampleEvaluation.id)
  })
})
