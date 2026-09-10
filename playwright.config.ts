import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Part I.21: pre-dismiss the cookie-consent banner globally so it can't
    // overlap/intercept clicks (Part D/H finding). Low-risk baseline localStorage.
    storageState: 'e2e/.playwright-consent.json',
    baseURL: 'https://staging.bornclock.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
