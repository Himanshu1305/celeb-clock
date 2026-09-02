// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HowLongWillILivePage } from '../HowLongWillILivePage';

afterEach(cleanup);

const renderPage = (Component: React.ComponentType = HowLongWillILivePage) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/how-long-will-i-live']}>
        <Component />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('HowLongWillILivePage — Structure', () => {

  it('TC-PAGE-01: renders without crashing', () => {
    expect(() => renderPage(HowLongWillILivePage)).not.toThrow();
  });

  it('TC-PAGE-02: has main landmark', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('main')).toBeTruthy();
  });

  it('TC-PAGE-03: exactly one H1', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('TC-PAGE-04: H1 contains "How Long Will I Live"', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('h1')?.textContent?.toLowerCase())
      .toContain('how long will i live');
  });

  it('TC-PAGE-05: has data-testid="hlwil-page"', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="hlwil-page"]')).toBeTruthy();
  });

  it('TC-PAGE-06: exactly 4 stat cards', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelectorAll('[data-testid="stat-card"]').length).toBe(4);
  });

  it('TC-PAGE-07: stat cards include Japan and India text', () => {
    renderPage(HowLongWillILivePage);
    const cards = document.querySelectorAll('[data-testid="stat-card"]');
    const text = Array.from(cards).map(c => c.textContent).join(' ');
    expect(text).toContain('Japan');
    expect(text).toContain('India');
    expect(text).toContain('73');
  });

  it('TC-PAGE-08: exactly 8 factor cards numbered factor-1 through factor-8', () => {
    renderPage(HowLongWillILivePage);
    for (let i = 1; i <= 8; i++) {
      expect(document.querySelector(`[data-testid="factor-${i}"]`)).toBeTruthy();
    }
  });

  it('TC-PAGE-09: all 8 factor cards have direction badge', () => {
    renderPage(HowLongWillILivePage);
    for (let i = 1; i <= 8; i++) {
      const card = document.querySelector(`[data-testid="factor-${i}"]`);
      const badge = card?.querySelector('[data-testid="factor-direction"]');
      expect(badge).toBeTruthy();
      const text = badge?.textContent?.trim() || '';
      expect(['Risk factor', 'Protective factor', 'Mixed impact'].some(v => text.includes(v))).toBe(true);
    }
  });

  it('TC-PAGE-10: ≥ 15 country rows using data-testid="country-row"', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('[data-testid="country-row"]').length
    ).toBeGreaterThanOrEqual(15);
  });

  it('TC-PAGE-11: Japan row found by data-country attribute', () => {
    renderPage(HowLongWillILivePage);
    const japanRow = document.querySelector('[data-country="Japan"]');
    expect(japanRow).toBeTruthy();
    expect(japanRow?.textContent).toContain('84');
  });

  it('TC-PAGE-12: India row found by data-country attribute', () => {
    renderPage(HowLongWillILivePage);
    const indiaRow = document.querySelector('[data-country="India"]');
    expect(indiaRow).toBeTruthy();
    expect(indiaRow?.textContent).toContain('70');
  });

  it('TC-PAGE-13: country table has scroll wrapper', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="country-table-wrapper"]')).toBeTruthy();
  });

  it('TC-PAGE-14: exactly 4 improvement step cards', () => {
    renderPage(HowLongWillILivePage);
    for (let i = 1; i <= 4; i++) {
      expect(document.querySelector(`[data-testid="step-${i}"]`)).toBeTruthy();
    }
  });

  it('TC-PAGE-15: improvement steps section renders', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="improvement-steps"]')).toBeTruthy();
  });

  it('TC-PAGE-16: gap analysis section renders', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="gap-analysis"]')).toBeTruthy();
  });

  it('TC-PAGE-17: honest limits section renders', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="honest-limits"]')).toBeTruthy();
  });

  it('TC-PAGE-18: FAQ section has ≥ 6 questions', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('[data-testid="faq-question"]').length
    ).toBeGreaterThanOrEqual(6);
  });

  it('TC-PAGE-19: ≥ 3 CTAs link to calculator', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('[data-testid="cta-to-calculator"]').length
    ).toBeGreaterThanOrEqual(3);
  });

  it('TC-PAGE-20: all CTA hrefs are valid paths with no undefined', () => {
    renderPage(HowLongWillILivePage);
    document.querySelectorAll('[data-testid="cta-to-calculator"]').forEach(cta => {
      const href = cta.getAttribute('href') || '';
      expect(href).toMatch(/^\/|^http/);
      expect(href).not.toContain('undefined');
      expect(href.length).toBeGreaterThan(1);
    });
  });

  it('TC-PAGE-21: ≥ 2 schema script tags', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('script[type="application/ld+json"]').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('TC-PAGE-22: all schema scripts contain valid JSON', () => {
    renderPage(HowLongWillILivePage);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      expect(() => JSON.parse(s.textContent || '')).not.toThrow();
    });
  });

  it('TC-PAGE-23: 4 related tool links', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('[data-testid="related-tool"]').length
    ).toBe(4);
  });

  it('TC-PAGE-24: article word count > 2000', () => {
    renderPage(HowLongWillILivePage);
    const article = document.querySelector('[data-testid="article-content"]');
    const words = article?.textContent?.trim().split(/\s+/).length || 0;
    expect(words).toBeGreaterThan(2000);
  });

  it('TC-PAGE-25: Harvard cited in article', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="article-content"]')?.textContent)
      .toContain('Harvard');
  });

  it('TC-PAGE-26: Karolinska cited in article', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="article-content"]')?.textContent)
      .toContain('Karolinska');
  });

  it('TC-PAGE-27: Blue Zone cited in article', () => {
    renderPage(HowLongWillILivePage);
    expect(document.querySelector('[data-testid="article-content"]')?.textContent)
      .toContain('Blue Zone');
  });

  it('TC-PAGE-28: 3 breadcrumb items', () => {
    renderPage(HowLongWillILivePage);
    expect(
      document.querySelectorAll('[data-testid="breadcrumb-item"]').length
    ).toBe(3);
  });

  it('TC-PAGE-29: country table section contains Kerala text (India note)', () => {
    renderPage(HowLongWillILivePage);
    const section = document.querySelector('[data-testid="country-table-section"]');
    expect(section?.textContent?.toLowerCase()).toContain('kerala');
  });

  it('TC-PAGE-30: no undefined or [object Object] in rendered output', () => {
    renderPage(HowLongWillILivePage);
    const text = document.body.textContent || '';
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
    expect(text).not.toContain('[object object]');
  });

});
