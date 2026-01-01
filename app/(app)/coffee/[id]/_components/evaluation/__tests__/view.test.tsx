import { render, screen } from '@testing-library/react'
import { EvaluationDetailView } from '../view'

const mockDeleteCoffeeEvaluation = jest.fn()

jest.mock('../../../../_components/shared/rating-stars', () => ({
  RatingStars: ({ rating }: any) => (
    <div data-testid="rating-stars" data-rating={rating} />
  ),
}))

jest.mock('@/lib/actions/coffee', () => ({
  deleteCoffeeEvaluation: (id: string) => mockDeleteCoffeeEvaluation(id),
}))

const sampleEvaluation = {
  id: 'eval-123',
  user_id: 'owner-1',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  bean_name: null,
  roast_level: 'Medium',
  acidity: 8,
  bitterness: 4,
  aroma: 9,
  overall_rating: 8,
  notes: 'Citrus and floral',
  created_at: '2025-01-02T12:00:00.000Z',
}

describe('EvaluationDetailView', () => {
  beforeEach(() => {
    mockDeleteCoffeeEvaluation.mockReset()
    jest.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders all evaluation fields and ratings', () => {
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="owner-1" />)

    expect(screen.getByText(sampleEvaluation.shop_name)).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.bean_type)).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.roast_level!)).toBeInTheDocument()
    expect(screen.getAllByTestId('rating-stars')).toHaveLength(4)
    expect(screen.getAllByTestId('rating-stars')[0]).toHaveAttribute(
      'data-rating',
      sampleEvaluation.overall_rating.toString()
    )
    expect(screen.getByText(sampleEvaluation.notes!)).toBeInTheDocument()
  })

  it('shows edit and delete buttons only for the owner', () => {
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="owner-1" />)
    expect(screen.getByRole('button', { name: /編集/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons for non-owners', () => {
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="other-user" />)
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument()
  })

  describe('Bean Name Display', () => {
    it('displays bean_name when it exists', () => {
      const evaluationWithBeanName = {
        ...sampleEvaluation,
        bean_name: 'イルガチェフェ G1',
      }
      render(<EvaluationDetailView evaluation={evaluationWithBeanName as any} currentUserId="owner-1" />)

      expect(screen.getByText('イルガチェフェ G1')).toBeInTheDocument()
    })

    it('does not display bean_name section when bean_name is null', () => {
      render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="owner-1" />)

      // bean_name should not appear in the document
      expect(screen.queryByText(/イルガチェフェ/)).not.toBeInTheDocument()
    })

    it('does not display bean_name section when bean_name is empty string', () => {
      const evaluationWithEmptyBeanName = {
        ...sampleEvaluation,
        bean_name: '',
      }
      render(<EvaluationDetailView evaluation={evaluationWithEmptyBeanName as any} currentUserId="owner-1" />)

      // Should only see bean_type, not bean_name
      expect(screen.getByText(sampleEvaluation.bean_type)).toBeInTheDocument()
    })
  })
})
