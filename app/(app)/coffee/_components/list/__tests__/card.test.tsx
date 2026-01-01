import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'

const mockRatingStars = jest.fn()

jest.mock('../../shared/rating-stars', () => ({
  RatingStars: (props: any) => {
    mockRatingStars(props)
    return <div data-testid="rating-stars">rating-stars-mock</div>
  },
}))

jest.mock('next/link', () => {
  return ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...rest}>
      {children}
    </a>
  )
})

// Lazy import after mocks are set up
import { CoffeeCard } from '../card'

const sampleEvaluation = {
  id: 'eval-123',
  shop_name: 'Blue Bottle Coffee',
  bean_type: 'Ethiopia Yirgacheffe',
  overall_rating: 8,
  created_at: '2025-01-02T12:00:00.000Z',
}

const renderCard = (props?: Partial<ComponentProps<typeof CoffeeCard>>) => {
  const merged: ComponentProps<typeof CoffeeCard> = {
    evaluation: sampleEvaluation,
    ...props,
  }

  render(<CoffeeCard {...merged} />)
  const link = screen.getByRole('link')
  return { link }
}

describe('CoffeeCard', () => {
  it('renders shop name, bean type, and formatted date', () => {
    renderCard()

    expect(screen.getByText(sampleEvaluation.shop_name)).toBeInTheDocument()
    expect(screen.getByText(sampleEvaluation.bean_type)).toBeInTheDocument()
    expect(screen.getByText(/2025-01-02/)).toBeInTheDocument()
  })

  it('uses RatingStars with overall_rating on a 5-star scale', () => {
    renderCard()
    expect(mockRatingStars).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: sampleEvaluation.overall_rating,
        size: 'md',
      })
    )
    expect(screen.getByTestId('rating-stars')).toBeInTheDocument()
  })

  it('links to the coffee evaluation detail page', () => {
    const { link } = renderCard()
    expect(link).toHaveAttribute('href', `/coffee/${sampleEvaluation.id}`)
  })

  it('applies interactive hover styling on the card container', () => {
    renderCard()
    const card = screen.getByTestId('coffee-card')
    expect(card).toHaveClass('group')
    expect(card).toHaveClass('hover:-translate-y-1')
  })
})
