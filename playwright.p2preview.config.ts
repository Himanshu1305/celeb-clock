import { defineConfig, devices } from '@playwright/test';

// Real-use against the live staging PREVIEW worker (real unmocked API).
export default defineConfig({
  testDir: './tests',
  testMatch: ['p2-vedic-preview.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: [['line']],
  use: { baseURL: process.env.P2_PREVIEW, trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
  ],
});
