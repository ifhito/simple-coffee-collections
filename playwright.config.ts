import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E test configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid auth state conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to ensure test isolation
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project for authentication
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Main tests (excluding logout which clears auth state)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /logout\.spec\.ts/,
    },

    // Logout test runs separately to avoid affecting other tests
    {
      name: 'logout',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup', 'chromium'],
      testMatch: /logout\.spec\.ts/,
    },
  ],

  // Start local dev server before running tests
  webServer: [
    {
      command: 'node e2e/mock-nominatim-server.js',
      url: 'http://127.0.0.1:3999/health',
      reuseExistingServer: !process.env.CI,
      timeout: 10 * 1000,
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      env: {
        ...process.env,
        NEXT_PUBLIC_NOMINATIM_BASE_URL: 'http://127.0.0.1:3999',
        NOMINATIM_USER_AGENT: 'SimpleCoffeeCollections/1.0 (E2E)',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000, // 2 minutes
    },
  ],
})
