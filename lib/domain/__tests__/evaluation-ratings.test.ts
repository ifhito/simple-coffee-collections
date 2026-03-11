/**
 * EvaluationRatings Value Object Unit Tests
 */
import { EvaluationRatings } from '../coffee-evaluation/value-objects/evaluation-ratings'

describe('EvaluationRatings Value Object', () => {
  describe('create', () => {
    it('should create with valid rating values', () => {
      const result = EvaluationRatings.create({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        overallRating: 9,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.acidity.value).toBe(7)
        expect(result.value.bitterness.value).toBe(5)
        expect(result.value.aroma.value).toBe(8)
        expect(result.value.overallRating.value).toBe(9)
      }
    })

    it('should create with boundary values (1 and 10)', () => {
      const result = EvaluationRatings.create({
        acidity: 1,
        bitterness: 10,
        aroma: 1,
        overallRating: 10,
      })

      expect(result.ok).toBe(true)
    })

    it('should fail if acidity is out of range', () => {
      const result = EvaluationRatings.create({
        acidity: 15,
        bitterness: 5,
        aroma: 8,
        overallRating: 9,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('酸味')
      }
    })

    it('should fail if bitterness is out of range', () => {
      const result = EvaluationRatings.create({
        acidity: 5,
        bitterness: 0,
        aroma: 8,
        overallRating: 9,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('苦味')
      }
    })

    it('should fail if aroma is not an integer', () => {
      const result = EvaluationRatings.create({
        acidity: 5,
        bitterness: 5,
        aroma: 8.5,
        overallRating: 9,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('香り')
      }
    })

    it('should fail if overallRating is NaN', () => {
      const result = EvaluationRatings.create({
        acidity: 5,
        bitterness: 5,
        aroma: 8,
        overallRating: NaN,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('総合評価')
      }
    })
  })

  describe('fromPrimitive', () => {
    it('should create without validation from known valid values', () => {
      const ratings = EvaluationRatings.fromPrimitive({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        overallRating: 9,
      })

      expect(ratings.acidity.value).toBe(7)
      expect(ratings.bitterness.value).toBe(5)
      expect(ratings.aroma.value).toBe(8)
      expect(ratings.overallRating.value).toBe(9)
    })
  })

  describe('equals', () => {
    it('should return true for equal ratings', () => {
      const a = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 5, aroma: 8, overallRating: 9,
      })
      const b = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 5, aroma: 8, overallRating: 9,
      })

      expect(a.equals(b)).toBe(true)
    })

    it('should return false when any rating differs', () => {
      const a = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 5, aroma: 8, overallRating: 9,
      })
      const b = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 6, aroma: 8, overallRating: 9,
      })

      expect(a.equals(b)).toBe(false)
    })
  })

  describe('toPrimitive', () => {
    it('should return camelCase keys', () => {
      const ratings = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 5, aroma: 8, overallRating: 9,
      })

      expect(ratings.toPrimitive()).toEqual({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        overallRating: 9,
      })
    })
  })

  describe('toPersistence', () => {
    it('should return snake_case keys for DB storage', () => {
      const ratings = EvaluationRatings.fromPrimitive({
        acidity: 7, bitterness: 5, aroma: 8, overallRating: 9,
      })

      expect(ratings.toPersistence()).toEqual({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        overall_rating: 9,
      })
    })
  })
})
