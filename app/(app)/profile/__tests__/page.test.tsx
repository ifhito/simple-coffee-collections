import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUpdateProfile = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockAuthGetUser = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      from: mockFrom.mockReturnThis(),
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle,
      auth: {
        getUser: mockAuthGetUser,
      },
    }),
}))

jest.mock('@/lib/actions/profile', () => ({
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}))

// Lazy import after mocks
import ProfilePage from '../page'

const sampleProfile = {
  id: 'user-1',
  display_name: 'Alice',
  bio: 'Coffee lover',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: sampleProfile, error: null })
  })

  it('fetches profile and prefills form fields', async () => {
    const ui = await ProfilePage()
    render(ui)

    expect(mockFrom).toHaveBeenCalledWith('user_profiles')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('id', 'user-1')

    expect(screen.getByLabelText(/表示名/i)).toHaveValue(sampleProfile.display_name)
    expect(screen.getByLabelText(/自己紹介/i)).toHaveValue(sampleProfile.bio)
  })

  it('submits updateProfile action with form data', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    const ui = await ProfilePage()
    render(ui)

    await user.clear(screen.getByLabelText(/表示名/i))
    await user.type(screen.getByLabelText(/表示名/i), 'Bob')
    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(mockUpdateProfile).toHaveBeenCalledWith(expect.any(FormData))
    const formData = mockUpdateProfile.mock.calls[0][0] as FormData
    expect(formData.get('display_name')).toBe('Bob')
  })

  it('validates max lengths and blocks submit when invalid', async () => {
    const user = userEvent.setup()
    const ui = await ProfilePage()
    render(ui)

    const longName = 'x'.repeat(101)
    await user.clear(screen.getByLabelText(/表示名/i))
    await user.type(screen.getByLabelText(/表示名/i), longName)
    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(await screen.findByText(/表示名は100文字以内/i)).toBeInTheDocument()
    expect(mockUpdateProfile).not.toHaveBeenCalled()
  })

  it('shows success message after successful update', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    const ui = await ProfilePage()
    render(ui)

    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(await screen.findByText(/保存しました/i)).toBeInTheDocument()
  })
})
