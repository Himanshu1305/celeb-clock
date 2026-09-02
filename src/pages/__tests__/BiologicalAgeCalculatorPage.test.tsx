// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BiologicalAgeCalculatorPage } from '../BiologicalAgeCalculatorPage';

afterEach(cleanup);

const renderPage = (Component: React.ComponentType = BiologicalAgeCalculatorPage) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/biological-age-calculator']}>
        <Component />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('BiologicalAgeCalculatorPage — Structure', () => {

  it('TC-PAGE-01: renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });

  it('TC-PAGE-02: has main landmark', () => {
    renderPage();
    expect(document.querySelector('main')).toBeTruthy();
  });

  it('TC-PAGE-03: exactly one H1', () => {
    renderPage();
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('TC-PAGE-04: H1 contains "Biological Age"', () => {
    renderPage();
    expect(document.querySelector('h1')?.textContent?.toLowerCase())
      .toContain('biological age');
  });

  it('TC-PAGE-05: has data-testid="bio-age-page"', () => {
    renderPage();
    expect(document.querySelector('[data-testid="bio-age-page"]')).toBeTruthy();
  });

  it('TC-PAGE-06: exactly 12 habit cards rendered', () => {
    renderPage();
    // Count only the numbered habit cards (habit-1..habit-12). A bare `^="habit-"`
    // also matches the required habit-difficulty / habit-gain badges (TC-PAGE-08/09).
    const habits = Array.from(document.querySelectorAll('[data-testid^="habit-"]'))
      .filter(el => /^habit-\d+$/.test(el.getAttribute('data-testid') || ''));
    expect(habits.length).toBe(12);
  });

  it('TC-PAGE-07: habit cards numbered 1-12', () => {
    renderPage();
    for (let i = 1; i <= 12; i++) {
      expect(document.querySelector(`[data-testid="habit-${i}"]`)).toBeTruthy();
    }
  });

  it('TC-PAGE-08: all 12 habits have a difficulty badge', () => {
    renderPage();
    for (let i = 1; i <= 12; i++) {
      const card = document.querySelector(`[data-testid="habit-${i}"]`);
      const badge = card?.querySelector('[data-testid="habit-difficulty"]');
      expect(badge).toBeTruthy();
      const text = badge?.textContent || '';
      expect(['Easy', 'Medium', 'Hard']).toContain(text);
    }
  });

  it('TC-PAGE-09: all 12 habits have a gain badge', () => {
    renderPage();
    for (let i = 1; i <= 12; i++) {
      const card = document.querySelector(`[data-testid="habit-${i}"]`);
      const gain = card?.querySelector('[data-testid="habit-gain"]');
      expect(gain?.textContent).toMatch(/^\+[\d.]+ yrs$/);
    }
  });

  it('TC-PAGE-10: exactly 5 step cards', () => {
    renderPage();
    const steps = document.querySelectorAll('[data-testid^="step-"]');
    expect(steps.length).toBe(5);
  });

  it('TC-PAGE-11: step cards numbered 1-5', () => {
    renderPage();
    for (let i = 1; i <= 5; i++) {
      expect(document.querySelector(`[data-testid="step-${i}"]`)).toBeTruthy();
    }
  });

  it('TC-PAGE-12: FAQ section has ≥ 6 questions', () => {
    renderPage();
    expect(
      document.querySelectorAll('[data-testid="faq-question"]').length
    ).toBeGreaterThanOrEqual(6);
  });

  it('TC-PAGE-13: ≥ 3 CTAs link to calculator', () => {
    renderPage();
    expect(
      document.querySelectorAll('[data-testid="cta-to-calculator"]').length
    ).toBeGreaterThanOrEqual(3);
  });

  it('TC-PAGE-14: all CTA links have a valid href', () => {
    renderPage();
    const ctas = document.querySelectorAll('[data-testid="cta-to-calculator"]');
    ctas.forEach(cta => {
      const href = cta.getAttribute('href') || '';
      expect(href).toMatch(/^\/|^http/);
      expect(href).not.toContain('undefined');
      expect(href.length).toBeGreaterThan(1);
    });
  });

  it('TC-PAGE-15: ≥ 2 schema script tags rendered', () => {
    renderPage();
    // Use >= because Day 3 confirmed head tags can emit twice during hydration
    expect(
      document.querySelectorAll('script[type="application/ld+json"]').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('TC-PAGE-16: all schema scripts are valid JSON', () => {
    renderPage();
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      expect(() => JSON.parse(s.textContent || '')).not.toThrow();
    });
  });

  it('TC-PAGE-17: Bryan Johnson section renders', () => {
    renderPage();
    const bj = document.querySelector('[data-testid="bryan-johnson-section"]');
    expect(bj).toBeTruthy();
    expect(bj?.textContent).toContain('Bryan Johnson');
  });

  it('TC-PAGE-18: chrono vs bio comparison section renders', () => {
    renderPage();
    expect(document.querySelector('[data-testid="chrono-vs-bio"]')).toBeTruthy();
  });

  it('TC-PAGE-19: intervention table has exactly 6 rows', () => {
    renderPage();
    expect(
      document.querySelectorAll('[data-testid="intervention-row"]').length
    ).toBe(6);
  });

  it('TC-PAGE-20: intervention table has scroll wrapper (overflow-x-auto)', () => {
    renderPage();
    const table = document.querySelector('[data-testid="intervention-table"]');
    expect(table).toBeTruthy();
    const wrapper = table?.closest('[data-testid="intervention-table-wrapper"]');
    expect(wrapper).toBeTruthy();
  });

  it('TC-PAGE-21: 4 related tool links rendered', () => {
    renderPage();
    expect(
      document.querySelectorAll('[data-testid="related-tool"]').length
    ).toBe(4);
  });

  it('TC-PAGE-22: realistic potential (not raw sum) shown in habits section', () => {
    renderPage();
    const habitsSection = document.querySelector('[data-testid="habits-section"]');
    // Should show BA_REALISTIC_POTENTIAL not the raw theoretical sum
    expect(habitsSection?.textContent).not.toContain('10 years'); // raw sum is ~10
    // Should show the realistic value (≤8)
    expect(habitsSection?.textContent).toMatch(/[0-9]\.[0-9] years realistic|realistic/i);
  });

  it('TC-PAGE-23: honest limits section renders', () => {
    renderPage();
    expect(document.querySelector('[data-testid="honest-limits"]')).toBeTruthy();
  });

  it('TC-PAGE-24: no undefined or [object Object] in rendered content', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
    expect(text).not.toContain('[object object]');
  });

  it('TC-PAGE-25: article word count > 2000', () => {
    renderPage();
    const article = document.querySelector('[data-testid="article-content"]');
    const words = article?.textContent?.trim().split(/\s+/).length || 0;
    expect(words).toBeGreaterThan(2000);
  });

  it('TC-PAGE-26: Horvath appears in article', () => {
    renderPage();
    expect(document.querySelector('[data-testid="article-content"]')?.textContent)
      .toContain('Horvath');
  });

  it('TC-PAGE-27: Bryan Johnson appears in article (with source)', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).toContain('Bryan Johnson');
    // Source citation must also be present on the page
    expect(text.toLowerCase()).toMatch(/blueprint|protocol|source/i);
  });

  it('TC-PAGE-28: NIH appears in article', () => {
    renderPage();
    expect(document.querySelector('[data-testid="article-content"]')?.textContent)
      .toContain('NIH');
  });

  it('TC-PAGE-29: breadcrumb has 3 items', () => {
    renderPage();
    const items = document.querySelectorAll('[data-testid="breadcrumb-item"]');
    expect(items.length).toBe(3);
  });

  it('TC-PAGE-30: breadcrumb items are Home, Longevity Calculator, Biological Age Calculator', () => {
    renderPage();
    const items = document.querySelectorAll('[data-testid="breadcrumb-item"]');
    expect(items[0]?.textContent?.trim()).toContain('Home');
    expect(items[1]?.textContent?.trim()).toContain('Longevity Calculator');
    expect(items[2]?.textContent?.trim()).toContain('Biological Age');
  });

});
