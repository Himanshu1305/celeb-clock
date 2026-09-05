// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HindiJeevanPratyashaPage } from '../articles/HindiJeevanPratyashaPage';

afterEach(cleanup);
const renderPage = () => render(
  <HelmetProvider><MemoryRouter><HindiJeevanPratyashaPage /></MemoryRouter></HelmetProvider>
);

describe('HindiJeevanPratyashaPage', () => {
  it('renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('contains Devanagari text in body', () => {
    renderPage();
    expect(document.body.textContent || '').toMatch(/[ऀ-ॿ]/);
  });
  it('H1 contains Hindi (Devanagari) text', () => {
    renderPage();
    expect(document.querySelector('h1')?.textContent || '').toMatch(/[ऀ-ॿ]/);
  });
  it('has a link to /longevity-calculator or /birthday-report', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => {
      const h = l.getAttribute('href') || '';
      return h.includes('/longevity-calculator') || h.includes('/birthday-report');
    })).toBe(true);
  });
  it('Article JSON-LD schema present', () => {
    renderPage();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('FAQPage schema has 5 questions', () => {
    renderPage();
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
    renderPage();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(300);
  });
  it('no "undefined" in rendered output', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
  });
});
