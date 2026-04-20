import { test, expect } from '../../fixtures'
import type { Page } from '@playwright/test'
import type { CoffeeFormPage } from '../../pages/coffee-form.page'
import { coffeeFormDefaults, getUniqueBeanName } from '../../fixtures/test-data'
import { openEvaluationDetail } from '../../fixtures/coffee-list'

async function createEvaluation(
  coffeeFormPage: CoffeeFormPage,
  page: Page,
  data: {
    beanName: string
    beanType: string
    shopName: string
    isPublic?: boolean
  }
) {
  await coffeeFormPage.goto()
  await coffeeFormPage.fillBeanName(data.beanName)
  await coffeeFormPage.fillBeanType(data.beanType)
  await coffeeFormPage.fillShopName(data.shopName)
  await coffeeFormPage.selectRoastLevel(coffeeFormDefaults.roastLevel)
  if (data.isPublic) {
    await coffeeFormPage.togglePublic()
  }
  await coffeeFormPage.submit()
  await page.waitForURL('/coffee/my')
}

test.describe('Community Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coffee/my')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('shows public evaluations in community feed (UC6-1)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${coffeeFormDefaults.shopName} Public`,
      isPublic: true,
    })

    // Act
    await page.goto('/coffee/community')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)

    // Assert
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    await expect(page.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test('does not show private evaluations in community feed (UC6-2)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${coffeeFormDefaults.shopName} Private`,
      isPublic: false,
    })

    // Act
    await page.goto('/coffee/community')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)

    // Assert
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    await expect(page.getByRole('heading', { name: beanName })).toHaveCount(0)
  })

  test('can change visibility to public and see it in community (UC6-3, UC6-4)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${coffeeFormDefaults.shopName} Toggle`,
      isPublic: false,
    })

    // Act: Toggle to public in edit form
    await openEvaluationDetail(page, beanName)
    await page.getByRole('link', { name: /編集/ }).click()
    await coffeeFormPage.togglePublic()
    await coffeeFormPage.submit()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Assert: Badge updated on my page
    await page.goto('/coffee/my')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    const card = page.locator('[data-testid="feed-card"]', {
      has: page.getByRole('heading', { name: beanName }),
    })
    await expect(card.getByTestId('public-badge')).toHaveText(/公開/)

    // Assert: Visible in community feed
    await page.goto('/coffee/community')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    await expect(page.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test('removes evaluation from community when set to private (UC6-5)', async ({ coffeeFormPage, page }) => {
    // Arrange
    const beanName = getUniqueBeanName()

    await createEvaluation(coffeeFormPage, page, {
      beanName,
      beanType: coffeeFormDefaults.beanType,
      shopName: `${coffeeFormDefaults.shopName} Revert`,
      isPublic: true,
    })

    await page.goto('/coffee/community')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    await expect(page.getByRole('heading', { name: beanName })).toBeVisible()

    // Act: Toggle to private in edit form
    await page.goto('/coffee/my')
    await openEvaluationDetail(page, beanName)
    await page.getByRole('link', { name: /編集/ }).click()
    await coffeeFormPage.togglePublic()
    await coffeeFormPage.submit()
    await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)

    // Assert: Not visible in community feed
    await page.goto('/coffee/community')
    await page.getByRole('textbox', { name: '検索' }).fill(beanName)
    await page.waitForURL((url) => new URL(url).searchParams.get('search') === beanName)
    await expect(page.getByRole('heading', { name: beanName })).toHaveCount(0)
  })
})
