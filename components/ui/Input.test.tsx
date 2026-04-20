import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input field', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with label when provided', () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('renders email type input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password type input', () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input[type="password"]')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('Error State', () => {
    it('renders error message', () => {
      render(<Input error="Email is required" />)
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('applies error styles', () => {
      render(<Input error="Invalid email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-400')
    })

    it('displays error with aria-invalid', () => {
      render(<Input error="Invalid" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('opacity-50', 'cursor-not-allowed')
    })
  })

  describe('Required Field', () => {
    it('marks input as required', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('shows required indicator in label', () => {
      render(<Input label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onChange when value changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'test@example.com')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value when controlled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      const { rerender } = render(<Input value="" onChange={handleChange} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe('')

      await user.type(input, 'test')
      rerender(<Input value="test" onChange={handleChange} />)

      expect(input.value).toBe('test')
    })

    it('supports autofocus', () => {
      render(<Input autoFocus />)
      expect(screen.getByRole('textbox')).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('associates label with input using id', () => {
      render(<Input id="email-input" label="Email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('provides aria-describedby for error messages', () => {
      render(<Input id="email" error="Invalid email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'email-error')
    })
  })
})
