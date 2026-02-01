/**
 * E2E tests for Coffee Evaluation Detail View
 *
 * Use Case: UC4 - View evaluation details
 * Priority: High
 */

import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test.describe('Coffee Evaluation Detail View', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure user is authenticated
    await page.goto('/coffee/my')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('should display evaluation details (UC4-3, UC4-4)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation first
    const uniqueBeanName = getUniqueBeanName()
    const testData = {
      beanName: uniqueBeanName,
      beanType: coffeeFormDefaults.beanType,
      shopName: coffeeFormDefaults.shopName,
      roastLevel: coffeeFormDefaults.roastLevel,
    }

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(testData.beanName)
    await coffeeFormPage.fillBeanType(testData.beanType)
    await coffeeFormPage.fillShopName(testData.shopName)
    await coffeeFormPage.selectRoastLevel(testData.roastLevel)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Act: Click on the created evaluation to view details
    const evaluationCard = page.getByRole('heading', { name: uniqueBeanName })
    await expect(evaluationCard).toBeVisible()
    await evaluationCard.click()

    // Assert: Verify all entered data is displayed
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(uniqueBeanName)

    // Verify key fields are displayed
    await expect(page.getByText(testData.shopName)).toBeVisible()
    await expect(page.getByText(testData.beanType)).toBeVisible()
  })

  test('should navigate back to list from detail page (UC4-1)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const uniqueBeanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to detail
    await page.getByRole('heading', { name: uniqueBeanName }).click()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Act: Click back button
    const backLink = page.getByRole('link', { name: /戻る|マイページ/ })
    if (await backLink.isVisible()) {
      await backLink.click()
    } else {
      // Fallback: use browser back
      await page.goBack()
    }

    // Assert: Should return to list page
    await expect(page).toHaveURL('/coffee/my')
    await expect(page.getByRole('heading', { name: uniqueBeanName })).toBeVisible()
  })
})
