import { defineConfig, devices } from '@playwright/test';
// Part V: verify nav spec against LOCAL preview (new code) before deploy.
export default defineConfig({
  testDir: './e2e/prelaunch', testMatch: /navigation\.spec\.ts/,
  fullyParallel: false, retries: 0, workers: 1, timeout: 45000,
  reporter: [['list']],
  use: { storageState: 'e2e/.playwright-consent.json', baseURL: 'http://localhost:4173', trace: 'off', screenshot: 'off', video: 'off', actionTimeout: 10000 },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 60000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
