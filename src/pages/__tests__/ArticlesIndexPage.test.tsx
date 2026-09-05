// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ArticlesIndexPage } from '../ArticlesIndexPage';

afterEach(cleanup);

const renderPage = () => render(
  <HelmetProvider><MemoryRouter><ArticlesIndexPage /></MemoryRouter></HelmetProvider>
);

const cards = () => Array.from(document.querySelectorAll('[data-testid="article-card"]'));

describe('ArticlesIndexPage', () => {
  it('TC-AIX-01: renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });

  it('TC-AIX-02: H1 present containing "Articles"', () => {
    renderPage();
    const h1 = document.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Articles');
  });

  it('TC-AIX-03: at least 15 article-card elements', () => {
    renderPage();
    expect(cards().length).toBeGreaterThanOrEqual(15);
  });

  it('TC-AIX-04: category filter buttons present', () => {
    renderPage();
    const filters = document.querySelectorAll('[data-testid="category-filter"]');
    expect(filters.length).toBeGreaterThan(1);
  });

  it('TC-AIX-05: clicking a category filter changes visible cards', () => {
    renderPage();
    const total = cards().length;
    const filters = Array.from(
      document.querySelectorAll('[data-testid="category-filter"]')
    ) as HTMLElement[];
    // Pick a non-"All" category (Numerology has only 2 articles).
    const target = filters.find(f => f.textContent === 'Numerology')!;
    expect(target).toBeTruthy();
    fireEvent.click(target);
    const filtered = cards().length;
    expect(filtered).toBeLessThan(total);
    expect(filtered).toBeGreaterThan(0);
  });

  it('TC-AIX-06: all cards have href attributes', () => {
    renderPage();
    const all = cards();
    expect(all.length).toBeGreaterThan(0);
    all.forEach(c => {
      const href = c.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//);
    });
  });

  it('TC-AIX-07: CollectionPage schema present', () => {
    renderPage();
    const schemas = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'CollectionPage'; }
      catch { return false; }
    })).toBe(true);
  });

  it('TC-AIX-08: no "undefined" in rendered text', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });

  it('TC-AIX-09: a CTA link present', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
    expect(links.some(l => l.getAttribute('href')?.includes('longevity-calculator'))).toBe(true);
  });

  it('TC-AIX-10: total cards >= 35 (matches array)', () => {
    renderPage();
    expect(cards().length).toBeGreaterThanOrEqual(35);
  });
});
