import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders with primary variant by default', () => {
      render(<Button>Primary Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('rounded-full')
    })

    it('renders with secondary variant when specified', () => {
      render(<Button variant="secondary">Secondary Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('rounded-full', 'border')
    })

    it('renders with full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })
  })

  describe('Disabled State', () => {
    it('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button disabled onClick={handleClick}>Click</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('renders loading state', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('処理中...')
    })

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button loading onClick={handleClick}>Submit</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports button type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>)
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
    })
  })
})
