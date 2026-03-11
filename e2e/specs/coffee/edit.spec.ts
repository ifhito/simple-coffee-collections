/**
 * E2E tests for Coffee Evaluation Edit
 *
 * Use Case: UC5 - Edit and update evaluation
 * Priority: High
 */

import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'
import { openEvaluationDetail } from '../../fixtures/coffee-list'

test.describe('Coffee Evaluation Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coffee/my')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('should navigate to edit page from detail page (UC5-1)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const uniqueBeanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to detail page
    await openEvaluationDetail(page, uniqueBeanName)

    // Act: Click edit button
    const editButton = page.getByRole('link', { name: /編集/ })
    await expect(editButton).toBeVisible()
    await editButton.click()

    // Assert: Should navigate to edit page
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+\/edit$/)
  })

  test('should load existing data in edit form (UC5-2)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation with specific data
    const uniqueBeanName = getUniqueBeanName()
    const originalShopName = 'Original Shop Name'

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(originalShopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to detail, then edit
    await openEvaluationDetail(page, uniqueBeanName)
    await page.getByRole('link', { name: /編集/ }).click()

    // Assert: Form should be pre-filled with existing data
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+\/edit$/)

    const shopNameInput = page.getByLabel(/店名|Shop/)
    const beanNameInput = page.getByLabel(/豆の名前|Bean Name/)

    await expect(shopNameInput).toHaveValue(originalShopName)
    await expect(beanNameInput).toHaveValue(uniqueBeanName)
  })

  test('should update evaluation with new data (UC5-3, UC5-4)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const originalBeanName = getUniqueBeanName()
    const updatedShopName = 'Updated Shop Name'

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(originalBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to edit page
    await openEvaluationDetail(page, originalBeanName)
    await page.getByRole('link', { name: /編集/ }).click()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+\/edit$/)

    // Act: Update shop name
    const shopNameInput = page.getByLabel(/店名|Shop/)
    await shopNameInput.clear()
    await shopNameInput.fill(updatedShopName)

    const updateButton = page.getByRole('button', { name: /更新|保存|Update/ })
    await updateButton.click()

    // Assert: Should redirect to detail page with updated data
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)
    await expect(page.getByText(updatedShopName)).toBeVisible()

    // Verify change persists in list view
    await page.goto('/coffee/my')
    const updatedCard = page.locator(`article:has(h3:text-is("${originalBeanName}"))`)
    await expect(updatedCard).toContainText(updatedShopName)
  })
})
