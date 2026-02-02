'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ShopSearchResultDTO } from '@/lib/actions/shop-search'

interface ShopSearchDropdownProps {
  results: ShopSearchResultDTO[]
  onSelect: (result: ShopSearchResultDTO) => void
  isLoading: boolean
  isOpen: boolean
}

/**
 * Shop Search Dropdown Component
 *
 * Displays search results in a dropdown list with keyboard navigation.
 * Touch-friendly with 44px minimum height for touch targets.
 */
export function ShopSearchDropdown({
  results,
  onSelect,
  isLoading,
  isOpen,
}: ShopSearchDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [results])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            onSelect(results[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setSelectedIndex(-1)
          break
      }
    },
    [isOpen, results, selectedIndex, onSelect]
  )

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  // Loading state
  if (isLoading) {
    return (
      <div
        className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center px-4 py-3 text-sm text-gray-500">
          <svg
            className="mr-2 h-4 w-4 animate-spin text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          検索中...
        </div>
      </div>
    )
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
        <div className="px-4 py-3 text-sm text-gray-500">
          候補が見つかりませんでした。手入力で追加できます。
        </div>
      </div>
    )
  }

  // Results list
  return (
    <ul
      ref={listRef}
      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
      role="listbox"
      aria-label="店舗検索結果"
    >
      {results.map((result, index) => (
        <li
          key={`${result.name}-${index}`}
          role="option"
          aria-selected={index === selectedIndex}
          className={`
            min-h-[44px] cursor-pointer px-4 py-3 text-sm
            ${
              index === selectedIndex
                ? 'bg-amber-50 text-amber-900'
                : 'text-gray-800 hover:bg-gray-50'
            }
            ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}
          `}
          onClick={() => onSelect(result)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="font-medium">{result.name}</div>
          {result.address && (
            <div className="mt-0.5 text-xs text-gray-500">{result.address}</div>
          )}
          {result.source === 'nominatim' && (
            <span className="mt-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
              地図データ
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
