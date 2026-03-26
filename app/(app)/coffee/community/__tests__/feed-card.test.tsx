import React from 'react'
import { render, screen } from '@testing-library/react'
import { FeedCard } from '../_components/feed-card'
import type { CoffeeEvaluationWithUser } from '@/lib/types/coffee'

const baseEvaluation: CoffeeEvaluationWithUser = {
  id: 'eval-1',
  user_id: 'user-123',
  display_name: '珈琲太郎',
  bean_name: 'エチオピア イルガチェフェ',
  bean_type: 'Ethiopia',
  roast_level: 'light',
  shop_name: 'Blue Bottle Coffee',
  acidity: 8,
  bitterness: 4,
  aroma: 9,
  overall_rating: 8,
  notes: 'フローラルな香りが際立つ。後味に甘みが残り非常に飲みやすい。',
  is_public: true,
  shop_id: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

describe('FeedCard', () => {
  it('notesがある場合に感想テキストを表示する', () => {
    render(<FeedCard evaluation={baseEvaluation} />)
    expect(screen.getByText(baseEvaluation.notes!)).toBeInTheDocument()
  })

  it('notesがnullの場合に感想エリアを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, notes: null }} />)
    expect(screen.queryByText(/フローラル/)).not.toBeInTheDocument()
  })

  it('roast_levelがある場合に日本語ラベルのバッジを表示する', () => {
    render(<FeedCard evaluation={baseEvaluation} />)
    expect(screen.getByText('浅煎り')).toBeInTheDocument()
  })

  it('roast_levelがnullの場合にバッジを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, roast_level: null }} />)
    expect(screen.queryByText('浅煎り')).not.toBeInTheDocument()
  })

  it('roast_levelが未知の値の場合そのまま表示する', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, roast_level: 'カスタム焙煎' }} />)
    expect(screen.getByText('カスタム焙煎')).toBeInTheDocument()
  })

  it('acidityがnullの場合に酸味バッジを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, acidity: null }} />)
    expect(screen.queryByText('酸味')).not.toBeInTheDocument()
  })

  it('bitternessがnullの場合に苦味バッジを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, bitterness: null }} />)
    expect(screen.queryByText('苦味')).not.toBeInTheDocument()
  })

  it('aromaがnullの場合に香りバッジを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, aroma: null }} />)
    expect(screen.queryByText('香り')).not.toBeInTheDocument()
  })

  it('overall_ratingがnullの場合に総合バッジを表示しない', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, overall_rating: null }} />)
    expect(screen.queryByText('総合')).not.toBeInTheDocument()
  })

  it('ユーザーリンクが/users/{user_id}に向く', () => {
    render(<FeedCard evaluation={baseEvaluation} />)
    const userLink = screen.getByRole('link', { name: /珈琲太郎/i })
    expect(userLink).toHaveAttribute('href', '/users/user-123')
  })

  it('詳細リンクが/coffee/{id}に向く', () => {
    render(<FeedCard evaluation={baseEvaluation} />)
    const detailLink = screen.getByRole('link', { name: /詳細を見る/i })
    expect(detailLink).toHaveAttribute('href', '/coffee/eval-1')
  })

  it('display_nameがnullの場合に「匿名ユーザー」を表示する', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, display_name: null }} />)
    expect(screen.getByText('匿名ユーザー')).toBeInTheDocument()
  })

  it('bean_nameがない場合にbean_typeを表示する', () => {
    render(<FeedCard evaluation={{ ...baseEvaluation, bean_name: '' }} />)
    expect(screen.getByRole('heading', { name: 'Ethiopia' })).toBeInTheDocument()
  })
})
