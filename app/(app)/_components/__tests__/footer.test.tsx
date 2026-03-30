import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  it('企業情報へのリンクを表示する', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /企業情報/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/company')
  })

  it('お問い合わせへのリンクを表示する', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /お問い合わせ/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/contact')
  })

  it('コピーライト表記を表示する', () => {
    render(<Footer />)
    expect(screen.getByText(/Coffee Collections/i)).toBeInTheDocument()
  })
})
