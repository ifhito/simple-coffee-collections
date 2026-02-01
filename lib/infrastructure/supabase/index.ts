/**
 * Supabase Infrastructure Module
 * 
 * @module lib/infrastructure/supabase
 */

export { createClient as createServerClient } from './server'
export { createClient as createBrowserClient } from './client'
export { updateSession } from './middleware'
