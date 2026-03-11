/**
 * Coffee Evaluation Server Actions
 *
 * Server Actions for CRUD operations on coffee evaluations.
 * Bean info and ratings are separated as independent concerns.
 *
 * @module lib/actions/coffee
 */

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Server Action response type
 * Returns void on success (followed by redirect), or error object on failure
 */
type ActionResponse = { error: string } | void

interface ParsedBeanInfo {
  shop_name: string
  bean_type: string
  bean_name: string
  roast_level: string | null
  is_public: boolean
}

interface ParsedRatings {
  acidity: number
  bitterness: number
  aroma: number
  overall_rating: number
}

type ValidationResult = { error: string } | null

// =============================================================================
// Helper Functions
// =============================================================================

async function getAuthenticatedUser(): Promise<
  { user: User } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: '認証が必要です' }
  }

  return { user }
}

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function parseNullableRating(value: FormDataEntryValue | null): number | null {
  if (value === null || value === '') return null
  return typeof value === 'string' ? parseInt(value, 10) : NaN
}

function parseRating(value: FormDataEntryValue | null): number {
  return typeof value === 'string' ? parseInt(value, 10) : NaN
}

// =============================================================================
// Parse Functions (separated by concern)
// =============================================================================

function parseBeanInfoFormData(formData: FormData): ParsedBeanInfo {
  return {
    shop_name: getStringField(formData, 'shop_name').trim(),
    bean_type: getStringField(formData, 'bean_type').trim(),
    bean_name: getStringField(formData, 'bean_name').trim(),
    roast_level: getStringField(formData, 'roast_level').trim() || null,
    is_public: formData.get('is_public') === 'true',
  }
}

function parseRatingsFormData(
  formData: FormData,
  options?: { allowSkipEvaluation?: boolean }
): { ratings: ParsedRatings | null } | { error: string } {
  const skipEvaluation =
    options?.allowSkipEvaluation !== false &&
    formData.get('skip_evaluation') === 'true'

  if (skipEvaluation) return { ratings: null }

  const values = [
    parseNullableRating(formData.get('acidity')),
    parseNullableRating(formData.get('bitterness')),
    parseNullableRating(formData.get('aroma')),
    parseNullableRating(formData.get('overall_rating')),
  ]

  const nullCount = values.filter((v) => v === null).length

  // All null → no ratings
  if (nullCount === 4) return { ratings: null }

  // Partial → error (all-or-nothing)
  if (nullCount > 0) {
    return { error: '評価値は全て入力するか、全て空にしてください' }
  }

  return {
    ratings: {
      acidity: values[0]!,
      bitterness: values[1]!,
      aroma: values[2]!,
      overall_rating: values[3]!,
    },
  }
}

// =============================================================================
// Validation Functions (separated by concern)
// =============================================================================

function validateBeanInfo(data: ParsedBeanInfo): ValidationResult {
  if (!data.bean_name || !data.bean_name.trim()) {
    return { error: 'bean_name: bean_name is required' }
  }
  return null
}

function validateRatings(data: ParsedRatings): ValidationResult {
  const ratings = [data.acidity, data.bitterness, data.aroma, data.overall_rating]

  for (const rating of ratings) {
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return { error: 'rating must be between 1-10' }
    }
  }

  return null
}

// =============================================================================
// Ownership Verification
// =============================================================================

async function verifyEvaluationOwnership(
  id: string,
  userId: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from('coffee_evaluations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { error: '評価が見つかりません' }
    }
    return { error: fetchError.message }
  }

  if (existing.user_id !== userId) {
    return { error: '権限がありません' }
  }

  return null
}

// =============================================================================
// Server Actions
// =============================================================================

export async function createCoffeeEvaluation(
  formData: FormData
): Promise<ActionResponse> {
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) return authResult
  const { user } = authResult

  const beanInfo = parseBeanInfoFormData(formData)
  const ratingsResult = parseRatingsFormData(formData)
  if ('error' in ratingsResult) return ratingsResult
  const { ratings } = ratingsResult

  const beanError = validateBeanInfo(beanInfo)
  if (beanError) return beanError

  if (ratings) {
    const ratingsError = validateRatings(ratings)
    if (ratingsError) return ratingsError
  }

  const supabase = await createClient()
  const { error: insertError } = await supabase
    .from('coffee_evaluations')
    .insert({
      user_id: user.id,
      ...beanInfo,
      ...(ratings ?? {}),
    })

  if (insertError) return { error: insertError.message }

  revalidatePath('/coffee')
  revalidatePath('/coffee/my')
  redirect('/coffee/my')
}

export async function updateCoffeeEvaluation(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) return authResult
  const { user } = authResult

  const beanInfo = parseBeanInfoFormData(formData)
  const ratingsResult = parseRatingsFormData(formData, { allowSkipEvaluation: false })
  if ('error' in ratingsResult) return ratingsResult
  const { ratings } = ratingsResult

  const beanError = validateBeanInfo(beanInfo)
  if (beanError) return beanError

  if (ratings) {
    const ratingsError = validateRatings(ratings)
    if (ratingsError) return ratingsError
  }

  // Verify ownership and get existing data
  const supabase = await createClient()
  const { data: existing, error: fetchError } = await supabase
    .from('coffee_evaluations')
    .select('user_id, overall_rating')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { error: '評価が見つかりません' }
    }
    return { error: fetchError.message }
  }

  if (existing.user_id !== user.id) {
    return { error: '権限がありません' }
  }

  // Prevent removing existing ratings (evaluation downgrade)
  const wasEvaluated = existing.overall_rating !== null
  if (wasEvaluated && !ratings) {
    return { error: '評価済みの豆から評価を取り消すことはできません' }
  }

  // Build update payload — only include ratings if present
  const updatePayload: Record<string, unknown> = {
    shop_name: beanInfo.shop_name,
    bean_type: beanInfo.bean_type,
    bean_name: beanInfo.bean_name,
    roast_level: beanInfo.roast_level,
    is_public: beanInfo.is_public,
  }

  if (ratings) {
    updatePayload.acidity = ratings.acidity
    updatePayload.bitterness = ratings.bitterness
    updatePayload.aroma = ratings.aroma
    updatePayload.overall_rating = ratings.overall_rating
  }

  const { error: updateError } = await supabase
    .from('coffee_evaluations')
    .update(updatePayload)
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/coffee')
  revalidatePath(`/coffee/${id}`)
  redirect(`/coffee/${id}`)
}

export async function deleteCoffeeEvaluation(
  id: string
): Promise<ActionResponse> {
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) return authResult
  const { user } = authResult

  const ownershipError = await verifyEvaluationOwnership(id, user.id)
  if (ownershipError) return ownershipError

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('coffee_evaluations')
    .delete()
    .eq('id', id)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/coffee')
  revalidatePath('/coffee/my')
  redirect('/coffee/my')
}

export async function addEvaluation(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) return authResult
  const { user } = authResult

  const ownershipError = await verifyEvaluationOwnership(id, user.id)
  if (ownershipError) return ownershipError

  // Parse and validate ratings (all required for addEvaluation)
  const acidity = parseRating(formData.get('acidity'))
  const bitterness = parseRating(formData.get('bitterness'))
  const aroma = parseRating(formData.get('aroma'))
  const overallRating = parseRating(formData.get('overall_rating'))

  const allRatings = [acidity, bitterness, aroma, overallRating]
  for (const rating of allRatings) {
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return { error: 'rating must be between 1-10' }
    }
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('coffee_evaluations')
    .update({
      acidity,
      bitterness,
      aroma,
      overall_rating: overallRating,
    })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/coffee')
  revalidatePath(`/coffee/${id}`)
  revalidatePath('/coffee/my')
  redirect(`/coffee/${id}`)
}
