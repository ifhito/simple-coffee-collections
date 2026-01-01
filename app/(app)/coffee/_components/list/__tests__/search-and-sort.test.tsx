import { fireEvent, render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
let mockSearchParams = new URLSearchParams()

const setSearchParams = (value: string) => {
  mockSearchParams = new URLSearchParams(value)
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/coffee',
}))

import { SearchAndSort } from '../search-and-sort'

describe('SearchAndSort', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockPush.mockReset()
    setSearchParams('')
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('prefills search and sort state from URL params', () => {
    setSearchParams('search=espresso&sort=rating_desc')

    render(<SearchAndSort />)

    expect(screen.getByRole('textbox', { name: /検索/i })).toHaveValue('espresso')
    expect(screen.getByRole('combobox', { name: /並び順/i })).toHaveValue('rating_desc')
  })

  it('debounces search input and updates URL after 300ms', async () => {
    const user = userEvent.setup({ delay: null })
    render(<SearchAndSort />)

    await user.type(screen.getByRole('textbox', { name: /検索/i }), 'Kenya')

    act(() => {
      jest.advanceTimersByTime(299)
    })
    expect(mockPush).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockPush).toHaveBeenCalledWith('/coffee?search=Kenya&sort=created_at_desc')
  })

  it('updates sort option and preserves existing search query', () => {
    setSearchParams('search=Kenya')
    render(<SearchAndSort />)

    fireEvent.change(screen.getByRole('combobox', { name: /並び順/i }), {
      target: { value: 'rating_desc' },
    })

    expect(mockPush).toHaveBeenCalledWith('/coffee?search=Kenya&sort=rating_desc')
  })

  it('shows all sort options', () => {
    render(<SearchAndSort />)
    const select = screen.getByRole('combobox', { name: /並び順/i })

    const options = Array.from(select.querySelectorAll('option')).map((opt) => opt.value)
    expect(options).toEqual([
      'created_at_desc',
      'created_at_asc',
      'rating_desc',
      'rating_asc',
      'shop_name_asc',
      'shop_name_desc',
    ])
  })
})
