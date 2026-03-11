import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function openEvaluationDetail(page: Page, beanName: string) {
  const card = page.locator('[data-testid="coffee-card"]', {
    has: page.getByRole('heading', { name: beanName }),
  })

  await expect(card).toBeVisible()
  await card.getByRole('link').click()
  await expect(page).toHaveURL(/\/coffee\/[a-zA-Z0-9-]+$/)
}
