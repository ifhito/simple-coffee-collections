# CLAUDE.md

## WHY: Project Purpose

A personal coffee journal to record cafe visits and coffee experiences.
Helps enthusiasts track their coffee journey, discover patterns, and explore new tastes.

**Audience**: Coffee enthusiasts (personal use & community sharing)
**Language**: Japanese (UI/content), English (docs)

---

## WHAT: Architecture & Components

### Architecture: Clean Architecture + DDD

- **Domain**: Entities, Value Objects (`lib/domain/`)
- **Application**: Use Cases, DTOs (`lib/application/`)
- **Infrastructure**: Supabase, Repository (`lib/infrastructure/`)
- **Presentation**: Next.js, Server Actions (`app/`, `lib/actions/`)

**Skills**: claude-md-creator, nextjs-best-practices (`.claude/skills/`)

---

## HOW: Development Guidelines

### Ubiquitous Language (MANDATORY)

**Before coding**: Check `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md`
**New terms**: Add using template
**Usage**: `CoffeeEvaluation` ✓ / `CoffeeReview` ✗ (Code), "評価" ✓ / "レビュー" ✗ (UI)

### TDD Workflow (80%+ coverage)

Test → Fail → Implement → Pass → Refactor

- Unit: Jest + Testing Library
- Integration: API, DB
- E2E: Playwright (`e2e/README.md`)

### Next.js Principles

Server Components first, Container/Presentational, Composition over drilling

### Documentation

- `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` - Term reference (推奨)
- `docs/UBIQUITOUS_LANGUAGE.md` - Domain model details
- `e2e/README.md` - E2E testing

### Development Steps

1. Check dictionary → 2. Write test → 3. Implement → 4. Update dict → 5. Run tests

---

**Last Updated**: 2026-01-30 | **Version**: 1.1.0
