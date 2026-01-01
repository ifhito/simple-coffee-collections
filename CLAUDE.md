# CLAUDE.md

## WHY: Project Purpose

A personal coffee journal to record cafe visits and coffee experiences.
Helps enthusiasts track their coffee journey, discover patterns, and explore new tastes.

**Audience**: Coffee enthusiasts (personal use & community sharing)
**Language**: Japanese (UI/content), English (docs)

---

## WHAT: Components

### Skills

| Skill | Description |
|-------|-------------|
| claude-md-creator | Auto-generates CLAUDE.md with WHY/WHAT/HOW structure (max 60 lines) |
| nextjs-best-practices | Next.js App Router (RSC) best practices for data fetching & component design |

> Details: `.claude/skills/[skill-name]/SKILL.md`

### Features (Planned)

- Coffee record CRUD operations
- Cafe information management
- Tasting notes & tagging
- Search & filtering
- Statistics & insights

---

## HOW: Usage

### Development with Claude Code

**Skills**:
- CLAUDE.md generation: `.claude/skills/claude-md-creator/`
- Next.js development: `.claude/skills/nextjs-best-practices/`

**Next.js Principles**:
- Server Components first for data fetching
- Tree-based UI decomposition (top-down design)
- Container/Presentational pattern
- Request optimization (Memoization & DataLoader)
- Composition over props drilling

**Doc Principles**:
- Keep CLAUDE.md under 60 lines
- WHY/WHAT/HOW structure only
- Use `@path/to/file` for detailed imports

### Future Additions

Add as needed: `docs/PRINCIPLES.md`, `docs/ARCHITECTURE.md`, `docs/API.md`

---

**Last Updated**: 2025-12-31 | **Version**: Initial
