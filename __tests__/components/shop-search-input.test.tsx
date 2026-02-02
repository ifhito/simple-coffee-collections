import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShopSearchInput } from '@/app/(app)/coffee/_components/shop-search-input'

const mockSearch = jest.fn()

jest.mock('@/lib/api/shop-search', () => ({
  cachedSearchShopAction: (...args: any[]) => mockSearch(...args),
}))

const sampleResults = [
  {
    name: 'Mock Cafe',
    address: '東京都渋谷区',
    location: { latitude: 35.1, longitude: 139.1 },
    source: 'nominatim' as const,
    displayText: 'Mock Cafe - 東京都渋谷区',
  },
]

describe('ShopSearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockSearch.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces search and displays results', async () => {
    mockSearch.mockResolvedValue({ success: true, data: sampleResults })
    const onSelect = jest.fn()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(<ShopSearchInput onSelect={onSelect} />)

    const input = screen.getByLabelText('店名')
    await user.type(input, 'Mock Cafe')

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => expect(mockSearch).toHaveBeenCalledWith('Mock Cafe'))
    expect(await screen.findByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Mock Cafe'))

    expect(onSelect).toHaveBeenLastCalledWith({
      name: 'Mock Cafe',
      address: '東京都渋谷区',
      latitude: 35.1,
      longitude: 139.1,
    })
  })

  it('does not search for queries shorter than 3 characters', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(<ShopSearchInput onSelect={onSelect} />)

    const input = screen.getByLabelText('店名')
    await user.type(input, 'ab')

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(mockSearch).not.toHaveBeenCalled()
  })

  it('shows loading state while searching', async () => {
    let resolveSearch: (value: any) => void
    const pendingPromise = new Promise((resolve) => {
      resolveSearch = resolve
    })

    mockSearch.mockReturnValue(pendingPromise)

    const onSelect = jest.fn()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(<ShopSearchInput onSelect={onSelect} />)

    const input = screen.getByLabelText('店名')
    await user.type(input, 'Mock Cafe')

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(await screen.findByText('検索中...')).toBeInTheDocument()

    resolveSearch!({ success: true, data: sampleResults })
  })
})
