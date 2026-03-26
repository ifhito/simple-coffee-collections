import { test, expect } from '../../fixtures'
import { testUser } from '../../fixtures/test-data'

test.describe('login', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('successful login', async ({ loginPage, page }) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, testUser.password)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, 'WrongPassword123!')
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
