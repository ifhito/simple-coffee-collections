import { render, screen, fireEvent } from '@testing-library/react'
import { ShopSearchDropdown } from '@/app/(app)/coffee/_components/shop-search-dropdown'

const results = [
  {
    name: 'Mock Cafe',
    address: '東京都渋谷区',
    location: { latitude: 35.1, longitude: 139.1 },
    source: 'nominatim' as const,
    displayText: 'Mock Cafe - 東京都渋谷区',
  },
  {
    name: 'Local Shop',
    address: null,
    location: null,
    source: 'database' as const,
    displayText: 'Local Shop',
  },
]

describe('ShopSearchDropdown', () => {
  it('renders results list with names and addresses', () => {
    render(
      <ShopSearchDropdown
        results={results}
        onSelect={jest.fn()}
        isLoading={false}
        isOpen
      />
    )

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Mock Cafe')).toBeInTheDocument()
    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument()
    expect(screen.getByText('Local Shop')).toBeInTheDocument()
  })

  it('calls onSelect when clicking a result', () => {
    const onSelect = jest.fn()

    render(
      <ShopSearchDropdown
        results={results}
        onSelect={onSelect}
        isLoading={false}
        isOpen
      />
    )

    fireEvent.click(screen.getByText('Mock Cafe'))
    expect(onSelect).toHaveBeenCalledWith(results[0])
  })

  it('supports keyboard navigation with Enter', () => {
    const onSelect = jest.fn()

    render(
      <ShopSearchDropdown
        results={results}
        onSelect={onSelect}
        isLoading={false}
        isOpen
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowDown' })
    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith(results[0])
  })

  it('shows empty state message when no results', () => {
    render(
      <ShopSearchDropdown
        results={[]}
        onSelect={jest.fn()}
        isLoading={false}
        isOpen
      />
    )

    expect(
      screen.getByText('候補が見つかりませんでした。手入力で追加できます。')
    ).toBeInTheDocument()
  })

  it('uses touch-friendly target sizes', () => {
    render(
      <ShopSearchDropdown
        results={results}
        onSelect={jest.fn()}
        isLoading={false}
        isOpen
      />
    )

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveClass('min-h-[44px]')
  })
})
