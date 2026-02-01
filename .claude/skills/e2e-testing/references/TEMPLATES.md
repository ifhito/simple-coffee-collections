# E2E Test Templates

Ready-to-use templates for common E2E test scenarios.

---

## Template 1: Basic CRUD Test

### Create Operation

```typescript
import { test, expect } from '../../fixtures'
import { getUniqueName } from '../../fixtures/test-data'

test.describe('Create [Entity]', () => {
  test('should create [entity] with valid data', async ({ [form]Page, page }) => {
    // Arrange
    const uniqueName = getUniqueName()
    const testData = {
      name: uniqueName,
      field1: 'value1',
      field2: 'value2',
    }

    // Act
    await [form]Page.goto()
    await [form]Page.fillName(testData.name)
    await [form]Page.fillField1(testData.field1)
    await [form]Page.fillField2(testData.field2)
    await [form]Page.submit()

    // Assert
    await expect(page).toHaveURL('/[entities]')
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible()
  })

  test('should show validation error for missing required fields', async ({ [form]Page, page }) => {
    // Arrange
    await [form]Page.goto()

    // Act
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('[Field] is required')).toBeVisible()
    await expect(page).toHaveURL('/[entities]/new')
  })
})
```

### Read Operation

```typescript
test.describe('View [Entity]', () => {
  test('should display [entity] details', async ({ page }) => {
    // Arrange
    const testEntity = await createTestEntity({
      name: 'Test Entity',
      field1: 'Value 1',
    })

    // Act
    await page.goto(`/[entities]/${testEntity.id}`)

    // Assert
    await expect(page.getByRole('heading', { name: testEntity.name })).toBeVisible()
    await expect(page.getByText(testEntity.field1)).toBeVisible()

    // Cleanup
    await deleteTestEntity(testEntity.id)
  })

  test('should show 404 for non-existent [entity]', async ({ page }) => {
    // Act
    await page.goto('/[entities]/non-existent-id')

    // Assert
    await expect(page.getByText('Not Found')).toBeVisible()
  })
})
```

### Update Operation

```typescript
test.describe('Edit [Entity]', () => {
  test('should update [entity] with new data', async ({ [form]Page, page }) => {
    // Arrange
    const testEntity = await createTestEntity({ name: 'Original Name' })
    const updatedName = 'Updated Name'

    // Act
    await page.goto(`/[entities]/${testEntity.id}/edit`)
    await [form]Page.fillName(updatedName)
    await [form]Page.submit()

    // Assert
    await expect(page).toHaveURL(`/[entities]/${testEntity.id}`)
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible()

    // Cleanup
    await deleteTestEntity(testEntity.id)
  })
})
```

### Delete Operation

```typescript
test.describe('Delete [Entity]', () => {
  test('should delete [entity] with confirmation', async ({ page }) => {
    // Arrange
    const testEntity = await createTestEntity({ name: 'To Be Deleted' })
    await page.goto(`/[entities]/${testEntity.id}`)

    // Act
    page.on('dialog', dialog => dialog.accept()) // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click()

    // Assert
    await expect(page).toHaveURL('/[entities]')
    await expect(page.getByText(testEntity.name)).not.toBeVisible()
  })

  test('should cancel deletion when user dismisses confirmation', async ({ page }) => {
    // Arrange
    const testEntity = await createTestEntity({ name: 'Not Deleted' })
    await page.goto(`/[entities]/${testEntity.id}`)

    // Act
    page.on('dialog', dialog => dialog.dismiss()) // Cancel
    await page.getByRole('button', { name: 'Delete' }).click()

    // Assert
    await expect(page).toHaveURL(`/[entities]/${testEntity.id}`)
    await expect(page.getByRole('heading', { name: testEntity.name })).toBeVisible()

    // Cleanup
    await deleteTestEntity(testEntity.id)
  })
})
```

---

## Template 2: Authentication Tests

### Login

```typescript
import { test, expect } from '../../fixtures'
import { testUser } from '../../fixtures/test-data'

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // Start logged out

  test('should login with valid credentials', async ({ loginPage, page }) => {
    // Arrange
    await loginPage.goto()

    // Act
    await loginPage.login(testUser.email, testUser.password)

    // Assert
    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Welcome, ${testUser.email}`)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  test('should show error for invalid password', async ({ loginPage, page }) => {
    // Arrange
    await loginPage.goto()

    // Act
    await loginPage.login(testUser.email, 'WrongPassword123!')

    // Assert
    await expect(page.getByText('Invalid email or password')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should show error for non-existent user', async ({ loginPage }) => {
    // Act
    await loginPage.goto()
    await loginPage.login('nonexistent@example.com', 'password')

    // Assert
    await expect(loginPage.errorMessage).toBeVisible()
  })
})
```

### Logout

```typescript
test.describe('Logout', () => {
  test('should logout and redirect to login', async ({ page }) => {
    // Arrange (already logged in via fixture)
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: 'Logout' }).click()

    // Assert
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
  })
})
```

### Signup

```typescript
test.describe('Signup', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should create new account', async ({ signupPage, page }) => {
    // Arrange
    const newUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'NewPassword123!',
    }

    // Act
    await signupPage.goto()
    await signupPage.signup(newUser.email, newUser.password)

    // Assert
    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Welcome, ${newUser.email}`)).toBeVisible()
  })

  test('should reject weak password', async ({ signupPage, page }) => {
    // Act
    await signupPage.goto()
    await signupPage.signup('new@example.com', 'weak')

    // Assert
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })
})
```

### Protected Routes

```typescript
test.describe('Protected Routes', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // Logged out

  test('should redirect to login when accessing protected page', async ({ page }) => {
    // Act
    await page.goto('/dashboard')

    // Assert
    await expect(page).toHaveURL('/login')
  })
})
```

---

## Template 3: Form Validation

```typescript
test.describe('[Form] Validation', () => {
  test('should validate required fields', async ({ [form]Page, page }) => {
    // Arrange
    await [form]Page.goto()

    // Act
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('[Field1] is required')).toBeVisible()
    await expect(page.getByText('[Field2] is required')).toBeVisible()
  })

  test('should validate email format', async ({ [form]Page, page }) => {
    // Act
    await [form]Page.goto()
    await [form]Page.fillEmail('invalid-email')
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('should validate minimum length', async ({ [form]Page, page }) => {
    // Act
    await [form]Page.goto()
    await [form]Page.fillPassword('short')
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should validate maximum length', async ({ [form]Page, page }) => {
    // Act
    await [form]Page.goto()
    await [form]Page.fillNotes('a'.repeat(501)) // If limit is 500
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('Notes cannot exceed 500 characters')).toBeVisible()
  })

  test('should validate numeric range', async ({ [form]Page, page }) => {
    // Act
    await [form]Page.goto()
    await [form]Page.fillRating(11) // If max is 10
    await [form]Page.submit()

    // Assert
    await expect(page.getByText('Rating must be between 1 and 10')).toBeVisible()
  })
})
```

---

## Template 4: Search & Filter

```typescript
test.describe('[Entity] Search', () => {
  test('should find entities by keyword', async ({ page }) => {
    // Arrange
    await createTestEntity({ name: 'Ethiopia Yirgacheffe' })
    await createTestEntity({ name: 'Colombia Supremo' })

    // Act
    await page.goto('/[entities]')
    await page.getByRole('searchbox', { name: 'Search' }).fill('Ethiopia')
    await page.getByRole('button', { name: 'Search' }).click()

    // Assert
    await expect(page.getByText('Ethiopia Yirgacheffe')).toBeVisible()
    await expect(page.getByText('Colombia Supremo')).not.toBeVisible()
  })

  test('should show no results message', async ({ page }) => {
    // Act
    await page.goto('/[entities]')
    await page.getByRole('searchbox').fill('NonExistentSearch')
    await page.getByRole('button', { name: 'Search' }).click()

    // Assert
    await expect(page.getByText('No results found')).toBeVisible()
  })
})

test.describe('[Entity] Filter', () => {
  test('should filter by category', async ({ page }) => {
    // Arrange
    await createTestEntity({ name: 'Item 1', category: 'CategoryA' })
    await createTestEntity({ name: 'Item 2', category: 'CategoryB' })

    // Act
    await page.goto('/[entities]')
    await page.getByRole('combobox', { name: 'Category' }).selectOption('CategoryA')

    // Assert
    await expect(page.getByText('Item 1')).toBeVisible()
    await expect(page.getByText('Item 2')).not.toBeVisible()
  })
})
```

---

## Template 5: Page Object

```typescript
// e2e/pages/[feature]-page.ts
import { Page, Locator } from '@playwright/test'

export class [Feature]Page {
  readonly page: Page

  // Locators
  readonly [element1]: Locator
  readonly [element2]: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Initialize locators
    this.[element1] = page.getByLabel('[Label1]')
    this.[element2] = page.getByLabel('[Label2]')
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.errorMessage = page.getByRole('alert')
  }

  // Navigation
  async goto() {
    await this.page.goto('/[path]')
  }

  // Actions
  async fill[Element1](value: string) {
    await this.[element1].fill(value)
  }

  async fill[Element2](value: string) {
    await this.[element2].fill(value)
  }

  async submit() {
    await this.submitButton.click()
  }

  // Compound actions
  async fillForm(data: {
    [element1]: string
    [element2]: string
  }) {
    await this.fill[Element1](data.[element1])
    await this.fill[Element2](data.[element2])
  }

  async submitForm(data: {
    [element1]: string
    [element2]: string
  }) {
    await this.fillForm(data)
    await this.submit()
  }

  // Assertions helpers
  async expectErrorVisible() {
    await this.errorMessage.waitFor({ state: 'visible' })
  }
}
```

---

## Template 6: Fixture

```typescript
// e2e/fixtures/index.ts
import { test as base } from '@playwright/test'
import { [Feature]Page } from '../pages/[feature]-page'

type Fixtures = {
  [feature]Page: [Feature]Page
}

export const test = base.extend<Fixtures>({
  [feature]Page: async ({ page }, use) => {
    const [feature]Page = new [Feature]Page(page)
    await use([feature]Page)
  },
})

export { expect } from '@playwright/test'
```

---

## Template 7: Test Data

```typescript
// e2e/fixtures/test-data.ts

// User credentials
export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
} as const

// Default form values
export const [entity]Defaults = {
  field1: 'DefaultValue1',
  field2: 'DefaultValue2',
  field3: 'DefaultValue3',
} as const

// Unique data generators
export function getUnique[Entity]Name(prefix = '[Entity]') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getUniqueEmail(prefix = 'test') {
  return `${prefix}-${Date.now()}@example.com`
}

// Test data builders
export class [Entity]Builder {
  private data: Partial<[Entity]> = {}

  withField1(value: string) {
    this.data.field1 = value
    return this
  }

  withField2(value: string) {
    this.data.field2 = value
    return this
  }

  build(): [Entity] {
    return {
      field1: this.data.field1 ?? [entity]Defaults.field1,
      field2: this.data.field2 ?? [entity]Defaults.field2,
      field3: this.data.field3 ?? [entity]Defaults.field3,
    }
  }
}
```

---

## Template 8: Database Setup

```sql
-- e2e/setup-test-[entity].sql

-- Create test user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'test-user-uuid',
  'e2e-test@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create test data
INSERT INTO [entities] (
  id,
  user_id,
  name,
  field1,
  created_at
) VALUES (
  'test-entity-uuid',
  'test-user-uuid',
  'Test Entity',
  'Test Value',
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

---

## Template 9: Complete Test File

```typescript
/**
 * E2E tests for [Feature]
 *
 * Use Case: [UC#] - [Description]
 * Priority: [Critical/High/Medium/Low]
 */

import { test, expect } from '../../fixtures'
import { testUser, [entity]Defaults, getUnique[Entity]Name } from '../../fixtures/test-data'

test.describe('[Feature] - [Use Case]', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup for all tests in this describe block
    await page.goto('/[path]')
  })

  test('should [action] with [condition] (happy path)', async ({ [feature]Page, page }) => {
    // Arrange
    const uniqueName = getUnique[Entity]Name()
    const testData = {
      name: uniqueName,
      ...[entity]Defaults,
    }

    // Act
    await [feature]Page.fillForm(testData)
    await [feature]Page.submit()

    // Assert
    await expect(page).toHaveURL('/[expected-path]')
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible()
  })

  test('should [handle error] when [invalid condition]', async ({ [feature]Page, page }) => {
    // Arrange
    const invalidData = { name: '' }

    // Act
    await [feature]Page.fillForm(invalidData)
    await [feature]Page.submit()

    // Assert
    await expect(page.getByText('[Error message]')).toBeVisible()
    await expect(page).toHaveURL('/[current-path]')
  })

  test('should [edge case] when [boundary condition]', async ({ [feature]Page, page }) => {
    // Arrange
    const boundaryData = { name: 'a'.repeat(256) } // Max length

    // Act
    await [feature]Page.fillForm(boundaryData)
    await [feature]Page.submit()

    // Assert
    await expect(page.getByText('[Boundary error]')).toBeVisible()
  })
})
```

---

## Usage Instructions

1. **Copy relevant template**
2. **Replace placeholders**:
   - `[Entity]` → Your entity name (e.g., `Coffee`, `User`)
   - `[Feature]` → Feature name (e.g., `Login`, `Signup`)
   - `[field1]`, `[field2]` → Actual field names
   - `[path]` → Actual route path
3. **Customize assertions** based on your UI
4. **Add test-specific logic** as needed

---

## References

- **Workflow**: @.claude/skills/e2e-testing/WORKFLOW.md
- **Patterns**: @.claude/skills/e2e-testing/PATTERNS.md
- **Best Practices**: @.claude/skills/e2e-testing/BEST_PRACTICES.md
