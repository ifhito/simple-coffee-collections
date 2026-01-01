import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './SignupForm'

// Mock Server Action
jest.mock('@/lib/actions/auth', () => ({
  signUp: jest.fn(),
}))

const { signUp } = require('@/lib/actions/auth')

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders signup form with all fields', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeInTheDocument()
    })

    it('renders link to login page', () => {
      render(<SignupForm />)

      const loginLink = screen.getByText('ログインはこちら')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    })

    it('marks email and password fields as required', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeRequired()
      expect(screen.getByLabelText(/パスワード/)).toBeRequired()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid credentials', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue(undefined) // Success case

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

      await waitFor(() => {
        expect(signUp).toHaveBeenCalled()
      })
    })

    it('displays loading state during submission', async () => {
      const user = userEvent.setup()
      signUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

      expect(screen.getByText('処理中...')).toBeInTheDocument()
    })

    it('displays error message when signup fails', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: 'メールアドレスは既に登録されています' })

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

      await waitFor(() => {
        expect(screen.getByText('メールアドレスは既に登録されています')).toBeInTheDocument()
      })
    })

    it('clears error message when user starts typing', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: 'エラーが発生しました' })

      render(<SignupForm />)

      // Trigger error
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

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

      render(<SignupForm />)

      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

      // HTML5 validation should prevent submission
      expect(signUp).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
    })

    it('displays error with proper ARIA attributes', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: 'エラー' })

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')
      await user.click(screen.getByRole('button', { name: 'アカウント作成' }))

      await waitFor(() => {
        const errorElement = screen.getByText('エラー')
        expect(errorElement).toHaveAttribute('role', 'alert')
      })
    })
  })
})
