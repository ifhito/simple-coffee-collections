/** @jest-environment node */

jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: (...args: any[]) => any) => {
      const memo = new Map<string, any>()
      return (...args: any[]) => {
        const key = JSON.stringify(args)
        if (memo.has(key)) {
          return memo.get(key)
        }
        const result = fn(...args)
        memo.set(key, result)
        return result
      }
    },
  }
})

import { ShopLocation } from '@/lib/domain/value-objects/shop-location'
import { ShopSearchResult } from '@/lib/domain/value-objects/shop-search-result'
import { cachedSearchShopAction } from '@/lib/api/shop-search'
import { searchShopAction } from '@/lib/actions/shop-search'
import { SearchShopUseCase } from '@/lib/application/use-cases/search-shop-use-case'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({}),
}))

jest.mock('@/lib/infrastructure/rate-limiter/supabase-rate-limiter', () => ({
  SupabaseRateLimiter: jest.fn().mockImplementation(() => ({
    canMakeRequest: jest.fn(),
    waitUntilReady: jest.fn(),
    recordRequest: jest.fn(),
  })),
}))

jest.mock('@/lib/infrastructure/nominatim/nominatim-client', () => ({
  createNominatimClient: jest.fn().mockReturnValue({
    search: jest.fn(),
    canMakeRequest: jest.fn(),
  }),
}))

jest.mock('@/lib/infrastructure/repositories/supabase-shop-repository', () => ({
  SupabaseShopRepository: jest.fn().mockImplementation(() => ({
    findExistingShops: jest.fn(),
  })),
}))

const executeMock = jest.fn()

jest.mock('@/lib/application/use-cases/search-shop-use-case', () => ({
  SearchShopUseCase: jest.fn().mockImplementation(() => ({
    execute: executeMock,
  })),
  SEARCH_QUERY_CONSTRAINTS: { MIN_LENGTH: 3, MAX_LENGTH: 100 },
}))

describe('searchShopAction integration', () => {
  beforeEach(() => {
    executeMock.mockReset()
    ;(SearchShopUseCase as jest.Mock).mockClear()
  })

  it('returns validation error for short queries', async () => {
    const response = await searchShopAction('ab')

    expect(response.success).toBe(false)
    if (!response.success) {
      expect(response.error).toContain('3')
    }
  })

  it('returns validation error for long queries', async () => {
    const response = await searchShopAction('a'.repeat(101))

    expect(response.success).toBe(false)
    if (!response.success) {
      expect(response.error).toContain('100')
    }
  })

  it('returns DTO results for valid queries', async () => {
    const location = ShopLocation.fromPrimitive(35.1, 139.1)
    executeMock.mockResolvedValue([
      ShopSearchResult.fromPrimitive('Mock Cafe', '東京都渋谷区', location, 'database'),
    ])

    const response = await searchShopAction('Mock Cafe')

    expect(response.success).toBe(true)
    if (response.success) {
      expect(response.data[0]).toEqual({
        name: 'Mock Cafe',
        address: '東京都渋谷区',
        location: { latitude: 35.1, longitude: 139.1 },
        source: 'database',
        displayText: 'Mock Cafe - 東京都渋谷区',
      })
    }
  })

  it('memoizes identical queries within a request', async () => {
    executeMock.mockResolvedValue([])

    await cachedSearchShopAction('Mock Cafe')
    await cachedSearchShopAction('Mock Cafe')

    expect(executeMock).toHaveBeenCalledTimes(1)
  })
})
