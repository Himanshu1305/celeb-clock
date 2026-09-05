// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FamousIndiansBornInJune } from '../articles/FamousIndiansBornInJune';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><FamousIndiansBornInJune /></MemoryRouter></HelmetProvider>
);

describe('FamousIndiansBornInJune', () => {
  it('renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('H1 contains the month name', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent).toContain('June');
  });
  it('body contains a real celebrity born in June', () => {
    renderArticle();
    expect(document.body.textContent || '').toContain('Leander Paes');
  });
  it('has at least one link to a celebrity page', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.startsWith('/celebrity/'))).toBe(true);
  });
  it('Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('no undefined in rendered text', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
  });
});
