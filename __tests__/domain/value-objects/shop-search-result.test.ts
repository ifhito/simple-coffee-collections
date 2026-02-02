/**
 * ShopSearchResult Value Object Tests
 *
 * @module __tests__/domain/value-objects/shop-search-result.test
 */

import { ShopSearchResult } from '@/lib/domain/value-objects/shop-search-result'
import { ShopLocation } from '@/lib/domain/value-objects/shop-location'

describe('ShopSearchResult', () => {
  describe('create', () => {
    it('should create a valid ShopSearchResult with required fields', () => {
      const result = ShopSearchResult.create({
        name: 'スターバックス 渋谷店',
        source: 'database',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('スターバックス 渋谷店')
        expect(result.value.address).toBeNull()
        expect(result.value.location).toBeNull()
        expect(result.value.source).toBe('database')
      }
    })

    it('should create with address and location', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const result = ShopSearchResult.create({
        name: 'スターバックス 渋谷店',
        address: '東京都渋谷区道玄坂2-1-1',
        location,
        source: 'nominatim',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('スターバックス 渋谷店')
        expect(result.value.address).toBe('東京都渋谷区道玄坂2-1-1')
        expect(result.value.location).toBe(location)
        expect(result.value.source).toBe('nominatim')
      }
    })

    it('should fail with empty name', () => {
      const result = ShopSearchResult.create({
        name: '',
        source: 'database',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('店舗名')
      }
    })

    it('should fail with whitespace-only name', () => {
      const result = ShopSearchResult.create({
        name: '   ',
        source: 'database',
      })

      expect(result.ok).toBe(false)
    })

    it('should trim name and address', () => {
      const result = ShopSearchResult.create({
        name: '  スターバックス  ',
        address: '  東京都  ',
        source: 'database',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('スターバックス')
        expect(result.value.address).toBe('東京都')
      }
    })
  })

  describe('fromPrimitive', () => {
    it('should create ShopSearchResult from primitive values', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        '東京都新宿区',
        location,
        'database'
      )

      expect(result.name).toBe('カフェA')
      expect(result.address).toBe('東京都新宿区')
      expect(result.location).toBe(location)
      expect(result.source).toBe('database')
    })
  })

  describe('displayText', () => {
    it('should return "name - address" when address exists', () => {
      const result = ShopSearchResult.fromPrimitive(
        'スターバックス',
        '東京都渋谷区',
        null,
        'nominatim'
      )

      expect(result.displayText).toBe('スターバックス - 東京都渋谷区')
    })

    it('should return name only when address is null', () => {
      const result = ShopSearchResult.fromPrimitive(
        'スターバックス',
        null,
        null,
        'database'
      )

      expect(result.displayText).toBe('スターバックス')
    })
  })

  describe('hasAddress', () => {
    it('should return true when address exists', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        '東京都',
        null,
        'database'
      )

      expect(result.hasAddress()).toBe(true)
    })

    it('should return false when address is null', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        null,
        null,
        'database'
      )

      expect(result.hasAddress()).toBe(false)
    })

    it('should return false when address is empty string', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        '',
        null,
        'database'
      )

      expect(result.hasAddress()).toBe(false)
    })
  })

  describe('hasLocation', () => {
    it('should return true when location exists', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        null,
        location,
        'database'
      )

      expect(result.hasLocation()).toBe(true)
    })

    it('should return false when location is null', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        null,
        null,
        'database'
      )

      expect(result.hasLocation()).toBe(false)
    })
  })

  describe('equals', () => {
    it('should return true for same name (case-insensitive)', () => {
      const result1 = ShopSearchResult.fromPrimitive(
        'Starbucks',
        null,
        null,
        'database'
      )
      const result2 = ShopSearchResult.fromPrimitive(
        'starbucks',
        '東京都',
        null,
        'nominatim'
      )

      expect(result1.equals(result2)).toBe(true)
    })

    it('should return false for different names', () => {
      const result1 = ShopSearchResult.fromPrimitive(
        'Starbucks',
        null,
        null,
        'database'
      )
      const result2 = ShopSearchResult.fromPrimitive(
        'Tullys',
        null,
        null,
        'database'
      )

      expect(result1.equals(result2)).toBe(false)
    })
  })

  describe('matchesByName', () => {
    it('should return true for matching names (case-insensitive)', () => {
      const result1 = ShopSearchResult.fromPrimitive(
        'スターバックス',
        null,
        null,
        'database'
      )
      const result2 = ShopSearchResult.fromPrimitive(
        'スターバックス',
        '東京都',
        null,
        'nominatim'
      )

      expect(result1.matchesByName(result2)).toBe(true)
    })
  })

  describe('toPrimitive', () => {
    it('should return serializable object', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        '東京都',
        location,
        'nominatim'
      )

      const primitive = result.toPrimitive()

      expect(primitive).toEqual({
        name: 'カフェA',
        address: '東京都',
        location: { latitude: 35.6581, longitude: 139.7414 },
        source: 'nominatim',
      })
    })

    it('should handle null location', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        null,
        null,
        'database'
      )

      const primitive = result.toPrimitive()

      expect(primitive.location).toBeNull()
    })
  })

  describe('immutability', () => {
    it('should be frozen after creation', () => {
      const result = ShopSearchResult.fromPrimitive(
        'カフェA',
        null,
        null,
        'database'
      )

      expect(Object.isFrozen(result)).toBe(true)
    })
  })
})
