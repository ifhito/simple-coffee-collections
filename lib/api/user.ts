/**
 * User Profile Data Fetching Layer
 *
 * All functions are wrapped with React cache() for request memoization
 * in Server Components to prevent duplicate database queries within the same request.
 *
 * @module lib/api/user
 */

import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/types/coffee'

/**
 * Fetch a user profile by user ID
 *
 * @param userId - UUID of the user
 * @returns UserProfile object
 * @throws Calls notFound() if user profile is not found
 * @throws Error if database query fails
 *
 * @example
 * ```ts
 * const profile = await getUserProfile('user-123')
 * // Returns UserProfile with display_name, bio, etc.
 * ```
 */
export const getUserProfile = cache(
  async (userId: string): Promise<UserProfile> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Early return on success
    if (!error) {
      return data
    }

    // Handle "not found" error (PGRST116 = no rows returned)
    if (error.code === 'PGRST116') {
      return notFound() as never // notFound() throws and never returns
    }

    // Handle other database errors
    throw new Error(error.message)
  }
)
