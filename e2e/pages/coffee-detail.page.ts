import { Page, Locator } from '@playwright/test'

export class CoffeeDetailPage {
  readonly page: Page
  readonly pageHeading: Locator
  readonly shopName: Locator
  readonly beanOrigin: Locator
  readonly beanName: Locator
  readonly roastLevel: Locator
  readonly notes: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator
  readonly backLink: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeading = page.getByRole('heading', { level: 1 })
    this.shopName = page.getByTestId('shop-name')
    this.beanOrigin = page.getByTestId('bean-origin')
    this.beanName = page.getByTestId('bean-name')
    this.roastLevel = page.getByTestId('roast-level')
    this.notes = page.getByTestId('notes')
    this.editButton = page.getByRole('link', { name: '編集' })
    this.deleteButton = page.getByRole('button', { name: '削除' })
    this.backLink = page.getByRole('link', { name: '戻る' })
  }

  async goto(evaluationId: string) {
    await this.page.goto(`/coffee/${evaluationId}`)
  }

  async clickEdit() {
    await this.editButton.click()
  }

  async clickDelete() {
    await this.deleteButton.click()
  }

  async clickBack() {
    await this.backLink.click()
  }
}
