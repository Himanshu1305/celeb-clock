/**
 * Playwright config for the pre-launch suite (Suites A–K).
 * Same local targets as the launch gauntlet: Vite :3000 proxying /api → :3001.
 *
 * Start both servers first (env loaded for the service-role key the DB helpers use):
 *   set -a; source .env.local; set +a
 *   ./node_modules/.bin/wrangler dev --port 3001     (Terminal 1)
 *   npm run dev                                        (Terminal 2)
 *
 * Run:
 *   set -a; source .env.local; set +a
 *   npx playwright test --config e2e/prelaunch/prelaunch.config.ts
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,          // environment-flake policy (d): retry cold starts / local flakes
  workers: 1,          // serial — created users + DB asserts must not interleave
  timeout: 45000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../playwright-report/prelaunch' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
