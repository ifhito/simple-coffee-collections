# Tasks Document - Coffee Evaluation Feature

> **Development Methodology**: Test-Driven Development (TDD)
>
> Each feature follows the **Red → Green → Refactor** cycle:
> - **🔴 Red**: Write a failing test first
> - **🟢 Green**: Write minimal code to make the test pass
> - **🔵 Refactor**: Improve code while keeping tests green

## Phase 1: Foundation (Database & Types)

- [x] 1.1. Run database migrations
  - File: supabase/migrations/20251231010000_coffee_evaluations_schema.sql
  - Execute migration to create coffee_evaluations and user_profiles tables
  - Verify RLS policies and indexes are created
  - Purpose: Set up database schema with proper security and performance
  - _Leverage: Existing migration file created by supabase-db-designer_
  - _Requirements: All (database foundation)_
  - _Prompt: Role: Database Administrator with Supabase expertise | Task: Execute the database migration file to create coffee_evaluations and user_profiles tables with RLS policies and indexes, verifying all constraints and triggers are properly set up | Restrictions: Do not modify existing auth.users table, ensure RLS is enabled before creating policies, verify pg_trgm extension is available | Success: All tables created with proper structure, RLS policies active and tested, indexes created for performance, triggers functioning correctly_

- [x] 1.2. Create TypeScript types for coffee evaluation
  - File: lib/types/coffee.ts
  - Define CoffeeEvaluation and UserProfile interfaces matching database schema
  - Add validation types for form inputs
  - Purpose: Establish type safety for coffee evaluation data structures
  - _Leverage: Database schema from design.md, existing type patterns_
  - _Requirements: 1, 2, 3 (data structure for all CRUD operations)_
  - _Prompt: Role: TypeScript Developer specializing in type systems and database schema mapping | Task: Create comprehensive TypeScript interfaces for CoffeeEvaluation and UserProfile matching the PostgreSQL schema, including validation types for form inputs with proper null handling and date string types | Restrictions: Match database schema exactly (nullable fields must be type | null), use ISO string for timestamps, include validation helper types, follow existing type naming conventions | Success: All interfaces compile without errors, proper null/undefined handling, types match database schema precisely, includes helper types for form validation_

## Phase 2: Data Layer (TDD) - API & Server Actions

### 🔴 Red: Write Tests First

- [x] 2.1. Write tests for data fetching functions (Red)
  - File: lib/__tests__/api/coffee.test.ts
  - Write tests for getCoffeeEvaluations, getCoffeeEvaluation, searchCoffeeEvaluations
  - Mock Supabase client to expect specific queries
  - Purpose: Define expected behavior before implementation
  - _Leverage: Jest, Supabase mocks, existing test patterns_
  - _Requirements: 2 (list), 3 (detail), 6 (search)_
  - _Prompt: Role: QA Engineer with TDD and Jest expertise | Task: Write failing tests for lib/api/coffee.ts functions before they exist, mocking Supabase client to define expected queries, testing success scenarios, error handling, and cache() behavior | Restrictions: Tests must fail initially (Red phase), mock Supabase completely, test both success and error paths, define clear expectations for cache() memoization, do not implement functions yet | Success: Tests written and failing (Red), clear expectations set for data fetching behavior, mocks properly configured, tests are comprehensive and maintainable_

- [x] 2.2. Write tests for Server Actions (Red)
  - File: lib/__tests__/actions/coffee.test.ts
  - Write tests for createCoffeeEvaluation, updateCoffeeEvaluation, deleteCoffeeEvaluation
  - Mock Supabase, redirect, and revalidatePath
  - Purpose: Define mutation behavior and error handling before implementation
  - _Leverage: Jest, Supabase mocks, Next.js mocks_
  - _Requirements: 1 (create), 4 (edit), 5 (delete)_
  - _Prompt: Role: QA Engineer with Server Actions testing expertise | Task: Write failing tests for Server Actions before implementation, mocking Supabase and Next.js utilities, testing FormData parsing, validation errors, successful mutations, and cache invalidation flow | Restrictions: Tests must fail initially (Red phase), mock all external dependencies, test FormData input handling, verify revalidatePath called before redirect, define error return format {error: string}, do not implement Server Actions yet | Success: Tests written and failing (Red), clear expectations for Server Actions behavior, FormData mocking correct, error scenarios well-defined_

### 🟢 Green: Implement to Pass Tests

- [x] 2.3. Implement data fetching layer (Green)
  - File: lib/api/coffee.ts
  - Create cached data fetching functions using React cache()
  - Implement getCoffeeEvaluations, getCoffeeEvaluation, searchCoffeeEvaluations
  - Purpose: Make tests pass with minimal implementation
  - _Leverage: lib/supabase/server.ts, React cache(), tests from 2.1_
  - _Requirements: 2 (list), 3 (detail), 6 (search)_
  - _Prompt: Role: Backend Developer with Next.js and TDD expertise | Task: Implement data fetching functions to make tests from 2.1 pass, using React cache() for memoization and Supabase client, writing minimal code to satisfy test expectations | Restrictions: Focus on making tests pass (Green phase), use React cache() wrapper, handle errors as defined in tests, return properly typed data, avoid over-engineering beyond test requirements | Success: All tests from 2.1 now pass (Green), functions correctly cached, error handling matches test expectations, implementation is minimal and focused_

- [x] 2.4. Implement Server Actions (Green)
  - File: lib/actions/coffee.ts
  - Create Server Actions for CRUD operations
  - Implement createCoffeeEvaluation, updateCoffeeEvaluation, deleteCoffeeEvaluation
  - Purpose: Make Server Action tests pass
  - _Leverage: lib/supabase/server.ts, Next.js utilities, tests from 2.2_
  - _Requirements: 1 (create), 4 (edit), 5 (delete)_
  - _Prompt: Role: Full-stack Developer with Server Actions and TDD expertise | Task: Implement Server Actions to make tests from 2.2 pass, handling FormData, calling Supabase, returning errors, using revalidatePath and redirect as expected by tests | Restrictions: Make tests pass (Green phase), use 'use server' directive, parse FormData as tested, handle errors returning {error: string}, call revalidatePath before redirect, minimal implementation focused on tests | Success: All tests from 2.2 now pass (Green), Server Actions work correctly, FormData parsing matches tests, error handling as expected, cache invalidation correct_

### 🔵 Refactor: Improve Code Quality

- [x] 2.5. Refactor data layer for maintainability (Refactor)
  - Files: lib/api/coffee.ts, lib/actions/coffee.ts
  - Extract common error handling logic
  - Improve type safety and error messages
  - Add JSDoc comments
  - Purpose: Improve code quality while keeping tests green
  - _Leverage: Passing tests as regression safety net_
  - _Requirements: Code quality, maintainability_
  - _Prompt: Role: Senior Developer with refactoring expertise | Task: Refactor data layer code to improve readability and maintainability while ensuring all tests remain green, extracting common patterns, improving error messages, adding documentation | Restrictions: All tests must remain passing (Refactor phase), do not change public APIs, improve internal implementation only, add JSDoc comments, extract helper functions for common logic | Success: Code is cleaner and more maintainable, all tests still pass, error messages more helpful, documentation added, no functionality changed_

## Phase 3: UI Components (TDD)

### 🔴 Red: Component Tests First

- [x] 3.1. Write tests for CoffeeSlider component (Red)
  - File: app/(app)/coffee/_components/shared/__tests__/coffee-slider.test.tsx
  - Test slider value changes, keyboard navigation, accessibility
  - Purpose: Define component behavior before implementation
  - _Leverage: React Testing Library, Jest_
  - _Requirements: 1 (slider input for ratings)_
  - _Prompt: Role: Frontend QA Engineer with React Testing Library expertise | Task: Write failing tests for CoffeeSlider component before it exists, testing value prop, onChange callback, keyboard navigation (arrow keys), accessibility (ARIA attributes), and edge cases (min/max values) | Restrictions: Tests must fail (Red phase), use React Testing Library queries, test user interactions, verify accessibility, test keyboard and mouse input, component doesn't exist yet | Success: Tests written and failing (Red), clear expectations for slider behavior, accessibility requirements defined, keyboard navigation tested_

- [x] 3.2. Implement CoffeeSlider component (Green)
  - File: app/(app)/coffee/_components/shared/coffee-slider.tsx
  - Implement slider with coffee theme to pass tests
  - Purpose: Make slider tests pass with minimal implementation
  - _Leverage: Tests from 3.1, frontend-design CSS, Tailwind_
  - _Requirements: 1 (slider UI)_
  - _Prompt: Role: Frontend Developer with TDD and accessibility expertise | Task: Implement CoffeeSlider component to make tests from 3.1 pass, using Client Component with controlled state, keyboard navigation, ARIA attributes, and frontend-design styling | Restrictions: Make tests pass (Green phase), must be Client Component ('use client'), implement accessibility as tested, use coffee theme from frontend-design, minimal code to satisfy tests | Success: All tests from 3.1 pass (Green), slider accessible and keyboard-navigable, styling matches design, implementation minimal and focused_

- [x] 3.3. Write tests for RatingStars component (Red)
  - File: app/(app)/coffee/_components/shared/__tests__/rating-stars.test.tsx
  - Test star rendering for different ratings, size variants
  - Purpose: Define rating display behavior
  - _Leverage: React Testing Library_
  - _Requirements: 2, 3 (rating display in cards and detail)_
  - _Prompt: Role: Frontend QA Engineer specializing in visual component testing | Task: Write failing tests for RatingStars component testing correct star count for various ratings (1-10 scale → 5 stars), half-star rendering, size variants (sm/md/lg), and accessibility | Restrictions: Tests must fail (Red phase), test rating to stars conversion accurately (7/10 = 3.5 stars), verify partial fill logic, test all size variants, component doesn't exist yet | Success: Tests written and failing (Red), star calculation logic defined clearly, size variants specified, accessibility tested_

- [x] 3.4. Implement RatingStars component (Green)
  - File: app/(app)/coffee/_components/shared/rating-stars.tsx
  - Implement star display to pass tests
  - Purpose: Make rating display tests pass
  - _Leverage: Tests from 3.3, SVG stars, frontend-design styling_
  - _Requirements: 2, 3 (rating visualization)_
  - _Prompt: Role: UI Developer with SVG and React expertise | Task: Implement RatingStars component to make tests from 3.3 pass, converting 1-10 rating to 5 stars with half-star precision, implementing size variants with Tailwind, using inline SVG for stars | Restrictions: Make tests pass (Green phase), presentational component only, accurate rating conversion (divide by 2), support partial fills, use frontend-design colors, minimal implementation | Success: All tests from 3.3 pass (Green), stars render correctly for all ratings, size variants work, half-stars displayed accurately_

- [x] 3.5. Write tests for CoffeeCard component (Red)
  - File: app/(app)/coffee/_components/list/__tests__/card.test.tsx
  - Test card rendering, data display, click navigation
  - Purpose: Define card component behavior
  - _Leverage: React Testing Library, Next.js router mocks_
  - _Requirements: 2 (list view card)_
  - _Prompt: Role: Frontend QA Engineer with Next.js component testing expertise | Task: Write failing tests for CoffeeCard component testing data display (shop, bean, rating, date), RatingStars integration, Next.js Link navigation, hover states, and accessibility | Restrictions: Tests must fail (Red phase), test all props rendered correctly, verify Link href correct, test hover interactions, mock RatingStars, component doesn't exist yet | Success: Tests written and failing (Red), data display expectations clear, navigation tested, hover behavior defined, accessibility verified_

- [x] 3.6. Implement CoffeeCard component (Green)
  - File: app/(app)/coffee/_components/list/card.tsx
  - Implement card to pass tests
  - Purpose: Make card tests pass
  - _Leverage: Tests from 3.5, RatingStars, frontend-design, Next.js Link_
  - _Requirements: 2 (card display)_
  - _Prompt: Role: Frontend Developer with card UI expertise | Task: Implement CoffeeCard component to make tests from 3.5 pass, rendering evaluation data, using RatingStars for overall_rating, wrapping in Next.js Link, applying frontend-design styling with hover effects | Restrictions: Make tests pass (Green phase), use RatingStars component, wrap in Link for navigation, apply frontend-design styles (hover, gold accent), minimal implementation focused on tests | Success: All tests from 3.6 pass (Green), card displays data correctly, navigation works, hover effects applied, accessible_

### 🔵 Refactor: Polish Components

- [x] 3.7. Refactor UI components (Refactor)
  - Files: All component files in Phase 3
  - Extract common styling patterns
  - Optimize performance with React.memo where needed
  - Add prop-types or improve TypeScript types
  - Purpose: Improve component quality while tests stay green
  - _Leverage: Passing component tests_
  - _Requirements: Code quality, performance_
  - _Prompt: Role: Senior Frontend Developer with React optimization expertise | Task: Refactor UI components to improve performance and maintainability while keeping all tests green, using React.memo for presentational components, extracting common Tailwind patterns, improving TypeScript props interfaces | Restrictions: All tests must stay passing (Refactor phase), no functionality changes, focus on performance and readability, use React.memo judiciously (not everywhere), maintain design consistency | Success: Components more performant, code more maintainable, all tests still green, TypeScript types improved, no visual changes_

## Phase 4: List & Detail Pages (TDD)

### 🔴 Red: Page Tests First

- [x] 4.1. Write tests for list container (Red)
  - File: app/(app)/coffee/_containers/list/__tests__/container.test.tsx
  - Test data fetching and passing to view
  - Purpose: Define container behavior
  - _Leverage: React Testing Library, mock getCoffeeEvaluations_
  - _Requirements: 2 (list page)_
  - _Prompt: Role: Next.js testing specialist | Task: Write failing tests for CoffeeListContainer Server Component testing that it calls getCoffeeEvaluations and passes data to CoffeeListView, handling loading and error states | Restrictions: Tests must fail (Red phase), mock getCoffeeEvaluations from lib/api, test Server Component async behavior, verify props passed to view, component doesn't exist yet | Success: Tests written and failing (Red), container behavior clearly defined, data fetching expectations set_

- [x] 4.2. Write tests for list view (Red)
  - File: app/(app)/coffee/_components/list/__tests__/view.test.tsx
  - Test grid rendering, empty state, card integration
  - Purpose: Define view behavior
  - _Leverage: React Testing Library, mock CoffeeCard_
  - _Requirements: 2 (list display)_
  - _Prompt: Role: Frontend QA Engineer | Task: Write failing tests for CoffeeListView testing responsive grid rendering (1/2/3 columns), empty state with message and link, CoffeeCard rendering for each evaluation | Restrictions: Tests must fail (Red phase), mock CoffeeCard component, test responsive classes, verify empty state UI, component doesn't exist yet | Success: Tests written and failing (Red), grid behavior defined, empty state specified, card integration tested_

### 🟢 Green: Implement Pages

- [x] 4.3. Implement list container (Green)
  - File: app/(app)/coffee/_containers/list/container.tsx
  - Implement Server Component fetching data
  - Purpose: Make container tests pass
  - _Leverage: Tests from 4.1, getCoffeeEvaluations, CoffeeListView_
  - _Requirements: 2 (list page)_
  - _Prompt: Role: Next.js Server Components developer | Task: Implement CoffeeListContainer to make tests from 4.1 pass, fetching data with getCoffeeEvaluations and passing to CoffeeListView | Restrictions: Make tests pass (Green phase), must be Server Component, use async/await, pass data to view, minimal implementation | Success: Tests from 4.1 pass (Green), data fetched and passed correctly_

- [x] 4.4. Implement list view (Green)
  - File: app/(app)/coffee/_components/list/view.tsx
  - Implement grid layout with cards
  - Purpose: Make view tests pass
  - _Leverage: Tests from 4.2, CoffeeCard, Tailwind grid_
  - _Requirements: 2 (list display)_
  - _Prompt: Role: Frontend Developer | Task: Implement CoffeeListView to make tests from 4.2 pass, rendering responsive grid with CoffeeCard components and empty state | Restrictions: Make tests pass (Green phase), use Tailwind responsive grid, show empty state when no data, render CoffeeCard for each evaluation, minimal code | Success: Tests from 4.2 pass (Green), grid responsive, empty state works, cards rendered_

- [x] 4.5. Create main list page (Green)
  - File: app/(app)/coffee/page.tsx
  - Compose container with metadata
  - Purpose: Complete list page
  - _Leverage: CoffeeListContainer, Next.js metadata_
  - _Requirements: 2 (list page entry point)_
  - _Prompt: Role: Next.js developer | Task: Create main list page rendering CoffeeListContainer with proper metadata for SEO (Japanese title/description), following Next.js App Router patterns | Restrictions: Must be Server Component, export metadata, composition only, use Suspense if needed | Success: Page renders correctly, metadata set, composition clean_

- [x] 4.6. Write tests for detail container (Red)
  - File: app/(app)/coffee/[id]/_containers/evaluation/__tests__/container.test.tsx
  - Test fetching single evaluation by ID, authorization
  - Purpose: Define detail container behavior
  - _Leverage: React Testing Library, mock getCoffeeEvaluation_
  - _Requirements: 3 (detail page)_
  - _Prompt: Role: Backend testing specialist | Task: Write failing tests for detail container testing getCoffeeEvaluation call, 404 handling (notFound), authorization check, passing data to view | Restrictions: Tests must fail (Red phase), mock getCoffeeEvaluation, test 404 and 403 scenarios, verify authorization logic, component doesn't exist yet | Success: Tests written and failing (Red), fetch and auth behavior defined_

- [x] 4.7. Write tests for detail view (Red)
  - File: app/(app)/coffee/[id]/_components/evaluation/__tests__/view.test.tsx
  - Test all field display, ratings, conditional buttons
  - Purpose: Define detail view behavior
  - _Leverage: React Testing Library, mock RatingStars_
  - _Requirements: 3 (detail display)_
  - _Prompt: Role: Frontend QA Engineer | Task: Write failing tests for EvaluationDetailView testing all evaluation fields displayed, RatingStars used for ratings, Edit/Delete buttons shown only for owner | Restrictions: Tests must fail (Red phase), mock RatingStars, test conditional button rendering, verify all data displayed, component doesn't exist yet | Success: Tests written and failing (Red), display behavior fully defined_

- [x] 4.8. Implement detail container (Green)
  - File: app/(app)/coffee/[id]/_containers/evaluation/container.tsx
  - Implement fetching and authorization
  - Purpose: Make detail container tests pass
  - _Leverage: Tests from 4.6, getCoffeeEvaluation_
  - _Requirements: 3 (detail fetch)_
  - _Prompt: Role: Backend developer with auth expertise | Task: Implement detail container to make tests from 4.6 pass, fetching evaluation, checking authorization, handling 404/403 errors | Restrictions: Make tests pass (Green phase), Server Component, verify ownership, use notFound() for 404, throw for 403, minimal code | Success: Tests from 4.6 pass (Green), authorization correct, errors handled_

- [x] 4.9. Implement detail view (Green)
  - File: app/(app)/coffee/[id]/_components/evaluation/view.tsx
  - Implement detail display with ratings
  - Purpose: Make detail view tests pass
  - _Leverage: Tests from 4.7, RatingStars_
  - _Requirements: 3 (detail display)_
  - _Prompt: Role: Frontend Developer | Task: Implement EvaluationDetailView to make tests from 4.7 pass, displaying all fields, using RatingStars, conditionally showing Edit/Delete buttons | Restrictions: Make tests pass (Green phase), Server Component, use RatingStars for all ratings, apply frontend-design styling, conditional buttons, minimal code | Success: Tests from 4.7 pass (Green), all data displayed, buttons conditional_

- [x] 4.10. Implement detail page with delete (Green)
  - File: app/(app)/coffee/[id]/page.tsx
  - Compose detail with delete functionality
  - Purpose: Complete detail page
  - _Leverage: Container, View, deleteCoffeeEvaluation_
  - _Requirements: 3 (detail page), 5 (delete)_
  - _Prompt: Role: Full-stack developer | Task: Create detail page composing container and view, implementing delete with confirmation dialog and Server Action call, handling errors and redirect | Restrictions: Use window.confirm or custom dialog, call deleteCoffeeEvaluation Server Action, show loading, redirect on success, display errors | Success: Page works, delete requires confirmation, redirects on success_

### 🔵 Refactor: Optimize Pages

- [x] 4.11. Refactor pages for performance (Refactor)
  - Files: All page files in Phase 4
  - Add loading.tsx and error.tsx boundaries
  - Optimize Suspense boundaries
  - Purpose: Improve UX while tests stay green
  - _Leverage: Next.js loading/error conventions_
  - _Requirements: UX, error handling_
  - _Prompt: Role: Next.js optimization specialist | Task: Refactor pages to improve UX by adding loading.tsx skeletons, error.tsx boundaries, optimizing Suspense placement while ensuring all tests remain green | Restrictions: All tests must pass (Refactor phase), add loading states matching layouts, user-friendly error pages, no functionality changes | Success: Loading states smooth, error handling graceful, all tests still pass, UX improved_

## Phase 5: Create & Edit Forms (TDD)

### 🔴 Red: Form Tests First

- [x] 5.1. Write tests for EvaluationForm component (Red)
  - File: app/(app)/coffee/_components/__tests__/evaluation-form.test.tsx
  - Test form rendering, validation, submission (create and edit modes)
  - Purpose: Define form behavior before implementation
  - _Leverage: React Testing Library, mock Server Actions_
  - _Requirements: 1 (create), 4 (edit)_
  - _Prompt: Role: Form testing specialist | Task: Write failing tests for EvaluationForm testing both create (no initialData) and edit (with initialData) modes, input validation, CoffeeSlider integration, Server Action calls, loading states, error display | Restrictions: Tests must fail (Red phase), mock createCoffeeEvaluation and updateCoffeeEvaluation, test both modes, verify validation prevents invalid submit, test loading and error states, component doesn't exist yet | Success: Tests written and failing (Red), form behavior fully defined for both modes, validation rules clear_

### 🟢 Green: Implement Form

- [x] 5.2. Implement EvaluationForm component (Green)
  - File: app/(app)/coffee/_components/evaluation-form.tsx
  - Implement form with sliders and Server Action integration
  - Purpose: Make form tests pass
  - _Leverage: Tests from 5.1, CoffeeSlider, UI components, Server Actions_
  - _Requirements: 1 (create), 4 (edit)_
  - _Prompt: Role: React forms developer | Task: Implement EvaluationForm to make tests from 5.1 pass, supporting create/edit modes via initialData, using CoffeeSlider for ratings, calling appropriate Server Action, using useTransition for loading, displaying errors | Restrictions: Make tests pass (Green phase), Client Component ('use client'), validate before submit, use useTransition, show loading/error states, handle both Server Actions correctly, minimal code | Success: Tests from 5.1 pass (Green), form works in both modes, validation prevents invalid submit, loading/error states work_

- [x] 5.3. Create new evaluation page (Green)
  - File: app/(app)/coffee/new/page.tsx
  - Render form in create mode
  - Purpose: Dedicated creation page
  - _Leverage: EvaluationForm, metadata API_
  - _Requirements: 1 (create page)_
  - _Prompt: Role: Next.js developer | Task: Create new evaluation page rendering EvaluationForm without initialData (create mode), with proper metadata (Japanese), following App Router patterns | Restrictions: Server Component, export metadata, render form only, authenticated via middleware | Success: Page renders form in create mode, metadata correct, creates evaluations_

- [x] 5.4. Create edit evaluation page (Green)
  - File: app/(app)/coffee/[id]/edit/page.tsx
  - Fetch evaluation and render form in edit mode
  - Purpose: Dedicated edit page
  - _Leverage: getCoffeeEvaluation, EvaluationForm_
  - _Requirements: 4 (edit page)_
  - _Prompt: Role: Full-stack developer | Task: Create edit page fetching evaluation by ID, verifying ownership, passing as initialData to EvaluationForm, handling 404/403 errors | Restrictions: Check ownership before form, use getCoffeeEvaluation, handle errors with notFound()/error boundary, pass evaluation to form | Success: Page fetches evaluation, ownership verified, form pre-filled, updates work_

### 🔵 Refactor: Form Quality

- [x] 5.5. Refactor form for better UX (Refactor)
  - File: app/(app)/coffee/_components/evaluation-form.tsx
  - Improve validation messages, add field descriptions
  - Enhance accessibility
  - Purpose: Improve form quality while tests stay green
  - _Leverage: Passing tests as safety net_
  - _Requirements: UX, accessibility_
  - _Prompt: Role: UX/accessibility specialist | Task: Refactor EvaluationForm to improve UX and accessibility while keeping tests green, adding helpful validation messages, field descriptions, ARIA labels, focus management | Restrictions: All tests must pass (Refactor phase), improve error messages, add ARIA attributes, enhance keyboard navigation, no functionality changes | Success: Form more accessible and user-friendly, all tests still pass, error messages clearer_

## Phase 6: Search & Sort (TDD)

### 🔴 Red: Search/Sort Tests First

- [x] 6.1. Write tests for SearchAndSort component (Red)
  - File: app/(app)/coffee/_components/list/__tests__/search-and-sort.test.tsx
  - Test search input, sort dropdown, URL state management
  - Purpose: Define search/sort UI behavior
  - _Leverage: React Testing Library, mock useRouter_
  - _Requirements: 6 (search), 7 (sort)_
  - _Prompt: Role: Frontend testing specialist | Task: Write failing tests for SearchAndSort component testing search input with debouncing, sort dropdown changes, URL parameter updates via router.push, state persistence | Restrictions: Tests must fail (Red phase), mock useRouter and useSearchParams, test debounced search (300ms), verify URL updates, test all sort options, component doesn't exist yet | Success: Tests written and failing (Red), search/sort behavior defined, URL state management tested_

### 🟢 Green: Implement Search/Sort

- [x] 6.2. Implement SearchAndSort component (Green)
  - File: app/(app)/coffee/_components/list/search-and-sort.tsx
  - Implement search input and sort dropdown with URL state
  - Purpose: Make search/sort tests pass
  - _Leverage: Tests from 6.1, useSearchParams, useRouter_
  - _Requirements: 6, 7_
  - _Prompt: Role: React developer with URL state expertise | Task: Implement SearchAndSort to make tests from 6.1 pass, using debounced search input, sort dropdown, updating URL with useRouter, reading state from useSearchParams | Restrictions: Make tests pass (Green phase), Client Component, debounce search 300ms, use URL for state, provide all sort options, apply frontend-design styling, minimal code | Success: Tests from 6.1 pass (Green), search debounced, sort works, URL updates correctly_

- [x] 6.3. Extend data layer for search/sort (Green)
  - File: lib/api/coffee.ts (modify)
  - Update getCoffeeEvaluations to accept search and sort params
  - Purpose: Enable server-side filtering/sorting
  - _Leverage: Existing tests, Supabase queries_
  - _Requirements: 6, 7_
  - _Prompt: Role: Backend developer | Task: Extend getCoffeeEvaluations function to accept optional search query and sort option, implementing filtering (shop, bean, roast with ilike) and sorting in Supabase query, updating existing tests | Restrictions: Maintain backward compatibility (params optional), filter with ilike for partial match, use database indexes, update tests to cover new params, maintain cache() | Success: Function accepts search/sort params, filters and sorts in database, existing tests still pass, new params tested_

- [x] 6.4. Integrate search/sort into list page (Green)
  - File: app/(app)/coffee/page.tsx (modify), app/(app)/coffee/_containers/list/container.tsx (modify)
  - Accept searchParams and pass to container/data layer
  - Purpose: Complete search/sort integration
  - _Leverage: SearchAndSort, enhanced getCoffeeEvaluations_
  - _Requirements: 6, 7_
  - _Prompt: Role: Next.js integration specialist | Task: Integrate SearchAndSort into list page, accept searchParams in page component, pass to container, extract and use in getCoffeeEvaluations, add SearchAndSort component to UI | Restrictions: Page accepts searchParams prop (App Router pattern), pass to container, extract search/sort from params, render SearchAndSort above list, handle loading during changes | Success: Search/sort integrated end-to-end, URL state works, filtering/sorting functional, UX smooth_

### 🔵 Refactor: Optimize Search/Sort

- [x] 6.5. Refactor search/sort for performance (Refactor)
  - Files: Search/sort related files
  - Optimize database queries with better indexes
  - Improve debouncing logic
  - Purpose: Optimize while tests stay green
  - _Leverage: Passing tests_
  - _Requirements: Performance_
  - _Prompt: Role: Performance optimization specialist | Task: Refactor search/sort implementation to improve performance while keeping tests green, optimizing database queries, reviewing debounce timing, ensuring efficient re-renders | Restrictions: All tests must pass (Refactor phase), verify database indexes used, optimize debounce delay if needed, use React.memo judiciously, no functionality changes | Success: Search/sort more performant, database queries efficient, all tests still pass, UX responsive_

## Phase 7: Profile Management (TDD)

### 🔴 Red: Profile Tests First

- [x] 7.1. Write tests for profile page (Red)
  - File: app/(app)/profile/__tests__/page.test.tsx
  - Test profile fetch, form rendering, update functionality
  - Purpose: Define profile management behavior
  - _Leverage: React Testing Library, mock Supabase_
  - _Requirements: 9 (profile management)_
  - _Prompt: Role: Full-stack testing specialist | Task: Write failing tests for profile page testing user profile fetch, form pre-fill, validation (max lengths), Server Action call for update, success message display | Restrictions: Tests must fail (Red phase), mock Supabase profile fetch and update, test nullable fields, verify max length validation (display_name: 100, bio: 500), test success state, page doesn't exist yet | Success: Tests written and failing (Red), profile behavior defined, validation rules clear_

### 🟢 Green: Implement Profile

- [x] 7.2. Implement profile page (Green)
  - File: app/(app)/profile/page.tsx
  - Fetch profile and implement update form
  - Purpose: Make profile tests pass
  - _Leverage: Tests from 7.1, Supabase, Server Actions_
  - _Requirements: 9_
  - _Prompt: Role: Full-stack developer | Task: Implement profile page to make tests from 7.1 pass, fetching authenticated user's profile, rendering form with display_name and bio, implementing updateProfile Server Action, showing success on update | Restrictions: Make tests pass (Green phase), fetch from user_profiles, validate max lengths, use Server Action for update, show success message, minimal code | Success: Tests from 7.1 pass (Green), profile fetches, form works, updates save, validation prevents invalid data_

### 🔵 Refactor: Profile Quality

- [x] 7.3. Refactor profile for better UX (Refactor)
  - File: app/(app)/profile/page.tsx
  - Improve form styling, add character counters
  - Purpose: Enhance profile UX while tests stay green
  - _Leverage: Frontend-design styling_
  - _Requirements: UX_
  - _Prompt: Role: UX specialist | Task: Refactor profile page to improve UX while keeping tests green, applying frontend-design styling, adding character counters for fields, improving validation feedback | Restrictions: All tests must pass (Refactor phase), add character counter UI, apply coffee theme styling, enhance validation messages, no functionality changes | Success: Profile page more polished, all tests still pass, UX improved with counters and styling_

## Phase 8: Integration & End-to-End Testing

- [x] 8.1. Write integration tests for complete flows
  - File: app/(app)/coffee/__tests__/integration/coffee-flows.test.tsx
  - Test complete user journeys (create → list → detail → edit → delete)
  - Purpose: Verify end-to-end functionality
  - _Leverage: React Testing Library, MSW for API mocking_
  - _Requirements: All functional requirements_
  - _Prompt: Role: Integration test engineer | Task: Write integration tests covering complete user journeys (creating evaluation, viewing list, opening detail, editing, deleting with confirmation) using React Testing Library with MSW to mock Supabase API, verifying page navigation and data flow | Restrictions: Mock Supabase API with MSW handlers, test realistic user paths end-to-end, verify page transitions work, ensure data updates propagate, tests must be deterministic and reliable | Success: Complete user flows tested successfully, navigation works correctly, data flows through pages, tests reliable and maintainable_

- [x] 8.2. Write integration tests for search/sort flows
  - File: app/(app)/coffee/__tests__/integration/search-sort-flows.test.tsx
  - Test search and sort user journeys
  - Purpose: Verify search/sort integration
  - _Leverage: React Testing Library, MSW_
  - _Requirements: 6, 7_
  - _Prompt: Role: Integration test engineer | Task: Write integration tests for search and sort journeys, testing user entering search query, selecting sort option, verifying filtered/sorted results display, URL state persistence on page reload | Restrictions: Mock Supabase responses with MSW, test URL state management, verify debouncing works, test various search/sort combinations, ensure tests deterministic | Success: Search/sort flows tested end-to-end, URL state verified, filtering/sorting works correctly in integration context_

## Phase 9: Polish & Documentation

- [x] 9.1. Add loading.tsx files for Suspense boundaries
  - Files: app/(app)/coffee/loading.tsx, app/(app)/coffee/[id]/loading.tsx, app/(app)/coffee/new/loading.tsx, app/(app)/coffee/[id]/edit/loading.tsx
  - Create skeleton loaders matching page layouts
  - Purpose: Improve perceived performance
  - _Leverage: Frontend-design styling, Next.js loading.tsx_
  - _Requirements: UX (loading states)_
  - _Prompt: Role: UX engineer | Task: Create loading.tsx files with skeleton loaders matching actual card and detail layouts using frontend-design styling, following Next.js Suspense patterns | Restrictions: Match actual layouts closely, use frontend-design colors, ensure smooth appearance, loading.tsx automatically wraps Suspense boundaries | Success: Loading skeletons match layouts, appear smoothly during data fetch, UX polished_

- [x] 9.2. Add error.tsx files for error boundaries
  - Files: app/(app)/coffee/error.tsx, app/(app)/coffee/[id]/error.tsx
  - Create user-friendly error pages with retry
  - Purpose: Graceful error handling
  - _Leverage: Next.js error.tsx, frontend-design_
  - _Requirements: UX (error handling)_
  - _Prompt: Role: UX engineer | Task: Create error.tsx Client Components with user-friendly error messages in Japanese, retry buttons, back navigation, following Next.js error boundary patterns with reset function | Restrictions: Must be Client Components, provide reset button, helpful Japanese error messages, back navigation option, apply frontend-design styling | Success: Error pages user-friendly, retry works, messages clear in Japanese, UX professional_

- [x] 9.3. Accessibility audit and improvements
  - Files: All component and page files
  - Review and improve accessibility (ARIA, keyboard, contrast)
  - Purpose: Ensure WCAG 2.1 AA compliance
  - _Leverage: WCAG guidelines, accessibility testing tools_
  - _Requirements: Accessibility (non-functional)_
  - _Prompt: Role: Accessibility specialist | Task: Audit all components and pages for accessibility, ensuring ARIA attributes correct, keyboard navigation works everywhere, color contrast meets WCAG 2.1 AA, semantic HTML used, screen reader compatible | Restrictions: Achieve WCAG 2.1 AA minimum, test with keyboard only, verify screen reader compatibility, ensure focus indicators visible, test color contrast | Success: All components fully accessible, keyboard navigation complete, passes accessibility audits, WCAG 2.1 AA compliant_

- [x] 9.4. Implement animations from frontend-design
  - Files: Component files with animations
  - Add fade-in, slide-up, stagger animations
  - Purpose: Polish visual experience
  - _Leverage: Frontend-design animation specs, Tailwind_
  - _Requirements: UX (animations)_
  - _Prompt: Role: Frontend animation specialist | Task: Implement animations from frontend-design output (fade-in page load, slide-up cards, stagger on list, hover effects) using Tailwind CSS and CSS transitions, ensuring 60fps performance | Restrictions: Follow frontend-design specs exactly, ensure animations performant (60fps), use CSS transitions over JavaScript, respect prefers-reduced-motion, smooth and subtle | Success: Animations smooth and performant, match design specs, respect user preferences, enhance UX without distracting_

- [x] 9.5. Add navigation to app layout
  - File: app/(app)/layout.tsx (modify)
  - Add "Coffee" link and "New Evaluation" button
  - Purpose: Integrate into main navigation
  - _Leverage: Existing layout patterns_
  - _Requirements: Integration_
  - _Prompt: Role: Frontend integration specialist | Task: Modify app layout to add "Coffee" navigation link to main menu and "New Evaluation" quick action button, following existing navigation patterns, ensuring active state highlights on coffee pages | Restrictions: Follow existing layout structure and styling, active state with pathname matching, maintain responsive behavior, test on all pages | Success: Coffee link in navigation with proper styling, active state works, New Evaluation button accessible, responsive on mobile, seamless integration_

- [x] 9.6. Create comprehensive documentation
  - Files: README.md (update), docs/coffee-evaluation.md (new)
  - Document feature usage, architecture, setup
  - Purpose: Ensure feature is well-documented
  - _Leverage: Existing docs patterns_
  - _Requirements: Documentation_
  - _Prompt: Role: Technical writer | Task: Create comprehensive documentation for coffee evaluation feature including user guide (how to use), developer guide (architecture, file structure, TDD approach), database setup instructions (running migrations), screenshots/GIFs of feature | Restrictions: Follow existing documentation style, beginner-friendly user guide, clear setup instructions for local development, architecture overview with diagrams, include all TDD practices used | Success: Documentation complete and clear, setup instructions work for new developers, user guide helpful, architecture aids understanding, TDD methodology documented_
