/**
 * Dependency Injection Container
 * 
 * Factory functions for creating repository instances.
 * This is where the dependency inversion is "wired" - where we choose
 * which implementation to use for each interface.
 * 
 * In production: uses Supabase implementations
 * In tests: can inject mock implementations
 * 
 * @module lib/di/container
 */

import type { CoffeeEvaluationRepository } from '@/lib/domain'
import { SupabaseCoffeeEvaluationRepository } from '@/lib/infrastructure'

/**
 * Singleton instance of CoffeeEvaluationRepository
 * Reused across requests to avoid creating new instances each time
 */
let coffeeEvaluationRepositoryInstance: CoffeeEvaluationRepository | null = null

/**
 * Get the CoffeeEvaluationRepository instance
 * 
 * Uses lazy initialization to create the repository on first access.
 * In production, returns SupabaseCoffeeEvaluationRepository.
 * 
 * @returns CoffeeEvaluationRepository instance
 */
export function getCoffeeEvaluationRepository(): CoffeeEvaluationRepository {
  if (!coffeeEvaluationRepositoryInstance) {
    coffeeEvaluationRepositoryInstance = new SupabaseCoffeeEvaluationRepository()
  }
  return coffeeEvaluationRepositoryInstance
}

/**
 * Create a CoffeeEvaluationRepository with optional custom implementation
 * 
 * Useful for testing - allows injecting mock repositories.
 * 
 * @param impl - Optional custom implementation to use
 * @returns CoffeeEvaluationRepository instance
 * 
 * @example
 * ```ts
 * // In tests
 * const mockRepo = new MockCoffeeEvaluationRepository()
 * const repo = createCoffeeEvaluationRepository(mockRepo)
 * ```
 */
export function createCoffeeEvaluationRepository(
  impl?: CoffeeEvaluationRepository
): CoffeeEvaluationRepository {
  return impl ?? new SupabaseCoffeeEvaluationRepository()
}

/**
 * Reset the singleton instance (for testing purposes)
 * 
 * Call this in test cleanup to ensure fresh instances between tests.
 */
export function resetRepositories(): void {
  coffeeEvaluationRepositoryInstance = null
}

/**
 * Set a custom repository instance (for testing purposes)
 * 
 * @param repo - The repository instance to use
 */
export function setCoffeeEvaluationRepository(repo: CoffeeEvaluationRepository): void {
  coffeeEvaluationRepositoryInstance = repo
}
