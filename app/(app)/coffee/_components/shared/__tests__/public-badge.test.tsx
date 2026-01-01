import { render, screen } from '@testing-library/react'
import { PublicBadge } from '../public-badge'

describe('PublicBadge', () => {
  it('displays "🌐 公開" with green styling when isPublic is true', () => {
    render(<PublicBadge isPublic={true} />)

    const badge = screen.getByText(/🌐 公開/i)
    expect(badge).toBeInTheDocument()

    // Check for green color classes
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })

  it('displays "🔒 非公開" with gray styling when isPublic is false', () => {
    render(<PublicBadge isPublic={false} />)

    const badge = screen.getByText(/🔒 非公開/i)
    expect(badge).toBeInTheDocument()

    // Check for gray color classes
    expect(badge).toHaveClass('bg-gray-100')
    expect(badge).toHaveClass('text-gray-800')
  })

  it('has correct positioning (absolute bottom-right)', () => {
    const { container } = render(<PublicBadge isPublic={true} />)

    const badge = screen.getByText(/🌐 公開/i)

    // Check for positioning classes
    expect(badge).toHaveClass('absolute')
    expect(badge).toHaveClass('bottom-2')
    expect(badge).toHaveClass('right-2')
  })

  it('has correct badge styling (padding, rounded, text size)', () => {
    render(<PublicBadge isPublic={true} />)

    const badge = screen.getByText(/🌐 公開/i)

    // Check for badge style classes
    expect(badge).toHaveClass('px-2')
    expect(badge).toHaveClass('py-1')
    expect(badge).toHaveClass('rounded')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-medium')
  })
})
