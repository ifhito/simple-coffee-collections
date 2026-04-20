import { render, screen } from '@testing-library/react'
import CompanyPage from '../page'

describe('CompanyPage', () => {
  it('ページタイトルを表示する', () => {
    render(<CompanyPage />)
    expect(screen.getByRole('heading', { name: /企業情報/i })).toBeInTheDocument()
  })

  it('サービス名を表示する', () => {
    render(<CompanyPage />)
    expect(screen.getByText(/Simple Coffee Collections/i)).toBeInTheDocument()
  })

  it('運営者情報を表示する', () => {
    render(<CompanyPage />)
    expect(screen.getByText(/運営者/i)).toBeInTheDocument()
  })

  it('お問い合わせページへのリンクを表示する', () => {
    render(<CompanyPage />)
    const link = screen.getByRole('link', { name: /お問い合わせ/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/contact')
  })
})
