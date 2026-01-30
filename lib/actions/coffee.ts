/**
 * Coffee Evaluation Server Actions
 * Refactored for better maintainability with extracted helper functions
 *
 * Server Actions for CRUD operations on coffee evaluations.
 * All actions:
 * - Validate user authentication
 * - Parse and validate FormData
 * - Verify resource ownership (for update/delete)
 * - Revalidate Next.js cache before redirecting
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

/**
 * Parsed and validated form data for coffee evaluation
 */
interface ParsedEvaluationData {
  shop_name: string
  bean_type: string
  bean_name: string
  roast_level: string | null
  acidity: number
  bitterness: number
  aroma: number
  overall_rating: number
  is_public: boolean
}

type ValidationResult = { error: string } | null

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get authenticated user from Supabase session
 * @returns Authenticated user object
 * @throws Returns error response if not authenticated
 */
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

/**
 * Build consistent validation error responses that include the field name.
 * Including the raw field name keeps tests and UI messaging aligned.
 */
function buildFieldError(
  field: keyof ParsedEvaluationData,
  description: string
): { error: string } {
  return { error: `${field}: ${description}` }
}

/**
 * Safely extract a string value from FormData (falls back to empty string).
 */
function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/**
 * Parse rating fields from FormData entry to number (NaN if invalid).
 */
function parseRating(value: FormDataEntryValue | null): number {
  return typeof value === 'string' ? parseInt(value, 10) : NaN
}

/**
 * Parse coffee evaluation data from FormData
 * @param formData - Form data from client
 * @returns Parsed evaluation data object
 */
function parseEvaluationFormData(formData: FormData): ParsedEvaluationData {
  const shopName = getStringField(formData, 'shop_name').trim()
  const beanType = getStringField(formData, 'bean_type').trim()
  const beanName = getStringField(formData, 'bean_name').trim()
  const roastLevel = getStringField(formData, 'roast_level').trim()

  return {
    shop_name: shopName,
    bean_type: beanType,
    bean_name: beanName,
    roast_level: roastLevel || null,
    acidity: parseRating(formData.get('acidity')),
    bitterness: parseRating(formData.get('bitterness')),
    aroma: parseRating(formData.get('aroma')),
    overall_rating: parseRating(formData.get('overall_rating')),
    is_public: formData.get('is_public') === 'true',
  }
}

/**
 * Validate coffee evaluation data
 * @param data - Parsed evaluation data
 * @returns Null if valid, error object if invalid
 */
function validateEvaluationData(data: ParsedEvaluationData): ValidationResult {
  // Validate required fields
  if (!data.bean_name || !data.bean_name.trim()) {
    return buildFieldError('bean_name', 'bean_name is required')
  }

  // Validate rating values (1-10)
  const ratings = [
    data.acidity,
    data.bitterness,
    data.aroma,
    data.overall_rating,
  ]
  for (const rating of ratings) {
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return { error: 'rating must be between 1-10' }
    }
  }

  return null
}

/**
 * Verify that the current user owns the coffee evaluation
 * @param id - Evaluation ID
 * @param userId - Current user ID
 * @returns Null if verified, error object if not owned or not found
 */
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

/**
 * Create a new coffee evaluation from FormData
 *
 * Workflow:
 * 1. Authenticate user
 * 2. Parse and validate FormData
 * 3. Insert to database
 * 4. Revalidate cache
 * 5. Redirect to list page
 *
 * @param formData - Form data containing evaluation fields
 * @returns void on success (redirects), or error object on failure
 */
export async function createCoffeeEvaluation(
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authenticate user
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) {
    return authResult
  }
  const { user } = authResult

  // 2. Parse and validate FormData
  const data = parseEvaluationFormData(formData)
  const validationError = validateEvaluationData(data)
  if (validationError) {
    return validationError
  }

  // 3. Insert into database
  const supabase = await createClient()
  const { error: insertError } = await supabase
    .from('coffee_evaluations')
    .insert({
      user_id: user.id,
      shop_name: data.shop_name,
      bean_type: data.bean_type,
      bean_name: data.bean_name,
      roast_level: data.roast_level,
      acidity: data.acidity,
      bitterness: data.bitterness,
      aroma: data.aroma,
      overall_rating: data.overall_rating,
      is_public: data.is_public,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  // 4. Revalidate cache BEFORE redirect
  revalidatePath('/coffee')
  revalidatePath('/coffee/my')

  // 5. Redirect to user's my page
  redirect('/coffee/my')
}

/**
 * Update an existing coffee evaluation from FormData
 *
 * Workflow:
 * 1. Authenticate user
 * 2. Parse and validate FormData
 * 3. Verify ownership
 * 4. Update database
 * 5. Revalidate cache
 * 6. Redirect to detail page
 *
 * @param id - Coffee evaluation ID to update
 * @param formData - Form data containing updated fields
 * @returns void on success (redirects), or error object on failure
 */
export async function updateCoffeeEvaluation(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authenticate user
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) {
    return authResult
  }
  const { user } = authResult

  // 2. Parse and validate FormData
  const data = parseEvaluationFormData(formData)
  const validationError = validateEvaluationData(data)
  if (validationError) {
    return validationError
  }

  // 3. Verify ownership
  const ownershipError = await verifyEvaluationOwnership(id, user.id)
  if (ownershipError) {
    return ownershipError
  }

  // 4. Update database
  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('coffee_evaluations')
    .update({
      shop_name: data.shop_name,
      bean_type: data.bean_type,
      bean_name: data.bean_name,
      roast_level: data.roast_level,
      acidity: data.acidity,
      bitterness: data.bitterness,
      aroma: data.aroma,
      overall_rating: data.overall_rating,
      is_public: data.is_public,
    })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  // 5. Revalidate caches BEFORE redirect
  revalidatePath('/coffee')
  revalidatePath(`/coffee/${id}`)

  // 6. Redirect to detail page
  redirect(`/coffee/${id}`)
}

/**
 * Delete a coffee evaluation by ID
 *
 * Workflow:
 * 1. Authenticate user
 * 2. Verify ownership
 * 3. Delete from database
 * 4. Revalidate cache
 * 5. Redirect to list page
 *
 * @param id - Coffee evaluation ID to delete
 * @returns void on success (redirects), or error object on failure
 */
export async function deleteCoffeeEvaluation(
  id: string
): Promise<ActionResponse> {
  // 1. Authenticate user
  const authResult = await getAuthenticatedUser()
  if ('error' in authResult) {
    return authResult
  }
  const { user } = authResult

  // 2. Verify ownership
  const ownershipError = await verifyEvaluationOwnership(id, user.id)
  if (ownershipError) {
    return ownershipError
  }

  // 3. Delete from database
  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('coffee_evaluations')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // 4. Revalidate cache BEFORE redirect
  revalidatePath('/coffee')
  revalidatePath('/coffee/my')

  // 5. Redirect to user's my page
  redirect('/coffee/my')
}
