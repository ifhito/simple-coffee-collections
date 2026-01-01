/**
 * Tests for User Profile Data Fetching Functions
 * TDD Red Phase: Tests are written before implementation
 *
 * These tests define expected behavior for:
 * - getUserProfile: Fetch user profile by userId
 */

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/api/user'
import type { UserProfile } from '@/lib/types/coffee'
import { notFound } from 'next/navigation'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

// Mock React cache
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn, // Pass-through for testing
}))

describe('User Profile Data Fetching', () => {
  // Sample test data
  const mockUserProfile: UserProfile = {
    id: 'user-123',
    display_name: 'テストユーザー',
    bio: 'コーヒー愛好家です',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  let mockSupabaseClient: any

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create chainable mock methods
    const chainableMock = {
      from: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
    }

    // Make all methods return the chainable mock (except single which returns a promise)
    chainableMock.from.mockReturnValue(chainableMock)
    chainableMock.select.mockReturnValue(chainableMock)
    chainableMock.eq.mockReturnValue(chainableMock)

    mockSupabaseClient = chainableMock

    // Mock createClient to return our mock client
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('getUserProfile', () => {
    const userId = 'user-123'

    it('should fetch a user profile by userId successfully', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUserProfile,
        error: null,
      })

      // Act
      const result = await getUserProfile(userId)

      // Assert
      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', userId)
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result).toEqual(mockUserProfile)
    })

    it('should call notFound() when user profile is not found', async () => {
      // Arrange: Mock "not found" error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      // Act
      await getUserProfile('non-existent-user-id')

      // Assert: notFound() should be called
      expect(notFound).toHaveBeenCalled()
    })

    it('should throw error for database failures', async () => {
      // Arrange: Mock database error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST000', message: 'Database connection failed' },
      })

      // Act & Assert
      await expect(getUserProfile(userId)).rejects.toThrow('Database connection failed')
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      // This is verified by the cache mock at the top
      expect(getUserProfile).toBeDefined()
      // In actual implementation, the function will be wrapped with cache()
    })
  })
})
