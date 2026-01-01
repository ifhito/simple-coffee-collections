import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockSearchParams = new URLSearchParams()
const mockPush = jest.fn()

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

import { SearchAndSort } from '../../_components/list/search-and-sort'

describe('SearchAndSort integration (mocked router)', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockPush.mockReset()
    setSearchParams('')
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('persists search/sort from URL and updates URL on interactions', async () => {
    const user = userEvent.setup({ delay: null })

    // initial render with existing params
    setSearchParams('search=espresso&sort=rating_desc')
    render(<SearchAndSort />)
    expect(screen.getByRole('textbox', { name: /検索/i })).toHaveValue('espresso')
    expect(screen.getByRole('combobox', { name: /並び順/i })).toHaveValue('rating_desc')

    // user types new search -> debounced push
    await user.clear(screen.getByRole('textbox', { name: /検索/i }))
    await user.type(screen.getByRole('textbox', { name: /検索/i }), 'Kenya')
    act(() => {
      jest.advanceTimersByTime(299)
    })
    expect(mockPush).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockPush).toHaveBeenCalledWith('/coffee?search=Kenya&sort=rating_desc')

    // sort change preserves latest search
    await user.selectOptions(screen.getByRole('combobox', { name: /並び順/i }), 'shop_name_asc')
    expect(mockPush).toHaveBeenCalledWith('/coffee?search=Kenya&sort=shop_name_asc')

    // simulate page reload with new params
    mockPush.mockReset()
    setSearchParams('search=Kenya&sort=shop_name_asc')
    const { getAllByRole, getAllByLabelText } = render(<SearchAndSort />)
    expect(getAllByLabelText(/検索/i)[0]).toHaveValue('Kenya')
    expect(getAllByRole('combobox', { name: /並び順/i })[0]).toHaveValue('shop_name_asc')
  })
})
