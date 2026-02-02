/**
 * SearchShopUseCase Tests
 *
 * @module __tests__/application/use-cases/search-shop-use-case.test
 */

import {
  SearchShopUseCase,
  SEARCH_QUERY_CONSTRAINTS,
} from '@/lib/application/use-cases/search-shop-use-case'
import { ShopSearchResult } from '@/lib/domain/value-objects/shop-search-result'
import type { IShopRepository } from '@/lib/infrastructure/repositories/shop-repository.interface'
import type { INominatimClient } from '@/lib/infrastructure/nominatim/nominatim-types'

describe('SearchShopUseCase', () => {
  // Mock implementations
  let mockShopRepository: jest.Mocked<IShopRepository>
  let mockNominatimClient: jest.Mocked<INominatimClient>
  let useCase: SearchShopUseCase

  beforeEach(() => {
    mockShopRepository = {
      findExistingShops: jest.fn(),
    }

    mockNominatimClient = {
      search: jest.fn(),
      canMakeRequest: jest.fn(),
    }

    useCase = new SearchShopUseCase(mockShopRepository, mockNominatimClient)
  })

  describe('execute', () => {
    it('should search database first', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェB', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェC', null, null, 'database'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)

      const results = await useCase.execute('カフェ')

      expect(mockShopRepository.findExistingShops).toHaveBeenCalledWith('カフェ', 5)
      expect(results).toHaveLength(3)
      expect(results[0].source).toBe('database')
    })

    it('should NOT call Nominatim API when DB results >= 3', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェB', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェC', null, null, 'database'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)

      await useCase.execute('カフェ')

      expect(mockNominatimClient.search).not.toHaveBeenCalled()
    })

    it('should call Nominatim API when DB results < 3', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェB', null, null, 'database'),
      ]
      const apiResults = [
        ShopSearchResult.fromPrimitive('カフェC', '東京都', null, 'nominatim'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)
      mockNominatimClient.search.mockResolvedValue(apiResults)

      const results = await useCase.execute('カフェ')

      expect(mockNominatimClient.search).toHaveBeenCalledWith('カフェ', {
        limit: 3, // 5 - 2 = 3
        countrycodes: 'jp',
        'accept-language': 'ja',
        amenity: 'cafe,restaurant',
      })
      expect(results).toHaveLength(3)
    })

    it('should deduplicate results by name (case-insensitive)', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('Starbucks', null, null, 'database'),
      ]
      const apiResults = [
        ShopSearchResult.fromPrimitive('starbucks', '東京都', null, 'nominatim'),
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'nominatim'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)
      mockNominatimClient.search.mockResolvedValue(apiResults)

      const results = await useCase.execute('star')

      // Should deduplicate "Starbucks" and "starbucks"
      expect(results).toHaveLength(2)
      expect(results.map((r) => r.name)).toContain('Starbucks')
      expect(results.map((r) => r.name)).toContain('カフェA')
    })

    it('should return max 5 results', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェ1', null, null, 'database'),
        ShopSearchResult.fromPrimitive('カフェ2', null, null, 'database'),
      ]
      const apiResults = [
        ShopSearchResult.fromPrimitive('カフェ3', null, null, 'nominatim'),
        ShopSearchResult.fromPrimitive('カフェ4', null, null, 'nominatim'),
        ShopSearchResult.fromPrimitive('カフェ5', null, null, 'nominatim'),
        ShopSearchResult.fromPrimitive('カフェ6', null, null, 'nominatim'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)
      mockNominatimClient.search.mockResolvedValue(apiResults)

      const results = await useCase.execute('カフェ')

      expect(results).toHaveLength(5)
    })

    it('should prefer database results over API results for duplicates', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('スターバックス', null, null, 'database'),
      ]
      const apiResults = [
        ShopSearchResult.fromPrimitive('スターバックス', '東京都', null, 'nominatim'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)
      mockNominatimClient.search.mockResolvedValue(apiResults)

      const results = await useCase.execute('スター')

      expect(results).toHaveLength(1)
      expect(results[0].source).toBe('database')
    })
  })

  describe('query validation', () => {
    it('should throw error for query less than 3 characters', async () => {
      await expect(useCase.execute('ab')).rejects.toThrow(
        `${SEARCH_QUERY_CONSTRAINTS.MIN_LENGTH}文字以上`
      )
    })

    it('should throw error for query more than 100 characters', async () => {
      const longQuery = 'a'.repeat(101)

      await expect(useCase.execute(longQuery)).rejects.toThrow(
        `${SEARCH_QUERY_CONSTRAINTS.MAX_LENGTH}文字以内`
      )
    })

    it('should accept query with exactly 3 characters', async () => {
      mockShopRepository.findExistingShops.mockResolvedValue([])
      mockNominatimClient.search.mockResolvedValue([])

      await expect(useCase.execute('abc')).resolves.toBeDefined()
    })

    it('should accept query with exactly 100 characters', async () => {
      const query = 'a'.repeat(100)
      mockShopRepository.findExistingShops.mockResolvedValue([])
      mockNominatimClient.search.mockResolvedValue([])

      await expect(useCase.execute(query)).resolves.toBeDefined()
    })

    it('should trim query before validation', async () => {
      mockShopRepository.findExistingShops.mockResolvedValue([])
      mockNominatimClient.search.mockResolvedValue([])

      await useCase.execute('  カフェ  ')

      expect(mockShopRepository.findExistingShops).toHaveBeenCalledWith('カフェ', 5)
    })
  })

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockShopRepository.findExistingShops.mockRejectedValue(
        new Error('Database error')
      )

      await expect(useCase.execute('カフェ')).rejects.toThrow('Database error')
    })

    it('should return partial results if API fails', async () => {
      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'database'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)
      mockNominatimClient.search.mockResolvedValue([]) // API returns empty on error

      const results = await useCase.execute('カフェ')

      expect(results).toHaveLength(1)
      expect(results[0].source).toBe('database')
    })
  })

  describe('configuration', () => {
    it('should use custom maxResults', async () => {
      const customUseCase = new SearchShopUseCase(
        mockShopRepository,
        mockNominatimClient,
        { maxResults: 3 }
      )

      mockShopRepository.findExistingShops.mockResolvedValue([])
      mockNominatimClient.search.mockResolvedValue([])

      await customUseCase.execute('カフェ')

      expect(mockShopRepository.findExistingShops).toHaveBeenCalledWith('カフェ', 3)
    })

    it('should use custom minDbResultsForApiSkip', async () => {
      const customUseCase = new SearchShopUseCase(
        mockShopRepository,
        mockNominatimClient,
        { minDbResultsForApiSkip: 1 }
      )

      const dbResults = [
        ShopSearchResult.fromPrimitive('カフェA', null, null, 'database'),
      ]

      mockShopRepository.findExistingShops.mockResolvedValue(dbResults)

      await customUseCase.execute('カフェ')

      // Should NOT call API because DB has 1 result and minDbResultsForApiSkip is 1
      expect(mockNominatimClient.search).not.toHaveBeenCalled()
    })
  })
})
