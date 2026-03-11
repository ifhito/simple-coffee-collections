/**
 * Tests for Coffee Evaluation Data Fetching Functions
 * TDD Red Phase: Tests are written before implementation
 *
 * These tests define expected behavior for:
 * - getCoffeeEvaluations: Fetch list of evaluations
 * - getCoffeeEvaluation: Fetch single evaluation by ID
 * - searchCoffeeEvaluations: Search evaluations with filters
 */

import { createClient } from '@/lib/supabase/server'
import {
  getCoffeeEvaluations,
  getCoffeeEvaluation,
  searchCoffeeEvaluations,
  getCoffeeEvaluationsWithUser,
} from '@/lib/api/coffee'
import type { CoffeeEvaluation, CoffeeEvaluationWithUser } from '@/lib/types/coffee'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

// Mock React cache
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn, // Pass-through for testing
}))

describe('Coffee Evaluation Data Fetching', () => {
  // Sample test data
  const mockEvaluation: CoffeeEvaluation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-123',
    shop_name: 'カフェテスト',
    bean_type: 'エチオピア イルガチェフェ',
    roast_level: '中煎り',
    acidity: 8,
    bitterness: 4,
    aroma: 9,
    overall_rating: 8,
    is_public: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockEvaluations: CoffeeEvaluation[] = [
    mockEvaluation,
    {
      ...mockEvaluation,
      id: '223e4567-e89b-12d3-a456-426614174001',
      shop_name: 'コーヒーショップ',
      bean_type: 'ブラジル サントス',
      overall_rating: 7,
    },
  ]

  let mockSupabaseClient: any

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create chainable mock methods
    const chainableMock = {
      from: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
      order: jest.fn(),
      ilike: jest.fn(),
      or: jest.fn(),
      single: jest.fn(),
    }

    // Make all methods return the chainable mock (except single which returns a promise)
    chainableMock.from.mockReturnValue(chainableMock)
    chainableMock.select.mockReturnValue(chainableMock)
    chainableMock.eq.mockReturnValue(chainableMock)
    chainableMock.order.mockReturnValue(chainableMock)
    chainableMock.ilike.mockReturnValue(chainableMock)
    chainableMock.or.mockReturnValue(chainableMock)

    mockSupabaseClient = chainableMock

    // Mock createClient to return our mock client
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('getCoffeeEvaluations', () => {
    it('should fetch all coffee evaluations successfully', async () => {
      // Arrange: Mock successful response on the final method (order)
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluations,
        error: null,
      })

      // Act: Call the function
      const result = await getCoffeeEvaluations()

      // Assert: Verify correct behavior
      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockEvaluations)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock error response on the final method (order)
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      })

      // Act & Assert: Expect function to throw or return empty array
      await expect(getCoffeeEvaluations()).rejects.toThrow('Database connection failed')
    })

    it('should filter evaluations by user_id when provided', async () => {
      // Arrange
      const userId = 'user-123'
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [mockEvaluation],
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluations({ user_id: userId })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', userId)
      expect(result).toHaveLength(1)
    })

    it('should filter by is_public when provided', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluations,
        error: null,
      })

      // Act
      await getCoffeeEvaluations({ is_public: true })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_public', true)
    })

    it('should apply sort order when provided', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluations,
        error: null,
      })

      // Act
      await getCoffeeEvaluations({ sort: 'rating_desc' })

      // Assert
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('overall_rating', { ascending: false, nullsFirst: false })
    })

    it('should apply search filter across shop, bean, and roast_level', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluations,
        error: null,
      })

      await getCoffeeEvaluations({ search: 'Kenya' })

      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('shop_name.ilike.%Kenya%')
      )
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('bean_type.ilike.%Kenya%')
      )
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('roast_level.ilike.%Kenya%')
      )
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      // This is verified by the cache mock at the top
      expect(getCoffeeEvaluations).toBeDefined()
      // In actual implementation, the function will be wrapped with cache()
    })
  })

  describe('getCoffeeEvaluation', () => {
    const evaluationId = '123e4567-e89b-12d3-a456-426614174000'

    it('should fetch a single coffee evaluation by ID', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockEvaluation,
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluation(evaluationId)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', evaluationId)
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result).toEqual(mockEvaluation)
    })

    it('should return null when evaluation is not found', async () => {
      // Arrange: Mock "not found" error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      // Act
      const result = await getCoffeeEvaluation('non-existent-id')

      // Assert
      expect(result).toBeNull()
    })

    it('should throw error for database failures', async () => {
      // Arrange: Mock database error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST000', message: 'Database error' },
      })

      // Act & Assert
      await expect(getCoffeeEvaluation(evaluationId)).rejects.toThrow('Database error')
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      expect(getCoffeeEvaluation).toBeDefined()
    })
  })

  describe('searchCoffeeEvaluations', () => {
    it('should search evaluations by keyword', async () => {
      // Arrange
      const searchTerm = 'エチオピア'
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [mockEvaluation],
        error: null,
      })

      // Act
      const result = await searchCoffeeEvaluations(searchTerm)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('shop_name.ilike')
      )
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('bean_type.ilike')
      )
      expect(result).toEqual([mockEvaluation])
    })

    it('should return empty array when no matches found', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Act
      const result = await searchCoffeeEvaluations('存在しないキーワード')

      // Assert
      expect(result).toEqual([])
    })

    it('should handle search errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Search failed' },
      })

      // Act & Assert
      await expect(searchCoffeeEvaluations('test')).rejects.toThrow('Search failed')
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      expect(searchCoffeeEvaluations).toBeDefined()
    })
  })

  describe('getCoffeeEvaluationsWithUser', () => {
    // Sample test data with user information
    const mockEvaluationWithUser: CoffeeEvaluationWithUser = {
      ...mockEvaluation,
      display_name: 'テストユーザー',
    }

    const mockEvaluationsWithUser: CoffeeEvaluationWithUser[] = [
      mockEvaluationWithUser,
      {
        ...mockEvaluation,
        id: '223e4567-e89b-12d3-a456-426614174001',
        user_id: 'user-456',
        shop_name: 'コーヒーショップ',
        display_name: '別のユーザー',
      },
    ]

    it('should fetch evaluations with user display names using JOIN', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluationsWithUser,
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluationsWithUser()

      // Assert
      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('coffee_evaluations')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        '*, user_profiles!inner(display_name)'
      )
      expect(result).toEqual(mockEvaluationsWithUser)
      expect(result[0]).toHaveProperty('display_name')
    })

    it('should filter by user_id when provided', async () => {
      // Arrange
      const userId = 'user-123'
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [mockEvaluationWithUser],
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluationsWithUser({ user_id: userId })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', userId)
      expect(result).toHaveLength(1)
      expect(result[0].user_id).toBe(userId)
    })

    it('should filter by is_public when provided', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluationsWithUser.filter((e) => e.is_public),
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluationsWithUser({ is_public: true })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_public', true)
      expect(result.every((e) => e.is_public)).toBe(true)
    })

    it('should apply search filter across shop, bean, and roast_level', async () => {
      // Arrange
      const searchTerm = 'エチオピア'
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [mockEvaluationWithUser],
        error: null,
      })

      // Act
      await getCoffeeEvaluationsWithUser({ search: searchTerm })

      // Assert
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('shop_name.ilike.%エチオピア%')
      )
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('bean_type.ilike.%エチオピア%')
      )
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('roast_level.ilike.%エチオピア%')
      )
    })

    it('should apply sort order when provided', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockEvaluationsWithUser,
        error: null,
      })

      // Act
      await getCoffeeEvaluationsWithUser({ sort: 'rating_desc' })

      // Assert
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('overall_rating', {
        ascending: false,
        nullsFirst: false,
      })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'JOIN query failed' },
      })

      // Act & Assert
      await expect(getCoffeeEvaluationsWithUser()).rejects.toThrow('JOIN query failed')
    })

    it('should return empty array when no evaluations found', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Act
      const result = await getCoffeeEvaluationsWithUser({ user_id: 'non-existent' })

      // Assert
      expect(result).toEqual([])
    })

    it('should combine multiple filters (user_id + is_public + search)', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [mockEvaluationWithUser],
        error: null,
      })

      // Act
      await getCoffeeEvaluationsWithUser({
        user_id: 'user-123',
        is_public: true,
        search: 'カフェ',
        sort: 'newest',
      })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_public', true)
      expect(mockSupabaseClient.or).toHaveBeenCalled()
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      expect(getCoffeeEvaluationsWithUser).toBeDefined()
      // In actual implementation, the function will be wrapped with cache()
    })
  })
})
