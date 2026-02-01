# E2E Test Patterns

Proven patterns for maintainable, reliable E2E tests.

---

## Pattern 1: Page Object Model (POM)

### What is POM?

Encapsulate page structure and interactions in reusable classes.

**Benefits**:
- **Maintainability**: Change locators in one place
- **Readability**: Tests read like user actions
- **Reusability**: Share page interactions across tests

### Structure

```typescript
export class PageName {
  readonly page: Page
  readonly elementName: Locator

  constructor(page: Page) { ... }

  async actionName(params) { ... }

  async expectStateName() { ... }
}
```

### Example: Login Page

```typescript
// e2e/pages/login.page.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Prefer accessible selectors
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Log in' })
    this.errorMessage = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectErrorVisible() {
    await this.errorMessage.waitFor({ state: 'visible' })
  }
}
```

### Usage in Test

```typescript
import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/login.page'

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')

  await expect(page).toHaveURL('/')
})
```

### POM Best Practices

1. **One class per page/component**
   ```
   ✅ LoginPage, SignupPage, DashboardPage
   ❌ AuthPage (too broad)
   ```

2. **Locators as class properties**
   ```typescript
   ✅ this.submitButton = page.getByRole('button', { name: 'Submit' })
   ❌ Methods that return locators each time
   ```

3. **Actions as methods**
   ```typescript
   ✅ async fillForm(data) { ... }
   ❌ Exposing raw locators: page.submitButton.click()
   ```

4. **Return values for chaining**
   ```typescript
   async login(email, password): Promise<void> {
     await this.emailInput.fill(email)
     await this.passwordInput.fill(password)
     await this.submitButton.click()
   }
   ```

5. **Assertions stay in tests**
   ```typescript
   ✅ Test: await expect(loginPage.errorMessage).toBeVisible()
   ❌ Page: async expectError() { expect(this.error).toBeVisible() }
   ```

---

## Pattern 2: Fixtures

### What are Fixtures?

Reusable test context providing pages, data, and setup.

### Custom Fixture Definition

```typescript
// e2e/fixtures/index.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { CoffeeFormPage } from '../pages/coffee-form.page'

type Fixtures = {
  loginPage: LoginPage
  coffeeFormPage: CoffeeFormPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  coffeeFormPage: async ({ page }, use) => {
    await use(new CoffeeFormPage(page))
  },
})

export { expect } from '@playwright/test'
```

### Usage

```typescript
import { test, expect } from '../../fixtures'

test('create coffee', async ({ coffeeFormPage, page }) => {
  // coffeeFormPage is automatically initialized
  await coffeeFormPage.goto()
  await coffeeFormPage.fillBeanName('Ethiopian Yirgacheffe')
  await coffeeFormPage.submit()

  await expect(page).toHaveURL('/coffee/my')
})
```

### Fixture Types

#### 1. Page Object Fixtures

```typescript
export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
})
```

#### 2. Authenticated User Fixture

```typescript
type AuthFixture = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, testUser.password)
    await page.waitForURL('/')
    await use(page)
  },
})
```

#### 3. Test Data Fixture

```typescript
type DataFixture = {
  testCoffee: CoffeeEvaluation
}

export const test = base.extend<DataFixture>({
  testCoffee: async ({ page }, use) => {
    // Create test data
    const coffee = await createTestCoffee()
    await use(coffee)
    // Cleanup
    await deleteTestCoffee(coffee.id)
  },
})
```

---

## Pattern 3: AAA (Arrange-Act-Assert)

### Structure

```typescript
test('descriptive test name', async ({ page }) => {
  // ARRANGE: Set up test conditions
  const testData = { ... }
  await page.goto('/feature')

  // ACT: Perform the action being tested
  await page.getByRole('button').click()

  // ASSERT: Verify the outcome
  await expect(page.getByText('Success')).toBeVisible()
})
```

### Example

```typescript
test('creates coffee evaluation with all details', async ({ coffeeFormPage, page }) => {
  // Arrange
  const beanName = `Test-${Date.now()}`
  const testData = {
    shopName: 'Blue Bottle',
    beanOrigin: 'Ethiopia',
    beanName,
  }
  await coffeeFormPage.goto()

  // Act
  await coffeeFormPage.fillShopName(testData.shopName)
  await coffeeFormPage.fillBeanOrigin(testData.beanOrigin)
  await coffeeFormPage.fillBeanName(testData.beanName)
  await coffeeFormPage.submit()

  // Assert
  await expect(page).toHaveURL('/coffee/my')
  const card = page.getByRole('heading', { name: beanName })
  await expect(card).toBeVisible()
})
```

---

## Pattern 4: Test Data Management

### Constants for Reusable Data

```typescript
// e2e/fixtures/test-data.ts

export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
} as const

export const coffeeFormDefaults = {
  shopName: 'Blue Bottle Coffee',
  beanOrigin: 'Ethiopia',
  roastLevel: 'Medium',
} as const
```

### Unique Data Generators

```typescript
export function getUniqueBeanName(prefix = 'Bean') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getUniqueEmail() {
  return `test-${Date.now()}@example.com`
}
```

### Test Data Builders

```typescript
export class CoffeeEvaluationBuilder {
  private data: Partial<CoffeeEvaluation> = {}

  withShopName(name: string) {
    this.data.shopName = name
    return this
  }

  withBeanOrigin(origin: string) {
    this.data.beanOrigin = origin
    return this
  }

  build(): CoffeeEvaluation {
    return {
      shopName: this.data.shopName ?? 'Default Shop',
      beanOrigin: this.data.beanOrigin ?? 'Unknown',
      // ... other defaults
    }
  }
}

// Usage
const coffee = new CoffeeEvaluationBuilder()
  .withShopName('Custom Shop')
  .withBeanOrigin('Colombia')
  .build()
```

---

## Pattern 5: Locator Strategies

### Priority Order

1. **Accessible Roles** (Best)
```typescript
✅ page.getByRole('button', { name: 'Submit' })
✅ page.getByRole('heading', { level: 1 })
✅ page.getByRole('textbox', { name: 'Email' })
```

2. **Labels**
```typescript
✅ page.getByLabel('Email address')
✅ page.getByLabel('Password')
```

3. **Test IDs**
```typescript
✅ page.getByTestId('coffee-card')
✅ page.getByTestId('submit-button')
```

4. **Text Content**
```typescript
⚠️ page.getByText('Submit') // Can break with i18n
⚠️ page.getByText('Welcome, John') // Dynamic content
```

5. **CSS Selectors** (Last Resort)
```typescript
❌ page.locator('.btn-primary') // Fragile
❌ page.locator('#submit-btn') // Fragile
```

### Locator Best Practices

```typescript
// ✅ Specific and stable
page.getByRole('button', { name: 'Save' })

// ❌ Too broad
page.getByRole('button') // Which button?

// ✅ Accessible attribute
page.getByLabel('Email')

// ❌ CSS class
page.locator('.form-input')

// ✅ Test ID for unique elements
page.getByTestId('coffee-grid')

// ❌ XPath
page.locator('//div[@class="card"][1]')
```

---

## Pattern 6: Wait Strategies

### Auto-Waiting (Preferred)

Playwright auto-waits for most actions:

```typescript
// ✅ Auto-waits for element to be ready
await page.getByRole('button').click()

// ✅ Auto-waits for navigation
await page.goto('/path')

// ✅ Auto-waits for visibility
await expect(page.getByText('Success')).toBeVisible()
```

### Explicit Waits (When Needed)

```typescript
// Wait for URL change
await page.waitForURL('/dashboard')

// Wait for network idle
await page.waitForLoadState('networkidle')

// Wait for specific condition
await page.waitForFunction(() => window.dataLoaded === true)
```

### Anti-Patterns

```typescript
// ❌ NEVER use hardcoded waits
await page.waitForTimeout(2000) // Flaky!

// ✅ Use proper waits
await expect(element).toBeVisible({ timeout: 5000 })
```

---

## Pattern 7: Test Organization

### File Structure

```
e2e/
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── signup.spec.ts
│   ├── coffee/
│   │   ├── create.spec.ts
│   │   ├── edit.spec.ts
│   │   ├── delete.spec.ts
│   │   └── search.spec.ts
│   └── profile/
│       └── update.spec.ts
```

### Test File Structure

```typescript
import { test, expect } from '../../fixtures'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup
  })

  test('scenario 1 - description', async ({ page }) => {
    // Test implementation
  })

  test('scenario 2 - description', async ({ page }) => {
    // Test implementation
  })
})
```

### Naming Convention

```typescript
// ✅ Descriptive names
test('should create coffee evaluation with complete data')
test('should show validation error for missing shop name')
test('should allow editing existing evaluation')

// ❌ Vague names
test('test 1')
test('coffee creation')
test('works correctly')
```

---

## Pattern 8: Error Handling

### Assertion Messages

```typescript
// ✅ Clear failure messages
await expect(page.getByText('Success'), 'Success message should be visible after save')
  .toBeVisible()

// ✅ Custom error context
await expect(async () => {
  const count = await page.getByTestId('coffee-card').count()
  expect(count).toBeGreaterThan(0)
}).toPass({ message: 'Should have at least one coffee card' })
```

### Debugging Helpers

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/coffee/new')

  // Pause execution for debugging
  // await page.pause()

  // Screenshot on specific step
  await page.screenshot({ path: 'debug-state.png' })

  // Console log
  console.log('Current URL:', page.url())
})
```

---

## Pattern Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| Page Object Model | Encapsulate page structure | All tests |
| Fixtures | Reusable test context | Setup/teardown, shared objects |
| AAA | Clear test structure | Every test |
| Test Data Management | Consistent, isolated data | All tests with data |
| Locator Strategies | Stable element selection | All element interactions |
| Wait Strategies | Reliable async handling | Dynamic content |
| Test Organization | Maintainable test suite | Project structure |
| Error Handling | Debugging and clarity | Failing tests |

---

## References

- **Workflow**: @.claude/skills/e2e-testing/WORKFLOW.md
- **Best Practices**: @.claude/skills/e2e-testing/BEST_PRACTICES.md
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
