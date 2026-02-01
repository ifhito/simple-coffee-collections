/**
 * E2E tests for Coffee Evaluation Delete
 *
 * Use Case: UC5 - Delete evaluation
 * Priority: High
 */

import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test.describe('Coffee Evaluation Delete', () => {
  test.beforeEach(async ({ page }) => {
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('should show confirmation dialog when deleting (UC5-5)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const uniqueBeanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to detail page
    await page.getByRole('heading', { name: uniqueBeanName }).click()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Act: Setup dialog handler before clicking delete
    let dialogShown = false
    page.on('dialog', async dialog => {
      dialogShown = true
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toMatch(/削除|delete/i)
      await dialog.dismiss() // Cancel deletion
    })

    const deleteButton = page.getByRole('button', { name: /削除|Delete/ })
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    // Assert: Dialog should have been shown
    await page.waitForTimeout(500) // Give time for dialog to appear
    expect(dialogShown).toBe(true)

    // Should still be on detail page after canceling
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)
  })

  test('should delete evaluation after confirmation (UC5-6, UC5-7)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const uniqueBeanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Verify evaluation exists in list
    await expect(page.getByRole('heading', { name: uniqueBeanName })).toBeVisible()

    // Navigate to detail page
    await page.getByRole('heading', { name: uniqueBeanName }).click()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Act: Accept deletion
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    const deleteButton = page.getByRole('button', { name: /削除|Delete/ })
    await deleteButton.click()

    // Assert: Should redirect to list page
    await expect(page).toHaveURL('/coffee/my')

    // Evaluation should no longer appear in list
    await expect(page.getByRole('heading', { name: uniqueBeanName })).not.toBeVisible()
  })

  test('should cancel deletion when dismissing confirmation (UC5-5)', async ({ coffeeFormPage, page }) => {
    // Arrange: Create a test evaluation
    const uniqueBeanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(uniqueBeanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    // Navigate to detail page
    await page.getByRole('heading', { name: uniqueBeanName }).click()
    const currentUrl = page.url()

    // Act: Dismiss deletion dialog
    page.on('dialog', async dialog => {
      await dialog.dismiss()
    })

    await page.getByRole('button', { name: /削除|Delete/ }).click()

    // Assert: Should remain on detail page
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(currentUrl)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(uniqueBeanName)

    // Verify evaluation still exists in list
    await page.goto('/coffee/my')
    await expect(page.getByRole('heading', { name: uniqueBeanName })).toBeVisible()
  })
})
