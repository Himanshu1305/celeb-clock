// @vitest-environment jsdom
// Item E — smoke tests for the four new SEO pages: single <h1>, main landmark,
// renders without crashing (H1 + lead must be present on first paint for prerender).
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ManglikPage from '../ManglikPage';
import KaalSarpDoshaPage from '../KaalSarpDoshaPage';
import PersonalYearNumberPage from '../PersonalYearNumberPage';
import AngelNumbersPage from '../AngelNumbersPage';

afterEach(cleanup);

const renderAt = (Component: React.ComponentType, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Component />
      </MemoryRouter>
    </HelmetProvider>
  );

const CASES: Array<[string, React.ComponentType, string, string]> = [
  ['Manglik', ManglikPage, '/manglik', 'manglik'],
  ['KaalSarp', KaalSarpDoshaPage, '/kaal-sarp-dosha', 'kaal sarp'],
  ['PersonalYear', PersonalYearNumberPage, '/personal-year-number', 'personal year'],
  ['AngelNumbers', AngelNumbersPage, '/angel-numbers', 'angel number'],
];

describe('Item E — new SEO pages', () => {
  for (const [name, Comp, path, h1frag] of CASES) {
    it(`${name}: renders without crashing`, () => {
      expect(() => renderAt(Comp, path)).not.toThrow();
    });
    it(`${name}: exactly one <h1>`, () => {
      renderAt(Comp, path);
      expect(document.querySelectorAll('h1').length).toBe(1);
    });
    it(`${name}: H1 mentions the topic`, () => {
      renderAt(Comp, path);
      expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain(h1frag);
    });
    it(`${name}: has a main landmark`, () => {
      renderAt(Comp, path);
      expect(document.querySelector('main')).toBeTruthy();
    });
  }
});
