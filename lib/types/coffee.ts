/**
 * Coffee Evaluation Type Definitions
 * Provides type safety for coffee evaluation data structures
 * Based on coffee_evaluations and user_profiles database schema
 */

import type { Database } from './database.types'

// =============================================================================
// Database Table Types (Re-exported from generated types)
// =============================================================================

/** Coffee evaluation record from database */
export type CoffeeEvaluation = Database['public']['Tables']['coffee_evaluations']['Row']

/** Coffee evaluation insert payload */
export type CoffeeEvaluationInsert = Database['public']['Tables']['coffee_evaluations']['Insert']

/** Coffee evaluation update payload */
export type CoffeeEvaluationUpdate = Database['public']['Tables']['coffee_evaluations']['Update']

/** User profile record from database */
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

/** User profile insert payload */
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

/** User profile update payload */
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// =============================================================================
// Extended Types (with JOINs)
// =============================================================================

/**
 * Coffee evaluation with user display name (from JOIN with user_profiles)
 * Used in community feed and user profile pages
 */
export interface CoffeeEvaluationWithUser extends CoffeeEvaluation {
  display_name: string | null
}

// =============================================================================
// Form Input Types
// =============================================================================

/**
 * Form data for creating a new coffee evaluation
 * Bean name and rating fields are required; shop name, bean type, and roast level are optional
 */
export interface CoffeeEvaluationFormInput {
  shop_name?: string
  bean_type?: string
  bean_name: string
  roast_level: string | null
  notes?: string | null
  acidity?: number
  bitterness?: number
  aroma?: number
  overall_rating?: number
  is_public: boolean
}

/**
 * Form data for editing an existing coffee evaluation
 * All fields are optional for partial updates
 */
export interface CoffeeEvaluationEditFormInput {
  shop_name?: string
  bean_type?: string
  bean_name?: string
  roast_level?: string | null
  notes?: string | null
  acidity?: number
  bitterness?: number
  aroma?: number
  overall_rating?: number
  is_public?: boolean
}

/**
 * User profile form input for creating/updating profile
 */
export interface UserProfileFormInput {
  display_name: string | null
  bio: string | null
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Rating value type (1-10 scale)
 * Used for all rating fields: acidity, bitterness, aroma, overall_rating
 */
export type RatingValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Validation constraints for coffee evaluation
 */
export const CoffeeEvaluationValidation = {
  shop_name: {
    required: false,
    maxLength: 255,
  },
  bean_type: {
    required: false,
    maxLength: 255,
  },
  bean_name: {
    required: true,
    maxLength: 255,
  },
  roast_level: {
    required: false,
    maxLength: 100,
  },
  notes: {
    required: false,
    maxLength: 500,
  },
  rating: {
    min: 1,
    max: 10,
  },
} as const

/**
 * Validation constraints for user profile
 */
export const UserProfileValidation = {
  display_name: {
    required: false,
    maxLength: 100,
  },
  bio: {
    required: false,
    maxLength: 500,
  },
} as const

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Coffee evaluation with user profile joined
 * Used for displaying evaluation list with creator info
 */
export interface CoffeeEvaluationWithProfile extends CoffeeEvaluation {
  user_profile?: UserProfile | null
}

/**
 * Form validation error messages
 */
export interface FormValidationErrors {
  shop_name?: string
  bean_type?: string
  bean_name?: string
  roast_level?: string
  notes?: string
  acidity?: string
  bitterness?: string
  aroma?: string
  overall_rating?: string
  is_public?: string
  _form?: string // General form error
}

/**
 * Server Action response type
 * Returns either success (void) or error (object with error message)
 */
export type ServerActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// =============================================================================
// Search & Filter Types
// =============================================================================

/**
 * Sort options for coffee evaluation list
 */
export type CoffeeEvaluationSortOption =
  | 'created_at_desc'    // Newest first (default)
  | 'created_at_asc'     // Oldest first
  | 'rating_desc'        // Highest rating first
  | 'rating_asc'         // Lowest rating first
  | 'shop_name_asc'      // Shop name A-Z
  | 'shop_name_desc'     // Shop name Z-A

/**
 * Search and filter parameters for coffee evaluations
 */
export interface CoffeeEvaluationSearchParams {
  search?: string                          // Search query (shop_name, bean_type, roast_level)
  sort?: CoffeeEvaluationSortOption        // Sort option
  user_id?: string                         // Filter by user
  is_public?: boolean                      // Filter by visibility
  evaluation_status?: 'all' | 'evaluated' | 'unevaluated'  // Filter by evaluation status
}
