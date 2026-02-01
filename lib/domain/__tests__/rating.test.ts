/**
 * Rating Value Object Unit Tests
 */
import { Rating, RATING_CONSTRAINTS } from '../coffee-evaluation/value-objects/rating'

describe('Rating Value Object', () => {
  describe('create', () => {
    it('should create a valid rating within range', () => {
      const result = Rating.create(5)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe(5)
      }
    })

    it('should create rating at minimum value (1)', () => {
      const result = Rating.create(RATING_CONSTRAINTS.MIN)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe(1)
      }
    })

    it('should create rating at maximum value (10)', () => {
      const result = Rating.create(RATING_CONSTRAINTS.MAX)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe(10)
      }
    })

    it('should fail for value below minimum', () => {
      const result = Rating.create(0)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('1〜10')
      }
    })

    it('should fail for value above maximum', () => {
      const result = Rating.create(11)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('1〜10')
      }
    })

    it('should fail for non-integer value', () => {
      const result = Rating.create(5.5)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('整数')
      }
    })

    it('should fail for NaN', () => {
      const result = Rating.create(NaN)
      
      expect(result.ok).toBe(false)
    })
  })

  describe('fromPrimitive', () => {
    it('should create rating without validation', () => {
      const rating = Rating.fromPrimitive(7)
      
      expect(rating.value).toBe(7)
    })
  })

  describe('equals', () => {
    it('should return true for equal ratings', () => {
      const rating1Result = Rating.create(5)
      const rating2Result = Rating.create(5)
      
      expect(rating1Result.ok && rating2Result.ok).toBe(true)
      if (rating1Result.ok && rating2Result.ok) {
        expect(rating1Result.value.equals(rating2Result.value)).toBe(true)
      }
    })

    it('should return false for different ratings', () => {
      const rating1Result = Rating.create(5)
      const rating2Result = Rating.create(7)
      
      expect(rating1Result.ok && rating2Result.ok).toBe(true)
      if (rating1Result.ok && rating2Result.ok) {
        expect(rating1Result.value.equals(rating2Result.value)).toBe(false)
      }
    })
  })

  describe('isHigh', () => {
    it('should return true for rating >= 7', () => {
      const rating = Rating.fromPrimitive(7)
      expect(rating.isHigh()).toBe(true)
    })

    it('should return false for rating < 7', () => {
      const rating = Rating.fromPrimitive(6)
      expect(rating.isHigh()).toBe(false)
    })
  })

  describe('isLow', () => {
    it('should return true for rating <= 3', () => {
      const rating = Rating.fromPrimitive(3)
      expect(rating.isLow()).toBe(true)
    })

    it('should return false for rating > 3', () => {
      const rating = Rating.fromPrimitive(4)
      expect(rating.isLow()).toBe(false)
    })
  })

  describe('toDisplayString', () => {
    it('should format rating as X/10', () => {
      const rating = Rating.fromPrimitive(8)
      expect(rating.toDisplayString()).toBe('8/10')
    })
  })
})
