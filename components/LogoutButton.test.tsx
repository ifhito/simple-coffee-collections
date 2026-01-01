import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoutButton } from './LogoutButton'

// Mock Server Action
jest.mock('@/lib/actions/auth', () => ({
  signOut: jest.fn(),
}))

const { signOut } = require('@/lib/actions/auth')

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders logout button', () => {
      render(<LogoutButton />)
      expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
    })

    it('renders with secondary variant by default', () => {
      render(<LogoutButton />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-600')
    })
  })

  describe('Logout Functionality', () => {
    it('calls signOut when clicked', async () => {
      const user = userEvent.setup()
      signOut.mockResolvedValue(undefined)

      render(<LogoutButton />)

      await user.click(screen.getByRole('button', { name: 'ログアウト' }))

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1)
      })
    })

    it('displays loading state during logout', async () => {
      const user = userEvent.setup()
      signOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<LogoutButton />)

      await user.click(screen.getByRole('button', { name: 'ログアウト' }))

      expect(screen.getByText('処理中...')).toBeInTheDocument()
    })
  })
})
