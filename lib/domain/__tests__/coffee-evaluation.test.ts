/**
 * CoffeeEvaluation Entity Unit Tests
 */
import { CoffeeEvaluation, CreateCoffeeEvaluationInput, CreateBeanOnlyInput } from '../coffee-evaluation/entity'

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
        expect(evaluation.acidity?.value).toBe(7)
        expect(evaluation.bitterness?.value).toBe(5)
        expect(evaluation.aroma?.value).toBe(8)
        expect(evaluation.overallRating?.value).toBe(8)
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

  describe('createBeanOnly', () => {
    const beanOnlyInput: CreateBeanOnlyInput = {
      userId: 'user-123',
      shopName: 'スターバックス',
      beanName: 'Ethiopia Yirgacheffe',
      beanType: 'アフリカ',
      roastLevel: '中煎り',
      isPublic: true,
    }

    it('should create a bean-only evaluation with null ratings', () => {
      const result = CoffeeEvaluation.createBeanOnly(beanOnlyInput)

      expect(result.ok).toBe(true)
      if (result.ok) {
        const evaluation = result.value
        expect(evaluation.beanName).toBe('Ethiopia Yirgacheffe')
        expect(evaluation.shopName).toBe('スターバックス')
        expect(evaluation.ratings).toBeNull()
        expect(evaluation.acidity).toBeNull()
        expect(evaluation.bitterness).toBeNull()
        expect(evaluation.aroma).toBeNull()
        expect(evaluation.overallRating).toBeNull()
        expect(evaluation.isEvaluated).toBe(false)
      }
    })

    it('should fail with empty bean name', () => {
      const result = CoffeeEvaluation.createBeanOnly({
        ...beanOnlyInput,
        beanName: '',
      })

      expect(result.ok).toBe(false)
    })
  })

  describe('isEvaluated', () => {
    it('should return true for evaluation with ratings', () => {
      const result = CoffeeEvaluation.create(validInput)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isEvaluated).toBe(true)
      }
    })

    it('should return false for bean-only evaluation', () => {
      const result = CoffeeEvaluation.createBeanOnly({
        userId: 'user-123',
        beanName: 'Test Bean',
        isPublic: false,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isEvaluated).toBe(false)
      }
    })
  })

  describe('evaluate', () => {
    it('should add ratings to an unevaluated bean', () => {
      const createResult = CoffeeEvaluation.createBeanOnly({
        userId: 'user-123',
        beanName: 'Test Bean',
        isPublic: false,
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const evaluateResult = createResult.value.evaluate({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        overallRating: 8,
      })

      expect(evaluateResult.ok).toBe(true)
      if (evaluateResult.ok) {
        expect(evaluateResult.value.isEvaluated).toBe(true)
        expect(evaluateResult.value.acidity!.value).toBe(7)
        expect(evaluateResult.value.bitterness!.value).toBe(5)
        expect(evaluateResult.value.aroma!.value).toBe(8)
        expect(evaluateResult.value.overallRating!.value).toBe(8)
        // Bean info should be preserved
        expect(evaluateResult.value.beanName).toBe('Test Bean')
      }
    })

    it('should allow re-evaluation (overwrite existing ratings)', () => {
      const createResult = CoffeeEvaluation.create(validInput)
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const evaluateResult = createResult.value.evaluate({
        acidity: 3,
        bitterness: 9,
        aroma: 4,
        overallRating: 6,
      })

      expect(evaluateResult.ok).toBe(true)
      if (evaluateResult.ok) {
        expect(evaluateResult.value.acidity!.value).toBe(3)
        expect(evaluateResult.value.bitterness!.value).toBe(9)
        expect(evaluateResult.value.overallRating!.value).toBe(6)
      }
    })

    it('should fail with invalid rating values', () => {
      const createResult = CoffeeEvaluation.createBeanOnly({
        userId: 'user-123',
        beanName: 'Test Bean',
        isPublic: false,
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const evaluateResult = createResult.value.evaluate({
        acidity: 15,
        bitterness: 5,
        aroma: 8,
        overallRating: 8,
      })

      expect(evaluateResult.ok).toBe(false)
    })
  })

  describe('toPersistence', () => {
    it('should serialize null ratings when unevaluated', () => {
      const result = CoffeeEvaluation.createBeanOnly({
        userId: 'user-123',
        beanName: 'Test Bean',
        isPublic: true,
      })
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const persistence = result.value.toPersistence()
      expect(persistence.acidity).toBeNull()
      expect(persistence.bitterness).toBeNull()
      expect(persistence.aroma).toBeNull()
      expect(persistence.overall_rating).toBeNull()
      expect(persistence.bean_name).toBe('Test Bean')
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
        expect(updateResult.value.overallRating?.value).toBe(9)
        // Other fields should remain unchanged
        expect(updateResult.value.shopName).toBe('スターバックス')
        expect(updateResult.value.acidity?.value).toBe(7)
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
