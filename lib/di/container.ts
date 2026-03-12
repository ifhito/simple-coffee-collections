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
import { SupabaseCoffeeEvaluationRepository, SupabaseShopRepository } from '@/lib/infrastructure'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import { SupabaseUserLlmSettingsRepository } from '@/lib/infrastructure/repositories/supabase-user-llm-settings-repository'
import type { ApiKeyEncryptor, LlmModelFactory, OcrExecutor } from '@/lib/application/ports'
import { Aes256GcmEncryptor } from '@/lib/infrastructure/crypto/aes-256-gcm-encryptor'
import { DefaultLlmModelFactory } from '@/lib/infrastructure/llm/default-llm-model-factory'
import { MastraOcrExecutor } from '@/lib/infrastructure/ocr/mastra-ocr-executor'

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
  shopRepositoryInstance = null
  userLlmSettingsRepositoryInstance = null
  apiKeyEncryptorInstance = null
  llmModelFactoryInstance = null
  ocrExecutorInstance = null
}

/**
 * Set a custom repository instance (for testing purposes)
 * 
 * @param repo - The repository instance to use
 */
export function setCoffeeEvaluationRepository(repo: CoffeeEvaluationRepository): void {
  coffeeEvaluationRepositoryInstance = repo
}

// =============================================================================
// ShopRepository (also implements ShopSearchProvider)
// =============================================================================

let shopRepositoryInstance: SupabaseShopRepository | null = null

export function getShopRepository(): SupabaseShopRepository {
  if (!shopRepositoryInstance) {
    shopRepositoryInstance = new SupabaseShopRepository()
  }
  return shopRepositoryInstance
}

export function setShopRepository(repo: SupabaseShopRepository): void {
  shopRepositoryInstance = repo
}

// =============================================================================
// UserLlmSettingsRepository
// =============================================================================

let userLlmSettingsRepositoryInstance: UserLlmSettingsRepository | null = null

export function getUserLlmSettingsRepository(): UserLlmSettingsRepository {
  if (!userLlmSettingsRepositoryInstance) {
    userLlmSettingsRepositoryInstance = new SupabaseUserLlmSettingsRepository()
  }
  return userLlmSettingsRepositoryInstance
}

export function setUserLlmSettingsRepository(repo: UserLlmSettingsRepository): void {
  userLlmSettingsRepositoryInstance = repo
}

// =============================================================================
// ApiKeyEncryptor
// =============================================================================

let apiKeyEncryptorInstance: ApiKeyEncryptor | null = null

export function getApiKeyEncryptor(): ApiKeyEncryptor {
  if (!apiKeyEncryptorInstance) {
    apiKeyEncryptorInstance = new Aes256GcmEncryptor()
  }
  return apiKeyEncryptorInstance
}

export function setApiKeyEncryptor(encryptor: ApiKeyEncryptor): void {
  apiKeyEncryptorInstance = encryptor
}

// =============================================================================
// LlmModelFactory
// =============================================================================

let llmModelFactoryInstance: LlmModelFactory | null = null

export function getLlmModelFactory(): LlmModelFactory {
  if (!llmModelFactoryInstance) {
    llmModelFactoryInstance = new DefaultLlmModelFactory()
  }
  return llmModelFactoryInstance
}

export function setLlmModelFactory(factory: LlmModelFactory): void {
  llmModelFactoryInstance = factory
}

// =============================================================================
// OcrExecutor
// =============================================================================

let ocrExecutorInstance: OcrExecutor | null = null

export function getOcrExecutor(): OcrExecutor {
  if (!ocrExecutorInstance) {
    ocrExecutorInstance = new MastraOcrExecutor()
  }
  return ocrExecutorInstance
}

export function setOcrExecutor(executor: OcrExecutor): void {
  ocrExecutorInstance = executor
}
