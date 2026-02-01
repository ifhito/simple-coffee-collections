import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { CoffeeFormPage } from '../pages/coffee-form.page'
import { CoffeeDetailPage } from '../pages/coffee-detail.page'

type Fixtures = {
  loginPage: LoginPage
  coffeeFormPage: CoffeeFormPage
  coffeeDetailPage: CoffeeDetailPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  coffeeFormPage: async ({ page }, use) => {
    await use(new CoffeeFormPage(page))
  },
  coffeeDetailPage: async ({ page }, use) => {
    await use(new CoffeeDetailPage(page))
  },
})

export { expect }
