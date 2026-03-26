import { test, expect } from '../../fixtures'

test('logout redirects to login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()

  await page.getByRole('button', { name: 'ログアウト' }).click()

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
})
