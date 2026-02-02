export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
}

export const testPassword = 'TestPassword123!'

export const coffeeFormDefaults = {
  beanType: 'Ethiopia',
  shopName: 'E2E Test Cafe',
  roastLevel: 'medium',
}

export function getUniqueBeanName() {
  return `E2E Bean ${Date.now()}`
}

export function getUniqueEmail() {
  return `e2e-${Date.now()}@example.com`
}
