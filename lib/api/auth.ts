/**
 * Authentication Data Fetching Layer
 *
 * All functions are wrapped with React cache() for request memoization
 * in Server Components to prevent duplicate auth checks within the same request.
 *
 * @module lib/api/auth
 */

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Get the currently authenticated user or redirect to login
 *
 * @returns Authenticated User object
 * @throws Redirects to /login if user is not authenticated (via redirect())
 *
 * @example
 * ```ts
 * const user = await getCurrentUser()
 * // Returns User object, or redirects to /login if not authenticated
 * ```
 */
export const getCurrentUser = cache(async (): Promise<User> => {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated or error occurred
  if (!user || error) {
    redirect('/login')
  }

  return user
})
