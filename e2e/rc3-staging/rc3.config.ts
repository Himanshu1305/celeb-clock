import { defineConfig, devices } from '@playwright/test';

// RC3 Rule-4 real-use tests. Runs real form submissions against the LIVE staging
// worker (not mocked). Three browser profiles: Chromium desktop, WebKit iPhone
// (Safari), and Pixel (Android Chrome). Serial + low parallelism to respect the
// staging rate-limit (HTTP 429) and Nominatim's ~1 req/s policy.
const BASE = process.env.RC3_BASE || 'https://bornclock-staging.usdvisionai.workers.dev';

export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  expect: { timeout: 25_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    actionTimeout: 25_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } },
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
