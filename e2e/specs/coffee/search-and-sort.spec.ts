import { test, expect } from '../../fixtures'
import type { Page } from '@playwright/test'
import type { CoffeeFormPage } from '../../pages/coffee-form.page'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'

type EvaluationData = {
  beanName: string
  beanType: string
  shopName: string
  roastLevel?: string
  overallRating?: number
}

async function createEvaluation(
  coffeeFormPage: CoffeeFormPage,
  page: Page,
  data: EvaluationData
) {
  await coffeeFormPage.goto()
  await coffeeFormPage.fillBeanName(data.beanName)
  await coffeeFormPage.fillBeanType(data.beanType)
  await coffeeFormPage.fillShopName(data.shopName)
  if (data.roastLevel) {
    await coffeeFormPage.selectRoastLevel(data.roastLevel)
  }
  if (data.overallRating) {
    await coffeeFormPage.setOverallRating(data.overallRating)
  }
  await coffeeFormPage.submit()
  await page.waitForURL('/coffee/my')
}

test.describe('Coffee List Search and Sort', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coffee/my')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('filters evaluations by bean origin (UC4-5)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const originKeyword = `Origin${Date.now()}`
    const targetBean = getUniqueBeanName()
    const otherBean = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName: targetBean,
      beanType: originKeyword,
      shopName: `${coffeeFormDefaults.shopName} A`,
      roastLevel: coffeeFormDefaults.roastLevel,
    })

    await createEvaluation(coffeeFormPage, page, {
      beanName: otherBean,
      beanType: `Other${Date.now()}`,
      shopName: `${coffeeFormDefaults.shopName} B`,
      roastLevel: coffeeFormDefaults.roastLevel,
    })

    // Act
    await page.goto('/coffee/my')
    await page.getByRole('textbox', { name: '検索' }).fill(originKeyword)

    // Assert
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === originKeyword)
    const cards = page.locator('[data-testid="coffee-card"]')
    await expect(cards).toHaveCount(1, { timeout: 10000 })
    const titles = await page.locator('[data-testid="coffee-card"] h3').allTextContents()
    expect(titles).toEqual([targetBean])
  })

  test('filters evaluations by shop name (UC4-6)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const shopKeyword = `Shop${Date.now()}`
    const targetBean = getUniqueBeanName()
    const otherBean = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName: targetBean,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${shopKeyword} Main`,
      roastLevel: coffeeFormDefaults.roastLevel,
    })

    await createEvaluation(coffeeFormPage, page, {
      beanName: otherBean,
      beanType: coffeeFormDefaults.beanType,
      shopName: `Other Shop ${Date.now()}`,
      roastLevel: coffeeFormDefaults.roastLevel,
    })

    // Act
    await page.goto('/coffee/my')
    await page.getByRole('textbox', { name: '検索' }).fill(shopKeyword)

    // Assert
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === shopKeyword)
    const cards = page.locator('[data-testid="coffee-card"]')
    await expect(cards).toHaveCount(1, { timeout: 10000 })
    const titles = await page.locator('[data-testid="coffee-card"] h3').allTextContents()
    expect(titles).toEqual([targetBean])
  })

  test('sorts evaluations by rating and date (UC4-7)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const searchKey = `Sort${Date.now()}`
    const highRatingBean = `${searchKey}-High`
    const lowRatingBean = `${searchKey}-Low`

    await createEvaluation(coffeeFormPage, page, {
      beanName: highRatingBean,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${searchKey} Alpha Shop`,
      roastLevel: coffeeFormDefaults.roastLevel,
      overallRating: 10,
    })

    await createEvaluation(coffeeFormPage, page, {
      beanName: lowRatingBean,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${searchKey} Beta Shop`,
      roastLevel: coffeeFormDefaults.roastLevel,
      overallRating: 2,
    })

    await page.goto('/coffee/my')
    await page.getByRole('textbox', { name: '検索' }).fill(searchKey)
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === searchKey)

    // Act: Sort by rating desc
    await page.getByRole('combobox', { name: '並び順' }).selectOption('rating_desc')

    // Assert rating order
    await page.waitForURL((url) => new URL(url).searchParams.get('sort') === 'rating_desc')
    const ratingOrder = await page.locator('[data-testid="coffee-card"] h3').allTextContents()
    expect(ratingOrder[0]).toBe(highRatingBean)

    // Act: Sort by oldest first
    await page.getByRole('combobox', { name: '並び順' }).selectOption('created_at_asc')

    // Assert date order (older first)
    await page.waitForURL((url) => new URL(url).searchParams.get('sort') === 'created_at_asc')
    const dateOrderAsc = await page.locator('[data-testid="coffee-card"] h3').allTextContents()
    expect(dateOrderAsc[0]).toBe(highRatingBean)

    // Act: Sort by newest first
    await page.getByRole('combobox', { name: '並び順' }).selectOption('created_at_desc')

    // Assert date order (newer first)
    await page.waitForURL((url) => new URL(url).searchParams.get('sort') === 'created_at_desc')
    const dateOrderDesc = await page.locator('[data-testid="coffee-card"] h3').allTextContents()
    expect(dateOrderDesc[0]).toBe(lowRatingBean)
  })
})
