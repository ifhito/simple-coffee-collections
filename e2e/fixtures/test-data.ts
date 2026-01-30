export const testUser = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
}

export const coffeeFormDefaults = {
  beanType: 'Ethiopia',
  shopName: 'E2E Test Cafe',
  roastLevel: 'medium',
}

export function getUniqueBeanName() {
  return `E2E Bean ${Date.now()}`
}
