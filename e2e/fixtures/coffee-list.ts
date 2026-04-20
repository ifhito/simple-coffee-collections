import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function openEvaluationDetail(page: Page, beanName: string) {
  const card = page.locator('[data-testid="coffee-card"], [data-testid="feed-card"]', {
    has: page.getByRole('heading', { name: beanName }),
  })

  await expect(card).toBeVisible()

  const detailLink = card.getByRole('link')
  const href = await detailLink.getAttribute('href')

  if (!href) {
    throw new Error(`評価 "${beanName}" の詳細リンク href を取得できませんでした`)
  }

  await page.goto(href)
  await expect(page).toHaveURL((url) => url.pathname === href)
}
