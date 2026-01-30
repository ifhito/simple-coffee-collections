/**
 * BeanInfo Value Object Unit Tests
 */
import { BeanInfo, BEAN_INFO_CONSTRAINTS } from '../coffee-evaluation/value-objects/bean-info'

describe('BeanInfo Value Object', () => {
  describe('create', () => {
    it('should create with valid bean name only', () => {
      const result = BeanInfo.create({ beanName: 'Ethiopia Yirgacheffe' })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.beanName).toBe('Ethiopia Yirgacheffe')
        expect(result.value.beanType).toBe('')
        expect(result.value.roastLevel).toBeNull()
      }
    })

    it('should create with all fields', () => {
      const result = BeanInfo.create({
        beanName: 'Ethiopia Yirgacheffe',
        beanType: 'アフリカ',
        roastLevel: '中煎り',
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.beanName).toBe('Ethiopia Yirgacheffe')
        expect(result.value.beanType).toBe('アフリカ')
        expect(result.value.roastLevel).toBe('中煎り')
      }
    })

    it('should trim whitespace from all fields', () => {
      const result = BeanInfo.create({
        beanName: '  Ethiopia  ',
        beanType: '  アフリカ  ',
        roastLevel: '  中煎り  ',
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.beanName).toBe('Ethiopia')
        expect(result.value.beanType).toBe('アフリカ')
        expect(result.value.roastLevel).toBe('中煎り')
      }
    })

    it('should convert empty roast level to null', () => {
      const result = BeanInfo.create({
        beanName: 'Test Bean',
        roastLevel: '   ',
      })
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.roastLevel).toBeNull()
      }
    })

    it('should fail for empty bean name', () => {
      const result = BeanInfo.create({ beanName: '' })
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('コーヒー名は必須')
      }
    })

    it('should fail for whitespace-only bean name', () => {
      const result = BeanInfo.create({ beanName: '   ' })
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('コーヒー名は必須')
      }
    })

    it('should fail for bean name exceeding max length', () => {
      const longName = 'a'.repeat(BEAN_INFO_CONSTRAINTS.BEAN_NAME_MAX_LENGTH + 1)
      const result = BeanInfo.create({ beanName: longName })
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain(`${BEAN_INFO_CONSTRAINTS.BEAN_NAME_MAX_LENGTH}文字`)
      }
    })
  })

  describe('fromPrimitive', () => {
    it('should create without validation', () => {
      const beanInfo = BeanInfo.fromPrimitive('Test', 'Type', 'Level')
      
      expect(beanInfo.beanName).toBe('Test')
      expect(beanInfo.beanType).toBe('Type')
      expect(beanInfo.roastLevel).toBe('Level')
    })
  })

  describe('hasBeanType', () => {
    it('should return true when bean type is set', () => {
      const beanInfo = BeanInfo.fromPrimitive('Test', 'Type', null)
      expect(beanInfo.hasBeanType()).toBe(true)
    })

    it('should return false when bean type is empty', () => {
      const beanInfo = BeanInfo.fromPrimitive('Test', '', null)
      expect(beanInfo.hasBeanType()).toBe(false)
    })
  })

  describe('hasRoastLevel', () => {
    it('should return true when roast level is set', () => {
      const beanInfo = BeanInfo.fromPrimitive('Test', '', 'Medium')
      expect(beanInfo.hasRoastLevel()).toBe(true)
    })

    it('should return false when roast level is null', () => {
      const beanInfo = BeanInfo.fromPrimitive('Test', '', null)
      expect(beanInfo.hasRoastLevel()).toBe(false)
    })
  })

  describe('toDisplayString', () => {
    it('should display bean name only', () => {
      const beanInfo = BeanInfo.fromPrimitive('Ethiopia', '', null)
      expect(beanInfo.toDisplayString()).toBe('Ethiopia')
    })

    it('should display bean name with type', () => {
      const beanInfo = BeanInfo.fromPrimitive('Ethiopia', 'アフリカ', null)
      expect(beanInfo.toDisplayString()).toBe('Ethiopia (アフリカ)')
    })

    it('should display all fields', () => {
      const beanInfo = BeanInfo.fromPrimitive('Ethiopia', 'アフリカ', '中煎り')
      expect(beanInfo.toDisplayString()).toBe('Ethiopia (アフリカ) - 中煎り')
    })
  })
})
