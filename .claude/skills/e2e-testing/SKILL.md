---
skillName: e2e-testing
description: User-centric E2E test design from use cases to implementation with Playwright
version: 1.0.0
author: hotake
tags: [e2e, playwright, testing, use-case-driven, page-object-model]
---

# E2E Testing Skill

Comprehensive E2E test design and implementation following user-centric, use case-driven methodology.

## Purpose

Guide E2E test creation from user needs to implementation:
- User journey mapping and use case analysis
- Test scenario design based on real user behavior
- Test case specification with clear acceptance criteria
- Page Object Model implementation
- Maintainable, reliable test automation

## Documentation

- **Workflow**: @.claude/skills/e2e-testing/WORKFLOW.md - Step-by-step process from use cases to tests
- **Patterns**: @.claude/skills/e2e-testing/PATTERNS.md - Page Object Model, fixtures, test structure
- **Best Practices**: @.claude/skills/e2e-testing/BEST_PRACTICES.md - Principles, anti-patterns, tips
- **Templates**: @.claude/skills/e2e-testing/TEMPLATES.md - Reusable test templates

## Usage

When creating E2E tests:

1. **Identify Use Cases** (WORKFLOW.md Step 1)
   - Map user journeys
   - Define user stories
   - Identify critical paths

2. **Design Test Scenarios** (WORKFLOW.md Step 2)
   - Convert use cases to scenarios
   - Define preconditions and expected outcomes
   - Prioritize by business value

3. **Write Test Cases** (WORKFLOW.md Step 3)
   - Specify detailed test steps
   - Define acceptance criteria
   - Create test data strategy

4. **Implement Tests** (WORKFLOW.md Step 4)
   - Follow Page Object Model (PATTERNS.md)
   - Use fixtures for test data (PATTERNS.md)
   - Apply best practices (BEST_PRACTICES.md)
   - Use templates (TEMPLATES.md)

## Target Framework

- **Playwright**: Latest version
- **Test Runner**: Playwright Test
- **Language**: TypeScript
- **Pattern**: Page Object Model

## Quick Reference

### Test Priority

1. **P0 (Critical)**: Authentication, data loss prevention, payment flows
2. **P1 (High)**: Core user workflows, CRUD operations
3. **P2 (Medium)**: Secondary features, edge cases
4. **P3 (Low)**: Nice-to-have features, cosmetic issues

### Test Independence

- Each test must be independent and idempotent
- No test should depend on another test's state
- Tests should clean up after themselves

### Reliability Principles

- Use stable locators (test IDs, accessible roles)
- Implement proper wait strategies
- Handle async operations correctly
- Avoid hardcoded delays
