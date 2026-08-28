import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    // Unit tests only. Exclude the Playwright e2e suites (they use @playwright/test
    // and must be run via `playwright test`, not vitest) so a bare `vitest run`
    // doesn't try to collect them and fail on the wrong `test()` runtime.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'api/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', '.claude/**'],
  },
});
