/**
 * @jest-environment node
 */
import { signUp, signIn, signOut } from './auth'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

const { createClient } = require('../supabase/server')
const { redirect } = require('next/navigation')

describe('Auth Server Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
      },
    }
    createClient.mockResolvedValue(mockSupabase)
  })

  describe('signUp', () => {
    it('signs up user successfully with valid credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      await expect(signUp(formData)).rejects.toThrow('NEXT_REDIRECT:/')
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('returns error when email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')

      const result = await signUp(formData)

      expect(result).toEqual({ error: 'メールアドレスを入力してください' })
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when password is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await signUp(formData)

      expect(result).toEqual({ error: 'パスワードを入力してください' })
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when password is too short', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '12345')

      const result = await signUp(formData)

      expect(result).toEqual({ error: 'パスワードは6文字以上である必要があります' })
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when email format is invalid', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')

      const result = await signUp(formData)

      expect(result).toEqual({ error: '有効なメールアドレスを入力してください' })
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when Supabase signUp fails', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      const result = await signUp(formData)

      expect(result).toEqual({ error: 'User already registered' })
    })
  })

  describe('signIn', () => {
    it('signs in user successfully with valid credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      await expect(signIn(formData)).rejects.toThrow('NEXT_REDIRECT:/')
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('returns error when email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'メールアドレスを入力してください' })
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('returns error when password is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'パスワードを入力してください' })
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('returns error when credentials are invalid', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'Invalid login credentials' })
    })
  })

  describe('signOut', () => {
    it('signs out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/login')
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('handles sign out error gracefully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/login')
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      // Still redirects even on error
      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})
