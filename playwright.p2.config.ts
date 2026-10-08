import { defineConfig, devices } from '@playwright/test';

// Local P2 real-use config: client-side numerology pages against `vite preview`.
export default defineConfig({
  testDir: './tests',
  testMatch: ['p2-numerology.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['line']],
  use: { baseURL: process.env.P2_BASE || 'http://localhost:4290', trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
  ],
});
