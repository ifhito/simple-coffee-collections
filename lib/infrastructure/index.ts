/**
 * Infrastructure Layer Barrel Export
 * 
 * Contains all external technology implementations:
 * - Supabase client factories
 * - Repository implementations
 * 
 * @module lib/infrastructure
 */

export * from './supabase'
export * from './repositories'

export { MastraBeanRecommendationExecutor } from './bean-recommendation/mastra-bean-recommendation-executor'
