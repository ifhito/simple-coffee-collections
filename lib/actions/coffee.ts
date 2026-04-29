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
import { CoffeeEvaluationValidation } from '@/lib/types/coffee'
import { getShopRepository } from '@/lib/di/container'
import type { User } from '@supabase/supabase-js'

/**
 * Server Action response type
 * Returns void on success (followed by redirect), or error object on failure
 */
type ActionResponse = { error: string } | void

type ParsedBeanInfo = {
  shop_name: string
  shop_id: string | null
  bean_type: string
  bean_name: string
  roast_level: string | null
  notes: string | null
  is_public: boolean
}

type ParsedRatings = {
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
  const notes = getStringField(formData, 'notes').trim()
  const shopId = getStringField(formData, 'shop_id').trim()
  return {
    shop_name: getStringField(formData, 'shop_name').trim(),
    shop_id: shopId || null,
    bean_type: getStringField(formData, 'bean_type').trim(),
    bean_name: getStringField(formData, 'bean_name').trim(),
    roast_level: getStringField(formData, 'roast_level').trim() || null,
    notes: notes || null,
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
  if (data.notes && data.notes.length > CoffeeEvaluationValidation.notes.maxLength) {
    return {
      error: `notes: notes must be ${CoffeeEvaluationValidation.notes.maxLength} characters or less`,
    }
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
// Shop Resolution
// =============================================================================

type ShopIdResult = { shopId: string | null } | { error: string }

async function resolveShopId(beanInfo: ParsedBeanInfo): Promise<ShopIdResult> {
  if (beanInfo.shop_id) return { shopId: beanInfo.shop_id }
  if (!beanInfo.shop_name) return { shopId: null }

  const shopRepo = getShopRepository()
  const result = await shopRepo.findOrCreate(beanInfo.shop_name)
  if (!result.ok) {
    return { error: '店舗の登録に失敗しました。もう一度お試しください。' }
  }
  return { shopId: result.value.id }
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

  const shopIdResult = await resolveShopId(beanInfo)
  if ('error' in shopIdResult) return shopIdResult
  const { shopId } = shopIdResult

  const supabase = await createClient()
  const { error: insertError } = await supabase
    .from('coffee_evaluations')
    .insert({
      user_id: user.id,
      shop_id: shopId,
      bean_type: beanInfo.bean_type,
      bean_name: beanInfo.bean_name,
      roast_level: beanInfo.roast_level,
      notes: beanInfo.notes,
      is_public: beanInfo.is_public,
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

  const shopIdResult = await resolveShopId(beanInfo)
  if ('error' in shopIdResult) return shopIdResult
  const { shopId } = shopIdResult

  // Build update payload — only include ratings if present
  const updatePayload: Record<string, unknown> = {
    shop_id: shopId,
    bean_type: beanInfo.bean_type,
    bean_name: beanInfo.bean_name,
    roast_level: beanInfo.roast_level,
    notes: beanInfo.notes,
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

  const notes = getStringField(formData, 'notes').trim()
  if (notes.length > CoffeeEvaluationValidation.notes.maxLength) {
    return { error: `notes: notes must be ${CoffeeEvaluationValidation.notes.maxLength} characters or less` }
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('coffee_evaluations')
    .update({
      acidity,
      bitterness,
      aroma,
      overall_rating: overallRating,
      notes: notes || null,
    })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/coffee')
  revalidatePath(`/coffee/${id}`)
  revalidatePath('/coffee/my')
  redirect(`/coffee/${id}`)
}
