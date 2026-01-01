# Tasks Document: モバイルナビゲーションメニュー

## Implementation Approach

**Test-Driven Development (TDD)**: すべてのタスクは Red-Green-Refactor サイクルに従って実装します。

**実装順序**: Phase 1 → Phase 2 → Phase 3 → Phase 4（各フェーズでテストを完了してから次へ）

---

## Phase 1: ハンバーガーメニューボタンの表示

### Task 1.1: ハンバーガーメニューボタン表示テスト（Red）

- [x] 1.1. ハンバーガーメニューボタンの表示テストを作成

  - File: `app/(app)/_components/__tests__/nav-bar.test.tsx`
  - Red: テストを書いて失敗させる
  - Purpose: 小画面でハンバーガーメニューボタンが表示されることを検証
  - _Leverage: 既存のテストパターン_
  - _Requirements: Requirement 1 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in React Testing Library and TDD | Task: Create comprehensive tests for hamburger menu button display following Requirement 1 acceptance criteria, using existing test patterns and mocking strategies from design.md | Restrictions: Must follow TDD Red phase - write failing tests first, do not implement component code yet, mock all external dependencies (next/navigation, LogoutButton, window.matchMedia) | Leverage: Existing test structure in app/(app)/_components/__tests__/, Jest configuration, React Testing Library | Requirements: Requirement 1 (all 5 acceptance criteria) | Success: Test file created with 5 failing tests covering all Requirement 1 acceptance criteria, proper mocks configured, tests are clear and maintainable | Instructions: After creating the failing tests, run spec-workflow-guide to understand the next steps, then mark this task as in-progress in tasks.md, implement the code, log the implementation with log-implementation tool including detailed artifacts (test structure, mock configurations, test cases), and mark as complete when all tests are written and failing as expected_

### Task 1.2: ハンバーガーメニューボタンの実装（Green）

- [x] 1.2. ハンバーガーメニューボタンをNavBarコンポーネントに追加

  - File: `app/(app)/_components/nav-bar.tsx`
  - Green: テストをパスさせる最小限の実装
  - Purpose: 小画面でハンバーガーメニューボタンを表示する
  - _Leverage: 既存の NavBar コンポーネント、useState hook_
  - _Requirements: Requirement 1 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer specializing in React and Next.js | Task: Implement hamburger menu button in NavBar component following Requirement 1 acceptance criteria to make Task 1.1 tests pass | Restrictions: Must pass all tests from Task 1.1, use minimal implementation (Green phase), add useState for menu state, use Tailwind CSS sm: breakpoint, embed SVG icons directly (no external dependencies) | Leverage: Existing NavBar component structure, useState hook, Tailwind CSS responsive utilities | Requirements: Requirement 1 (all 5 acceptance criteria) | Success: All Task 1.1 tests pass, hamburger button displays on small screens (<640px), hides on large screens (≥640px), shows correct icon based on menu state, has proper accessibility attributes (aria-expanded, aria-label) | Instructions: After implementation, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests pass, log implementation with log-implementation tool including artifacts (component structure, state management, SVG icons, responsive styles, accessibility attributes), mark as complete_

### Task 1.3: ハンバーガーメニューボタンのリファクタリング（Refactor）

- [x] 1.3. ハンバーガーメニューボタンのコードを整理・最適化

  - File: `app/(app)/_components/nav-bar.tsx`
  - Refactor: テストをパスした状態でコードを改善
  - Purpose: コードの可読性とメンテナンス性を向上
  - _Leverage: React hooks (useCallback), Tailwind CSS utilities_
  - _Requirements: Requirement 1 - Non-functional requirements (Performance, Accessibility)_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Senior Frontend Developer specializing in React optimization and code quality | Task: Refactor hamburger menu button implementation following non-functional requirements while maintaining all Task 1.1 test passing status | Restrictions: Must not break any existing tests, maintain same functionality, optimize for performance (useCallback for event handlers), improve code organization and readability, ensure accessibility compliance | Leverage: React hooks (useCallback, useMemo if needed), Tailwind CSS utility composition, existing code patterns | Requirements: Non-functional requirements (Performance, Accessibility, Code Quality) | Success: All tests still pass, code is more readable and maintainable, event handlers optimized with useCallback, accessibility attributes properly implemented, no performance regressions | Instructions: After refactoring, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests still pass, log refactoring changes with log-implementation tool including artifacts (optimization techniques used, code structure improvements), mark as complete_

---

## Phase 2: メニューの開閉機能

### Task 2.1: メニュー開閉機能のテスト（Red）

- [x] 2.1. メニュー開閉機能のテストを作成

  - File: `app/(app)/_components/__tests__/nav-bar.test.tsx` (追加)
  - Red: テストを書いて失敗させる
  - Purpose: メニューのクリック操作と状態変化を検証
  - _Leverage: @testing-library/user-event, 既存のテスト構造_
  - _Requirements: Requirement 2 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in user interaction testing and TDD | Task: Create comprehensive tests for menu toggle functionality following Requirement 2 acceptance criteria, using @testing-library/user-event for click interactions | Restrictions: Must follow TDD Red phase - write failing tests first, do not implement toggle logic yet, test menu visibility based on state, test automatic closing after link click | Leverage: @testing-library/user-event for click simulation, existing test structure from Task 1.1, React Testing Library queries | Requirements: Requirement 2 (all 5 acceptance criteria) | Success: Test file extended with 4 new failing tests covering all Requirement 2 acceptance criteria, user interactions properly simulated, tests verify menu visibility and aria-expanded attribute | Instructions: After creating failing tests, run spec-workflow-guide, mark task as in-progress in tasks.md, implement the code, log implementation with log-implementation tool including artifacts (interaction test patterns, state verification methods), mark as complete_

### Task 2.2: メニュー開閉機能の実装（Green）

- [x] 2.2. メニュー開閉ロジックとモバイルメニューパネルを実装

  - File: `app/(app)/_components/nav-bar.tsx`
  - Green: テストをパスさせる最小限の実装
  - Purpose: ハンバーガーボタンクリックでメニューを開閉する
  - _Leverage: useState (isMobileMenuOpen), イベントハンドラー_
  - _Requirements: Requirement 2 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer specializing in React state management | Task: Implement menu toggle logic and mobile menu panel following Requirement 2 acceptance criteria to make Task 2.1 tests pass | Restrictions: Must pass all tests from Task 2.1, implement minimal toggle functionality (Green phase), show/hide menu panel based on state, update aria-expanded attribute, add conditional rendering for mobile menu | Leverage: useState for isMobileMenuOpen state, onClick handler for toggle, conditional rendering (&&), existing NavBar structure | Requirements: Requirement 2 (all 5 acceptance criteria) | Success: All Task 2.1 tests pass, menu opens/closes on button click, menu panel displays navigation and user menu when open, menu closes after clicking navigation link, aria-expanded reflects state correctly | Instructions: After implementation, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests pass, log implementation with log-implementation tool including artifacts (state management, event handlers, mobile menu panel structure, conditional rendering), mark as complete_

### Task 2.3: メニュー開閉機能のリファクタリング（Refactor）

- [x] 2.3. メニュー開閉ロジックを最適化

  - File: `app/(app)/_components/nav-bar.tsx`
  - Refactor: テストをパスした状態でコードを改善
  - Purpose: イベントハンドラーを最適化し、コードを整理
  - _Leverage: useCallback, ヘルパー関数の抽出_
  - _Requirements: Requirement 2 - Non-functional requirements (Performance)_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Senior Frontend Developer specializing in React performance optimization | Task: Refactor menu toggle logic following non-functional performance requirements while maintaining all Task 2.1 test passing status | Restrictions: Must not break any existing tests, maintain same functionality, optimize event handlers with useCallback, extract toggle logic if it becomes complex, minimize re-renders | Leverage: useCallback for handleToggle and handleLinkClick, React.memo if needed for child components, existing optimization patterns | Requirements: Non-functional requirements (Performance - 60fps animation, minimal re-renders) | Success: All tests still pass, event handlers optimized with useCallback, toggle logic is clean and maintainable, no unnecessary re-renders, performance meets 60fps requirement | Instructions: After refactoring, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests still pass and performance is optimal, log refactoring with log-implementation tool including artifacts (callback optimizations, performance improvements), mark as complete_

---

## Phase 3: ナビゲーションリンクの表示

### Task 3.1: ナビゲーションリンク表示のテスト（Red）

- [x] 3.1. モバイルメニュー内のナビゲーションリンク表示テストを作成

  - File: `app/(app)/_components/__tests__/nav-bar.test.tsx` (追加)
  - Red: テストを書いて失敗させる
  - Purpose: モバイルメニュー内でのナビゲーションリンクの表示と動作を検証
  - _Leverage: usePathname モック、@testing-library/user-event_
  - _Requirements: Requirement 3 - Acceptance Criteria 1, 2, 3, 4_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in navigation and routing tests | Task: Create comprehensive tests for navigation links in mobile menu following Requirement 3 acceptance criteria, testing active state styling and navigation behavior | Restrictions: Must follow TDD Red phase - write failing tests first, mock usePathname to test active state, do not implement mobile navigation links yet, test link visibility and styling | Leverage: Mocked usePathname from next/navigation, @testing-library/user-event for clicks, existing test structure | Requirements: Requirement 3 (all 4 acceptance criteria) | Success: Test file extended with 4 new failing tests covering all Requirement 3 acceptance criteria, active state properly tested with pathname mocking, link navigation behavior verified | Instructions: After creating failing tests, run spec-workflow-guide, mark task as in-progress in tasks.md, implement the code, log implementation with log-implementation tool including artifacts (pathname mocking strategy, active state tests, navigation tests), mark as complete_

### Task 3.2: モバイルナビゲーションリンクの実装（Green）

- [x] 3.2. モバイルメニュー内にナビゲーションリンクを追加

  - File: `app/(app)/_components/nav-bar.tsx`
  - Green: テストをパスさせる最小限の実装
  - Purpose: モバイルメニューにCoffeeリンクを表示し、アクティブ状態をサポート
  - _Leverage: 既存の navItems 配列、usePathname、Link コンポーネント_
  - _Requirements: Requirement 3 - Acceptance Criteria 1, 2, 3, 4_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer specializing in navigation and routing | Task: Implement navigation links in mobile menu following Requirement 3 acceptance criteria to make Task 3.1 tests pass | Restrictions: Must pass all tests from Task 3.1, reuse existing navItems array, implement active state styling (bg-amber-100 text-amber-800), add onClick to close menu after navigation, ensure link accessibility | Leverage: Existing navItems array, usePathname for active detection, Next.js Link component, Tailwind CSS for styling | Requirements: Requirement 3 (all 4 acceptance criteria) | Success: All Task 3.1 tests pass, Coffee link displayed in mobile menu when open, active styling applied when on /coffee page, menu closes after link click, proper touch target size (44x44px) | Instructions: After implementation, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests pass, log implementation with log-implementation tool including artifacts (navigation link structure, active state logic, menu closing behavior, responsive styles), mark as complete_

### Task 3.3: ナビゲーションリンクのリファクタリング（Refactor）

- [x] 3.3. デスクトップとモバイルの共通リンク生成ロジックを抽出

  - File: `app/(app)/_components/nav-bar.tsx`
  - Refactor: テストをパスした状態でコードを改善
  - Purpose: デスクトップとモバイルで重複するリンク生成コードを統一
  - _Leverage: ヘルパー関数、useMemo_
  - _Requirements: Code Architecture - DRY principle, Modularity_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Senior Frontend Developer specializing in code refactoring and React patterns | Task: Refactor navigation link generation to eliminate duplication between desktop and mobile following DRY principle while maintaining all Task 3.1 test passing status | Restrictions: Must not break any existing tests, maintain same functionality for both desktop and mobile, extract common logic into helper function or component, use useMemo for optimization if appropriate | Leverage: Helper functions for link generation, useMemo for expensive operations, React component composition | Requirements: Non-functional requirements (Code Architecture - Single Responsibility, Modular Design, DRY) | Success: All tests still pass, no code duplication between desktop/mobile link rendering, extracted logic is reusable and maintainable, performance is maintained or improved | Instructions: After refactoring, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests still pass, log refactoring with log-implementation tool including artifacts (extracted helper functions, code deduplication approach, reusability improvements), mark as complete_

---

## Phase 4: ユーザーメニューの表示

### Task 4.1: ユーザーメニュー表示のテスト（Red)

- [x] 4.1. モバイルメニュー内のユーザーメニュー表示テストを作成

  - File: `app/(app)/_components/__tests__/nav-bar.test.tsx` (追加)
  - Red: テストを書いて失敗させる
  - Purpose: ログイン状態に応じたユーザーメニューの表示を検証
  - _Leverage: userEmail props のモック、LogoutButton モック_
  - _Requirements: Requirement 4 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in authentication and conditional rendering tests | Task: Create comprehensive tests for user menu in mobile menu following Requirement 4 acceptance criteria, testing logged-in/logged-out states and user interactions | Restrictions: Must follow TDD Red phase - write failing tests first, mock userEmail prop for logged-in/out states, mock LogoutButton component, do not implement user menu yet, test conditional rendering and visual separator | Leverage: Mocked userEmail prop, mocked LogoutButton component, @testing-library/user-event for interactions, existing test structure | Requirements: Requirement 4 (all 5 acceptance criteria) | Success: Test file extended with 5 new failing tests covering all Requirement 4 acceptance criteria, logged-in/out states properly tested, profile navigation and logout verified, visual separator tested | Instructions: After creating failing tests, run spec-workflow-guide, mark task as in-progress in tasks.md, implement the code, log implementation with log-implementation tool including artifacts (authentication state tests, conditional rendering tests, interaction tests), mark as complete_

### Task 4.2: モバイルユーザーメニューの実装（Green）

- [x] 4.2. モバイルメニュー内にユーザーメニューを追加

  - File: `app/(app)/_components/nav-bar.tsx`
  - Green: テストをパスさせる最小限の実装
  - Purpose: ログインユーザー向けにプロフィールとログアウトを表示
  - _Leverage: 既存の LogoutButton コンポーネント、Link コンポーネント_
  - _Requirements: Requirement 4 - Acceptance Criteria 1, 2, 3, 4, 5_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer specializing in authentication UI and user menu implementation | Task: Implement user menu in mobile menu following Requirement 4 acceptance criteria to make Task 4.1 tests pass | Restrictions: Must pass all tests from Task 4.1, conditionally render based on userEmail prop, reuse LogoutButton with variant=\"text\", add visual separator (border-top), add onClick to close menu after profile click | Leverage: Existing LogoutButton component (variant=\"text\"), Next.js Link component, conditional rendering (userEmail &&), Tailwind CSS for separator | Requirements: Requirement 4 (all 5 acceptance criteria) | Success: All Task 4.1 tests pass, user menu displays when logged in, hidden when logged out, visual separator between navigation and user menu, profile link navigates and closes menu, logout button triggers logout | Instructions: After implementation, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests pass, log implementation with log-implementation tool including artifacts (user menu structure, conditional rendering logic, LogoutButton integration, separator styling), mark as complete_

### Task 4.3: ユーザーメニューのリファクタリングと最終調整（Refactor）

- [x] 4.3. ユーザーメニューのコードを整理し、全体の最終調整

  - File: `app/(app)/_components/nav-bar.tsx`
  - Refactor: テストをパスした状態で全体を最終調整
  - Purpose: コード品質を向上させ、一貫性を確保
  - _Leverage: React hooks、Tailwind CSS、コードレビューベストプラクティス_
  - _Requirements: All - Code quality, Performance, Accessibility_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Senior Frontend Developer and Code Reviewer specializing in React best practices and accessibility | Task: Perform final refactoring and code quality improvements following all non-functional requirements while maintaining all test passing status | Restrictions: Must not break any existing tests (all 20 tests from Phases 1-4), ensure code consistency across desktop/mobile, verify accessibility compliance (WCAG 2.1 Level AA), optimize performance, maintain code readability | Leverage: All React optimization techniques (useCallback, useMemo), Tailwind CSS best practices, accessibility attributes (aria-*), existing code patterns | Requirements: All requirements - especially non-functional (Performance, Security, Accessibility, Usability, Code Architecture) | Success: All 20 tests pass, code is clean and well-organized, performance meets 60fps target, accessibility attributes properly implemented, touch targets ≥44x44px, keyboard navigation works, code follows project conventions | Instructions: After refactoring, run spec-workflow-guide, mark task as in-progress in tasks.md, verify all tests pass and quality requirements met, log final refactoring with log-implementation tool including artifacts (final code structure, performance optimizations, accessibility improvements, code quality enhancements), mark as complete_

---

## Phase 5: 統合とドキュメント

### Task 5.1: テストカバレッジの検証

- [x] 5.1. テストカバレッジを測定し、目標達成を確認

  - File: N/A (テスト実行とレポート確認)
  - Purpose: Statement 90%以上、Branch 85%以上、Function 90%以上を達成
  - _Leverage: Jest coverage reporter_
  - _Requirements: Testing (TDD Requirements) - Coverage goals_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Lead specializing in test coverage analysis and quality assurance | Task: Measure test coverage for nav-bar.tsx and verify coverage goals are met following TDD requirements | Restrictions: Must achieve minimum coverage targets (Statement ≥90%, Branch ≥85%, Function ≥90%), identify any uncovered lines and add tests if needed, do not modify production code to inflate coverage | Leverage: Jest coverage reporter (npm test -- --coverage), existing test suite from Phases 1-4 | Requirements: Testing requirements (Coverage goals: Statement 90%+, Branch 85%+, Function 90%+) | Success: Coverage report shows all targets met or exceeded, uncovered areas identified and additional tests added if necessary, coverage report documented | Instructions: After verification, run spec-workflow-guide, mark task as in-progress in tasks.md, run coverage report, add missing tests if needed, log coverage results with log-implementation tool including artifacts (coverage statistics, coverage report summary, gaps addressed), mark as complete_

### Task 5.2: マニュアルテストとクロスブラウザ確認

- [x] 5.2. 実際のデバイスとブラウザでマニュアルテストを実施

  - File: N/A (マニュアルテスト)
  - Purpose: 実環境での動作確認とユーザビリティ検証
  - _Leverage: 開発サーバー、デバイスエミュレーター_
  - _Requirements: Usability, Performance, Compatibility requirements_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Tester specializing in manual testing and user experience validation | Task: Perform comprehensive manual testing on real devices and browsers following usability and compatibility requirements | Restrictions: Must test on multiple screen sizes (320px-2560px), verify on modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions), test touch interactions on mobile, verify keyboard navigation, check accessibility with screen reader | Leverage: Development server (npm run dev), browser DevTools device emulation, real mobile devices if available | Requirements: Usability (touch targets ≥44x44px, keyboard navigation, screen reader support), Performance (60fps animation), Compatibility (modern browsers, responsive design) | Success: All features work correctly across tested browsers and devices, touch targets are adequate, keyboard navigation functions properly, animations are smooth, accessibility is verified | Instructions: After testing, run spec-workflow-guide, mark task as in-progress in tasks.md, document test results and any issues found, log testing results with log-implementation tool including artifacts (tested browsers/devices list, issues found and fixed, user experience notes), mark as complete_

### Task 5.3: ドキュメント更新と実装完了

- [x] 5.3. 実装内容を README や CLAUDE.md に反映

  - File: README.md, CLAUDE.md (該当する場合)
  - Purpose: 新機能のドキュメント化と開発者向けガイド更新
  - _Leverage: 既存のドキュメント構造_
  - _Requirements: Documentation standards_
  - _Prompt: Implement the task for spec mobile-navigation-menu, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer specializing in developer documentation | Task: Update project documentation to reflect the new mobile navigation menu feature following documentation standards | Restrictions: Must maintain existing documentation structure and tone, document new features clearly for future developers, include usage examples if appropriate, do not over-document obvious functionality | Leverage: Existing README.md and CLAUDE.md structure, documentation templates | Requirements: Documentation standards (clear, concise, maintainable) | Success: Documentation updated with mobile navigation menu information, new component usage documented, any breaking changes or migration notes added, documentation is clear and helpful | Instructions: After documentation, run spec-workflow-guide, mark task as in-progress in tasks.md, review documentation for clarity, log documentation updates with log-implementation tool including artifacts (documentation sections added/updated, examples provided), mark as complete when all tasks in spec are finished_

---

## Summary

**Total Tasks**: 15 tasks across 5 phases

**Estimated Completion**:
- Phase 1 (Hamburger Button): Tasks 1.1-1.3 (3 tasks)
- Phase 2 (Menu Toggle): Tasks 2.1-2.3 (3 tasks)
- Phase 3 (Navigation Links): Tasks 3.1-3.3 (3 tasks)
- Phase 4 (User Menu): Tasks 4.1-4.3 (3 tasks)
- Phase 5 (Integration): Tasks 5.1-5.3 (3 tasks)

**Success Criteria**:
- ✅ All 20 unit tests passing
- ✅ Test coverage ≥90% statement, ≥85% branch, ≥90% function
- ✅ Manual testing passed on multiple browsers/devices
- ✅ Accessibility compliance (WCAG 2.1 Level AA)
- ✅ Performance target met (60fps animations)
- ✅ Documentation updated
