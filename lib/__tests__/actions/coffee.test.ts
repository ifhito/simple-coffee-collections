/**
 * Tests for Coffee Evaluation Server Actions
 * TDD Red Phase: Tests are written before implementation
 *
 * These tests define expected behavior for:
 * - createCoffeeEvaluation: Create new evaluation from FormData
 * - updateCoffeeEvaluation: Update existing evaluation from FormData
 * - deleteCoffeeEvaluation: Delete evaluation and revalidate
 */

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createCoffeeEvaluation,
  updateCoffeeEvaluation,
  deleteCoffeeEvaluation,
} from '@/lib/actions/coffee'

// Mock Next.js utilities
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/server')

describe('Coffee Evaluation Server Actions', () => {
  let mockSupabaseClient: any
  let mockAuthGetUser: jest.Mock

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock authenticated user
    mockAuthGetUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Create chainable mock methods
    const chainableMock: any = {
      auth: {
        getUser: mockAuthGetUser,
      },
      from: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
    }

    // Make all methods return the chainable mock
    chainableMock.from.mockReturnValue(chainableMock)
    chainableMock.insert.mockReturnValue(chainableMock)
    chainableMock.update.mockReturnValue(chainableMock)
    chainableMock.delete.mockReturnValue(chainableMock)
    chainableMock.select.mockReturnValue(chainableMock)
    chainableMock.eq.mockReturnValue(chainableMock)

    mockSupabaseClient = chainableMock

    // Mock createClient to return our mock
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('createCoffeeEvaluation', () => {
    it('should create a new coffee evaluation from FormData', async () => {
      // Arrange: Create FormData with valid data
      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('bean_type', 'エチオピア イルガチェフェ')
      formData.append('roast_level', '中煎り')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')
      formData.append('is_public', 'true')

      // Mock successful insert
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act: Call the Server Action
      await createCoffeeEvaluation(formData)

      // Assert: Verify correct behavior
      expect(createClient).toHaveBeenCalled()
      expect(mockAuthGetUser).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          shop_name: 'カフェテスト',
          bean_type: 'エチオピア イルガチェフェ',
          roast_level: '中煎り',
          acidity: 8,
          bitterness: 4,
          aroma: 9,
          overall_rating: 8,
          is_public: true,
        })
      )

      // Verify revalidatePath is called BEFORE redirect
      expect(revalidatePath).toHaveBeenCalledWith('/coffee')
      expect(redirect).toHaveBeenCalledWith('/coffee')

      // Verify order: revalidatePath before redirect
      const revalidateCall = (revalidatePath as jest.Mock).mock.invocationCallOrder[0]
      const redirectCall = (redirect as jest.Mock).mock.invocationCallOrder[0]
      expect(revalidateCall).toBeLessThan(redirectCall)
    })

    it('should return validation error for missing shop_name', async () => {
      // Arrange: FormData without shop_name
      const formData = new FormData()
      formData.append('bean_type', 'エチオピア')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      // Act
      const result = await createCoffeeEvaluation(formData)

      // Assert: Should return error object
      expect(result).toEqual({
        error: expect.stringContaining('shop_name'),
      })
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return validation error for missing bean_type', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      // Act
      const result = await createCoffeeEvaluation(formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringContaining('bean_type'),
      })
    })

    it('should return validation error for invalid rating values', async () => {
      // Arrange: Rating outside 1-10 range
      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('bean_type', 'エチオピア')
      formData.append('acidity', '11') // Invalid: > 10
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      // Act
      const result = await createCoffeeEvaluation(formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/rating|1-10/i),
      })
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange: Mock unauthenticated user
      mockAuthGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('bean_type', 'エチオピア')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      // Act
      const result = await createCoffeeEvaluation(formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/認証|authentication/i),
      })
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled()
    })

    it('should return error when database insert fails', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('bean_type', 'エチオピア')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      })

      // Act
      const result = await createCoffeeEvaluation(formData)

      // Assert
      expect(result).toEqual({
        error: 'Database error',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should handle roast_level as optional field', async () => {
      // Arrange: FormData without roast_level
      const formData = new FormData()
      formData.append('shop_name', 'カフェテスト')
      formData.append('bean_type', 'エチオピア')
      formData.append('acidity', '8')
      formData.append('bitterness', '4')
      formData.append('aroma', '9')
      formData.append('overall_rating', '8')

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      await createCoffeeEvaluation(formData)

      // Assert
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          roast_level: null,
        })
      )
    })
  })

  describe('updateCoffeeEvaluation', () => {
    const evaluationId = '123e4567-e89b-12d3-a456-426614174000'

    it('should update an existing coffee evaluation', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('shop_name', 'カフェ更新')
      formData.append('bean_type', 'コロンビア')
      formData.append('roast_level', '深煎り')
      formData.append('acidity', '6')
      formData.append('bitterness', '8')
      formData.append('aroma', '7')
      formData.append('overall_rating', '7')
      formData.append('is_public', 'false')

      // Mock ownership check: eq for select returns chainable, then single returns promise
      let callCount = 0
      mockSupabaseClient.eq.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First eq call (for select/ownership check) - return chainable for .single()
          return mockSupabaseClient
        } else {
          // Second eq call (for update) - return resolved promise
          return Promise.resolve({ data: null, error: null })
        }
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      })

      // Act
      await updateCoffeeEvaluation(evaluationId, formData)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          shop_name: 'カフェ更新',
          bean_type: 'コロンビア',
          overall_rating: 7,
        })
      )
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', evaluationId)
      expect(revalidatePath).toHaveBeenCalledWith('/coffee')
      expect(revalidatePath).toHaveBeenCalledWith(`/coffee/${evaluationId}`)
      expect(redirect).toHaveBeenCalledWith(`/coffee/${evaluationId}`)
    })

    it('should verify ownership before updating', async () => {
      // Arrange: Mock evaluation owned by different user
      const formData = new FormData()
      formData.append('shop_name', 'カフェ更新')
      formData.append('bean_type', 'コロンビア')
      formData.append('acidity', '6')
      formData.append('bitterness', '8')
      formData.append('aroma', '7')
      formData.append('overall_rating', '7')

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { user_id: 'different-user' }, // Different user
        error: null,
      })

      // Act
      const result = await updateCoffeeEvaluation(evaluationId, formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/権限|permission|unauthorized/i),
      })
      expect(mockSupabaseClient.update).not.toHaveBeenCalled()
    })

    it('should return error when evaluation not found', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('shop_name', 'カフェ更新')
      formData.append('bean_type', 'コロンビア')
      formData.append('acidity', '6')
      formData.append('bitterness', '8')
      formData.append('aroma', '7')
      formData.append('overall_rating', '7')

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Act
      const result = await updateCoffeeEvaluation(evaluationId, formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/見つかりません|not found/i),
      })
    })

    it('should return validation errors for invalid data', async () => {
      // Arrange: Invalid rating
      const formData = new FormData()
      formData.append('shop_name', 'カフェ更新')
      formData.append('bean_type', 'コロンビア')
      formData.append('acidity', '0') // Invalid: < 1
      formData.append('bitterness', '8')
      formData.append('aroma', '7')
      formData.append('overall_rating', '7')

      // Act
      const result = await updateCoffeeEvaluation(evaluationId, formData)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/rating|1-10/i),
      })
      expect(mockSupabaseClient.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteCoffeeEvaluation', () => {
    const evaluationId = '123e4567-e89b-12d3-a456-426614174000'

    it('should delete an evaluation successfully', async () => {
      // Mock ownership check: eq for select returns chainable, then single returns promise
      let callCount = 0
      mockSupabaseClient.eq.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First eq call (for select/ownership check) - return chainable for .single()
          return mockSupabaseClient
        } else {
          // Second eq call (for delete) - return resolved promise
          return Promise.resolve({ data: null, error: null })
        }
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      })

      // Act
      await deleteCoffeeEvaluation(evaluationId)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', evaluationId)
      expect(revalidatePath).toHaveBeenCalledWith('/coffee')
      expect(redirect).toHaveBeenCalledWith('/coffee')

      // Verify order: revalidatePath before redirect
      const revalidateCall = (revalidatePath as jest.Mock).mock.invocationCallOrder[0]
      const redirectCall = (redirect as jest.Mock).mock.invocationCallOrder[0]
      expect(revalidateCall).toBeLessThan(redirectCall)
    })

    it('should verify ownership before deleting', async () => {
      // Arrange: Different user owns the evaluation
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { user_id: 'different-user' },
        error: null,
      })

      // Act
      const result = await deleteCoffeeEvaluation(evaluationId)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/権限|permission|unauthorized/i),
      })
      expect(mockSupabaseClient.delete).not.toHaveBeenCalled()
    })

    it('should return error when evaluation not found', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Act
      const result = await deleteCoffeeEvaluation(evaluationId)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/見つかりません|not found/i),
      })
    })

    it('should return error when database delete fails', async () => {
      // Mock ownership check: eq for select returns chainable, then single returns promise
      let callCount = 0
      mockSupabaseClient.eq.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First eq call (for select/ownership check) - return chainable for .single()
          return mockSupabaseClient
        } else {
          // Second eq call (for delete) - return resolved promise with error
          return Promise.resolve({ data: null, error: { message: 'Delete failed' } })
        }
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      })

      // Act
      const result = await deleteCoffeeEvaluation(evaluationId)

      // Assert
      expect(result).toEqual({
        error: 'Delete failed',
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockAuthGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      // Act
      const result = await deleteCoffeeEvaluation(evaluationId)

      // Assert
      expect(result).toEqual({
        error: expect.stringMatching(/認証|authentication/i),
      })
      expect(mockSupabaseClient.delete).not.toHaveBeenCalled()
    })
  })
})
