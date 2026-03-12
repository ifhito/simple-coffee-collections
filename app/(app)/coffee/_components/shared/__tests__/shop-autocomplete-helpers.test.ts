import {
  buildShopSearchUrl,
  getNextActiveIndex,
  shouldShowSuggestions,
} from '../shop-autocomplete-helpers'

describe('shop-autocomplete-helpers', () => {
  it('builds a search URL with encoded query', () => {
    expect(buildShopSearchUrl('Glitch Coffee & Roasters'))
      .toBe('/api/shops/search?q=Glitch%20Coffee%20%26%20Roasters&limit=10')
  })

  it('returns next index and wraps to the first suggestion', () => {
    expect(getNextActiveIndex(-1, 3, 'next')).toBe(0)
    expect(getNextActiveIndex(1, 3, 'next')).toBe(2)
    expect(getNextActiveIndex(2, 3, 'next')).toBe(0)
  })

  it('returns previous index and wraps to the last suggestion', () => {
    expect(getNextActiveIndex(0, 3, 'previous')).toBe(2)
    expect(getNextActiveIndex(2, 3, 'previous')).toBe(1)
  })

  it('hides suggestions when query is blank or results are empty', () => {
    expect(shouldShowSuggestions('', 3)).toBe(false)
    expect(shouldShowSuggestions('Onibus', 0)).toBe(false)
    expect(shouldShowSuggestions('Onibus', 2)).toBe(true)
  })
})
