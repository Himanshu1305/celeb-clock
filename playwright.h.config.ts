import { defineConfig, devices } from '@playwright/test';

// Part H whole-journey walkthrough against LIVE staging with REAL Gemini —
// generous per-test timeout because real reading/chat generation is slow.
export default defineConfig({
  testDir: './e2e',
  testMatch: /part-h-walkthrough\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 150_000,
  reporter: [['list']],
  use: {
    baseURL: 'https://staging.bornclock.com',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    actionTimeout: 20_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
