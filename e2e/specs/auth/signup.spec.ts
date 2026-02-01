import { test, expect } from '../../fixtures'
import { testUser, getUniqueEmail } from '../../fixtures/test-data'

test.describe('signup', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('successful signup (UC1-1)', async ({ page }) => {
    // Arrange
    const email = getUniqueEmail()
    const password = 'TestPassword123!'

    // Act
    await page.goto('/signup')
    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await page.getByRole('button', { name: 'アカウント作成' }).click()

    // Assert
    await expect(page).toHaveURL('/')
    const loginStatus = page.getByText('ログイン中:')
    await expect(loginStatus).toBeVisible()
    await expect(loginStatus.locator('strong')).toHaveText(email)
  })

  test('rejects existing email (UC1-2)', async ({ page }) => {
    const formAlert = page.locator('form').getByRole('alert')

    // Act
    await page.goto('/signup')
    await page.getByLabel('メールアドレス').fill(testUser.email)
    await page.getByLabel('パスワード').fill(testUser.password)
    await page.getByRole('button', { name: 'アカウント作成' }).click()

    // Assert
    await expect(formAlert).toBeVisible()
    await expect(page).toHaveURL('/signup')
  })

  test('shows error for invalid email format (UC1-3)', async ({ page }) => {
    const formAlert = page.locator('form').getByRole('alert')

    // Arrange
    await page.goto('/signup')
    await page.locator('form').evaluate((form) => form.setAttribute('novalidate', 'true'))

    // Act
    await page.getByLabel('メールアドレス').fill('invalid-email')
    await page.getByLabel('パスワード').fill('TestPassword123!')
    await page.getByRole('button', { name: 'アカウント作成' }).click()

    // Assert
    await expect(formAlert).toHaveText('有効なメールアドレスを入力してください')
    await expect(page).toHaveURL('/signup')
  })

  test('shows error for weak password (UC1-4)', async ({ page }) => {
    const formAlert = page.locator('form').getByRole('alert')

    // Act
    await page.goto('/signup')
    await page.getByLabel('メールアドレス').fill(getUniqueEmail())
    await page.getByLabel('パスワード').fill('123')
    await page.getByRole('button', { name: 'アカウント作成' }).click()

    // Assert
    await expect(formAlert).toHaveText('パスワードは6文字以上である必要があります')
    await expect(page).toHaveURL('/signup')
  })
})
