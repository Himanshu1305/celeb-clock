// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LongevityFoodsIndiaArticle } from '../articles/LongevityFoodsIndiaArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LongevityFoodsIndiaArticle /></MemoryRouter></HelmetProvider>
);

describe('LongevityFoodsIndiaArticle', () => {
  it('TC-LFI-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LFI-P-02: H1 contains "food"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('food');
  });
  it('TC-LFI-P-03: body mentions turmeric', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('turmeric');
  });
  it('TC-LFI-P-04: at least 15 food items present', () => {
    renderArticle();
    const items = document.querySelectorAll('[data-testid="longevity-food-item"]');
    expect(items.length).toBeGreaterThanOrEqual(15);
  });
  it('TC-LFI-P-05: named longevity foods appear (>=12)', () => {
    renderArticle();
    const text = (document.body.textContent || '').toLowerCase();
    const foods = ['turmeric','dal','amla','ghee','millet','palak','curd','green tea','nuts','garlic','ginger','spinach','rajma','whole grain','fruit'];
    const found = foods.filter(f => text.includes(f));
    expect(found.length).toBeGreaterThanOrEqual(12);
  });
  it('TC-LFI-P-06: evidence levels rendered', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text.includes('Strong') || text.includes('Moderate')).toBe(true);
  });
  it('TC-LFI-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LFI-P-08: FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent||'');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-LFI-P-09: links to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.filter(l => l.getAttribute('href') === '/longevity-calculator').length).toBeGreaterThanOrEqual(2);
  });
  it('TC-LFI-P-10: related article cross-links present', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a')).map(l => l.getAttribute('href'));
    expect(links).toContain('/articles/blue-zones-diet');
    expect(links).toContain('/articles/how-to-live-to-100');
  });
  it('TC-LFI-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LFI-N-02: content > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});
