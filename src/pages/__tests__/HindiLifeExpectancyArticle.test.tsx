// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HindiLifeExpectancyArticle } from '../articles/HindiLifeExpectancyArticle';

afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><HindiLifeExpectancyArticle /></MemoryRouter></HelmetProvider>
);

describe('HindiLifeExpectancyArticle', () => {
  it('renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('contains Devanagari text in body', () => {
    renderArticle();
    expect(document.body.textContent || '').toMatch(/[ऀ-ॿ]/);
  });
  it('H1 contains Hindi (Devanagari) text', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent || '').toMatch(/[ऀ-ॿ]/);
  });
  it('has a link to /longevity-calculator or /birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => {
      const h = l.getAttribute('href') || '';
      return h.includes('/longevity-calculator') || h.includes('/birthday-report');
    })).toBe(true);
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
  it('content length > 300 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(300);
  });
  it('no "undefined" in rendered output', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
  });
});
