// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AgeDaysHoursMinutesArticle } from '../articles/AgeDaysHoursMinutesArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><AgeDaysHoursMinutesArticle /></MemoryRouter></HelmetProvider>
);

describe('AgeDaysHoursMinutesArticle', () => {
  it('TC-ADH-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-ADH-P-02: H1 contains "days"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('days');
  });
  it('TC-ADH-P-03: body mentions "heartbeat"', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('heartbeat');
  });
  it('TC-ADH-P-04: entering DOB 1990-01-15 shows a days value with digits (not 0)', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-01-15' } });
    const result = document.querySelector('[data-testid="age-days-result"]');
    expect(result).toBeTruthy();
    const text = result?.textContent || '';
    expect(text).toContain('Days lived');
    // must contain a multi-digit number that is not zero
    expect(text).toMatch(/[1-9][0-9,]{2,}/);
  });
  it('TC-ADH-P-05: multiple outputs (hours/minutes) present after DOB entry', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-01-15' } });
    const text = document.querySelector('[data-testid="age-days-result"]')?.textContent || '';
    expect(text).toContain('Hours lived');
    expect(text).toContain('Minutes lived');
  });
  it('TC-ADH-P-06: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-ADH-P-07: FAQPage schema has 5 questions', () => {
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
  it('TC-ADH-P-08: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-ADH-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-ADH-N-02: article content > 1000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1000);
  });
});
