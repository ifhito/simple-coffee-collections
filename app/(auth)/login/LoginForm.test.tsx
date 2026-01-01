import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

// Mock Server Action
jest.mock('@/lib/actions/auth', () => ({
  signIn: jest.fn(),
}))

const { signIn } = require('@/lib/actions/auth')

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form with all fields', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('renders link to signup page', () => {
      render(<LoginForm />)

      const signupLink = screen.getByText('アカウント作成はこちら')
      expect(signupLink).toBeInTheDocument()
      expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
    })

    it('marks email and password fields as required', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeRequired()
      expect(screen.getByLabelText(/パスワード/)).toBeRequired()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid credentials', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue(undefined) // Success case

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        expect(signIn).toHaveBeenCalled()
      })
    })

    it('displays loading state during submission', async () => {
      const user = userEvent.setup()
      signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      expect(screen.getByText('処理中...')).toBeInTheDocument()
    })

    it('displays error message when login fails', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue({ error: 'メールアドレスまたはパスワードが正しくありません' })

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument()
      })
    })

    it('clears error message when user starts typing', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue({ error: 'エラーが発生しました' })

      render(<LoginForm />)

      // Trigger error
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Start typing to clear error
      await user.type(screen.getByLabelText(/メールアドレス/), 'a')

      expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('prevents submission with empty fields', async () => {
      const user = userEvent.setup()

      render(<LoginForm />)

      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      // HTML5 validation should prevent submission
      expect(signIn).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
    })

    it('displays error with proper ARIA attributes', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue({ error: 'エラー' })

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        const errorElement = screen.getByText('エラー')
        expect(errorElement).toHaveAttribute('role', 'alert')
      })
    })
  })
})
