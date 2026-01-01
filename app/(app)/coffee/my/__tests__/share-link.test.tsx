import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('../_components/copy-profile-link-button', () => ({
  CopyProfileLinkButton: ({ url }: { url: string }) => (
    <button data-testid="copy-profile-link" data-url={url}>
      プロフィールリンクをコピー
    </button>
  ),
}))

import { MyPageView } from '../_components/view'

const sampleEvaluation = {
  id: 'eval-1',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  roast_level: 'Light',
  acidity: 8,
  bitterness: 3,
  aroma: 9,
  overall_rating: 8,
  is_public: true,
  user_id: 'user-1',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

describe('MyPageView profile share integration (RED)', () => {
  it('renders copy profile link button with provided URL', () => {
    // @ts-expect-error profileShareUrl to be added in implementation
    render(<MyPageView evaluations={[sampleEvaluation] as any} profileShareUrl="https://example.com/users/user-1" />)

    const copyButton = screen.getByTestId('copy-profile-link')
    expect(copyButton).toBeInTheDocument()
    expect(copyButton).toHaveAttribute('data-url', 'https://example.com/users/user-1')
  })
})
