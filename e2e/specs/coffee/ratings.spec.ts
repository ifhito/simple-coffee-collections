import { test, expect } from '../../fixtures'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'
import { openEvaluationDetail } from '../../fixtures/coffee-list'

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

    await openEvaluationDetail(page, beanName)

    // Assert
    await expect(page.getByText('full_city')).toBeVisible()

    const overallCard = page.locator('p', { hasText: /^総合評価$/ }).locator('..')
    await expect(overallCard).toContainText('10')

    const acidityCard = page.locator('p', { hasText: /^酸味$/ }).locator('..')
    await expect(acidityCard).toContainText('8')

    const bitternessCard = page.locator('p', { hasText: /^苦味$/ }).locator('..')
    await expect(bitternessCard).toContainText('6')

    const aromaCard = page.locator('p', { hasText: /^香り$/ }).locator('..')
    await expect(aromaCard).toContainText('4')
  })
})
