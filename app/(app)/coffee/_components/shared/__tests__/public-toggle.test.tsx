import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PublicToggle } from '../public-toggle'

describe('PublicToggle', () => {
  it('always shows "公開する" label regardless of state (unchecked)', () => {
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    expect(screen.getByText('公開する')).toBeInTheDocument()
  })

  it('always shows "公開する" label regardless of state (checked)', () => {
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    expect(screen.getByText('公開する')).toBeInTheDocument()
  })

  it('initial state matches defaultChecked prop (true)', () => {
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    expect(checkbox).toBeChecked()
  })

  it('initial state matches defaultChecked prop (false)', () => {
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    expect(checkbox).not.toBeChecked()
  })

  it('clicking toggle changes checked state', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    // Label remains "公開する" after toggling
    expect(screen.getByText('公開する')).toBeInTheDocument()
  })

  it('clicking toggle from checked to unchecked', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={true} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    expect(checkbox).toBeChecked()

    await user.click(checkbox)

    expect(checkbox).not.toBeChecked()
    // Label remains "公開する" after toggling
    expect(screen.getByText('公開する')).toBeInTheDocument()
  })

  it('hidden input value updates on state change', async () => {
    const user = userEvent.setup()
    const { container } = render(<PublicToggle defaultChecked={false} name="is_public" />)

    const hiddenInput = container.querySelector('input[type="hidden"][name="is_public"]') as HTMLInputElement
    expect(hiddenInput).toBeInTheDocument()
    expect(hiddenInput.value).toBe('false')

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    await user.click(checkbox)

    expect(hiddenInput.value).toBe('true')
  })

  it('is accessible via keyboard (Space key)', async () => {
    const user = userEvent.setup()
    render(<PublicToggle defaultChecked={false} name="is_public" />)

    const checkbox = screen.getByRole('checkbox', { name: '公開する' })
    checkbox.focus()
    expect(checkbox).toHaveFocus()

    await user.keyboard(' ')

    expect(checkbox).toBeChecked()
  })

  it('renders with correct name attribute for form submission', () => {
    const { container } = render(<PublicToggle defaultChecked={true} name="evaluation_public" />)

    const hiddenInput = container.querySelector('input[type="hidden"][name="evaluation_public"]')
    expect(hiddenInput).toBeInTheDocument()
  })
})
