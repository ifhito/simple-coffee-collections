# Tasks Document

## Task Overview

この仕様では、7つの主要なタスクを実装します:
1. データベースマイグレーション（bean_name カラム追加）
2. 型定義の更新（TypeScript types）
3. Server Actions の拡張（FormData parsing と DB操作）**【TDD適用】**
4. フォームコンポーネントの更新（入力フィールド追加）**【TDD適用】**
5. 表示コンポーネントの更新（カード、詳細ビュー）**【TDD適用】**
6. 検索機能の拡張（bean_name を検索対象に）**【TDD適用】**
7. 統合テストと回帰テスト **【TDD適用】**

各タスクは独立して実装可能で、1-3ファイルの変更で完結します。

## TDD (Test-Driven Development) Approach

**Task 3-7 では TDD サイクルを厳格に適用します:**

```
🔴 RED: テストを先に書く（失敗するテスト）
  ↓
🟢 GREEN: テストが通る最小限の実装
  ↓
🔵 REFACTOR: コードをリファクタリング（テストは通ったまま）
  ↓
繰り返し
```

**実装順序（各タスクで共通）:**
1. **🔴 RED フェーズ**: 機能のテストを先に書く（`pnpm test` で失敗を確認）
2. **🟢 GREEN フェーズ**: テストが通る最小限のコードを実装（`pnpm test` で成功を確認）
3. **🔵 REFACTOR フェーズ**: コードの品質を改善（テストは通ったまま）
4. **📝 LOG**: log-implementation ツールで実装を記録
5. **✅ MARK**: tasks.md でタスクを完了としてマーク

このアプローチにより、テストカバレッジが保証され、リグレッションを防ぎます。

---

- [x] 1. データベースマイグレーション - bean_name カラム追加
  - **Files:**
    - `supabase/migrations/YYYYMMDDHHMMSS_add_bean_name_to_coffee_evaluations.sql` (新規作成)
  - **Purpose:** `coffee_evaluations` テーブルに `bean_name VARCHAR(255) NULL` カラムを追加
  - **Details:**
    - SQL: `ALTER TABLE coffee_evaluations ADD COLUMN bean_name VARCHAR(255) NULL;`
    - 既存データへの影響なし（NULL許可）
    - マイグレーション実行後、`supabase gen types` で型定義を再生成
  - **_Leverage:**
    - 既存のマイグレーションファイル（`supabase/migrations/`）のパターン
    - Supabase CLI コマンド
  - **_Requirements:** 4（データベーススキーマの更新）
  - **_Prompt:** Role: Database Engineer specializing in PostgreSQL and Supabase migrations | Task: Implement the task for spec bean-name-input - Create a database migration file to add the bean_name VARCHAR(255) NULL column to the coffee_evaluations table following Requirement 4. Before starting, run spec-workflow-guide to get the workflow guide. Then: (1) run spec-status to check progress, (2) edit tasks.md to mark this task as [-], (3) create migration file in supabase/migrations/ following existing naming conventions, (4) test migration on local Supabase, (5) run supabase gen types typescript --local > lib/types/database.types.ts to regenerate types, (6) use log-implementation tool with detailed artifacts, (7) mark task as [x] in tasks.md | Restrictions: Do not modify existing columns or data, ensure backward compatibility, follow existing migration file naming conventions, do not add indexes | _Leverage: Existing migration files in supabase/migrations/ for patterns, Supabase CLI commands | _Requirements: Requirement 4 (Database Schema Update) | Success: Migration file created with correct timestamp naming, SQL successfully adds bean_name VARCHAR(255) NULL column, migration runs without errors on local Supabase, existing data remains intact (all bean_name values are NULL), types regenerated successfully_

---

- [x] 2. TypeScript 型定義の更新
  - **Files:**
    - `lib/types/database.types.ts` (自動生成 - 手動編集不要)
    - `lib/types/coffee.ts` (手動編集)
  - **Purpose:** `bean_name` フィールドの型定義を追加
  - **Details:**
    - `database.types.ts`: `supabase gen types` で自動更新（Task 1 完了後）
    - `coffee.ts`: `CoffeeEvaluationFormInput` と `CoffeeEvaluationEditFormInput` に `bean_name?: string` を追加
    - `CoffeeEvaluationValidation` に検証ルールを追加（maxLength: 255）
  - **_Leverage:**
    - 既存の型定義パターン（`lib/types/coffee.ts`）
    - Supabase 型生成コマンド
  - **_Requirements:** 1（入力フィールド追加）, 4（DB型定義）
  - **_Prompt:** Role: TypeScript Developer specializing in type systems and data validation | Task: Implement the task for spec bean-name-input - Update TypeScript type definitions to include bean_name field following Requirements 1 and 4. Before starting, run spec-workflow-guide. Then: (1) run spec-status, (2) mark task as [-], (3) ensure database.types.ts is regenerated, (4) update lib/types/coffee.ts to add bean_name?: string to CoffeeEvaluationFormInput and CoffeeEvaluationEditFormInput, (5) add bean_name validation to CoffeeEvaluationValidation (maxLength: 255), (6) use log-implementation tool, (7) mark as [x] | Restrictions: Do not modify database.types.ts manually (auto-generated), maintain backward compatibility with existing types, follow existing naming conventions, ensure type safety for all bean_name usages | _Leverage: Existing type patterns in lib/types/coffee.ts, database types from lib/types/database.types.ts | _Requirements: Requirement 1 (Input Field), Requirement 4 (Database Schema) | Success: CoffeeEvaluationFormInput and CoffeeEvaluationEditFormInput include bean_name?: string, CoffeeEvaluationValidation includes bean_name validation (maxLength: 255), all types compile without errors, type definitions are consistent_

---

- [x] 3. Server Actions の拡張 - FormData parsing と DB操作
  - **Files:**
    - `lib/actions/coffee.ts` (既存ファイルを拡張)
  - **Purpose:** `bean_name` を FormData から抽出し、DB に保存
  - **Details:**
    - `ParsedEvaluationData` インターフェースに `bean_name: string | null` を追加
    - `parseEvaluationFormData()` 関数で `bean_name` を抽出（空文字列は NULL に変換）
    - `createCoffeeEvaluation()` と `updateCoffeeEvaluation()` で `bean_name` を DB に保存
    - バリデーションは不要（任意フィールド、最大長はDB制約で保証）
  - **_Leverage:**
    - 既存の `getStringField()` ヘルパー関数
    - 既存の Server Actions パターン（`lib/actions/coffee.ts`）
  - **_Requirements:** 1（入力フィールド）, 4（DB操作）
  - **_Prompt:** Role: Backend Developer with expertise in Next.js Server Actions and TDD methodology | Task: Implement the task for spec bean-name-input using TDD approach - Extend Server Actions to handle bean_name field following Requirements 1 and 4. Before starting, run spec-workflow-guide. Then follow TDD cycle: **🔴 RED**: (1) run spec-status, (2) mark task as [-], (3) write failing tests in lib/__tests__/actions/coffee.test.ts for parseEvaluationFormData() extracting bean_name, empty string conversion to NULL, createCoffeeEvaluation() saving bean_name, updateCoffeeEvaluation() updating bean_name, (4) run pnpm test to confirm tests fail. **🟢 GREEN**: (5) add bean_name: string | null to ParsedEvaluationData interface in lib/actions/coffee.ts, (6) extend parseEvaluationFormData() to extract bean_name and convert empty strings to NULL, (7) update createCoffeeEvaluation() to save bean_name, (8) update updateCoffeeEvaluation() to save bean_name, (9) run pnpm test to confirm tests pass. **🔵 REFACTOR**: (10) improve code quality if needed while keeping tests green. **📝 LOG**: (11) use log-implementation tool. **✅ MARK**: (12) mark as [x] | Restrictions: Do not create new Server Actions files (extend existing lib/actions/coffee.ts), maintain existing validation patterns, convert empty strings to NULL, do not add validation for bean_name (optional field), follow TDD strictly (tests first, then implementation) | _Leverage: Existing getStringField() helper function, existing parseEvaluationFormData() pattern, createCoffeeEvaluation() and updateCoffeeEvaluation() Server Actions, existing test patterns in lib/__tests__/actions/coffee.test.ts | _Requirements: Requirement 1 (Input Field), Requirement 4 (Database Operations) | Success: Tests written first and initially fail, ParsedEvaluationData includes bean_name: string | null, parseEvaluationFormData() extracts bean_name and converts empty strings to NULL, both create and update actions save bean_name correctly, all tests pass, existing functionality unchanged_

---

- [x] 4. EvaluationForm コンポーネントの更新 - 豆の名前入力フィールド
  - **Files:**
    - `app/(app)/coffee/_components/evaluation-form.tsx` (既存ファイルを拡張)
  - **Purpose:** フォームに「豆の名前」入力フィールドを追加
  - **Details:**
    - State に `beanName` を追加（`useState(initialData?.bean_name ?? '')`）
    - `buildFormData()` に `bean_name` を追加
    - JSX に `Input` コンポーネントを追加（ラベル: 「豆の名前（任意）」、プレースホルダー: 例文）
    - 既存のgridレイアウトに統合（2カラムグリッド）
  - **_Leverage:**
    - 既存の `Input` コンポーネント（`components/ui/Input.tsx`）
    - 既存のフォーム構造とstateパターン
  - **_Requirements:** 1（入力フィールド追加）
  - **_Prompt:** Role: Frontend Developer specializing in React forms, Next.js Client Components, and TDD | Task: Implement the task for spec bean-name-input using TDD approach - Add bean_name input field to the evaluation form following Requirement 1. Before starting, run spec-workflow-guide. Then follow TDD cycle: **🔴 RED**: (1) run spec-status, (2) mark task as [-], (3) write failing tests in app/(app)/coffee/_components/__tests__/evaluation-form.test.tsx for beanName state management, Input field rendering with correct label and placeholder, buildFormData() including bean_name, form submission with bean_name, edit mode displaying existing bean_name, (4) run pnpm test to confirm tests fail. **🟢 GREEN**: (5) add beanName state to app/(app)/coffee/_components/evaluation-form.tsx with useState(initialData?.bean_name ?? ''), (6) add Input component with label "豆の名前（任意）" and placeholder "例: エチオピア イルガチェフェ G1", (7) integrate field into existing 2-column grid layout, (8) update buildFormData() to include bean_name, (9) run pnpm test to confirm tests pass. **🔵 REFACTOR**: (10) improve code quality if needed while keeping tests green. **📝 LOG**: (11) use log-implementation tool. **✅ MARK**: (12) mark as [x] | Restrictions: Do not modify Input component (reuse as-is), maintain existing form validation patterns, follow existing grid layout structure, do not add validation for bean_name (optional field), preserve existing form functionality, follow TDD strictly (tests first, then implementation) | _Leverage: Existing Input component from components/ui/Input.tsx, existing form state management patterns, existing buildFormData() pattern, existing test patterns in evaluation-form.test.tsx | _Requirements: Requirement 1 (Input Field Addition) | Success: Tests written first and initially fail, beanName state managed correctly, Input field displays with proper label and placeholder, field integrates into 2-column grid layout, buildFormData() includes bean_name value, form submits bean_name to Server Action, edit mode displays existing bean_name value, all tests pass_

---

- [x] 5. 表示コンポーネントの更新 - カードと詳細ビュー
  - **Files:**
    - `app/(app)/coffee/_components/list/card.tsx` (既存ファイルを拡張)
    - `app/(app)/coffee/[id]/_components/evaluation/view.tsx` (既存ファイルを拡張)
  - **Purpose:** 評価の一覧と詳細ページに「豆の名前」を表示
  - **Details:**
    - **card.tsx**: `bean_name` がある場合、`bean_type - bean_name` 形式で表示
    - **view.tsx**: description list に「豆の名前」セクションを追加（条件付きレンダリング）
    - 両方とも条件付きレンダリング（`bean_name` が NULL の場合は非表示）
  - **_Leverage:**
    - 既存のカードレイアウトパターン
    - 既存の description list パターン（`view.tsx`）
  - **_Requirements:** 2（表示機能）
  - **_Prompt:** Role: Frontend Developer specializing in React Server Components, UI presentation, and TDD | Task: Implement the task for spec bean-name-input using TDD approach - Display bean_name in evaluation list cards and detail view following Requirement 2. Before starting, run spec-workflow-guide. Then follow TDD cycle: **🔴 RED**: (1) run spec-status, (2) mark task as [-], (3) write failing tests in app/(app)/coffee/_components/list/__tests__/card.test.tsx for displaying "bean_type - bean_name" when bean_name exists and only "bean_type" when NULL, (4) write failing tests in app/(app)/coffee/[id]/_components/evaluation/__tests__/view.test.tsx for showing bean_name in description list conditionally, (5) run pnpm test to confirm tests fail. **🟢 GREEN**: (6) update app/(app)/coffee/_components/list/card.tsx to display "bean_type - bean_name" with conditional rendering, (7) update app/(app)/coffee/[id]/_components/evaluation/view.tsx to show bean_name in description list conditionally, (8) run pnpm test to confirm tests pass. **🔵 REFACTOR**: (9) improve code quality if needed while keeping tests green. **📝 LOG**: (10) use log-implementation tool. **✅ MARK**: (11) mark as [x] | Restrictions: Do not modify component props or data fetching logic, maintain existing layout and styling patterns, use conditional rendering (hide field if bean_name is NULL), preserve existing display functionality, follow TDD strictly (tests first, then implementation) | _Leverage: Existing card layout pattern in card.tsx, existing description list pattern in view.tsx, CoffeeEvaluation type with bean_name field, existing test patterns | _Requirements: Requirement 2 (Display Functionality) | Success: Tests written first and initially fail, card displays "bean_type - bean_name" when bean_name exists and only "bean_type" when NULL, detail view shows bean_name in description list when it exists and hides section when NULL, styling is consistent with existing fields, no layout shifts, all tests pass_

---

- [x] 6. 検索機能の拡張 - bean_name を検索対象に追加
  - **Files:**
    - `lib/api/coffee.ts` (既存ファイルを拡張)
  - **Purpose:** 検索クエリに `bean_name` を追加
  - **Details:**
    - 検索関数（または該当する関数）の `.or()` クエリに `bean_name.ilike.%${query}%` を追加
    - UI変更は不要（検索はServer Sideで実施）
    - 既存の検索ロジックとの統合
  - **_Leverage:**
    - 既存の検索関数パターン（`lib/api/coffee.ts`）
    - Supabase `.or()` クエリパターン
  - **_Requirements:** 3（検索機能統合）
  - **_Prompt:** Role: Backend Developer with expertise in Supabase queries, data fetching, and TDD | Task: Implement the task for spec bean-name-input using TDD approach - Extend search functionality to include bean_name field following Requirement 3. Before starting, run spec-workflow-guide. Then follow TDD cycle: **🔴 RED**: (1) run spec-status, (2) mark task as [-], (3) write failing tests in app/(app)/coffee/__tests__/integration/search-sort-flows.test.tsx for searching by bean_name with partial matching (e.g. "イルガ" matches "イルガチェフェ"), verify search results include evaluations with matching bean_name, (4) run pnpm test to confirm tests fail. **🟢 GREEN**: (5) locate search function in lib/api/coffee.ts, (6) add bean_name.ilike.%${query}% to the existing .or() clause, (7) run pnpm test to confirm tests pass. **🔵 REFACTOR**: (8) improve code quality if needed while keeping tests green. **📝 LOG**: (9) use log-implementation tool. **✅ MARK**: (10) mark as [x] | Restrictions: Do not modify search UI components (SearchAndSort.tsx), maintain existing search behavior for other fields, use case-insensitive search (ilike), do not add new API functions (extend existing), follow TDD strictly (tests first, then implementation) | _Leverage: Existing search query pattern in lib/api/coffee.ts, Supabase .or() and .ilike operators, cache() wrapper for Request Memoization, existing search test patterns | _Requirements: Requirement 3 (Search Integration) | Success: Tests written first and initially fail, search query includes bean_name in .or() clause, partial match search works (e.g. "イルガ" matches "イルガチェフェ"), search results include evaluations with matching bean_name, existing search functionality for shop_name and bean_type still works, no performance degradation, all tests pass_

---

- [x] 7. 統合テストと回帰テスト - エンドツーエンドフロー検証
  - **Files:**
    - `app/(app)/coffee/__tests__/integration/coffee-flows.test.tsx` (既存テストを拡張)
    - `app/(app)/coffee/__tests__/integration/search-sort-flows.test.tsx` (既存テストを拡張)
  - **Purpose:** `bean_name` 機能の統合テストと回帰テストを追加
  - **Details:**
    - **統合テスト (coffee-flows):**
      - 作成フロー with bean_name（フォーム入力 → 保存 → 詳細表示）
      - 作成フロー without bean_name（NULL値の処理）
      - 編集フロー（bean_name の追加・変更・削除）
      - 一覧表示での bean_name 表示確認
    - **統合テスト (search-sort-flows):**
      - bean_name での検索（既にTask 6で実装済みだが、追加の統合テスト）
      - 複合検索（shop_name + bean_name など）
    - **回帰テスト:**
      - 既存の全テストが通ることを確認
      - bean_name なしの既存データが正常に動作することを確認
  - **_Leverage:**
    - 既存の統合テストパターン（Jest, React Testing Library）
    - 既存のモックとフィクスチャ
    - Tasks 3-6 で作成したユニットテスト
  - **_Requirements:** All（全要件の統合テスト）
  - **_Prompt:** Role: QA Engineer with expertise in integration testing, Jest, React Testing Library, and TDD methodology | Task: Implement the task for spec bean-name-input using TDD approach - Add comprehensive integration and regression tests for bean_name functionality following all requirements. Before starting, run spec-workflow-guide. Then follow TDD cycle: **🔴 RED**: (1) run spec-status, (2) mark task as [-], (3) write failing integration tests in app/(app)/coffee/__tests__/integration/coffee-flows.test.tsx for create/edit flows with bean_name (with and without values), verify list and detail display, (4) write additional integration tests in search-sort-flows.test.tsx if not covered in Task 6, (5) run pnpm test to confirm new integration tests fail. **🟢 GREEN**: (6) verify that Tasks 3-6 implementations make the integration tests pass, (7) run pnpm test to confirm all tests pass (including regression tests). **🔵 REFACTOR**: (8) improve test code quality if needed while keeping tests green. **📝 LOG**: (9) use log-implementation tool with test coverage metrics. **✅ MARK**: (10) mark as [x] | Restrictions: Do not create new test files (extend existing integration test files), follow existing test patterns and conventions, use existing mocks and test utilities, maintain test isolation, verify all existing tests still pass (regression), follow TDD strictly (integration tests first, verify implementations pass them) | _Leverage: Existing integration test patterns in coffee-flows.test.tsx and search-sort-flows.test.tsx, React Testing Library utilities, existing mock Supabase client, existing test fixtures and helpers, unit tests from Tasks 3-6 | _Requirements: All requirements (comprehensive integration test coverage) | Success: Integration tests written first and initially fail, integration tests cover create/edit/display/search flows with bean_name, tests verify both with and without bean_name values, all tests pass consistently (including existing regression tests), test coverage for bean_name functionality is > 90%, edge cases are covered (NULL values, empty strings, max length), no existing functionality is broken_

---

## Implementation Notes

- **Order**: Tasks can be implemented in order (1→7) for best results, but Tasks 2-3 and 4-6 can be done in parallel after Task 1 is complete
- **Dependencies**:
  - Task 2 depends on Task 1 (migration must run first to regenerate types)
  - Tasks 3-6 depend on Task 2 (type definitions must exist)
  - Task 7 can be done incrementally after each feature task
- **Testing**: Run tests frequently during implementation to catch issues early
- **Commit Strategy**: Consider committing after each task completion for clean history

## Success Criteria

All tasks completed when:
- All tasks marked as `[x]` in this document
- All tests pass (`pnpm test`)
- No TypeScript errors (`npx tsc --noEmit`)
- Manual testing confirms all requirements are met
- Implementation logs created for all tasks (log-implementation tool used)
