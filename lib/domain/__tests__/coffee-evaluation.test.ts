/**
 * CoffeeEvaluation Entity Unit Tests
 */
import { CoffeeEvaluation, CreateCoffeeEvaluationInput } from '../coffee-evaluation/entity'

describe('CoffeeEvaluation Entity', () => {
  const validInput: CreateCoffeeEvaluationInput = {
    userId: 'user-123',
    shopName: 'スターバックス',
    beanName: 'Ethiopia Yirgacheffe',
    beanType: 'アフリカ',
    roastLevel: '中煎り',
    acidity: 7,
    bitterness: 5,
    aroma: 8,
    overallRating: 8,
    isPublic: true,
  }

  describe('create', () => {
    it('should create a valid evaluation with all fields', () => {
      const result = CoffeeEvaluation.create(validInput)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        const evaluation = result.value
        expect(evaluation.userId).toBe('user-123')
        expect(evaluation.shopName).toBe('スターバックス')
        expect(evaluation.beanName).toBe('Ethiopia Yirgacheffe')
        expect(evaluation.beanType).toBe('アフリカ')
        expect(evaluation.roastLevel).toBe('中煎り')
        expect(evaluation.acidity.value).toBe(7)
        expect(evaluation.bitterness.value).toBe(5)
        expect(evaluation.aroma.value).toBe(8)
        expect(evaluation.overallRating.value).toBe(8)
        expect(evaluation.isPublic).toBe(true)
      }
    })

    it('should create with minimal required fields', () => {
      const result = CoffeeEvaluation.create({
        userId: 'user-123',
        beanName: 'Test Bean',
        acidity: 5,
        bitterness: 5,
        aroma: 5,
        overallRating: 5,
        isPublic: false,
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.shopName).toBe('')
        expect(result.value.beanType).toBe('')
        expect(result.value.roastLevel).toBeNull()
      }
    })

    it('should fail with invalid rating', () => {
      const result = CoffeeEvaluation.create({
        ...validInput,
        acidity: 15,
      })
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('酸味')
      }
    })

    it('should fail with empty bean name', () => {
      const result = CoffeeEvaluation.create({
        ...validInput,
        beanName: '',
      })
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('コーヒー名')
      }
    })
  })

  describe('isOwnedBy', () => {
    it('should return true for owner', () => {
      const result = CoffeeEvaluation.create(validInput)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isOwnedBy('user-123')).toBe(true)
      }
    })

    it('should return false for non-owner', () => {
      const result = CoffeeEvaluation.create(validInput)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isOwnedBy('other-user')).toBe(false)
      }
    })
  })

  describe('isViewableBy', () => {
    it('should allow owner to view private evaluation', () => {
      const result = CoffeeEvaluation.create({
        ...validInput,
        isPublic: false,
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isViewableBy('user-123')).toBe(true)
      }
    })

    it('should allow anyone to view public evaluation', () => {
      const result = CoffeeEvaluation.create({
        ...validInput,
        isPublic: true,
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isViewableBy(null)).toBe(true)
        expect(result.value.isViewableBy('other-user')).toBe(true)
      }
    })

    it('should deny non-owner from viewing private evaluation', () => {
      const result = CoffeeEvaluation.create({
        ...validInput,
        isPublic: false,
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isViewableBy('other-user')).toBe(false)
        expect(result.value.isViewableBy(null)).toBe(false)
      }
    })
  })

  describe('update', () => {
    it('should update specific fields', () => {
      const createResult = CoffeeEvaluation.create(validInput)
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const updateResult = createResult.value.update({
        beanName: 'Updated Bean',
        overallRating: 9,
      })

      expect(updateResult.ok).toBe(true)
      if (updateResult.ok) {
        expect(updateResult.value.beanName).toBe('Updated Bean')
        expect(updateResult.value.overallRating.value).toBe(9)
        // Other fields should remain unchanged
        expect(updateResult.value.shopName).toBe('スターバックス')
        expect(updateResult.value.acidity.value).toBe(7)
      }
    })

    it('should fail update with invalid values', () => {
      const createResult = CoffeeEvaluation.create(validInput)
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const updateResult = createResult.value.update({
        overallRating: 15,
      })

      expect(updateResult.ok).toBe(false)
    })
  })

  describe('toggleVisibility', () => {
    it('should toggle from public to private', () => {
      const createResult = CoffeeEvaluation.create({
        ...validInput,
        isPublic: true,
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const toggled = createResult.value.toggleVisibility()
      expect(toggled.isPublic).toBe(false)
    })

    it('should toggle from private to public', () => {
      const createResult = CoffeeEvaluation.create({
        ...validInput,
        isPublic: false,
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const toggled = createResult.value.toggleVisibility()
      expect(toggled.isPublic).toBe(true)
    })
  })
})
