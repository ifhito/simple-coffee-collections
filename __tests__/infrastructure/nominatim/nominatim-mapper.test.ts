/**
 * NominatimMapper Tests
 *
 * @module __tests__/infrastructure/nominatim/nominatim-mapper.test
 */

import { NominatimMapper } from '@/lib/infrastructure/nominatim/nominatim-mapper'
import type { NominatimPlace } from '@/lib/infrastructure/nominatim/nominatim-types'

describe('NominatimMapper', () => {
  describe('toShopSearchResult', () => {
    it('should convert NominatimPlace with all fields', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'スターバックス コーヒー, 渋谷, 東京都, 日本',
        name: 'スターバックス コーヒー',
        lat: '35.6581',
        lon: '139.7414',
        class: 'amenity',
        type: 'cafe',
        address: {
          cafe: 'スターバックス コーヒー',
          road: '道玄坂',
          city: '渋谷区',
          state: '東京都',
          country: '日本',
        },
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.name).toBe('スターバックス コーヒー')
      expect(result.address).toBe('道玄坂、渋谷区、東京都')
      expect(result.location).not.toBeNull()
      expect(result.location?.latitude).toBe(35.6581)
      expect(result.location?.longitude).toBe(139.7414)
      expect(result.source).toBe('nominatim')
    })

    it('should use display_name when name is missing', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'カフェ渋谷, 渋谷, 東京都, 日本',
        lat: '35.6581',
        lon: '139.7414',
        class: 'amenity',
        type: 'cafe',
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.name).toBe('カフェ渋谷')
    })

    it('should use address.shop/cafe/restaurant when name is missing', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'Some address, Japan',
        lat: '35.6581',
        lon: '139.7414',
        class: 'amenity',
        type: 'cafe',
        address: {
          cafe: 'カフェ名',
          city: '渋谷区',
        },
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.name).toBe('カフェ名')
    })

    it('should handle missing address', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'カフェ渋谷',
        name: 'カフェ渋谷',
        lat: '35.6581',
        lon: '139.7414',
        class: 'amenity',
        type: 'cafe',
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.address).toBeNull()
    })

    it('should handle invalid coordinates', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'カフェ渋谷',
        name: 'カフェ渋谷',
        lat: '999', // Invalid
        lon: '139.7414',
        class: 'amenity',
        type: 'cafe',
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.location).toBeNull()
    })

    it('should handle missing coordinates', () => {
      const place: NominatimPlace = {
        place_id: 123,
        display_name: 'カフェ渋谷',
        name: 'カフェ渋谷',
        lat: '',
        lon: '',
        class: 'amenity',
        type: 'cafe',
      }

      const result = NominatimMapper.toShopSearchResult(place)

      expect(result.location).toBeNull()
    })
  })

  describe('toShopSearchResults', () => {
    it('should convert array of NominatimPlace', () => {
      const places: NominatimPlace[] = [
        {
          place_id: 1,
          display_name: 'カフェA',
          name: 'カフェA',
          lat: '35.6581',
          lon: '139.7414',
          class: 'amenity',
          type: 'cafe',
        },
        {
          place_id: 2,
          display_name: 'カフェB',
          name: 'カフェB',
          lat: '35.658',
          lon: '139.7016',
          class: 'amenity',
          type: 'cafe',
        },
      ]

      const results = NominatimMapper.toShopSearchResults(places)

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('カフェA')
      expect(results[1].name).toBe('カフェB')
      expect(results[0].source).toBe('nominatim')
      expect(results[1].source).toBe('nominatim')
    })

    it('should return empty array for empty input', () => {
      const results = NominatimMapper.toShopSearchResults([])
      expect(results).toHaveLength(0)
    })
  })

  describe('formatAddress', () => {
    it('should format address with road, city, and state', () => {
      const address = {
        road: '道玄坂',
        city: '渋谷区',
        state: '東京都',
      }

      const result = NominatimMapper.formatAddress(address)

      expect(result).toBe('道玄坂、渋谷区、東京都')
    })

    it('should use town when city is missing', () => {
      const address = {
        road: '大通り',
        town: '新宿',
        state: '東京都',
      }

      const result = NominatimMapper.formatAddress(address)

      expect(result).toBe('大通り、新宿、東京都')
    })

    it('should include neighbourhood', () => {
      const address = {
        road: '道玄坂',
        neighbourhood: '宇田川町',
        city: '渋谷区',
      }

      const result = NominatimMapper.formatAddress(address)

      expect(result).toBe('道玄坂、宇田川町、渋谷区')
    })

    it('should return null for undefined address', () => {
      const result = NominatimMapper.formatAddress(undefined)
      expect(result).toBeNull()
    })

    it('should return null for empty address', () => {
      const result = NominatimMapper.formatAddress({})
      expect(result).toBeNull()
    })
  })
})
