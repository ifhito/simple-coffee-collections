import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test.describe('Coffee Evaluation Creation', () => {
  test('should create evaluation with all required fields (UC3-1, UC3-2, UC3-3)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    // Act
    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.selectRoastLevel(coffeeFormDefaults.roastLevel)

    // Ensure no form error is displayed before submitting
    await expect(page.getByText('認証が必要です')).not.toBeVisible()

    await coffeeFormPage.submit()

    // Assert
    await page.waitForURL('/coffee/my', { timeout: 10000 })
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()

    const grid = page.getByTestId('coffee-grid')
    await expect(grid).toBeVisible()
    await expect(grid.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test('should show validation error for missing shop name (UC3-4)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()
    await coffeeFormPage.goto()

    // Act
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    // Intentionally skip shop name
    await coffeeFormPage.submit()

    // Assert
    // Form should not be submitted
    await expect(page).toHaveURL('/coffee/new')
    // Browser HTML5 validation or custom error should prevent submission
    // We verify the user stays on the form page
  })

  test('should show validation error for missing bean origin (UC3-4)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()
    await coffeeFormPage.goto()

    // Act
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    // Intentionally skip bean type/origin
    await coffeeFormPage.submit()

    // Assert
    await expect(page).toHaveURL('/coffee/new')
  })
})
