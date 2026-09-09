import { defineConfig, devices } from '@playwright/test';

// Part D reading-UX E2E. Runs against a LOCAL `vite preview` (:4173) — the
// existing e2e/ suite targets remote staging, but new reading UI can't be there
// until deployed, so per the spec we run locally and mock /api/* at the route
// level. Playwright auto-starts the preview server (build `dist/` first).
export default defineConfig({
  testDir: './e2e-reading',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 45000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    screenshot: 'off', // we take explicit screenshots for the deliverable
    video: 'off',
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
