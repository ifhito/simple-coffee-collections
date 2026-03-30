import { render, screen } from '@testing-library/react'
import ContactPage from '../page'

// resend が TextEncoder を使うため jsdom 環境でモックが必要
jest.mock('@/lib/actions/contact', () => ({
  sendContactEmail: jest.fn(),
}))

jest.mock('../_components/contact-form', () => ({
  ContactForm: () => <div data-testid="contact-form">contact form</div>,
}))

describe('ContactPage', () => {
  it('ページタイトルを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByRole('heading', { name: /お問い合わせ/i, level: 1 })).toBeInTheDocument()
  })

  it('説明文を表示する', () => {
    render(<ContactPage />)
    expect(screen.getByText(/フォームよりご連絡ください/i)).toBeInTheDocument()
  })

  it('メール問い合わせセクションの見出しを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByRole('heading', { name: /メールで直接お問い合わせ/i })).toBeInTheDocument()
  })

  it('お問い合わせフォームを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
  })

  it('注意書きを表示する', () => {
    render(<ContactPage />)
    expect(screen.getByText(/個人が運営/i)).toBeInTheDocument()
  })
})
