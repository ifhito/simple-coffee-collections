import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

test.describe('Coffee Evaluation Detailed Ratings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coffee/my')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('should capture roast level and detailed ratings (UC3-5)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    // Act
    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)
    await coffeeFormPage.fillShopName(coffeeFormDefaults.shopName)
    await coffeeFormPage.selectRoastLevel('full_city')
    await coffeeFormPage.setOverallRating(10)
    await coffeeFormPage.setAcidity(8)
    await coffeeFormPage.setBitterness(6)
    await coffeeFormPage.setAroma(4)
    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my')

    await page.getByRole('heading', { name: beanName }).click()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Assert
    await expect(page.getByText('full_city')).toBeVisible()

    const overallCard = page.getByText('総合評価').locator('..')
    await expect(overallCard.getByTestId('rating-stars')).toHaveAttribute('aria-label', '5 out of 5 stars')

    const acidityCard = page.getByText('酸味').locator('..')
    await expect(acidityCard.getByTestId('rating-stars')).toHaveAttribute('aria-label', '4 out of 5 stars')

    const bitternessCard = page.getByText('苦味').locator('..')
    await expect(bitternessCard.getByTestId('rating-stars')).toHaveAttribute('aria-label', '3 out of 5 stars')

    const aromaCard = page.getByText('香り').locator('..')
    await expect(aromaCard.getByTestId('rating-stars')).toHaveAttribute('aria-label', '2 out of 5 stars')
  })
})
