import { render, screen } from '@testing-library/react'
import { MyPageView } from '../_components/view'

describe('My Page empty state', () => {
  it('shows empty message and link when no evaluations', () => {
    render(<MyPageView evaluations={[]} />)

    expect(screen.getByText('まだ評価がありません')).toBeInTheDocument()
    const createLink = screen.getByRole('link', { name: '新規評価' })
    expect(createLink).toHaveAttribute('href', '/coffee/new')
  })
})
