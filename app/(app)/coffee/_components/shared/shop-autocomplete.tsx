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
      <label htmlFor="shop-autocomplete-input" className="mb-1 block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id="shop-autocomplete-input"
        type="text"
        value={value}
        onChange={handleInputElementChange}
        onKeyDown={handleInputKeyDown}
        onFocus={openSuggestions}
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
