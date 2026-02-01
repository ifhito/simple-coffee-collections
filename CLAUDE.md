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

### Feature Development Workflow

1. Branch: `git checkout -b feature/name`
2. spec-workflow MCP: Requirements → Design → Tasks → Implementation
3. TDD: Test → Fail → Implement → Pass → Refactor (80%+ coverage)

### Ubiquitous Language (MANDATORY)

**Before coding**: Check `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md`
**Usage**: `CoffeeEvaluation` ✓ / `CoffeeReview` ✗ (Code), "評価" ✓ / "レビュー" ✗ (UI)

### Next.js & Testing

- Server Components first, Container/Presentational, Composition over drilling
- Unit: Jest + Testing Library | Integration: API, DB | E2E: Playwright (`e2e/README.md`)

### Key Resources

- `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` - Term reference (推奨)
- `.claude/skills/` - claude-md-creator, nextjs-best-practices

---

**Last Updated**: 2026-01-30 | **Version**: 1.1.0
