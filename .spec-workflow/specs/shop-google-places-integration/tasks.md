# Tasks Document

## Phase 1: Database and Type Foundations

- [ ] 1. Create database migration for Google Places fields
  - Files: `supabase/migrations/[timestamp]_add_google_places_fields.sql`
  - Add new columns to `coffee_evaluations` table: `google_place_id`, `shop_address`, `shop_map_url`, `shop_location`
  - Create index on `google_place_id`
  - Ensure NULL constraints for backward compatibility
  - Purpose: Extend database schema to store Google Places information
  - _Leverage: supabase/migrations/20251231010000_coffee_evaluations_schema.sql_
  - _Requirements: 4_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Engineer with PostgreSQL and PostGIS expertise | Task: Create database migration following requirement 4, adding Google Places fields (google_place_id, shop_address, shop_map_url, shop_location POINT) to coffee_evaluations table with proper indexes and NULL constraints, leveraging existing migration patterns | Restrictions: Must maintain backward compatibility with existing data, do not modify existing columns, ensure proper data types (TEXT for strings, POINT for location), create partial index on google_place_id WHERE NOT NULL | Success: Migration runs successfully on clean database and with existing data, new columns are created with correct types and constraints, index improves query performance for Place ID lookups | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with detailed artifacts (tables modified, columns added, indexes created) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 2. Regenerate database types
  - Files: `lib/types/database.types.ts`
  - Run `npx supabase gen types typescript --local > lib/types/database.types.ts`
  - Verify new fields appear in `coffee_evaluations` Row/Insert/Update types
  - Purpose: Update TypeScript types to reflect new database schema
  - _Leverage: existing lib/types/database.types.ts_
  - _Requirements: 4_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Regenerate database types using Supabase CLI following requirement 4, ensuring new Google Places fields are properly typed | Restrictions: Do not manually edit database.types.ts, use Supabase CLI command only, verify types match database schema | Success: database.types.ts contains new fields (google_place_id: string | null, shop_address: string | null, shop_map_url: string | null) in coffee_evaluations types, TypeScript compilation succeeds | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (files modified: lib/types/database.types.ts) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 3. Create Google Places type definitions
  - Files: `lib/types/google-places.ts`
  - Define TypeScript interfaces: `PlaceSuggestion`, `AutocompleteResponse`, `PlaceDetails`, `ShopData`
  - Document each interface with JSDoc comments
  - Purpose: Provide type safety for Google Places API interactions
  - _Leverage: lib/types/database.types.ts patterns_
  - _Requirements: 1, 5_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in type systems and API contracts | Task: Create comprehensive Google Places type definitions following requirements 1 and 5, defining interfaces for PlaceSuggestion (placeId, description, mainText, secondaryText), AutocompleteResponse (predictions array), PlaceDetails (name, placeId, address, mapUrl, location), and ShopData (same as PlaceDetails) with JSDoc comments | Restrictions: Use existing project type patterns, ensure interfaces are exportable, add JSDoc comments for each property, follow strict TypeScript standards | Success: All interfaces compile without errors, proper JSDoc documentation, interfaces match API response structures from design.md | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (files created: lib/types/google-places.ts, functions/interfaces defined) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 2: API Routes (Server-side Google Places Integration)

- [ ] 4. Create Autocomplete API Route
  - Files: `app/api/places/autocomplete/route.ts`
  - Implement GET handler that calls Google Places Autocomplete API (New)
  - Add input validation (minimum 2 characters)
  - Implement session token support for cost optimization
  - Add error handling and logging
  - Purpose: Provide server-side endpoint for shop name autocomplete
  - _Leverage: Next.js API Route patterns, Google Places API documentation_
  - _Requirements: 1, 5_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with Next.js API Routes and Google Places API expertise | Task: Implement Autocomplete API Route following requirements 1 and 5, creating GET endpoint that validates input (min 2 chars), calls Google Places Autocomplete API with session token, languageCode='ja', includedPrimaryTypes=['cafe','restaurant'], and returns simplified PlaceSuggestion[] format | Restrictions: Must protect API key (use process.env.GOOGLE_PLACES_API_KEY), validate inputs server-side, return 200 with empty array for invalid input (not error), use Field Mask to minimize costs, implement 5-second timeout | Success: API Route returns predictions for valid input, handles errors gracefully (logs server-side, returns empty array to client), session token reduces costs, response format matches AutocompleteResponse interface | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with detailed artifacts (apiEndpoints: method, path, purpose, requestFormat, responseFormat, location) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 5. Create Place Details API Route
  - Files: `app/api/places/details/route.ts`
  - Implement GET handler that calls Google Places Details API (New)
  - Validate Place ID format (regex: `/^ChIJ[a-zA-Z0-9_-]+$/`)
  - Generate Google Maps URL from Place ID
  - Add error handling and logging
  - Purpose: Provide server-side endpoint for shop details retrieval
  - _Leverage: Next.js API Route patterns, app/api/places/autocomplete/route.ts_
  - _Requirements: 1, 5_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with Next.js API Routes and Google Maps API expertise | Task: Implement Place Details API Route following requirements 1 and 5, creating GET endpoint that validates Place ID format, calls Google Places Details API with Field Mask (id,displayName,formattedAddress,location), generates mapUrl (https://www.google.com/maps/place/?q=place_id:{placeId}), and returns PlaceDetails format | Restrictions: Must validate Place ID before API call (return 400 for invalid), protect API key, use minimal Field Mask, implement timeout, handle API errors (return 500 with message) | Success: API Route returns complete PlaceDetails for valid Place ID, generates correct Google Maps URL, handles errors appropriately (400 for validation, 500 for API errors), response matches PlaceDetails interface | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with detailed artifacts (apiEndpoints: method, path, purpose, requestFormat, responseFormat, location) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 6. Create API Route unit tests
  - Files: `app/api/places/autocomplete/__tests__/route.test.ts`, `app/api/places/details/__tests__/route.test.ts`
  - Test both API Routes with valid and invalid inputs
  - Mock Google Places API responses
  - Test error scenarios (API failures, timeouts, invalid inputs)
  - Purpose: Ensure API Routes are reliable and handle errors correctly
  - _Leverage: existing test patterns, Jest, @testing-library_
  - _Requirements: 1, 5_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with Next.js API testing expertise | Task: Create comprehensive unit tests for both API Routes following requirements 1 and 5, testing valid inputs (returns predictions/details), invalid inputs (returns empty/400), API errors (returns 500), and timeouts, using mocked Google Places API responses | Restrictions: Must mock fetch calls (global.fetch = jest.fn()), test both success and error paths, verify correct status codes and response formats, ensure tests run independently | Success: All tests pass, coverage includes happy path and error scenarios, mocking prevents actual API calls, tests verify request validation and error handling | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (files created, functions tested) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 3: Frontend Components

- [ ] 7. Create ShopAutocomplete component
  - Files: `app/(app)/coffee/_components/shop-autocomplete/ShopAutocomplete.tsx`
  - Implement Client Component with autocomplete UI
  - Add debounced input handling (300ms)
  - Implement session token management
  - Add loading states and error handling
  - Style with Tailwind CSS (match existing form components)
  - Purpose: Provide interactive autocomplete UI for shop selection
  - _Leverage: components/ui/Input.tsx patterns, React hooks (useState, useEffect, useCallback)_
  - _Requirements: 1, 6_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend React Developer with expertise in autocomplete UIs and debouncing | Task: Create ShopAutocomplete Client Component following requirements 1 and 6, implementing props (onSelect, initialValue, placeholder, disabled), state (query, suggestions, isLoading, error, sessionToken), debounced input (300ms), API calls to /api/places/autocomplete and /api/places/details, and styled suggestions dropdown | Restrictions: Must use 'use client' directive, implement custom useDebounce hook or use lodash.debounce, generate new session token per autocomplete session, handle keyboard navigation (arrow keys, Enter, Escape), ensure accessibility (ARIA attributes), match existing form component styles | Success: Component displays suggestions after 300ms debounce, calls Autocomplete API with session token, shows loading state, handles suggestion selection (calls Details API, triggers onSelect callback), displays errors gracefully, accessible with keyboard and screen readers | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with detailed artifacts (components: name, type, purpose, location, props, exports) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 8. Create MapLink component
  - Files: `app/(app)/coffee/_components/shared/MapLink.tsx`
  - Implement Client Component that renders map link
  - Add map icon (📍 or SVG)
  - Handle click to open Google Maps in new tab
  - Add accessibility attributes
  - Purpose: Display clickable map link in detail view
  - _Leverage: existing component patterns, Tailwind CSS_
  - _Requirements: 3_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend React Developer | Task: Create MapLink Client Component following requirement 3, implementing props (mapUrl, shopName, className), rendering map icon (📍 emoji or custom SVG) with "地図で見る" text, handling click to open mapUrl in new tab with window.open(mapUrl, '_blank', 'noopener,noreferrer') | Restrictions: Must use 'use client' directive, include aria-label with shopName for accessibility, apply Tailwind classes for styling (match existing link styles), prevent default anchor behavior if using <a> tag | Success: Component renders map icon and text, opens Google Maps in new tab on click, accessible (aria-label, keyboard operable), styled consistently with project | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (components: name, type, purpose, location, props, exports) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 9. Create component unit tests
  - Files: `app/(app)/coffee/_components/shop-autocomplete/__tests__/ShopAutocomplete.test.tsx`, `app/(app)/coffee/_components/shared/__tests__/MapLink.test.tsx`
  - Test ShopAutocomplete: input rendering, debouncing, API calls, suggestion display, selection handling, error states
  - Test MapLink: rendering, click behavior, accessibility
  - Use React Testing Library and Jest
  - Purpose: Ensure components are reliable and handle edge cases
  - _Leverage: existing component test patterns, @testing-library/react, @testing-library/user-event_
  - _Requirements: 1, 3, 6_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with React Testing Library expertise | Task: Create comprehensive unit tests for ShopAutocomplete and MapLink following requirements 1, 3, and 6, testing ShopAutocomplete (renders input, debounces input 300ms, calls Autocomplete API, displays suggestions, calls Details API on selection, triggers onSelect callback, displays errors), and MapLink (renders icon and text, opens new tab on click, has aria-label) | Restrictions: Must mock fetch for API calls, use waitFor for async operations, test user interactions with user-event, verify accessibility attributes, ensure tests run independently | Success: All tests pass, ShopAutocomplete tests cover debouncing, API integration, user interactions, error handling; MapLink tests verify rendering, click behavior, accessibility | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (files created, components tested) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 4: Integration with Existing Forms

- [ ] 10. Extend EvaluationForm component
  - Files: `app/(app)/coffee/_components/evaluation-form.tsx`
  - Replace shop name Input with ShopAutocomplete
  - Add state for Google Places fields (google_place_id, shop_address, shop_map_url)
  - Implement handleShopSelect callback
  - Update buildFormData to include new fields
  - Add map URL preview for edit mode
  - Purpose: Integrate autocomplete into evaluation form
  - _Leverage: existing EvaluationForm component, ShopAutocomplete_
  - _Requirements: 6_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Full-stack React Developer | Task: Extend EvaluationForm component following requirement 6, replacing shop name Input with ShopAutocomplete, adding state (shopPlaceId, shopAddress, shopMapUrl), implementing handleShopSelect callback that updates all shop-related states, modifying buildFormData to include new fields, and displaying map URL preview (address + MapLink) in edit mode when shopMapUrl exists | Restrictions: Must preserve existing form functionality (hand manual input still works if user types without selecting), maintain form validation, keep existing state management patterns, ensure backward compatibility with evaluations without Google Places data | Success: ShopAutocomplete integrates seamlessly, selecting suggestion populates all shop fields, manual input works as before, map preview displays in edit mode, form submission includes Google Places data | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with detailed artifacts (components modified, integrations: frontendComponent, backendEndpoint, dataFlow) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 11. Extend Coffee Detail View
  - Files: `app/(app)/coffee/[id]/_components/evaluation/view.tsx`
  - Add MapLink next to shop name when shop_map_url exists
  - Display shop address below shop name
  - Add conditional rendering (only show if data exists)
  - Purpose: Display map link and address in detail view
  - _Leverage: existing Detail View component, MapLink_
  - _Requirements: 3_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend React Developer | Task: Extend Coffee Detail View following requirement 3, adding MapLink component next to shop name when evaluation.shop_map_url exists, displaying shop_address below shop name when it exists, using conditional rendering to hide these elements when data is null | Restrictions: Must maintain existing layout and styling, use existing component patterns, ensure backward compatibility with evaluations without Google Places data (graceful degradation), follow Server Component patterns (no 'use client' needed here) | Success: Map link displays next to shop name when available, address displays below shop name when available, no errors for evaluations without Google Places data, layout remains consistent | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (components modified, integrations) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 5: Server Actions Extension

- [ ] 12. Extend parseEvaluationFormData function
  - Files: `lib/actions/coffee.ts`
  - Add parsing for google_place_id, shop_address, shop_map_url fields
  - Handle NULL values (manual input case)
  - Add validation for Place ID format (optional field)
  - Purpose: Parse Google Places fields from form data
  - _Leverage: existing parseEvaluationFormData function_
  - _Requirements: 2_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with form data processing expertise | Task: Extend parseEvaluationFormData function in lib/actions/coffee.ts following requirement 2, adding extraction of google_place_id, shop_address, shop_map_url from FormData using getStringField, handling empty strings as NULL, optionally validating Place ID format if provided (regex /^ChIJ[a-zA-Z0-9_-]+$/) | Restrictions: Must maintain backward compatibility (fields are optional), use existing getStringField helper, preserve existing parsing logic, ensure type safety with ParsedEvaluationData interface update | Success: Function parses new fields correctly, handles NULL values for manual input, validates Place ID format when provided, existing form data parsing still works | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (functions modified, signature updated) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 13. Update ParsedEvaluationData interface
  - Files: `lib/actions/coffee.ts`
  - Add google_place_id, shop_address, shop_map_url, shop_location fields to interface
  - All new fields should be optional (string | null)
  - Purpose: Update type definition for parsed form data
  - _Leverage: existing ParsedEvaluationData interface_
  - _Requirements: 2_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Update ParsedEvaluationData interface in lib/actions/coffee.ts following requirement 2, adding google_place_id?: string | null, shop_address?: string | null, shop_map_url?: string | null, shop_location?: string | null (PostGIS POINT format for future use) | Restrictions: Must maintain existing interface properties, mark new fields as optional, ensure backward compatibility | Success: Interface includes new fields, TypeScript compilation succeeds, parseEvaluationFormData matches updated interface | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (interfaces/types modified) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 14. Update createCoffeeEvaluation and updateCoffeeEvaluation actions
  - Files: `lib/actions/coffee.ts`
  - Pass new Google Places fields to Supabase insert/update
  - Ensure NULL handling for manual input
  - Test with both Google Places data and manual input
  - Purpose: Save Google Places information to database
  - _Leverage: existing Server Actions_
  - _Requirements: 2_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Full-stack Developer with Supabase and Next.js Server Actions expertise | Task: Update createCoffeeEvaluation and updateCoffeeEvaluation Server Actions following requirement 2, including google_place_id, shop_address, shop_map_url in Supabase insert/update operations, ensuring NULL values are properly handled for manual input (fields are optional) | Restrictions: Must maintain existing action behavior, preserve error handling, ensure type safety, test with both autocomplete-selected and manually-entered shop names | Success: Actions save Google Places data when available, handle NULL gracefully for manual input, existing functionality preserved, revalidatePath and redirect still work | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (functions modified, server actions updated) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 15. Create Server Action tests
  - Files: `lib/actions/__tests__/coffee.test.ts`
  - Add tests for Google Places data handling
  - Test both autocomplete and manual input scenarios
  - Verify database saves correctly
  - Purpose: Ensure Server Actions handle Google Places data correctly
  - _Leverage: existing Server Action tests_
  - _Requirements: 2_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with Server Actions testing expertise | Task: Extend Server Action tests following requirement 2, adding test cases for createCoffeeEvaluation and updateCoffeeEvaluation with Google Places data (all fields populated) and manual input (Google Places fields NULL), verifying database insert/update includes new fields correctly | Restrictions: Must use existing test setup (Supabase mocks), maintain test isolation, verify both scenarios (with/without Google Places data), ensure backward compatibility tests pass | Success: Tests pass for both Google Places and manual input scenarios, database operations verified, existing tests still pass, proper NULL handling confirmed | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (test files modified, test cases added) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 6: Environment Setup and Documentation

- [ ] 16. Add environment variable configuration
  - Files: `.env.example`, `.env.local` (not committed)
  - Add `GOOGLE_PLACES_API_KEY` to `.env.example` with placeholder
  - Add comment with setup instructions URL
  - Create actual API key and add to `.env.local`
  - Purpose: Configure Google Places API key
  - _Leverage: existing environment variable patterns_
  - _Requirements: 5_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Add Google Places API key configuration following requirement 5, updating .env.example with GOOGLE_PLACES_API_KEY=, adding comment "# Get your key from: https://console.cloud.google.com/apis/credentials", and adding actual key to .env.local (ensure .env.local is in .gitignore) | Restrictions: Must not commit actual API key to git, verify .env.local is in .gitignore, follow existing env variable naming conventions, include setup instructions comment | Success: .env.example updated with placeholder and instructions, .env.local contains actual key (not committed), Next.js can access process.env.GOOGLE_PLACES_API_KEY | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (files modified) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 17. Update documentation (optional)
  - Files: `docs/GOOGLE_PLACES_INTEGRATION.md` (already created)
  - Verify documentation is up-to-date
  - Add any implementation notes or gotchas
  - Update examples if needed
  - Purpose: Ensure documentation matches implementation
  - _Leverage: existing docs/GOOGLE_PLACES_INTEGRATION.md_
  - _Requirements: All_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Review and update docs/GOOGLE_PLACES_INTEGRATION.md to match final implementation, adding any implementation notes (e.g., known limitations, gotchas, troubleshooting), verifying examples are correct, ensuring setup instructions are accurate | Restrictions: Must maintain existing documentation structure, keep examples practical and tested, ensure accuracy (no outdated information), follow project documentation style | Success: Documentation is accurate and complete, examples work as written, setup instructions are clear, implementation notes help future developers | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (documentation files updated) after completion, 3. Mark task as completed [x] in tasks.md_

## Phase 7: Integration Testing and Final Verification

- [ ] 18. Create integration tests
  - Files: `app/(app)/coffee/__tests__/create-with-autocomplete.test.tsx`, `app/(app)/coffee/__tests__/edit-with-autocomplete.test.tsx`
  - Test full user flow: type shop name → select from autocomplete → fill form → submit → verify data saved
  - Test edit flow: load evaluation with Google Places data → edit → save
  - Test manual input flow: type shop name without selecting → submit → verify NULL Google Places fields
  - Purpose: Verify end-to-end functionality
  - _Leverage: existing integration test patterns, React Testing Library_
  - _Requirements: All_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with integration testing expertise | Task: Create comprehensive integration tests covering all requirements, testing full user flows (autocomplete selection, manual input, edit with Google Places data), mocking API responses (/api/places/autocomplete, /api/places/details), verifying database operations, and testing map link display | Restrictions: Must mock all API calls (no real Google API calls), use waitFor for async operations, verify database state after actions, test both happy paths and error scenarios, ensure tests run independently | Success: All integration tests pass, user flows work end-to-end (autocomplete → form → database), manual input flow verified (NULL Google Places fields), edit flow works with existing Google Places data, map link displays correctly | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (test files created, flows tested) after completion, 3. Mark task as completed [x] in tasks.md_

- [ ] 19. Manual QA and final verification
  - Test in local Supabase environment
  - Verify autocomplete works with real Google Places API
  - Test all edge cases: API errors, timeouts, invalid inputs
  - Test on mobile viewport (responsive design)
  - Verify backward compatibility with existing evaluations
  - Purpose: Final quality assurance before completion
  - _Leverage: Supabase local dev, browser dev tools_
  - _Requirements: All_
  - _Prompt: Implement the task for spec shop-google-places-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Tester with manual testing expertise | Task: Perform comprehensive manual QA covering all requirements, testing autocomplete with real Google Places API (verify API key works, suggestions appear, selection works), error scenarios (API down, network timeout, invalid Place ID), mobile responsiveness (320px to 2560px), backward compatibility (load and edit evaluations without Google Places data), and accessibility (keyboard navigation, screen reader) | Restrictions: Must test on local Supabase instance first (supabase start), verify API key is properly configured, test all user flows manually, check console for errors, verify data saves correctly in database | Success: All features work as expected, autocomplete is responsive and accessible, errors handled gracefully, backward compatibility confirmed, ready for deployment | After completing the task: 1. Edit tasks.md to mark this task as in-progress [-] before starting, 2. Use log-implementation tool with artifacts (QA notes, issues found/fixed) after completion, 3. Mark task as completed [x] in tasks.md_

## Notes

- **Estimated Total: 19 tasks** across 7 phases
- **Dependencies**: Tasks should generally be completed in order within each phase, but phases 2-3 can partially overlap
- **Testing Strategy**: Unit tests after each component/API Route, integration tests at the end
- **Rollout**: Feature is opt-in (autocomplete is an enhancement, manual input still works)
- **Backward Compatibility**: All new database fields are NULL-able to support existing evaluations
