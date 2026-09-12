import { defineConfig, devices } from '@playwright/test';

// Part O Item 9 — LOCAL-ONLY specs excluded from the default (staging) run.
// These target a local dev server (localhost:3000/:3001), need .env.local
// service-role secrets, or read local build files, and have their own configs
// (e2e/launch-gauntlet/gauntlet.config.ts, e2e/prelaunch/prelaunch.config.ts,
// baseURL http://localhost:3000). They only got swept into this staging run
// because testDir is './e2e'. Verified against a full staging JSON run: EACH of
// these files has ZERO passing tests on staging (every test fails purely on the
// missing local dependency), so excluding them removes environmental noise WITHOUT
// dropping any real staging coverage. This is a per-FILE list, deliberately NOT a
// folder exclusion — the launch-gauntlet/ and prelaunch/ folders also contain 291
// tests that DO pass on staging (public pages, SEO, mobile, smoke) and must keep
// running. Set E2E_LOCAL=1 to include these when running the suite locally.
const LOCAL_ONLY_SPECS = [
  '**/launch-gauntlet/05-payment-endpoints.spec.ts',  // POSTs to localhost:3001 API
  '**/launch-gauntlet/10-emails-and-reports.spec.ts', // POSTs to localhost:3001 API
  '**/prelaunch/seo-magnet-3.spec.ts',                // localhost:3001 + reads dist/
  '**/prelaunch/seo-cards-mesh.spec.ts',              // reads local dist/ build files
  '**/prelaunch/delete-account.spec.ts',              // needs .env.local service-role (helpers/db)
  '**/prelaunch/generation-flow.spec.ts',             // needs .env.local service-role (helpers/db)
  '**/prelaunch/paywall-modal.spec.ts',               // needs .env.local service-role (helpers/db)
];

export default defineConfig({
  testDir: './e2e',
  testIgnore: process.env.E2E_LOCAL ? [] : LOCAL_ONLY_SPECS,
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
