// B20 — runs e2e/b21.spec.ts at phone (375) and desktop (1280) widths.
//   BASE_URL=http://localhost:4321 npx playwright test -c playwright.b20.config.ts
// Set PW_CHROMIUM to a Chromium binary when Playwright's own browser is not installed.
import { defineConfig, devices } from '@playwright/test';
const launchOptions = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
export default defineConfig({
  testDir: './e2e', testMatch: 'b21.spec.ts', timeout: 60_000, workers: 3, reporter: [['list']],
  projects: [
    { name: 'mobile-375', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 }, browserName: 'chromium', launchOptions } },
    { name: 'desktop-1280', use: { viewport: { width: 1280, height: 900 }, launchOptions } },
  ],
});
