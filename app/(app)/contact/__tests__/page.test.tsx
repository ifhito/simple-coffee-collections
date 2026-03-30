import { render, screen } from '@testing-library/react'
import ContactPage from '../page'

describe('ContactPage', () => {
  it('ページタイトルを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByRole('heading', { name: /お問い合わせ/i })).toBeInTheDocument()
  })

  it('連絡先の説明を表示する', () => {
    render(<ContactPage />)
    expect(screen.getAllByText(/GitHub/i).length).toBeGreaterThan(0)
  })

  it('GitHub Issues へのリンクを表示する', () => {
    render(<ContactPage />)
    const link = screen.getByRole('link', { name: /GitHub Issues/i })
    expect(link).toBeInTheDocument()
  })

  it('メールアドレスを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByText(/hito01010101\[at\]gmail\.com/i)).toBeInTheDocument()
  })
})
