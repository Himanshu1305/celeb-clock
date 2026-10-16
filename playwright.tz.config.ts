import { defineConfig, devices } from '@playwright/test';

// fix-timezone-accuracy real-use suite — runs against the STAGING worker only
// (bornclock-staging, *.workers.dev — never production). Override with BASE=...
const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');

export default defineConfig({
  testDir: './e2e',
  testMatch: /tz-accuracy\.spec\.ts/,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  retries: 1,
  workers: 2,
  reporter: [['list']],
  use: { baseURL: BASE, trace: 'off', actionTimeout: 20_000, screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
