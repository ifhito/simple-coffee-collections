# CMUX Resume Plan

Date: 2026-03-12
Source: `workspace:5 / pane:12 / surface:11` (Claude Code)
Branch: `feature/extract-shops-and-search-plan`

## Extracted Plan

1. Reproduce the failing E2E tests around coffee search after creating an evaluation.
2. Verify the failing query path in the app and repository search logic.
3. Replace the broken `or()` usage that includes `shops.name.ilike...` with a PostgREST-compatible approach.
4. Keep shop-name search behavior by resolving matching shop IDs first, then applying those IDs to the coffee evaluation query.
5. Update unit tests that currently assert the invalid `shops.name.ilike` OR condition.
6. Re-run targeted tests, then the relevant Playwright E2E specs.
7. If green, commit and report the resumed work.

## Execution Status From Claude Code Log

- Completed:
  - Reproduced the Playwright failure.
  - Identified the broken query pattern in `lib/api/coffee.ts` and repository search code.
  - Verified with direct REST calls that local PostgREST rejects `or=(shops.name.ilike...., ...)`.
- Partially completed:
  - Root-cause analysis was written out, but no code fix was applied.
- Not started:
  - Search implementation change.
  - Test updates for the new search strategy.
  - Re-running Playwright after the fix.

## Resume Point

Start from step 3: implement a PostgREST-compatible shop-name search strategy in API/repository code and then update affected tests.
