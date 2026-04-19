'use client'

import { useShopAutocompleteController } from './use-shop-autocomplete-controller'

type ShopAutocompleteProps = {
  value: string
  shopId: string | null
  onChange: (name: string, shopId: string | null) => void
  label?: string
}

export function ShopAutocomplete({
  value,
  shopId: _shopId,
  onChange,
  label = '店名',
}: ShopAutocompleteProps) {
  const {
    activeIndex,
    containerRef,
    isOpen,
    suggestions,
    handleInputElementChange,
    handleInputKeyDown,
    handleSelect,
    highlightSuggestion,
    openSuggestions,
  } = useShopAutocompleteController({ onChange })

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="shop-autocomplete-input" className="mb-1 block text-sm font-medium text-[var(--ink-2)]">
        {label}
      </label>
      <input
        id="shop-autocomplete-input"
        type="text"
        value={value}
        onChange={handleInputElementChange}
        onKeyDown={handleInputKeyDown}
        onFocus={openSuggestions}
        className="w-full rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30"
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
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-[var(--rule)] bg-[var(--paper)] shadow-[0_8px_24px_-8px_rgba(60,30,10,0.2)]"
        >
          {suggestions.map((s, index) => (
            <li
              key={s.id}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex
                  ? 'bg-[var(--background-2)] text-[var(--espresso)]'
                  : 'text-[var(--ink)] hover:bg-[var(--background-2)]'
              }`}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => highlightSuggestion(index)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
