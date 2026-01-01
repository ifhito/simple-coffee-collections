import type { ComponentProps } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { RatingStars } from '../rating-stars'

const renderStars = (props?: Partial<ComponentProps<typeof RatingStars>>) => {
  cleanup()
  const merged: ComponentProps<typeof RatingStars> = {
    rating: 7,
    size: 'md',
    ...props,
  }

  render(<RatingStars {...merged} />)
  const stars = screen.getAllByTestId('rating-star')

  return {
    stars,
    getStates: () => stars.map((star) => star.getAttribute('data-state')),
  }
}

describe('RatingStars', () => {
  it('renders 5 stars with correct full/half/empty distribution for a 7/10 rating', () => {
    const { stars, getStates } = renderStars({ rating: 7 }) // 3.5 / 5

    expect(stars).toHaveLength(5)
    expect(getStates()).toEqual(['full', 'full', 'full', 'half', 'empty'])
  })

  it('renders all stars as full for a perfect 10/10 rating', () => {
    const { getStates } = renderStars({ rating: 10 })

    expect(getStates()).toEqual(['full', 'full', 'full', 'full', 'full'])
  })

  it('renders a single half star for the lowest rating (1/10)', () => {
    const { getStates } = renderStars({ rating: 1 })

    expect(getStates()).toEqual(['half', 'empty', 'empty', 'empty', 'empty'])
  })

  it('applies size variants to star icons', () => {
    const { stars: smStars } = renderStars({ rating: 8, size: 'sm' })
    expect(smStars[0]).toHaveClass('h-4', 'w-4')

    const { stars: lgStars } = renderStars({ rating: 8, size: 'lg' })
    expect(lgStars[0]).toHaveClass('h-6', 'w-6')
  })

  it('exposes an accessible label with 5-star scale conversion', () => {
    renderStars({ rating: 7 })

    expect(
      screen.getByRole('img', { name: /3\.5 out of 5 stars/i })
    ).toBeInTheDocument()
  })
})
