import { mkdir } from 'fs/promises'
import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'
import { getUniqueEmail, testPassword } from './fixtures/test-data'

test('authenticate', async ({ page }) => {
  const email = getUniqueEmail()

  await page.goto('/signup')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(testPassword)
  await page.getByRole('button', { name: 'アカウント作成' }).click()

  const signupSucceeded = await waitForAuthRedirect(page)
  if (!signupSucceeded) {
    const message = await getAlertMessage(page)
    throw new Error(
      `Signup failed during auth setup. ` +
        `Confirm Supabase is running and retry. ${message}`
    )
  }

  await expect(page.getByText('ログイン中:')).toBeVisible()
  await mkdir('playwright/.auth', { recursive: true })
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})

async function waitForAuthRedirect(page: Page): Promise<boolean> {
  const formAlert = page.locator('form').getByRole('alert')

  try {
    await Promise.race([
      expect(page).toHaveURL('/', { timeout: 8000 }),
      formAlert.waitFor({ state: 'visible', timeout: 8000 }),
    ])
  } catch {
    return false
  }

  return page.url().endsWith('/')
}

async function getAlertMessage(page: Page): Promise<string> {
  const alert = page.locator('form').getByRole('alert')
  if (await alert.isVisible().catch(() => false)) {
    return (await alert.textContent()) ?? ''
  }
  return ''
}
