# Tasks Document: Shop Search Integration

## Phase 1: Domain Layer（Value Objects）

- [ ] 1. ShopLocation Value Object作成
  - File: lib/domain/value-objects/shop-location.ts
  - ShopLocationクラスを実装（latitude, longitude）
  - バリデーション: latitude -90~90, longitude -180~180
  - メソッド: isValid(), toString(), distanceTo(other: ShopLocation)
  - 範囲外の値はコンストラクタでエラースロー
  - _Leverage: lib/domain/value-objects/ (既存VO patterns)_
  - _Requirements: Requirement 2 (Shop Information Storage Schema)_
  - _Design: Data Models - Model 2 (ShopLocation), line 951-977_
  - _Prompt: Role: DDD specialist focusing on immutable value objects | Task: Create ShopLocation class with readonly latitude/longitude properties, constructor validation (-90 to 90, -180 to 180), isValid() returning boolean, toString() formatting as "lat,lon", distanceTo(other) calculating Haversine distance in km | Restrictions: Must be immutable, throw errors for invalid coordinates in constructor, no external dependencies | Success: VO enforces coordinate constraints, all methods work correctly, immutability guaranteed, follows design.md line 951-977_

- [ ] 2. ShopSearchResult Value Object作成
  - File: lib/domain/value-objects/shop-search-result.ts
  - ShopSearchResultクラスを実装（name, address, location, source）
  - displayTextゲッターを実装（name + address or name only）
  - 空文字列nameはエラースロー
  - source: 'database' | 'nominatim' のリテラル型
  - _Leverage: lib/domain/value-objects/, ShopLocation_
  - _Requirements: Requirement 1 (Server-Side Shop Search), Requirement 5 (Ubiquitous Language)_
  - _Design: Data Models - Model 1 (ShopSearchResult), line 887-927, Ubiquitous Language line 14-42_
  - _Prompt: Role: DDD architect specializing in value object design | Task: Create ShopSearchResult class with readonly properties (name: string, address: string | null, location: ShopLocation | null, source: 'database' | 'nominatim'), displayText getter returning "name - address" or "name", constructor throwing error for empty name | Restrictions: Must be immutable, no conversion methods (mappers handle that), follow Ubiquitous Language naming, use ShopLocation VO for location | Success: VO is immutable and pure, displayText works correctly, empty name validation works, follows design.md line 887-927 and Ubiquitous Language line 14-42_

- [ ] 3. Domain Service Interface作成
  - File: lib/domain/services/shop-search-service.interface.ts
  - IShopSearchService interface定義
  - searchShops(query: string, maxResults: number): Promise<ShopSearchResult[]>
  - _Leverage: lib/domain/services/ (existing service patterns)_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: Component 4 (ShopSearchService), line 778-795_
  - _Prompt: Role: Interface architect with Clean Architecture expertise | Task: Define IShopSearchService interface with searchShops method signature, JSDoc comments describing expected behavior (deduplication, max results, error handling), follow existing service interface patterns | Restrictions: Interface only (no implementation), use domain types only, document contract clearly | Success: Interface defines clear contract, JSDoc is comprehensive, follows design.md Component 4 line 778-795_

## Phase 2: Infrastructure Layer（External Dependencies）

- [ ] 4. Nominatim型定義作成
  - File: lib/infrastructure/nominatim/nominatim-types.ts
  - NominatimPlace interface（name, display_name, address, lat, lon, type, class）
  - NominatimSearchOptions interface（countrycodes, limit, format, accept-language, addressdetails, extratags, amenity）
  - _Leverage: None (new external API integration)_
  - _Requirements: Requirement 4 (API Integration with Error Handling)_
  - _Design: Data Models - Model 3 (Nominatim Types), line 1015-1034_
  - _Prompt: Role: TypeScript specialist with API integration experience | Task: Create NominatimPlace interface matching Nominatim API response structure (name, display_name, address object, lat, lon strings, type, class), NominatimSearchOptions with all query parameters (countrycodes, limit, format, accept-language, addressdetails: 1, extratags: 1, amenity), follow Nominatim API documentation exactly | Restrictions: Match API response structure exactly, use optional properties where needed, document each field | Success: Types accurately represent Nominatim API, options include cafe/restaurant filtering (amenity), follows design.md line 1015-1034_

- [ ] 5. Rate Limiter Interface作成
  - File: lib/infrastructure/rate-limiter/rate-limiter.interface.ts
  - IRateLimiter interface定義
  - canMakeRequest(): Promise<boolean>, recordRequest(): Promise<void>, waitUntilReady(): Promise<void>
  - _Leverage: None (new infrastructure interface)_
  - _Requirements: Requirement 1 (rate limiting), Requirement 4 (API compliance)_
  - _Design: Component 6 (IRateLimiter Interface), line 837-866_
  - _Prompt: Role: Infrastructure architect with rate limiting expertise | Task: Define IRateLimiter interface with three async methods: canMakeRequest returning boolean, recordRequest recording timestamp, waitUntilReady waiting until rate limit allows next request, add JSDoc explaining 1 req/sec contract | Restrictions: Interface only, all methods async (Promise-based), document serverless requirements | Success: Interface supports serverless shared state, clearly documents rate limit contract, follows design.md Component 6 line 837-866_

- [ ] 6. Supabase RateLimiter実装
  - File: lib/infrastructure/rate-limiter/supabase-rate-limiter.ts
  - SupabaseRateLimiter class（IRateLimiter実装）
  - PostgreSQL行ロック（SELECT FOR UPDATE）で1req/sec保証
  - DB接続エラー時は保守的に1秒待機
  - _Leverage: lib/infrastructure/supabase-client.ts_
  - _Requirements: Requirement 1 (rate limiting), Requirement 4 (API compliance)_
  - _Design: Component 6 (SupabaseRateLimiter), line 837-866, Migration line 1087-1128_
  - _Prompt: Role: Backend engineer with serverless and database expertise | Task: Implement SupabaseRateLimiter using rate_limiter_state table, canMakeRequest checks if (NOW() - last_request_at) > 1 second using SELECT FOR UPDATE for row locking, recordRequest updates last_request_at to NOW(), waitUntilReady polls every 100ms until allowed, handle DB errors gracefully by waiting 1 second | Restrictions: Use PostgreSQL transactions and row locking, must work across multiple Vercel instances, no in-memory state, follow 1 req/sec strictly | Success: Rate limiter enforces 1 req/sec globally, uses SELECT FOR UPDATE correctly, handles concurrency safely, DB errors fallback to 1s wait, follows design.md Component 6 line 837-866_

- [ ] 7. rate_limiter_stateマイグレーション作成
  - File: supabase/migrations/[timestamp]_create_rate_limiter_state.sql
  - rate_limiter_state table作成（service PRIMARY KEY, last_request_at TIMESTAMPTZ, updated_at TIMESTAMPTZ）
  - 初期データ挿入（nominatim, NOW() - 2 seconds）
  - トリガー作成（updated_at自動更新）
  - _Leverage: supabase/migrations/ (existing migration patterns)_
  - _Requirements: Requirement 4 (API Integration)_
  - _Design: Database Schema Changes - Migration 2, line 1087-1128_
  - _Prompt: Role: Database administrator with PostgreSQL migration expertise | Task: Create idempotent migration for rate_limiter_state table (CREATE TABLE IF NOT EXISTS) with service TEXT PRIMARY KEY, last_request_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW(), insert initial 'nominatim' row with NOW() - INTERVAL '2 seconds', create trigger for updated_at auto-update, add table/column comments | Restrictions: Must be idempotent (IF NOT EXISTS, ON CONFLICT DO NOTHING), follow existing migration naming, no RLS needed (internal table) | Success: Migration runs successfully multiple times, initial data allows immediate first request, trigger works, follows design.md line 1087-1128_

- [ ] 8. NominatimMapper作成
  - File: lib/infrastructure/nominatim/nominatim-mapper.ts
  - NominatimMapper class（static methods）
  - toShopSearchResult(data: NominatimPlace): ShopSearchResult
  - formatAddress(address): string | null（road, city, countryを統合）
  - _Leverage: ShopSearchResult, ShopLocation VOs_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: Data Models - Nominatim Mapper, line 899-920_
  - _Prompt: Role: Data transformation specialist with VO expertise | Task: Create NominatimMapper with static toShopSearchResult method converting NominatimPlace to ShopSearchResult, parse lat/lon strings to numbers for ShopLocation, format address from road/city/country fields (join with ", "), use name or display_name fallback, set source='nominatim', handle null/undefined gracefully | Restrictions: Must be in Infrastructure layer, all static methods, validate coordinates before creating ShopLocation, return null location if invalid | Success: Mapper converts API responses correctly, address formatting is readable ("road, city, country"), handles missing fields, creates valid VOs, follows design.md line 899-920_

- [ ] 9. NominatimClient実装
  - File: lib/infrastructure/nominatim/nominatim-client.ts
  - NominatimAPIClient class（INominatimClient実装）
  - search(query, options)メソッド（fetch + NominatimMapper）
  - User-Agent, Refererヘッダー設定必須
  - 429/503エラーは空配列返却（リトライなし）
  - _Leverage: IRateLimiter, NominatimMapper, nominatim-types.ts_
  - _Requirements: Requirement 4 (API Integration with Error Handling)_
  - _Design: Component 5 (NominatimAPIClient), line 797-835, Error Handling line 1140-1163_
  - _Prompt: Role: API integration engineer with error handling expertise | Task: Implement NominatimAPIClient.search building URL with query params (countrycodes=jp, limit, format=json, accept-language=ja, addressdetails=1, amenity=cafe,restaurant), check IRateLimiter.canMakeRequest before fetch, set headers (User-Agent: "SimpleCoffeeCollections/1.0", Referer: env.NEXT_PUBLIC_APP_URL), handle 429/503 by returning empty array (NO retry), call recordRequest after success, use NominatimMapper for conversion | Restrictions: Must respect rate limiter, NO retry on any error, log all errors with timestamp, return empty array on failure (never throw) | Success: Client enforces rate limit, sets required headers, handles 429/503 without retry, logs errors, converts responses with mapper, follows design.md Component 5 line 797-835 and Error Handling line 1140-1163_

- [ ] 10. ShopRepository Interface作成
  - File: lib/infrastructure/repositories/shop-repository.interface.ts
  - IShopRepository interface定義
  - findExistingShops(query: string, limit: number): Promise<ShopSearchResult[]>
  - _Leverage: lib/infrastructure/repositories/ (existing patterns)_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: Domain図 line 440-441, Component 7 line 868-884_
  - _Prompt: Role: Repository pattern specialist with Clean Architecture knowledge | Task: Define IShopRepository interface with findExistingShops method, JSDoc explaining it searches coffee_evaluations table for shop_name partial matches using ILIKE, returns ShopSearchResult array | Restrictions: Interface only (no implementation), use domain types, document query behavior | Success: Interface defines clear repository contract, JSDoc explains ILIKE search, follows design.md Domain diagram line 440-441 and Component 7 line 868-884_

- [ ] 11. ShopRepositoryMapper作成
  - File: lib/infrastructure/repositories/shop-repository-mapper.ts
  - ShopRepositoryMapper class（static methods）
  - toShopSearchResult(data: DB record): ShopSearchResult
  - DBカラム名（shop_name, shop_address, shop_latitude, shop_longitude）をVOに変換
  - _Leverage: ShopSearchResult, ShopLocation VOs_
  - _Requirements: Requirement 1 (Server-Side Shop Search), Requirement 2 (Storage Schema)_
  - _Design: Data Models - Shop Repository Mapper, line 922-944_
  - _Prompt: Role: Data mapper specialist with database expertise | Task: Create ShopRepositoryMapper with static toShopSearchResult method converting DB record (shop_name, shop_address, shop_latitude, shop_longitude) to ShopSearchResult, create ShopLocation only if both lat/lon are not null, handle null address, set source='database' | Restrictions: Must be in Infrastructure layer, all static methods, handle nullable columns correctly, validate coordinates | Success: Mapper converts DB records correctly, handles null address/location, source='database' is set, creates valid VOs, follows design.md line 922-944_

- [ ] 12. SupabaseShopRepository実装
  - File: lib/infrastructure/repositories/shop-repository.ts
  - SupabaseShopRepository class（IShopRepository実装）
  - findExistingShops: coffee_evaluations検索（ILIKE shop_name）
  - DISTINCT ON (shop_name) で重複排除
  - _Leverage: lib/supabase/server.ts, ShopRepositoryMapper_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: Component 7 (SupabaseShopRepository), line 868-884_
  - _Prompt: Role: Database query specialist with Supabase expertise | Task: Implement SupabaseShopRepository.findExistingShops using createClient from lib/supabase/server.ts, query coffee_evaluations.select('shop_name, shop_address, shop_latitude, shop_longitude').ilike('shop_name', `%${query}%`).limit(limit), use DISTINCT if possible, convert records with ShopRepositoryMapper, handle errors by returning empty array | Restrictions: Use Supabase client patterns, ILIKE for case-insensitive search, no SQL injection (parameterized queries), log errors, never throw | Success: Repository queries efficiently, ILIKE search works, uses mapper for conversion, handles errors gracefully, follows design.md Component 7 line 868-884_

## Phase 3: Application Layer（Use Cases）

- [ ] 13. SearchShopUseCase実装
  - File: lib/application/use-cases/search-shop-use-case.ts
  - SearchShopUseCaseクラス作成
  - execute(query): シーケンシャル実行（DB → count check → conditional API → merge → dedupe → limit 5）
  - 重複排除: name小文字比較
  - _Leverage: IShopRepository, INominatimClient, ShopSearchResult_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: sudoモデリング Object図 line 315-361, Architecture説明 line 627-640_
  - _Prompt: Role: Use case orchestration specialist with Clean Architecture expertise | Task: Implement SearchShopUseCase.execute orchestrating: 1) call shopRepository.findExistingShops(query, 5), 2) if results.length < 3, call nominatimClient.search(query, {limit: 5 - results.length}), 3) merge DB and API results, 4) deduplicate by lowercase name comparison, 5) return max 5 results, inject IShopRepository and INominatimClient via constructor | Restrictions: Sequential execution (DB first, then conditional API), no parallel calls, validate query (3-100 chars), use interfaces (not concrete classes), no domain logic (delegate to service) | Success: Use case orchestrates correctly, conditional API call works (only if DB < 3), deduplication prevents duplicates, max 5 enforced, follows design.md Object diagram line 315-361 and Architecture line 627-640_

## Phase 4: Presentation Layer（Server Actions & API）

- [ ] 14. searchShopAction実装
  - File: lib/actions/shop-search.ts
  - searchShopAction(query): Server Action
  - React cache() wrapper適用
  - SearchShopUseCaseインスタンス化とDI
  - ActionResponse<ShopSearchResult[]>返却
  - _Leverage: SearchShopUseCase, lib/actions/coffee.ts (ActionResponse pattern)_
  - _Requirements: Requirement 1 (Server-Side Shop Search)_
  - _Design: Component 3 (searchShopAction), line 764-776, Project Structure line 289-290_
  - _Prompt: Role: Next.js Server Actions specialist with DI expertise | Task: Implement searchShopAction Server Action with 'use server' directive, create SearchShopUseCase with SupabaseShopRepository and NominatimAPIClient instances, call useCase.execute(query), validate query (3-100 chars), return ActionResponse<ShopSearchResult[]> format {success, data/error}, wrap with React cache() for request deduplication | Restrictions: Must use 'use server', cache() wrapper required, validate input, use ActionResponse pattern from lib/actions/coffee.ts, handle errors with try-catch | Success: Server Action works from client components, cache() deduplicates requests, validation works, error responses are user-friendly, follows design.md Component 3 line 764-776_

- [ ] 15. cache() wrapper作成（オプション）
  - File: lib/api/shop-search.ts
  - cache()でsearchShopActionをラップ
  - Request-level memoization
  - _Leverage: React cache(), searchShopAction_
  - _Requirements: Requirement 1 (Performance)_
  - _Design: Project Structure line 292-293, Architecture line 236_
  - _Prompt: Role: Next.js optimization specialist with caching expertise | Task: Create cached version of searchShopAction using React cache() wrapper, export as cachedSearchShopAction, add JSDoc explaining request-level memoization (same query in one render returns cached result), note this is NOT time-based caching | Restrictions: Use React cache() only (no TTL caching), memoization is per-request lifecycle, document behavior clearly | Success: cache() wrapper works correctly, same query returns memoized result within request, JSDoc explains scope, follows design.md Architecture line 236_

## Phase 5: Database Schema

- [ ] 16. shop_location_fieldsマイグレーション作成
  - File: supabase/migrations/[timestamp]_add_shop_location_fields.sql
  - coffee_evaluationsに3カラム追加（shop_address TEXT, shop_latitude NUMERIC(10,7), shop_longitude NUMERIC(10,7)）
  - ALTER TABLE ADD COLUMN IF NOT EXISTS（冪等性）
  - コメント追加、RLS維持
  - _Leverage: supabase/migrations/, coffee_evaluations table_
  - _Requirements: Requirement 2 (Shop Information Storage Schema)_
  - _Design: Database Schema Changes - Migration 1, line 1037-1085_
  - _Prompt: Role: Database migration specialist with PostgreSQL expertise | Task: Create idempotent migration for coffee_evaluations table adding shop_address TEXT NULL, shop_latitude NUMERIC(10,7) NULL, shop_longitude NUMERIC(10,7) NULL using ALTER TABLE ADD COLUMN IF NOT EXISTS, add COMMENT ON COLUMN for each field, verify RLS policies still apply, ensure existing data unaffected (all new columns nullable) | Restrictions: Must be idempotent (IF NOT EXISTS), backward compatible (nullable), no data loss, follow existing migration naming with timestamp | Success: Migration adds 3 columns successfully, existing records have NULL values, can run multiple times safely, RLS maintained, follows design.md line 1037-1085_

## Phase 6: UI Components

- [ ] 17. ShopSearchInput Component作成
  - File: app/(app)/coffee/_components/shop-search-input.tsx
  - 'use client' directive、controlled input
  - useDebounce（300ms）実装
  - searchShopAction呼び出し
  - Loading state表示
  - _Leverage: components/ui/Input.tsx, React hooks_
  - _Requirements: Requirement 3 (Form UX Enhancement)_
  - _Design: Component 1 (ShopSearchInput), line 726-745, Project Structure line 298-300_
  - _Prompt: Role: React component specialist with UX expertise | Task: Create ShopSearchInput Client Component with 'use client', controlled input using useState, useEffect for 300ms debounce, call searchShopAction when input ≥3 chars, show loading spinner during fetch using useTransition, render ShopSearchDropdown with results, implement onSelect callback to parent, use shadcn/ui Input component, ARIA labels for accessibility | Restrictions: Must be Client Component, debounce at 300ms, minimum 3 chars, use shadcn/ui components, accessible (ARIA), handle empty results gracefully | Success: Component debounces correctly, triggers search after 300ms, loading state shows, dropdown appears, keyboard navigation works, accessible, follows design.md Component 1 line 726-745_

- [ ] 18. ShopSearchDropdown Component作成
  - File: app/(app)/coffee/_components/shop-search-dropdown.tsx
  - 'use client' directive
  - 結果リスト表示（name, address）
  - キーボードナビゲーション（↑↓Enter）
  - タッチフレンドリー（min 44px高）
  - _Leverage: ShopSearchResult type, Tailwind CSS_
  - _Requirements: Requirement 3 (Form UX Enhancement)_
  - _Design: Component 2 (ShopSearchDropdown), line 746-762_
  - _Prompt: Role: UI component developer with accessibility expertise | Task: Create ShopSearchDropdown Client Component displaying ShopSearchResult array, render each result with name and address (use displayText), implement keyboard navigation (ArrowDown/Up select, Enter confirms), ensure touch targets ≥44px height, emit onSelect callback on click/Enter, show "候補が見つかりませんでした。手入力で追加できます" when empty, use Card/CardContent from shadcn/ui, ARIA roles for list | Restrictions: Must be Client Component, keyboard navigation required, touch-friendly (44px min), accessible (ARIA), use shadcn/ui styling | Success: Dropdown displays results clearly, keyboard navigation works (↑↓Enter), touch targets are adequate, empty state message shows, accessible, follows design.md Component 2 line 746-762_

- [ ] 19. EvaluationFormへの統合
  - File: app/(app)/coffee/_components/evaluation-form.tsx
  - shop_name inputをShopSearchInputに置換
  - onSelectでaddress/lat/lon hidden fieldsに値セット
  - 手入力も可能（backward compatibility）
  - _Leverage: Existing EvaluationForm, ShopSearchInput_
  - _Requirements: Requirement 1 (Server-Side Shop Search), Requirement 3 (Form UX)_
  - _Design: sudoモデリング Object図 line 315-361, Project Structure line 298_
  - _Prompt: Role: Full-stack integration specialist with form expertise | Task: Integrate ShopSearchInput into EvaluationForm replacing shop_name text input, add onSelect handler populating hidden fields (shop_address, shop_latitude, shop_longitude), allow manual shop_name override (user can type freely), ensure form submission includes all shop fields, maintain existing validation for shop_name (required), use react-hook-form patterns | Restrictions: Must maintain backward compatibility (manual input works), shop_name still required, use existing form state management, preserve all other form fields | Success: ShopSearchInput integrated seamlessly, selection populates all fields, manual input still possible, form submission includes shop data, existing behavior preserved, follows design.md Object diagram line 315-361_

## Phase 7: Testing

- [ ] 20. ShopLocation Unit Tests
  - File: __tests__/domain/value-objects/shop-location.test.ts
  - コンストラクタバリデーション、isValid(), toString(), distanceTo()
  - 境界値テスト（-90/90, -180/180, ±91/181エラー）
  - _Leverage: Jest, ShopLocation VO_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing #2, line 1212-1216_
  - _Prompt: Role: TDD specialist with value object testing expertise | Task: Write comprehensive unit tests for ShopLocation covering: valid coordinates create instance, out-of-range throws error (lat ±91, lon ±181), boundary values (exactly -90/90, -180/180), isValid returns true for valid, toString formats as "lat,lon", distanceTo calculates Haversine correctly (test known distance), immutability verified | Restrictions: Use Jest, test all public methods, boundary value testing, achieve 80%+ coverage, follow TDD (write tests first) | Success: All ShopLocation behaviors tested, boundary cases covered, distanceTo calculation verified, immutability tested, follows design.md line 1212-1216_

- [ ] 21. ShopSearchResult Unit Tests
  - File: __tests__/domain/value-objects/shop-search-result.test.ts
  - コンストラクタバリデーション、displayText getter
  - 空name検証、null address/location処理
  - _Leverage: Jest, ShopSearchResult VO_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing #1, line 1207-1210_
  - _Prompt: Role: TDD practitioner with domain model testing expertise | Task: Write unit tests for ShopSearchResult covering: empty name throws error, displayText with address returns "name - address", displayText without address returns "name", null location handled, source='database' or 'nominatim' enforced, immutability verified | Restrictions: Use Jest, test constructor validation, test all getters, achieve 80%+ coverage, TDD approach | Success: All validation tested, displayText logic verified, null handling tested, source types validated, immutability confirmed, follows design.md line 1207-1210_

- [ ] 22. Mapper Unit Tests
  - File: __tests__/infrastructure/nominatim/nominatim-mapper.test.ts
  - File: __tests__/infrastructure/repositories/shop-repository-mapper.test.ts
  - toShopSearchResult変換テスト、null/undefined処理
  - source値検証
  - _Leverage: Jest, Mappers, VOs_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing #3,#4, line 1218-1228_
  - _Prompt: Role: Data transformation testing specialist | Task: Write unit tests for NominatimMapper and ShopRepositoryMapper covering: complete data conversion, missing address parts (null handling), missing lat/lon (location=null), name fallback (display_name), source='nominatim'/'database' verification, address formatting (road, city, country join), coordinate validation before ShopLocation creation | Restrictions: Use Jest, mock API/DB responses, test all conversion paths, null/undefined scenarios, achieve 80%+ coverage | Success: All conversion scenarios tested, null handling validated, source values correct, address formatting tested, coordinate validation verified, follows design.md line 1218-1228_

- [ ] 23. RateLimiter Unit Tests
  - File: __tests__/infrastructure/rate-limiter/supabase-rate-limiter.test.ts
  - canMakeRequest, recordRequest, waitUntilReady
  - 並行リクエスト、DBエラーフォールバック
  - _Leverage: Jest, mock Supabase client_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing #5, line 1230-1234_
  - _Prompt: Role: Async testing specialist with rate limiting expertise | Task: Write unit tests for SupabaseRateLimiter covering: first request canMakeRequest=true, second within 1s canMakeRequest=false, recordRequest updates DB timestamp, waitUntilReady waits ~1s before resolving, concurrent requests handled safely (mock SELECT FOR UPDATE), DB error fallback (wait 1s), use jest.useFakeTimers for time control | Restrictions: Mock Supabase client, use fake timers, test concurrency scenarios, test error handling, achieve 80%+ coverage, TDD | Success: All rate limiter behaviors tested, 1 req/sec enforced, concurrency safe, DB errors handled, timers work correctly, follows design.md line 1230-1234_

- [ ] 24. NominatimClient Unit Tests
  - File: __tests__/infrastructure/nominatim/nominatim-client.test.ts
  - search()成功、rate limiter統合、429/503エラー
  - ヘッダー検証、空配列返却
  - _Leverage: Jest, mock fetch, mock IRateLimiter_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing (implied), Error Handling line 1140-1163_
  - _Prompt: Role: API client testing specialist | Task: Write unit tests for NominatimClient covering: successful search returns results, rate limiter blocks when canMakeRequest=false, 429 error returns empty array (no retry), 503 error returns empty array, network error returns empty array, correct headers set (User-Agent, Referer), recordRequest called after success, all errors logged, use global fetch mock, mock IRateLimiter | Restrictions: Mock fetch globally, mock rate limiter, verify no retry on errors, test header setting, verify logging, achieve 80%+ coverage | Success: All API behaviors tested, rate limiting verified, 429/503 handling validated (no retry), headers checked, logging tested, follows design.md Error Handling line 1140-1163_

- [ ] 25. SearchShopUseCase Unit Tests
  - File: __tests__/application/use-cases/search-shop-use-case.test.ts
  - execute()オーケストレーション、DB≥3（API呼び出しなし）、DB<3（API補完）
  - 重複排除、最大5件、クエリバリデーション
  - _Leverage: Jest, mock IShopRepository, INominatimClient_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing #6, line 1236-1240_
  - _Prompt: Role: Use case testing expert with mocking expertise | Task: Write comprehensive unit tests for SearchShopUseCase.execute covering: DB results ≥3 (no API call, verify nominatimClient not called), DB results <3 (API called with limit=5-count), deduplication (same lowercase name from different sources keeps one), max 5 results enforced, query validation (2 chars error, 101 chars error, valid 3-100), error handling (repository error, API error), mock both interfaces | Restrictions: Mock IShopRepository and INominatimClient, test orchestration logic only, verify conditional API call, test deduplication algorithm, achieve 80%+ coverage | Success: All orchestration paths tested, conditional API validated, deduplication works, max 5 enforced, validation tested, errors handled, follows design.md line 1236-1240_

- [ ] 26. searchShopAction Integration Tests
  - File: __tests__/integration/actions/shop-search.test.ts
  - searchShopAction（real Supabase）、cache()重複排除
  - クエリバリデーション、エラーハンドリング
  - _Leverage: Supabase test client, searchShopAction_
  - _Requirements: Testing Requirements (Integration Tests)_
  - _Design: Testing Strategy - Integration Testing #3, line 1266-1271_
  - _Prompt: Role: Integration testing specialist with Next.js Server Actions expertise | Task: Write integration tests for searchShopAction using real Supabase test database covering: valid query returns results (verify DB integration), query <3 chars returns error, query >100 chars returns error, cache() deduplication (same query in one test returns memoized), DB+API integration works (if DB <3, API called), error handling (DB down, API down), verify ActionResponse format | Restrictions: Use test database, test with real Supabase, verify cache() behavior (difficult - may need separate test), test error scenarios, clean up test data | Success: All Server Action behaviors tested, cache deduplication validated (if possible), DB/API integration verified, error handling tested, follows design.md line 1266-1271_

- [ ] 27. Component Tests
  - File: __tests__/components/shop-search-input.test.tsx
  - File: __tests__/components/shop-search-dropdown.test.tsx
  - 入力、デバウンス、loading、結果表示、キーボードナビゲーション
  - _Leverage: @testing-library/react, @testing-library/user-event_
  - _Requirements: Testing Requirements (TDD, 80%+ coverage)_
  - _Design: Testing Strategy - Unit Testing (implied for components)_
  - _Prompt: Role: Frontend testing expert with React Testing Library | Task: Write component tests for ShopSearchInput covering: typing triggers search after 300ms (use fake timers), <3 chars no search, loading indicator shows, results display in dropdown, clicking result calls onSelect, keyboard navigation (ArrowDown/Up/Enter), empty state message, mock searchShopAction; for ShopSearchDropdown: renders results with name/address, click emits onSelect, keyboard nav works, touch targets ≥44px (test computed styles), empty message displays | Restrictions: Use Testing Library queries (getByRole preferred), mock searchShopAction, use fake timers for debounce, test accessibility (ARIA), user-event for interactions, achieve 80%+ coverage | Success: All component behaviors tested, debouncing validated, user interactions work, keyboard nav verified, accessibility tested, follows React Testing Library best practices_

- [ ] 28. E2E Tests
  - File: e2e/shop-search.spec.ts
  - 完全フロー: form→search→select→submit→verify
  - モバイル・デスクトップ両viewport
  - 手入力fallback（検索結果なし）
  - _Leverage: Playwright, e2e/README.md_
  - _Requirements: Testing Requirements (E2E Tests - Playwright)_
  - _Design: Testing Strategy - E2E Testing, line 1282-1305_
  - _Prompt: Role: E2E automation specialist with Playwright expertise | Task: Write Playwright E2E test covering: navigate to evaluation form, type shop name (≥3 chars), wait 300ms, verify dropdown appears, click shop result, verify address/lat/lon populated in form (hidden fields or state), submit form, query DB to verify coffee_evaluations record has shop data, test on mobile (375x667) and desktop (1280x720) viewports; write second test for manual fallback: type shop with no results, verify empty message, manually enter shop_name, submit, verify record saved with NULL address/lat/lon | Restrictions: Use mocked Nominatim API only (no live requests), clean up test data after, follow e2e/README.md patterns, test critical path only | Success: E2E validates complete user journey, works on both viewports, data persists correctly, manual fallback tested, test is reliable, follows design.md line 1282-1305_

## Phase 8: Documentation & Quality

- [ ] 29. Ubiquitous Language Dictionary更新
  - File: docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md
  - ShopSearchResult, ShopLocation, SearchSource追加
  - コード例、UI文言ガイドライン追加
  - _Leverage: docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md (existing)_
  - _Requirements: Requirement 5 (Ubiquitous Language Compliance)_
  - _Design: Ubiquitous Language section line 8-224_
  - _Prompt: Role: Technical writer with DDD terminology expertise | Task: Add new domain terms to UBIQUITOUS_LANGUAGE_DICTIONARY.md: ShopSearchResult (店舗検索結果, #値オブジェクト), ShopLocation (店舗位置情報, #値オブジェクト), SearchSource (検索ソース, 'database' | 'nominatim'), include code usage examples from design.md, UI text guidelines (店舗、検索、候補), maintain alphabetical order, cross-reference related terms | Restrictions: Follow existing dictionary format, Japanese for UI terms, include both English and Japanese, provide code examples, maintain consistency | Success: New terms documented clearly with examples, consistent with design.md Ubiquitous Language section line 8-224, easy to reference_

- [ ] 30. Test Coverage検証
  - jest --coverage実行、80%以上確認
  - 不足箇所の追加テスト
  - console.log削除、TODO解決
  - _Leverage: package.json test scripts_
  - _Requirements: Testing Requirements (80%+ coverage)_
  - _Design: Testing Strategy全般_
  - _Prompt: Role: Quality assurance engineer with coverage analysis expertise | Task: Run jest --coverage, verify ≥80% for statements/branches/functions/lines across all files, identify uncovered code and add tests if needed (prioritize critical paths), remove all console.log statements from production code, resolve or document all TODO comments, ensure all tests pass in CI, verify no flaky tests | Restrictions: Must achieve 80%+ coverage, no console.logs in production, all TODOs addressed, all tests passing, maintain test quality | Success: Coverage ≥80% achieved, all tests passing, no debug code, no unresolved TODOs, code is production-ready_

- [ ] 31. Implementation Log記録
  - spec-workflow log-implementation tool使用
  - 全API、Component、Function、Class、Integration記録
  - _Leverage: mcp__spec-workflow__log-implementation_
  - _Requirements: All requirements_
  - _Design: All components line 726-884_
  - _Prompt: Role: Technical documentation specialist with artifact tracking expertise | Task: After ALL tasks completed, use log-implementation tool to record comprehensive artifacts: apiEndpoints (searchShopAction signature/format), components (ShopSearchInput, ShopSearchDropdown with props/exports/location), functions (SearchShopUseCase.execute, NominatimClient.search, RateLimiter methods with signatures/locations), classes (NominatimMapper, ShopRepositoryMapper, SupabaseRateLimiter with methods), integrations (ShopSearchInput → searchShopAction → Nominatim API data flow), filesModified list, filesCreated list, statistics (lines added/removed/files changed) | Restrictions: MUST include ALL artifact types with complete details (file paths, line numbers, signatures), be exhaustive for future discoverability, include integration flows | Success: Comprehensive log created documenting ALL APIs, components, functions, classes, integrations with full details for future AI agents to discover and prevent code duplication_
