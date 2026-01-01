import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PublicToggle } from '../public-toggle'

describe('PublicToggle', () => {
  it('initial state matches defaultChecked prop (true)', () => {
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    expect(checkbox).toBeChecked()
  })

  it('initial state matches defaultChecked prop (false)', () => {
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    expect(checkbox).not.toBeChecked()
  })

  it('label shows "🌐 公開" emoji when checked', () => {
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    expect(screen.getByText(/🌐.*公開/i)).toBeInTheDocument()
  })

  it('label shows "🔒 非公開" emoji when unchecked', () => {
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    expect(screen.getByText(/🔒.*非公開/i)).toBeInTheDocument()
  })

  it('clicking toggle updates state and label from unchecked to checked', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    
    // Initially unchecked with private label
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText(/🔒.*非公開/i)).toBeInTheDocument()

    // Click to toggle
    await user.click(checkbox)

    // Now checked with public label
    expect(checkbox).toBeChecked()
    expect(screen.getByText(/🌐.*公開/i)).toBeInTheDocument()
  })

  it('clicking toggle updates state and label from checked to unchecked', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    
    // Initially checked with public label
    expect(checkbox).toBeChecked()
    expect(screen.getByText(/🌐.*公開/i)).toBeInTheDocument()

    // Click to toggle
    await user.click(checkbox)

    // Now unchecked with private label
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText(/🔒.*非公開/i)).toBeInTheDocument()
  })

  it('hidden input value updates on state change', async () => {
    const user = userEvent.setup()
    const { container } = render(<PublicToggle defaultChecked={false} name="is_public" />)

    // Find hidden input by name
    const hiddenInput = container.querySelector('input[type="hidden"][name="is_public"]') as HTMLInputElement
    expect(hiddenInput).toBeInTheDocument()
    expect(hiddenInput.value).toBe('false')

    // Click checkbox to toggle
    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    await user.click(checkbox)

    // Hidden input should now be 'true'
    expect(hiddenInput.value).toBe('true')
  })

  it('is accessible via keyboard (Space key)', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: /公開/i })
    
    // Focus on checkbox
    checkbox.focus()
    expect(checkbox).toHaveFocus()

    // Press Space to toggle
    await user.keyboard(' ')

    // Should be checked now
    expect(checkbox).toBeChecked()
  })

  it('renders with correct name attribute for form submission', () => {
    const { container } = render(<PublicToggle defaultChecked={true} name="evaluation_public" />)

    const hiddenInput = container.querySelector('input[type="hidden"][name="evaluation_public"]')
    expect(hiddenInput).toBeInTheDocument()
  })
})
