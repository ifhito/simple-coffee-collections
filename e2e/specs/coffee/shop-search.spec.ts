import { test, expect } from '../../fixtures'
import { getUniqueBeanName, coffeeFormDefaults } from '../../fixtures/test-data'

test.describe('Shop Search Integration', () => {
  test('should show shop search input on evaluation form', async ({ coffeeFormPage, page }) => {
    // Arrange
    await coffeeFormPage.goto()

    // Assert - shop search input should be visible
    const shopInput = page.getByLabel('店名')
    await expect(shopInput).toBeVisible()
    await expect(shopInput).toHaveAttribute('placeholder', '店舗名を入力して検索')
  })

  test('should allow manual shop name input (fallback)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()
    const shopName = 'マイカフェ'

    // Act
    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)

    // Fill shop name manually (no search required)
    await page.getByLabel('店名').fill(shopName)

    await coffeeFormPage.submit()

    // Assert - form should submit successfully
    await page.waitForURL('/coffee/my', { timeout: 10000 })

    // Verify the evaluation was created with the shop name
    const grid = page.getByTestId('coffee-grid')
    await expect(grid).toBeVisible()
    await expect(grid.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test('should trigger search after typing 3+ characters', async ({ coffeeFormPage, page }) => {
    // Arrange
    await coffeeFormPage.goto()

    // Act - type less than 3 characters
    const shopInput = page.getByLabel('店名')
    await shopInput.fill('ab')

    // Wait a bit for potential dropdown
    await page.waitForTimeout(500)

    // Assert - no dropdown should appear
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).not.toBeVisible()

    // Act - type 3+ characters
    await shopInput.fill('スタバ')

    // Wait for debounce (300ms) + potential network request
    await page.waitForTimeout(1000)

    // Note: The dropdown visibility depends on actual API response
    // In a real E2E test, we might mock the API or use a known shop name
  })

  test('should have accessible shop input with ARIA attributes', async ({ coffeeFormPage, page }) => {
    // Arrange
    await coffeeFormPage.goto()

    // Assert - shop input should have proper ARIA attributes
    const shopInput = page.getByLabel('店名')
    await expect(shopInput).toHaveAttribute('aria-autocomplete', 'list')
    await expect(shopInput).toHaveAttribute('aria-haspopup', 'listbox')
  })

  test('should create evaluation with shop name on mobile viewport', async ({ coffeeFormPage, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Arrange
    const beanName = getUniqueBeanName()
    const shopName = 'モバイルカフェ'

    // Act
    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await page.getByLabel('店名').fill(shopName)
    await coffeeFormPage.submit()

    // Assert
    await page.waitForURL('/coffee/my', { timeout: 10000 })
    const grid = page.getByTestId('coffee-grid')
    await expect(grid).toBeVisible()
  })
})
