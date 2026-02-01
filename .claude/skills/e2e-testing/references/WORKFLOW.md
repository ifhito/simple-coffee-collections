# E2E Test Development Workflow

User-centric, use case-driven approach to E2E test creation.

---

## Overview

```
User Needs → Use Cases → Test Scenarios → Test Cases → Test Implementation
```

This workflow ensures tests validate actual user value, not just technical functionality.

---

## Step 1: Identify Use Cases

### What is a Use Case?

A use case describes **who** does **what** to achieve **which goal** in the system.

**Format**:
```
As a [user role]
I want to [action]
So that [benefit/goal]
```

### How to Identify Use Cases

1. **Map User Journeys**
   - List all user roles (new user, returning user, admin, etc.)
   - Identify main goals for each role
   - Trace the path users take to achieve goals

2. **Prioritize by Business Value**
   - **Critical**: Revenue impact, data integrity, security
   - **High**: Core workflows, frequent actions
   - **Medium**: Secondary features
   - **Low**: Edge cases, rare scenarios

3. **Group Related Use Cases**
   - Authentication & Authorization
   - CRUD operations per entity
   - Search & Discovery
   - Data visualization
   - Settings & Configuration

### Example: Coffee App

```markdown
## Use Case: Record Coffee Experience

**Priority**: High (Core workflow)

**User Story**:
As a coffee enthusiast
I want to record my coffee tasting experience
So that I can remember and compare different coffees

**User Journey**:
1. User visits a café and tries a coffee
2. Opens the app after/during tasting
3. Navigates to "New Evaluation" form
4. Fills in coffee details (origin, roast, shop)
5. Rates taste characteristics (acidity, bitterness, aroma)
6. Adds personal notes
7. Saves the evaluation
8. Views the saved evaluation in their list

**Success Criteria**:
- Evaluation is saved to database
- User can see the evaluation in their list
- All entered data is preserved accurately
```

### Deliverable

Document use cases in `e2e/TEST_MATRIX.md` following the template:

```markdown
## Use Case X: [Name]

**Scenario**: [1-2 sentence description]

**User Story**: As a [role], I want to [action], so that [benefit]

**Priority**: [Critical/High/Medium/Low]

**User Journey**:
1. [Step 1]
2. [Step 2]
...

**Success Criteria**:
- [Criterion 1]
- [Criterion 2]
...
```

---

## Step 2: Design Test Scenarios

### What is a Test Scenario?

A test scenario is a **specific path** through a use case, including:
- **Preconditions**: Initial state before test
- **Actions**: Steps the user takes
- **Expected Results**: What should happen

### Scenario Types

1. **Happy Path**: Ideal flow with valid inputs
2. **Alternate Paths**: Valid alternative routes
3. **Error Paths**: Invalid inputs, edge cases
4. **Boundary Conditions**: Min/max values, limits

### How to Design Scenarios

1. **Extract from Use Case**
   - Take the user journey as the happy path
   - Identify decision points and variations
   - List possible error conditions

2. **Apply Test Design Techniques**
   - **Equivalence Partitioning**: Group similar inputs
   - **Boundary Value Analysis**: Test limits
   - **Decision Tables**: Complex logic combinations
   - **State Transition**: Multi-step workflows

3. **Consider Real User Behavior**
   - What mistakes do users make?
   - What edge cases occur in production?
   - What are common support tickets?

### Example: Coffee Evaluation Creation

```markdown
### Scenario 1: Happy Path - Create Complete Evaluation

**Precondition**: User is logged in

**Test Steps**:
1. Navigate to /coffee/new
2. Fill "Shop Name": "Blue Bottle Coffee"
3. Fill "Bean Origin": "Ethiopia"
4. Fill "Bean Name": "Yirgacheffe"
5. Select "Roast Level": "Medium"
6. Set "Acidity": 8
7. Set "Bitterness": 4
8. Set "Aroma": 9
9. Set "Overall Rating": 8
10. Fill "Notes": "Floral, citrus notes"
11. Click "Save"

**Expected Result**:
- Redirects to /coffee/my
- New evaluation appears in list
- All data is displayed correctly

---

### Scenario 2: Error Path - Missing Required Fields

**Precondition**: User is logged in

**Test Steps**:
1. Navigate to /coffee/new
2. Leave "Shop Name" empty
3. Fill "Bean Origin": "Colombia"
4. Click "Save"

**Expected Result**:
- Form is NOT submitted
- Error message: "Shop Name is required"
- User remains on form page
- Other filled fields retain their values

---

### Scenario 3: Boundary - Maximum Text Length

**Precondition**: User is logged in

**Test Steps**:
1. Navigate to /coffee/new
2. Fill required fields
3. Fill "Notes" with 501 characters (if limit is 500)
4. Click "Save"

**Expected Result**:
- Validation error shown
- User cannot exceed character limit
```

### Deliverable

Add scenarios to `e2e/TEST_MATRIX.md` in each use case section:

```markdown
| # | User Story | Test Scenario | Status | File |
|---|-----------|---------------|--------|------|
| UC3-1 | Record coffee | Happy path - complete form | ✅ | create.spec.ts |
| UC3-2 | Record coffee | Error - missing required fields | ⬜ | - |
| UC3-3 | Record coffee | Boundary - max text length | ⬜ | - |
```

---

## Step 3: Write Test Cases

### What is a Test Case?

A test case is the **executable specification** of a test scenario with:
- Unique ID
- Detailed steps
- Test data
- Assertions

### Test Case Template

```markdown
**Test ID**: TC-UC3-001

**Scenario**: Happy Path - Create Complete Evaluation

**Preconditions**:
- User "test@example.com" exists
- User is logged in
- Database is in clean state

**Test Data**:
- shopName: "Blue Bottle Coffee"
- beanOrigin: "Ethiopia"
- beanName: "Yirgacheffe"
- roastLevel: "Medium"
- acidity: 8
- bitterness: 4
- aroma: 9
- overallRating: 8
- notes: "Floral, citrus notes"

**Test Steps**:
1. Open browser
2. Navigate to http://localhost:3000/coffee/new
3. Verify page title is "New Evaluation"
4. Locate input[name="shop_name"]
5. Type "Blue Bottle Coffee"
6. Locate input[name="bean_type"]
7. Type "Ethiopia"
... (detailed for each field)
20. Click button[type="submit"]

**Expected Results**:
1. URL changes to /coffee/my
2. Status code: 200
3. Page contains text "Blue Bottle Coffee"
4. Database record created with correct data
5. Evaluation ID is valid UUID

**Assertions**:
- expect(page).toHaveURL('/coffee/my')
- expect(heading).toContainText('Yirgacheffe')
- expect(database).toHaveEvaluation(expectedData)
```

### Test Data Strategy

1. **Fixed Data**: Known values for reproducibility
2. **Dynamic Data**: Unique IDs to avoid conflicts (e.g., timestamp-based names)
3. **Realistic Data**: Actual user-like inputs
4. **Edge Cases**: Boundary values, special characters

### Best Practices

- **One scenario per test**: Keep tests focused
- **Clear naming**: Test name should describe scenario
- **Independent**: No dependencies between tests
- **Idempotent**: Can run multiple times safely

---

## Step 4: Implement Tests

### Project Structure

```
e2e/
├── fixtures/
│   ├── index.ts           # Custom fixtures
│   └── test-data.ts       # Test data constants
├── pages/
│   ├── login.page.ts      # Page Object: Login
│   ├── coffee-form.page.ts # Page Object: Coffee Form
│   └── ...
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   └── coffee/
│       ├── create.spec.ts
│       ├── edit.spec.ts
│       └── delete.spec.ts
├── auth.setup.ts          # Global auth setup
└── setup-test-user.sql    # Database seed
```

### Implementation Steps

#### 4.1: Create Page Object

**Location**: `e2e/pages/[feature].page.ts`

**Purpose**: Encapsulate page interactions, selectors, and navigation

```typescript
import { Page, Locator } from '@playwright/test'

export class CoffeeFormPage {
  readonly page: Page
  readonly shopNameInput: Locator
  readonly beanOriginInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.shopNameInput = page.getByLabel('Shop Name')
    this.beanOriginInput = page.getByLabel('Bean Origin')
    this.submitButton = page.getByRole('button', { name: 'Save' })
  }

  async goto() {
    await this.page.goto('/coffee/new')
  }

  async fillShopName(name: string) {
    await this.shopNameInput.fill(name)
  }

  async submit() {
    await this.submitButton.click()
  }
}
```

**See**: PATTERNS.md for full Page Object Model guide

#### 4.2: Create Test Data

**Location**: `e2e/fixtures/test-data.ts`

```typescript
export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
}

export const coffeeEvaluationDefaults = {
  shopName: 'Blue Bottle Coffee',
  beanOrigin: 'Ethiopia',
  beanName: 'Yirgacheffe',
  roastLevel: 'Medium',
  acidity: 8,
  bitterness: 4,
  aroma: 9,
  overallRating: 8,
}

export function getUniqueBeanName() {
  return `Test-Bean-${Date.now()}`
}
```

#### 4.3: Write Test Spec

**Location**: `e2e/specs/[feature]/[action].spec.ts`

```typescript
import { test, expect } from '../../fixtures'
import { coffeeEvaluationDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test.describe('Coffee Evaluation Creation', () => {
  test('should create complete evaluation (happy path)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()
    await coffeeFormPage.goto()

    // Act
    await coffeeFormPage.fillShopName(coffeeEvaluationDefaults.shopName)
    await coffeeFormPage.fillBeanOrigin(coffeeEvaluationDefaults.beanOrigin)
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.submit()

    // Assert
    await expect(page).toHaveURL('/coffee/my')
    const grid = page.getByTestId('coffee-grid')
    await expect(grid.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test('should show error for missing required fields', async ({ coffeeFormPage, page }) => {
    // Arrange
    await coffeeFormPage.goto()

    // Act
    await coffeeFormPage.submit()

    // Assert
    await expect(page.getByText('Shop Name is required')).toBeVisible()
    await expect(page).toHaveURL('/coffee/new') // Still on form
  })
})
```

**See**: TEMPLATES.md for full test templates

#### 4.4: Run and Debug

```bash
# Run all tests
pnpm test:e2e

# Run specific test file
pnpm exec playwright test e2e/specs/coffee/create.spec.ts

# Debug mode (pause on failure)
pnpm test:e2e:debug

# UI mode (interactive)
pnpm test:e2e:ui

# Headed mode (see browser)
pnpm test:e2e:headed
```

#### 4.5: Review Test Output

- ✅ All tests pass
- Screenshots on failure (auto-captured)
- HTML report with trace viewer
- Execution time < 30s per test

---

## Complete Workflow Example

### 1. Use Case Identified

```
UC3: Record Coffee Experience
Priority: High
User Story: As a coffee enthusiast, I want to record coffee details, so I can build my coffee journal
```

### 2. Test Scenarios Designed

```
- SC1: Happy path - complete form
- SC2: Error - missing shop name
- SC3: Error - missing bean origin
- SC4: Boundary - max note length
```

### 3. Test Cases Written

```
TC-UC3-001: Happy path with all fields
TC-UC3-002: Validation error - shop name required
TC-UC3-003: Validation error - bean origin required
TC-UC3-004: Boundary - notes exceed 500 chars
```

### 4. Tests Implemented

```
✅ e2e/pages/coffee-form.page.ts
✅ e2e/fixtures/test-data.ts
✅ e2e/specs/coffee/create.spec.ts (4 tests)
```

### 5. Test Matrix Updated

```markdown
| UC3-1 | Record coffee | Happy path | ✅ | create.spec.ts |
| UC3-2 | Record coffee | Missing shop | ✅ | create.spec.ts |
| UC3-3 | Record coffee | Missing origin | ✅ | create.spec.ts |
| UC3-4 | Record coffee | Max length | ✅ | create.spec.ts |
```

---

## Quality Checklist

Before marking a test as complete:

- [ ] Test name clearly describes scenario
- [ ] Follows AAA pattern (Arrange-Act-Assert)
- [ ] Uses Page Object Model
- [ ] No hardcoded waits (`page.waitForTimeout`)
- [ ] Proper assertions with meaningful messages
- [ ] Test data is isolated (no conflicts)
- [ ] Runs successfully in isolation
- [ ] Runs successfully with other tests
- [ ] Execution time < 30 seconds
- [ ] Screenshots on failure
- [ ] Updated TEST_MATRIX.md

---

## References

- **Patterns**: @.claude/skills/e2e-testing/PATTERNS.md
- **Best Practices**: @.claude/skills/e2e-testing/BEST_PRACTICES.md
- **Templates**: @.claude/skills/e2e-testing/TEMPLATES.md
- **Playwright Docs**: https://playwright.dev/
