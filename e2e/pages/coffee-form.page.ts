import type { Page } from '@playwright/test'

export class CoffeeFormPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/coffee/new')
  }

  async fillBeanName(name: string) {
    await this.page.getByLabel('豆の名前').fill(name)
  }

  async fillBeanType(type: string) {
    await this.page.getByLabel('豆の産地').fill(type)
  }

  async fillShopName(name: string) {
    await this.page.getByLabel('店名').fill(name)
  }

  async selectRoastLevel(value: string) {
    await this.page.locator('#roast-level').selectOption(value)
  }

  async setRating(label: string, value: number) {
    const slider = this.page.getByRole('slider', { name: label })
    await slider.fill(value.toString())
  }

  async setOverallRating(value: number) {
    await this.setRating('総合評価', value)
  }

  async setAcidity(value: number) {
    await this.setRating('酸味', value)
  }

  async setBitterness(value: number) {
    await this.setRating('苦味', value)
  }

  async setAroma(value: number) {
    await this.setRating('香り', value)
  }

  async togglePublic() {
    await this.page.getByTestId('public-toggle').getByRole('checkbox').click()
  }

  async submit() {
    await this.page.getByRole('button', { name: /保存|更新/ }).click()
  }
}
