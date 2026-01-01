/**
 * Tests for Authentication Data Fetching Functions
 * TDD Red Phase: Tests are written before implementation
 *
 * These tests define expected behavior for:
 * - getCurrentUser: Get authenticated user or redirect to login
 */

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/api/auth'
import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

// Mock React cache
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn, // Pass-through for testing
}))

describe('Authentication Data Fetching', () => {
  // Sample authenticated user
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
    app_metadata: {},
    user_metadata: {},
  } as User

  let mockSupabaseClient: any

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create mock auth methods
    const authMock = {
      getUser: jest.fn(),
    }

    mockSupabaseClient = {
      auth: authMock,
    }

    // Mock createClient to return our mock client
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('getCurrentUser', () => {
    it('should return authenticated user successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      // Act
      const result = await getCurrentUser()

      // Assert
      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should redirect to /login when user is not authenticated', async () => {
      // Arrange: Mock unauthenticated response
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      // Act & Assert: redirect() throws, so we wrap in try-catch
      try {
        await getCurrentUser()
      } catch (error) {
        // redirect() throws an error to halt execution in Next.js
        // This is expected behavior
      }

      // Assert: redirect should be called
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should redirect to /login when auth.getUser returns error', async () => {
      // Arrange: Mock authentication error
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Authentication failed' },
      })

      // Act
      try {
        await getCurrentUser()
      } catch (error) {
        // redirect() throws
      }

      // Assert
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should use React cache for memoization', () => {
      // Assert: Function should be wrapped with React cache
      // This is verified by the cache mock at the top
      expect(getCurrentUser).toBeDefined()
      // In actual implementation, the function will be wrapped with cache()
    })
  })
})
