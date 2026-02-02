import { test, expect } from './fixtures'
import { getUniqueBeanName, coffeeFormDefaults } from './fixtures/test-data'

test.describe('Shop Search Integration', () => {
  test('selects a shop from search and submits with location data', async ({ coffeeFormPage, page }) => {
    const beanName = getUniqueBeanName()

    await coffeeFormPage.goto()
    await coffeeFormPage.fillBeanName(beanName)
    await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)

    const shopInput = page.getByLabel('店名')
    await shopInput.fill('Mock Cafe')

    const option = page.getByRole('option', { name: /Mock Cafe/ })
    await expect(option).toBeVisible()
    await option.click()

    await expect(page.getByTestId('shop-address')).toHaveValue('道玄坂、渋谷区、東京都')
    await expect(page.getByTestId('shop-latitude')).toHaveValue('35.6895')
    await expect(page.getByTestId('shop-longitude')).toHaveValue('139.6917')

    await coffeeFormPage.submit()

    await page.waitForURL('/coffee/my', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: beanName })).toBeVisible()
  })

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('allows manual shop input when no results', async ({ coffeeFormPage, page }) => {
      const beanName = getUniqueBeanName()
      const shopName = 'No Result Cafe'

      await coffeeFormPage.goto()
      await coffeeFormPage.fillBeanName(beanName)
      await coffeeFormPage.fillBeanType(coffeeFormDefaults.beanType)

      const shopInput = page.getByLabel('店名')
      await shopInput.fill(shopName)

      await expect(page.getByText('候補が見つかりませんでした。手入力で追加できます。')).toBeVisible()

      await expect(page.getByTestId('shop-address')).toHaveValue('')
      await expect(page.getByTestId('shop-latitude')).toHaveValue('')
      await expect(page.getByTestId('shop-longitude')).toHaveValue('')

      await coffeeFormPage.submit()

      await page.waitForURL('/coffee/my', { timeout: 10000 })
      await expect(page.getByRole('heading', { name: beanName })).toBeVisible()
    })
  })
})
