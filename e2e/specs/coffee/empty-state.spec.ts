import { test, expect } from '../../fixtures'
import { getUniqueEmail } from '../../fixtures/test-data'

test.describe('Coffee List Empty State', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('shows empty state when no evaluations exist (UC4-2)', async ({ page }) => {
    // Arrange
    const email = getUniqueEmail()
    const password = 'TestPassword123!'

    // Sign up a new user
    await page.goto('/signup')
    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await page.getByRole('button', { name: 'アカウント作成' }).click()
    await expect(page).toHaveURL('/')

    // Log in explicitly to ensure session is set
    await page.goto('/login')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/')

    // Act
    await page.goto('/coffee/my')

    // Assert
    await expect(page.getByText('まだ評価がありません')).toBeVisible()
  })
})
