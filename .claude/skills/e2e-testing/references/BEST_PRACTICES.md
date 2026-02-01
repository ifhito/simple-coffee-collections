# E2E Testing Best Practices

Principles, guidelines, and anti-patterns for reliable E2E tests.

---

## Core Principles

### 1. Test Independence

**Rule**: Each test must run successfully in isolation and in any order.

```typescript
// ✅ Good: Self-contained test
test('create coffee evaluation', async ({ coffeeFormPage, page }) => {
  const beanName = getUniqueBeanName() // Unique data
  await coffeeFormPage.goto()
  await coffeeFormPage.fillBeanName(beanName)
  await coffeeFormPage.submit()
  await expect(page).toHaveURL('/coffee/my')
})

// ❌ Bad: Depends on previous test
test('edit coffee evaluation', async ({ page }) => {
  // Assumes evaluation from previous test exists
  await page.goto('/coffee/1/edit') // Hardcoded ID from previous test
})
```

**Why**: Tests that depend on each other create:
- Flaky test suites
- Difficult debugging (one failure cascades)
- Order-dependent execution

**How to Fix**:
- Use `beforeEach` for common setup
- Create test data in each test
- Use unique identifiers

---

### 2. Test Idempotency

**Rule**: Tests should produce the same result when run multiple times.

```typescript
// ✅ Good: Idempotent test
test('create evaluation', async ({ coffeeFormPage }) => {
  const uniqueName = `Bean-${Date.now()}`
  await coffeeFormPage.fillBeanName(uniqueName)
  // No conflicts even if run multiple times
})

// ❌ Bad: Not idempotent
test('create evaluation', async ({ coffeeFormPage }) => {
  await coffeeFormPage.fillBeanName('Ethiopia Yirgacheffe')
  // Fails on second run if uniqueness constraint exists
})
```

**Strategies**:
- Use timestamp/UUID in test data
- Clean up after tests (if needed)
- Use database transactions (rollback after test)

---

### 3. Test One Thing

**Rule**: Each test should verify a single scenario/behavior.

```typescript
// ✅ Good: Focused test
test('should show error for missing shop name', async ({ coffeeFormPage, page }) => {
  await coffeeFormPage.goto()
  await coffeeFormPage.submit()
  await expect(page.getByText('Shop Name is required')).toBeVisible()
})

// ❌ Bad: Tests multiple scenarios
test('form validation', async ({ coffeeFormPage, page }) => {
  // Tests missing shop name
  await coffeeFormPage.submit()
  await expect(page.getByText('Shop Name is required')).toBeVisible()

  // Tests missing bean origin (mixed concern)
  await coffeeFormPage.fillShopName('Shop')
  await coffeeFormPage.submit()
  await expect(page.getByText('Bean Origin is required')).toBeVisible()
})
```

**Why**: Focused tests are:
- Easier to understand
- Easier to debug
- Better failure reporting

---

### 4. Avoid Hardcoded Waits

**Rule**: Never use `page.waitForTimeout()` with hardcoded delays.

```typescript
// ❌ NEVER do this
test('wait for element', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForTimeout(3000) // Flaky!
  await expect(page.getByText('Welcome')).toBeVisible()
})

// ✅ Use proper waits
test('wait for element', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText('Welcome')).toBeVisible({ timeout: 5000 })
})

// ✅ Wait for specific condition
test('wait for data load', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('data-grid')).toBeVisible()
})
```

**Why**:
- Hardcoded waits are unreliable (too short or too long)
- Slows down test suite
- Doesn't actually verify the condition

---

### 5. Use Meaningful Assertions

**Rule**: Assertions should clearly state what is being verified.

```typescript
// ✅ Good: Clear assertions
test('successful login', async ({ loginPage, page }) => {
  await loginPage.login('user@example.com', 'password')
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Welcome, user@example.com')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
})

// ❌ Bad: Vague assertions
test('login works', async ({ loginPage, page }) => {
  await loginPage.login('user@example.com', 'password')
  await expect(page.locator('.success')).toBeTruthy() // What success?
})
```

**Custom Error Messages**:
```typescript
await expect(
  page.getByTestId('coffee-card'),
  'Coffee card should appear after creation'
).toBeVisible()
```

---

### 6. Stable Selectors

**Rule**: Use selectors that are unlikely to change.

**Priority**:
1. Accessibility roles/labels (best)
2. Test IDs
3. Text content (with caution)
4. CSS selectors (last resort)

```typescript
// ✅ Best: Accessibility
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')

// ✅ Good: Test ID
page.getByTestId('submit-button')

// ⚠️ Caution: Text can change
page.getByText('Submit') // Breaks with i18n

// ❌ Bad: CSS classes
page.locator('.btn-primary') // Styling changes break tests
```

**Adding Test IDs**:
```tsx
// In component
<button data-testid="submit-button">Submit</button>
```

---

### 7. Clean Test Data

**Rule**: Tests should not pollute the database or leave behind artifacts.

**Strategies**:

#### Option 1: Unique Data (Preferred)
```typescript
test('create evaluation', async ({ coffeeFormPage }) => {
  const uniqueName = getUniqueBeanName()
  await coffeeFormPage.fillBeanName(uniqueName)
  // No cleanup needed - won't conflict
})
```

#### Option 2: Cleanup After Test
```typescript
test('create and delete evaluation', async ({ page }) => {
  // Create
  const id = await createTestEvaluation()

  // Test actions
  await page.goto(`/coffee/${id}`)

  // Cleanup
  await deleteTestEvaluation(id)
})
```

#### Option 3: Fixture with Cleanup
```typescript
const test = base.extend({
  testEvaluation: async ({}, use) => {
    const evaluation = await createTestEvaluation()
    await use(evaluation)
    await deleteTestEvaluation(evaluation.id)
  },
})
```

---

### 8. Test User Management

**Rule**: Use dedicated test users, not production data.

```typescript
// ✅ Good: Dedicated test user
export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
}

// Setup script (e2e/setup-test-user.sql)
INSERT INTO auth.users (email, encrypted_password, ...)
VALUES ('e2e-test@example.com', crypt('TestPassword123!', gen_salt('bf')), ...)
ON CONFLICT (email) DO NOTHING;

// ❌ Bad: Real user credentials
const user = {
  email: 'john.doe@company.com', // Real user!
  password: process.env.REAL_PASSWORD,
}
```

**Auth Setup**:
```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test'
import { testUser } from './fixtures/test-data'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(testUser.email)
  await page.getByLabel('Password').fill(testUser.password)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Testing Implementation Details

```typescript
// ❌ Bad: Testing internal state
test('button click', async ({ page }) => {
  await page.goto('/form')
  await page.evaluate(() => {
    // Testing internal React state
    return window.__reactInternalInstance.state.isSubmitting === true
  })
})

// ✅ Good: Testing user-visible behavior
test('button shows loading state', async ({ page }) => {
  await page.goto('/form')
  const button = page.getByRole('button', { name: 'Submit' })
  await button.click()
  await expect(button).toBeDisabled()
  await expect(button).toContainText('Submitting...')
})
```

### ❌ Anti-Pattern 2: Over-Mocking

```typescript
// ❌ Bad: Mocking everything (not E2E anymore)
test('load data', async ({ page }) => {
  await page.route('**/api/**', route => {
    route.fulfill({ json: mockData })
  })
  await page.goto('/dashboard')
})

// ✅ Good: Test real integration
test('load data', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByTestId('data-grid')).toBeVisible()
  // Real API calls, real data flow
})
```

**When to Mock in E2E**:
- External services (payment gateways, email)
- Rate-limited APIs
- Non-deterministic data (random generators)

### ❌ Anti-Pattern 3: Too Many Assertions

```typescript
// ❌ Bad: Too many assertions (hard to debug)
test('create evaluation', async ({ page }) => {
  // ... create action ...

  // 20+ assertions
  await expect(page.locator('.card')).toBeVisible()
  await expect(page.locator('.card h3')).toHaveText('Ethiopia')
  await expect(page.locator('.card p')).toContainText('Blue Bottle')
  await expect(page.locator('.rating')).toHaveText('8')
  // ... many more ...
})

// ✅ Good: Focus on key outcomes
test('create evaluation', async ({ page }) => {
  // ... create action ...

  await expect(page).toHaveURL('/coffee/my')
  await expect(page.getByRole('heading', { name: 'Ethiopia' })).toBeVisible()
  // Key validation, not every detail
})
```

### ❌ Anti-Pattern 4: Coupled Tests

```typescript
// ❌ Bad: Tests depend on order
test.describe.serial('evaluation lifecycle', () => {
  let evaluationId: string

  test('create', async ({ page }) => {
    evaluationId = await createEvaluation()
  })

  test('edit', async ({ page }) => {
    await editEvaluation(evaluationId) // Depends on previous test
  })

  test('delete', async ({ page }) => {
    await deleteEvaluation(evaluationId) // Depends on previous tests
  })
})

// ✅ Good: Independent tests
test('create evaluation', async ({ page }) => {
  const id = await createEvaluation()
  await expect(page.getByTestId('coffee-card')).toBeVisible()
})

test('edit evaluation', async ({ page }) => {
  const id = await createEvaluation() // Each test creates its own data
  await editEvaluation(id)
  await expect(page.getByText('Updated successfully')).toBeVisible()
})
```

---

## Performance Best Practices

### 1. Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Run tests in parallel
})
```

### 2. Reuse Authentication

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: 'playwright/.auth/user.json', // Reuse auth across tests
  },
})
```

### 3. Optimize Page Loads

```typescript
// Block unnecessary resources
test.beforeEach(async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2}', route => route.abort())
})
```

### 4. Use Fast Selectors

```typescript
// ✅ Fast
page.getByTestId('submit')
page.getByRole('button', { name: 'Submit' })

// ⚠️ Slower
page.locator('div > div > button.btn-primary')
```

---

## Accessibility Testing

E2E tests should verify accessibility:

```typescript
test('form is accessible', async ({ page }) => {
  await page.goto('/coffee/new')

  // Verify labels are associated
  const shopInput = page.getByLabel('Shop Name')
  await expect(shopInput).toBeVisible()

  // Verify keyboard navigation
  await page.keyboard.press('Tab')
  await expect(shopInput).toBeFocused()

  // Verify ARIA attributes
  const submitButton = page.getByRole('button', { name: 'Submit' })
  await expect(submitButton).toHaveAttribute('type', 'submit')
})
```

---

## Error Handling & Debugging

### Debug Failed Tests

```typescript
// Enable trace on failure
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

### Debugging Tools

```bash
# Show browser during test
pnpm test:e2e:headed

# Pause execution
pnpm test:e2e:debug

# UI mode (recommended)
pnpm test:e2e:ui

# View trace after failure
npx playwright show-trace trace.zip
```

### Console Logging

```typescript
test('debug example', async ({ page }) => {
  page.on('console', msg => console.log('Browser:', msg.text()))
  page.on('pageerror', error => console.error('Page error:', error))

  await page.goto('/coffee/new')
})
```

---

## CI/CD Best Practices

### 1. Retry Failed Tests

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
})
```

### 2. Timeout Configuration

```typescript
export default defineConfig({
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5 * 1000, // 5 seconds per assertion
  },
})
```

### 3. CI-Specific Config

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.CI
      ? 'http://localhost:3000'
      : 'http://127.0.0.1:3000',
  },
  workers: process.env.CI ? 2 : 4,
})
```

---

## Test Maintenance

### Regular Reviews

- [ ] Remove flaky tests or fix them
- [ ] Update selectors when UI changes
- [ ] Archive obsolete tests for removed features
- [ ] Refactor duplicated code into page objects

### Test Health Metrics

Monitor:
- **Pass rate**: Should be > 95%
- **Flakiness**: Same test fails/passes inconsistently
- **Execution time**: Keep < 30s per test
- **Coverage**: Track which user flows are tested

---

## Quick Reference Checklist

Before committing a test:

- [ ] Test runs successfully in isolation
- [ ] Test runs successfully with full suite
- [ ] No hardcoded waits (`waitForTimeout`)
- [ ] Uses stable selectors (roles, labels, test IDs)
- [ ] Follows AAA pattern
- [ ] Has meaningful test name
- [ ] Execution time < 30 seconds
- [ ] Uses Page Object Model
- [ ] Test data is unique/isolated
- [ ] Proper assertions with clear messages

---

## References

- **Workflow**: @.claude/skills/e2e-testing/WORKFLOW.md
- **Patterns**: @.claude/skills/e2e-testing/PATTERNS.md
- **Templates**: @.claude/skills/e2e-testing/TEMPLATES.md
- **Playwright Docs**: https://playwright.dev/docs/best-practices
