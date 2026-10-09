import { defineConfig, devices } from '@playwright/test';

// P5 real-use suite against the uploaded preview version (NOT production).
// BASE defaults to the P5 preview URL; override with BASE=... if re-uploaded.
const BASE = (process.env.BASE || 'https://5b06308c-bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');

export default defineConfig({
  testDir: './e2e',
  testMatch: /p5-preview\.spec\.ts/,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 1,
  workers: 2,
  reporter: [['line']],
  use: {
    baseURL: BASE,
    trace: 'off',
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } },
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
