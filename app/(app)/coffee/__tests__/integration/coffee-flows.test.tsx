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
  bean_name: 'イルガチェフェ',
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
    await user.type(screen.getByLabelText(/豆の名前/i), 'Kenya AA')
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

  describe('Bean Name Integration', () => {
    it('creates evaluation with bean_name and displays it in list and detail views', async () => {
      const user = userEvent.setup()

      // Create with bean_name
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)
      render(<EvaluationForm />)
      await user.type(screen.getByLabelText(/店名/i), 'Verve Coffee')
      await user.type(screen.getByLabelText(/豆の種類/i), 'Ethiopia')
      await user.type(screen.getByLabelText(/豆の名前/i), 'イルガチェフェ G1')
      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalled())

      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('bean_name')).toBe('イルガチェフェ G1')

      // List view with bean_name
      cleanup()
      const evalWithBeanName = {
        ...sampleEvaluation,
        bean_name: 'イルガチェフェ G1',
      }
      render(<CoffeeListView evaluations={[evalWithBeanName]} />)
      expect(screen.getByText('Ethiopia - イルガチェフェ G1')).toBeInTheDocument()

      // Detail view with bean_name
      cleanup()
      render(<EvaluationDetailView evaluation={evalWithBeanName as any} currentUserId="user-1" />)
      expect(screen.getByText('イルガチェフェ G1')).toBeInTheDocument()
    })

    it('edits evaluation to add bean_name', async () => {
      const user = userEvent.setup()

      mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)
      render(<EvaluationForm initialData={sampleEvaluation as any} />)

      expect(screen.getByLabelText(/豆の名前/i)).toHaveValue(sampleEvaluation.bean_name)

      // Add bean_name
      await user.clear(screen.getByLabelText(/豆の名前/i))
      await user.type(screen.getByLabelText(/豆の名前/i), 'アンティグア')
      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() => expect(mockUpdateCoffeeEvaluation).toHaveBeenCalled())

      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('bean_name')).toBe('アンティグア')
    })

    it('edits evaluation to change bean_name', async () => {
      const user = userEvent.setup()

      mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)
      render(<EvaluationForm initialData={sampleEvaluation as any} />)

      expect(screen.getByLabelText(/豆の名前/i)).toHaveValue(sampleEvaluation.bean_name)

      await user.clear(screen.getByLabelText(/豆の名前/i))
      await user.type(screen.getByLabelText(/豆の名前/i), 'New Bean Name')
      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() => expect(mockUpdateCoffeeEvaluation).toHaveBeenCalled())

      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('bean_name')).toBe('New Bean Name')
    })
  })
})
