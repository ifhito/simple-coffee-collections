import { test, expect } from '../../fixtures'
import { testUser } from '../../fixtures/test-data'

test.describe('login', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('successful login', async ({ loginPage, page }) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, testUser.password)
    await expect(page).toHaveURL('/')
    const loginStatus = page.getByText('ログイン中:')
    await expect(loginStatus).toBeVisible()
    await expect(loginStatus.locator('strong')).toHaveText(testUser.email)
  })

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, 'WrongPassword123!')
    await loginPage.expectErrorVisible()
  })
})
