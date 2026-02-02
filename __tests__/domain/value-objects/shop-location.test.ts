/**
 * ShopLocation Value Object Tests
 *
 * @module __tests__/domain/value-objects/shop-location.test
 */

import {
  ShopLocation,
  SHOP_LOCATION_CONSTRAINTS,
} from '@/lib/domain/value-objects/shop-location'

describe('ShopLocation', () => {
  describe('create', () => {
    it('should create a valid ShopLocation with valid coordinates', () => {
      const result = ShopLocation.create({ latitude: 35.6581, longitude: 139.7414 })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.latitude).toBe(35.6581)
        expect(result.value.longitude).toBe(139.7414)
      }
    })

    it('should fail with latitude below -90', () => {
      const result = ShopLocation.create({ latitude: -91, longitude: 0 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('-90')
      }
    })

    it('should fail with latitude above 90', () => {
      const result = ShopLocation.create({ latitude: 91, longitude: 0 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('90')
      }
    })

    it('should fail with longitude below -180', () => {
      const result = ShopLocation.create({ latitude: 0, longitude: -181 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('-180')
      }
    })

    it('should fail with longitude above 180', () => {
      const result = ShopLocation.create({ latitude: 0, longitude: 181 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('180')
      }
    })

    // Boundary value tests
    it('should accept exactly -90 latitude', () => {
      const result = ShopLocation.create({ latitude: -90, longitude: 0 })
      expect(result.ok).toBe(true)
    })

    it('should accept exactly 90 latitude', () => {
      const result = ShopLocation.create({ latitude: 90, longitude: 0 })
      expect(result.ok).toBe(true)
    })

    it('should accept exactly -180 longitude', () => {
      const result = ShopLocation.create({ latitude: 0, longitude: -180 })
      expect(result.ok).toBe(true)
    })

    it('should accept exactly 180 longitude', () => {
      const result = ShopLocation.create({ latitude: 0, longitude: 180 })
      expect(result.ok).toBe(true)
    })
  })

  describe('fromPrimitive', () => {
    it('should create ShopLocation from primitive values', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)

      expect(location.latitude).toBe(35.6581)
      expect(location.longitude).toBe(139.7414)
    })
  })

  describe('isValid', () => {
    it('should return true for valid coordinates', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      expect(location.isValid()).toBe(true)
    })

    it('should return true for boundary values', () => {
      const location1 = ShopLocation.fromPrimitive(-90, -180)
      const location2 = ShopLocation.fromPrimitive(90, 180)

      expect(location1.isValid()).toBe(true)
      expect(location2.isValid()).toBe(true)
    })
  })

  describe('toString', () => {
    it('should return "latitude,longitude" format', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      expect(location.toString()).toBe('35.6581,139.7414')
    })
  })

  describe('distanceTo', () => {
    it('should calculate distance between two locations', () => {
      // Tokyo Tower
      const tokyo = ShopLocation.fromPrimitive(35.6586, 139.7454)
      // Shibuya Station
      const shibuya = ShopLocation.fromPrimitive(35.658, 139.7016)

      const distance = tokyo.distanceTo(shibuya)

      // Distance should be approximately 3.9 km
      expect(distance).toBeGreaterThan(3.5)
      expect(distance).toBeLessThan(4.5)
    })

    it('should return 0 for same location', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      expect(location.distanceTo(location)).toBe(0)
    })
  })

  describe('equals', () => {
    it('should return true for equal coordinates', () => {
      const location1 = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const location2 = ShopLocation.fromPrimitive(35.6581, 139.7414)

      expect(location1.equals(location2)).toBe(true)
    })

    it('should return false for different coordinates', () => {
      const location1 = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const location2 = ShopLocation.fromPrimitive(35.658, 139.7016)

      expect(location1.equals(location2)).toBe(false)
    })
  })

  describe('toPrimitive', () => {
    it('should return object with latitude and longitude', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)
      const primitive = location.toPrimitive()

      expect(primitive).toEqual({
        latitude: 35.6581,
        longitude: 139.7414,
      })
    })
  })

  describe('immutability', () => {
    it('should be frozen after creation', () => {
      const location = ShopLocation.fromPrimitive(35.6581, 139.7414)

      expect(Object.isFrozen(location)).toBe(true)
    })
  })
})
