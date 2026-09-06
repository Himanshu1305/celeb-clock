import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

// Guards against the class of bug where a page component + its isolated test pass,
// but the <Route> was never wired into App.tsx (so the real URL 404s / prerenders
// an empty shell). Isolated page tests can't catch this — this one does.
const app = readFileSync('src/App.tsx', 'utf8');

const REQUIRED_ROUTES = [
  '/kundali',
  '/kundali-match',
  '/baby-names',
  '/hi/rashifal/:rashi',
  '/born-on/:month/:day/personality',
  '/reminders',
  '/articles/kundali-compatibility',
  '/diwali-gift',
  '/wish',
  '/for-business',
  '/compatibility',
  '/birthday-report/gift',
];

describe('App routing wired — TC-ROUTES', () => {
  REQUIRED_ROUTES.forEach(route => {
    it(`route registered: ${route}`, () => {
      expect(app, `Missing <Route path="${route}"> in App.tsx`).toContain(`path="${route}"`);
    });
  });
});
