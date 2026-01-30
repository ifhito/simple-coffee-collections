import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { CoffeeFormPage } from '../pages/coffee-form.page'

type Fixtures = {
  loginPage: LoginPage
  coffeeFormPage: CoffeeFormPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  coffeeFormPage: async ({ page }, use) => {
    await use(new CoffeeFormPage(page))
  },
})

export { expect }
