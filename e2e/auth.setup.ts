import { mkdir } from 'fs/promises'
import { test, expect } from './fixtures'
import { testUser } from './fixtures/test-data'

test('authenticate', async ({ loginPage, page }) => {
  await loginPage.goto()
  await loginPage.login(testUser.email, testUser.password)
  await expect(page).toHaveURL('/')
  await expect(page.getByText('ログイン中:')).toBeVisible()
  await mkdir('playwright/.auth', { recursive: true })
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
