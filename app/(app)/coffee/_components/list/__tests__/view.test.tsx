import { render, screen } from '@testing-library/react'

const mockCoffeeCard = jest.fn()

jest.mock('../card', () => ({
  CoffeeCard: (props: any) => {
    mockCoffeeCard(props)
    return <div data-testid="coffee-card-mock" data-id={props.evaluation.id} />
  },
}))

// Lazy import after mocks
import { CoffeeListView } from '../view'

const sampleEvaluations = [
  {
    id: 'eval-1',
    shop_name: 'Blue Bottle',
    bean_type: 'Ethiopia',
    bean_name: 'イルガチェフェ',
    overall_rating: 8,
    created_at: '2025-01-02T12:00:00.000Z',
  },
  {
    id: 'eval-2',
    shop_name: 'Verve',
    bean_type: 'Kenya',
    bean_name: 'Nyeri',
    overall_rating: 7,
    created_at: '2025-01-03T12:00:00.000Z',
  },
]

describe('CoffeeListView', () => {
  it('renders a responsive grid and CoffeeCard for each evaluation', () => {
    render(<CoffeeListView evaluations={sampleEvaluations} />)

    const grid = screen.getByTestId('coffee-grid')
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-3')

    const cards = screen.getAllByTestId('coffee-card-mock')
    expect(cards).toHaveLength(sampleEvaluations.length)
    expect(mockCoffeeCard).toHaveBeenCalledWith(
      expect.objectContaining({ evaluation: sampleEvaluations[0] })
    )
  })

  it('shows an empty state when no evaluations are provided', () => {
    render(<CoffeeListView evaluations={[]} />)

    expect(screen.getByText(/まだ評価がありません/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /新規作成/i })).toHaveAttribute(
      'href',
      '/coffee/new'
    )
  })
})
