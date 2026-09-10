import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: /part-h-adversarial\.spec\.ts/,
  fullyParallel: false, workers: 1, retries: 0, timeout: 150_000,
  reporter: [['list']],
  use: { baseURL: 'https://staging.bornclock.com', trace: 'off', screenshot: 'off', video: 'off', actionTimeout: 20_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
