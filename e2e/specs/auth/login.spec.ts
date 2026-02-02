import { test, expect } from '../../fixtures'
import { createTestUser } from '../../helpers/supabase'
import { getUniqueEmail, testPassword } from '../../fixtures/test-data'

test.describe('login', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('successful login', async ({ loginPage, page, request }) => {
    const email = getUniqueEmail()
    await createTestUser(request, email, testPassword)

    await loginPage.goto()
    await loginPage.login(email, testPassword)
    await expect(page).toHaveURL('/')
    const loginStatus = page.getByText('ログイン中:')
    await expect(loginStatus).toBeVisible()
    await expect(loginStatus.locator('strong')).toHaveText(email)
  })

  test('shows error for invalid credentials', async ({ loginPage, request }) => {
    const email = getUniqueEmail()
    await createTestUser(request, email, testPassword)

    await loginPage.goto()
    await loginPage.login(email, 'WrongPassword123!')
    await loginPage.expectErrorVisible()
  })

  test('shows error for non-existent user (UC2-3)', async ({ loginPage, page }) => {
    // Arrange
    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`

    // Act
    await loginPage.goto()
    await loginPage.login(nonExistentEmail, 'SomePassword123!')

    // Assert
    await loginPage.expectErrorVisible()
    await expect(page).toHaveURL('/login')
  })
})
