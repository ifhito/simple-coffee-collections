'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type ShopSuggestion = {
  id: string
  name: string
}

type ShopAutocompleteProps = {
  value: string
  shopId: string | null
  onChange: (name: string, shopId: string | null) => void
  label?: string
}

const DEBOUNCE_MS = 300

export function ShopAutocomplete({
  value,
  shopId,
  onChange,
  label = '店名',
}: ShopAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ShopSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    try {
      const res = await fetch(
        `/api/shops/search?q=${encodeURIComponent(query)}&limit=10`
      )
      if (!res.ok) return
      const data: ShopSuggestion[] = await res.json()
      setSuggestions(data)
      setIsOpen(data.length > 0)
      setActiveIndex(-1)
    } catch {
      // silently fail
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue, null) // free-typed → clear shopId

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, DEBOUNCE_MS)
  }

  const handleSelect = (suggestion: ShopSuggestion) => {
    onChange(suggestion.name, suggestion.id)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="shop-autocomplete-input" className="mb-1 block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id="shop-autocomplete-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true)
        }}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="shop-suggestions"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul
          id="shop-suggestions"
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg"
        >
          {suggestions.map((s, index) => (
            <li
              key={s.id}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-neutral-800 hover:bg-neutral-50'
              }`}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
