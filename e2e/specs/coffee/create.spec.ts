import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test('create coffee evaluation', async ({ coffeeFormPage, page }) => {
  const beanName = getUniqueBeanName()

  await coffeeFormPage.goto()

  await coffeeFormPage.fillBeanName(beanName)
  await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
  await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
  await coffeeFormPage.selectRoastLevel(coffeeFormDefaults.roastLevel)

  // Ensure no form error is displayed before submitting
  await expect(page.getByText('認証が必要です')).not.toBeVisible()

  await coffeeFormPage.submit()

  // Wait for navigation after successful creation - redirects to my page
  await page.waitForURL('/coffee/my', { timeout: 10000 })

  // Verify user is still authenticated after redirect
  await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()

  const grid = page.getByTestId('coffee-grid')
  await expect(grid).toBeVisible()
  await expect(grid.getByRole('heading', { name: beanName })).toBeVisible()
})
