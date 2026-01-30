# Tasks Document - DDD + Clean Architecture

## Phase 1: Foundation (Value Objects)

- [x] 1.1. Create Result<T,E> type
  - File: lib/domain/shared/result.ts
  - Implement Result monad with ok, fail, isOk, isFail, map, flatMap helpers
  - Purpose: Provide type-safe error handling without exceptions
  - _Requirements: US-1 (domain logic separation)_

- [x] 1.2. Create Value Objects
  - Files: lib/domain/coffee-evaluation/value-objects/*.ts
  - Implement Rating, BeanInfo, ShopInfo, Visibility as immutable value objects
  - Factory methods with self-validation
  - Purpose: Encapsulate validation rules in domain objects
  - _Requirements: US-1 (domain logic separation), US-3 (testability)_

## Phase 2: Entity & Repository Interface

- [x] 2.1. Create CoffeeEvaluation entity
  - File: lib/domain/coffee-evaluation/entity.ts
  - Aggregate root combining value objects
  - Domain methods: isOwnedBy, isViewableBy, update, toggleVisibility
  - Purpose: Model business rules as entity behavior
  - _Requirements: US-1 (domain logic separation)_

- [x] 2.2. Create Repository interface
  - File: lib/domain/coffee-evaluation/repository.ts
  - Define CRUD operations, search, count as abstract interface
  - Purpose: Establish contract for data persistence
  - _Requirements: US-2 (database abstraction)_

## Phase 3: Infrastructure Layer

- [x] 3.1. Build infrastructure layer
  - Files: lib/infrastructure/**/*.ts, lib/di/container.ts
  - Move Supabase clients to infrastructure
  - Implement SupabaseCoffeeEvaluationRepository
  - Create DI container with factory functions
  - Purpose: Implement repository interface with Supabase
  - _Requirements: US-2 (database abstraction), NF-2 (compatibility)_

## Phase 4: Application Layer

- [x] 4.1. Build application layer
  - Files: lib/application/coffee-evaluation/*.ts
  - Create DTOs for input/output
  - Implement CreateEvaluationUseCase, UpdateEvaluationUseCase, DeleteEvaluationUseCase
  - Implement GetEvaluationUseCase, ListEvaluationsUseCase
  - Purpose: Orchestrate domain logic through use cases
  - _Requirements: US-1, US-2_

## Phase 5: Server Actions Integration

- [x] 5.1. Refactor Server Actions
  - File: lib/actions/coffee.ts
  - Convert to use cases and DI container
  - Parse FormData to DTOs, execute use cases, handle redirects
  - Purpose: Make Server Actions thin adapters
  - _Requirements: NF-2 (compatibility)_

## Phase 6: Testing

- [x] 6.1. Create domain unit tests
  - Files: lib/domain/__tests__/*.test.ts
  - Test Rating, BeanInfo, CoffeeEvaluation
  - 43 test cases covering value objects and entity behavior
  - Purpose: Verify domain logic in isolation
  - _Requirements: US-3 (testability)_

## Completion Status
- All tasks completed: 2026-01-27
