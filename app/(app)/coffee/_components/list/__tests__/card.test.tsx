import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/link', () => {
  const LinkMock = ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...rest}>
      {children}
    </a>
  )
  LinkMock.displayName = 'NextLinkMock'

  return { __esModule: true, default: LinkMock }
})

import { CoffeeCard } from '../card'

const sampleEvaluation = {
  id: 'eval-123',
  shop_name: 'Blue Bottle Coffee',
  bean_type: 'Ethiopia Yirgacheffe',
  bean_name: '',
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
  it('renders coffee name as title and shop name as subtitle', () => {
    renderCard()

    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent(sampleEvaluation.bean_type)

    expect(screen.getByText(sampleEvaluation.shop_name)).toBeInTheDocument()
    expect(screen.getByText(/2025-01-02/)).toBeInTheDocument()
  })

  it('displays overall_rating as numeric value with OVERALL label', () => {
    renderCard()
    expect(screen.getByText('8.0')).toBeInTheDocument()
    expect(screen.getByText('OVERALL')).toBeInTheDocument()
  })

  it('links to the coffee evaluation detail page', () => {
    const { link } = renderCard()
    expect(link).toHaveAttribute('href', `/coffee/${sampleEvaluation.id}`)
  })

  it('applies interactive hover styling on the card container', () => {
    renderCard()
    const card = screen.getByTestId('coffee-card')
    expect(card).toHaveClass('group')
    expect(card).toHaveClass('hover:-translate-y-0.5')
  })

  describe('Bean Name Display', () => {
    it('displays only bean_name in heading when bean_name exists', () => {
      const evaluationWithBeanName = {
        ...sampleEvaluation,
        bean_name: 'イルガチェフェ G1',
      }
      renderCard({ evaluation: evaluationWithBeanName })

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('イルガチェフェ G1')
      expect(heading).not.toHaveTextContent(sampleEvaluation.bean_type)
    })

    it('displays bean_type in heading when bean_name is null (fallback)', () => {
      renderCard()

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent(sampleEvaluation.bean_type)
    })

    it('displays bean_type in heading when bean_name is empty string (fallback)', () => {
      const evaluationWithEmptyBeanName = {
        ...sampleEvaluation,
        bean_name: '',
      }
      renderCard({ evaluation: evaluationWithEmptyBeanName })

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent(sampleEvaluation.bean_type)
    })

    it('displays "産地不明" in heading when bean_name is empty and bean_type is "Unknown"', () => {
      const evaluationWithUnknownOrigin = {
        ...sampleEvaluation,
        bean_name: '',
        bean_type: 'Unknown',
      }
      renderCard({ evaluation: evaluationWithUnknownOrigin })

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('産地不明')
      expect(heading).not.toHaveTextContent('Unknown')
    })
  })
})
