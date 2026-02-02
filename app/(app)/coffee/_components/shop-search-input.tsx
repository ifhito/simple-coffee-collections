'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { searchShopAction } from '@/lib/actions/shop-search'
import type { ShopSearchResultDTO } from '@/lib/actions/shop-search'
import { ShopSearchDropdown } from './shop-search-dropdown'

/**
 * Shop data returned when a shop is selected
 */
export interface ShopSelection {
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

interface ShopSearchInputProps {
  /** Callback when a shop is selected or name is entered */
  onSelect: (shop: ShopSelection) => void
  /** Initial shop name value */
  initialValue?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Input label */
  label?: string
  /** Error message */
  error?: string
}

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3

/**
 * Shop Search Input Component
 *
 * Provides autocomplete functionality for shop name input.
 * Debounces search requests and shows dropdown with results.
 *
 * Features:
 * - 300ms debounce for search
 * - Minimum 3 characters to trigger search
 * - Keyboard navigation (↑↓ Enter Escape)
 * - Touch-friendly dropdown (44px min height)
 * - Manual input fallback (no selection required)
 */
export function ShopSearchInput({
  onSelect,
  initialValue = '',
  disabled = false,
  label = '店名',
  error,
}: ShopSearchInputProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [results, setResults] = useState<ShopSearchResultDTO[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      const response = await searchShopAction(query)
      if (response.success) {
        setResults(response.data)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(true) // Show "no results" message
      }
    })
  }, [])

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        performSearch(value)
      }, DEBOUNCE_MS)

      // Notify parent of manual input (without location data)
      onSelect({
        name: value,
        address: null,
        latitude: null,
        longitude: null,
      })
    },
    [performSearch, onSelect]
  )

  // Handle shop selection from dropdown
  const handleSelect = useCallback(
    (result: ShopSearchResultDTO) => {
      setInputValue(result.name)
      setIsOpen(false)
      setResults([])

      // Clear any pending search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Notify parent with full shop data
      onSelect({
        name: result.name,
        address: result.address,
        latitude: result.location?.latitude ?? null,
        longitude: result.location?.longitude ?? null,
      })
    },
    [onSelect]
  )

  // Handle blur - delay to allow click on dropdown
  const handleBlur = useCallback(() => {
    // Use setTimeout to allow click events on dropdown items
    setTimeout(() => {
      // Only close if focus has moved outside the container
      if (
        containerRef.current &&
        !containerRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false)
      }
    }, 200)
  }, [])

  // Handle focus - show results if available
  const handleFocus = useCallback(() => {
    if (results.length > 0 || inputValue.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true)
    }
  }, [results.length, inputValue.length])

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="店舗名を入力して検索"
        disabled={disabled}
        error={error}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />

      <ShopSearchDropdown
        results={results}
        onSelect={handleSelect}
        isLoading={isPending}
        isOpen={isOpen}
      />
    </div>
  )
}
