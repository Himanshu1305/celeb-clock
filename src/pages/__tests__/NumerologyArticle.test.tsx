// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NumerologyArticle } from '../articles/NumerologyArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><NumerologyArticle /></MemoryRouter></HelmetProvider>
);

describe('NumerologyArticle', () => {
  it('TC-NUM-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-NUM-P-02: H1 contains "numerology"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('numerology');
  });
  // Batch 9: the article is the India guide (Mulank vs Bhagyank vs Life Path); the
  // calculator itself lives on /numerology, so the article links there instead.
  it('TC-NUM-P-03: links to the /numerology calculator', () => {
    renderArticle();
    const cta = document.querySelector('[data-testid="article-calc-cta"] a');
    expect(cta?.getAttribute('href')).toBe('/numerology/');
  });
  it('TC-NUM-P-04: worked example 28-03-1973 → Mulank 1, Bhagyank 6, Life Path 6', () => {
    renderArticle();
    const t = document.querySelector('[data-testid="article-three-numbers"]')?.textContent || '';
    expect(t).toContain('Mulank 1');
    expect(t).toContain('Bhagyank 6');
    expect(t).toContain('Life Path 6');
    const m = document.querySelector('[data-testid="article-master-example"]')?.textContent || '';
    expect(m).toContain('33 (master number, kept)');
  });
  it('TC-NUM-P-05: all 9 life path numbers present in article', () => {
    renderArticle();
    const text = document.body.textContent || '';
    [1,2,3,4,5,6,7,8,9].forEach(n => {
      expect(text, `Missing Life Path ${n}`).toContain(`Life Path ${n}`);
    });
  });
  it('TC-NUM-P-06: master numbers 11, 22, 33 present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Life Path 11');
    expect(text).toContain('Life Path 22');
    expect(text).toContain('Life Path 33');
  });
  it('TC-NUM-P-07: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-NUM-P-08: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-NUM-P-09: FAQPage schema has 5 questions', () => {
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
  it('TC-NUM-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-NUM-N-02: article text > 3000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(3000);
  });
  it('TC-NUM-N-03: the report link makes no price claim (pricing decided later — founder, Oct 2026)', () => {
    renderArticle();
    const paid = Array.from(document.querySelectorAll('a')).filter(l => l.getAttribute('href')?.includes('birthday-report'));
    expect(paid.every(l => !/free|मुफ्त|₹|paid/i.test(l.textContent || ''))).toBe(true);
  });
});
