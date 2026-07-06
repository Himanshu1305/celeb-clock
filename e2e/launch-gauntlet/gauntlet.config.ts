/**
 * Playwright config for the launch-gauntlet suite.
 * Points to localhost:3000 (Vite dev) which proxies /api to localhost:3001 (Vercel dev).
 *
 * Start both servers before running:
 *   Terminal 1: npm run dev          (Vite on :3000)
 *   Terminal 2: vercel dev --listen 3001
 *
 * Run gauntlet:
 *   npx playwright test --config e2e/launch-gauntlet/gauntlet.config.ts
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 45000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../playwright-report/gauntlet' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
