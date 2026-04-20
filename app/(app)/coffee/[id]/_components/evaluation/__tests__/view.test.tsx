import { render, screen } from '@testing-library/react'
import { EvaluationDetailView } from '../view'

const mockDeleteCoffeeEvaluation = jest.fn()

jest.mock('@/lib/actions/coffee', () => ({
  deleteCoffeeEvaluation: (id: string) => mockDeleteCoffeeEvaluation(id),
}))

const sampleEvaluation = {
  id: 'eval-123',
  user_id: 'owner-1',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  bean_name: 'Yirgacheffe',
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

    // Coffee name should be in heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(sampleEvaluation.bean_name!)

    // Shop name and bean_type should be displayed
    expect(screen.getByText(sampleEvaluation.shop_name)).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.bean_type)).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.roast_level!)).toBeInTheDocument()

    // Numeric ratings are displayed as integers.
    // RadarChart SVG labels also render the same values, so multiple nodes exist.
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('9').length).toBeGreaterThanOrEqual(1)

    expect(screen.getByRole('heading', { level: 2, name: /感想/i })).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.notes!)).toBeInTheDocument()
  })

  it('shows edit and delete buttons only for the owner', () => {
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="owner-1" />)
    expect(screen.getByRole('link', { name: /編集/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons for non-owners', () => {
    render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="other-user" />)
    expect(screen.queryByRole('link', { name: /編集/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument()
  })

  describe('Coffee Name and Origin Display', () => {
    it('displays bean_name in heading and bean_type separately', () => {
      render(<EvaluationDetailView evaluation={sampleEvaluation as any} currentUserId="owner-1" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent(sampleEvaluation.bean_name!)

      // bean_type should be displayed separately, not in heading
      expect(screen.getByText(sampleEvaluation.bean_type)).toBeInTheDocument()
      expect(heading).not.toHaveTextContent(sampleEvaluation.bean_type)
    })

    it('displays different coffee names correctly', () => {
      const evaluationWithDifferentName = {
        ...sampleEvaluation,
        bean_name: 'イルガチェフェ G1',
        bean_type: 'エチオピア',
      }
      render(<EvaluationDetailView evaluation={evaluationWithDifferentName as any} currentUserId="owner-1" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('イルガチェフェ G1')
      expect(screen.getByText('エチオピア')).toBeInTheDocument()
    })

    it('displays "産地不明" when bean_type is "Unknown"', () => {
      const evaluationWithUnknownOrigin = {
        ...sampleEvaluation,
        bean_type: 'Unknown',
      }
      render(<EvaluationDetailView evaluation={evaluationWithUnknownOrigin as any} currentUserId="owner-1" />)

      expect(screen.getByText('産地不明')).toBeInTheDocument()
      expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
    })
  })

  it('hides the notes section when notes are not present', () => {
    render(
      <EvaluationDetailView
        evaluation={{ ...sampleEvaluation, notes: null } as any}
        currentUserId="owner-1"
      />
    )

    expect(screen.queryByRole('heading', { level: 2, name: /感想/i })).not.toBeInTheDocument()
  })
})
