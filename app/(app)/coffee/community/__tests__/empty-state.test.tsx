import { render, screen } from '@testing-library/react'
import { CommunityView } from '../_components/view'

describe('Community Feed empty state', () => {
  it('shows empty message when no public evaluations', () => {
    render(<CommunityView evaluations={[]} />)

    expect(screen.getByText('まだ公開評価がありません')).toBeInTheDocument()
  })
})
