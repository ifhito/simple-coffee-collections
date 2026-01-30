import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async fillEmail(email: string) {
    await this.page.locator('#email').fill(email)
  }

  async fillPassword(password: string) {
    await this.page.locator('#password').fill(password)
  }

  async submit() {
    await this.page.getByRole('button', { name: 'ログイン' }).click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async expectErrorVisible() {
    await expect(this.page.getByRole('alert')).toBeVisible()
  }
}
