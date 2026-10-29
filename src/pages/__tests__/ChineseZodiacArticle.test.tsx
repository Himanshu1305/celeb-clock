// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChineseZodiacArticle } from '../articles/ChineseZodiacArticle';
afterEach(cleanup);
const enterDob = (d: string, m: string, y: string) => {
  fireEvent.change(document.getElementById('cz-dob-day')!, { target: { value: d } });
  fireEvent.change(document.getElementById('cz-dob-month')!, { target: { value: m } });
  fireEvent.change(document.getElementById('cz-dob-year')!, { target: { value: y } });
};
const resultText = () => document.querySelector('[data-testid="chinese-zodiac-result"]')?.textContent || '';
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><ChineseZodiacArticle /></MemoryRouter></HelmetProvider>
);

describe('ChineseZodiacArticle', () => {
  it('TC-CHZ-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-CHZ-P-02: H1 contains "chinese zodiac"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('chinese zodiac');
  });
  it('TC-CHZ-P-03: body mentions Dragon', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Dragon');
  });
  it('TC-CHZ-P-04: all 12 animal names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'].forEach(a => {
      expect(text, `Missing ${a}`).toContain(a);
    });
  });
  it('TC-CHZ-P-05: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="chinese-zodiac-calculator"]')).toBeTruthy();
  });
  it('TC-CHZ-P-06: date of birth 15-06-1988 shows Dragon', () => {
    renderArticle();
    enterDob('15', '06', '1988');
    expect(resultText()).toContain('Dragon');
  });
  it('TC-CHZ-P-07: date of birth 15-06-1990 shows Horse', () => {
    renderArticle();
    enterDob('15', '06', '1990');
    expect(resultText()).toContain('Horse');
  });
  it('TC-CHZ-P-07b: 20-01-1998 is Fire Ox (before Chinese New Year 28 Jan 1998), not Earth Tiger', () => {
    renderArticle();
    enterDob('20', '01', '1998');
    const t = resultText();
    expect(t).toContain('Fire Ox');
    expect(t).not.toContain('Tiger');
    expect(t).toContain('You were born before Chinese New Year 1998');
  });
  it('TC-CHZ-P-07c: no year-only number input remains', () => {
    renderArticle();
    expect(document.querySelector('input[type="number"]')).toBeNull();
  });
  it('TC-CHZ-P-07d: year table 1924–2031 with #1998 anchor and sourced dates', () => {
    renderArticle();
    const rows = document.querySelectorAll('[data-testid="chinese-year-table"] tbody tr');
    expect(rows.length).toBe(108);
    const r1998 = document.getElementById('1998')?.textContent || '';
    expect(r1998).toContain('28 Jan 1998');
    expect(r1998).toContain('15 Feb 1999');
    expect(r1998).toContain('Tiger');
    expect(r1998).toContain('Earth');
    expect(r1998).toContain('Yang');
    const r2026 = document.getElementById('2026')?.textContent || '';
    expect(r2026).toContain('17 Feb 2026');
    expect(r2026).toContain('5 Feb 2027');
    expect(r2026).toContain('Horse');
    expect(document.querySelector('[data-testid="chinese-year-table-source"]')?.textContent).toMatch(/Hong Kong Observatory/);
  });
  it('TC-CHZ-P-08: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-CHZ-P-09: at least 2 birthday-report CTAs', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    const count = links.filter(l => l.getAttribute('href')?.includes('birthday-report')).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
  it('TC-CHZ-P-10: related articles link to moon-sign and the planetary-age calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a')).map(l => l.getAttribute('href') || '');
    expect(links.some(h => h.includes('/articles/moon-sign-by-date-of-birth'))).toBe(true);
    expect(links.some(h => h.includes('/planetary-age/'))).toBe(true);
  });
  it('TC-CHZ-P-11: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-CHZ-P-12: FAQPage schema has the 5 guide questions + 6 year questions', () => {
    renderArticle();
    let names: string[] = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent||'');
        if (d['@type'] === 'FAQPage') names = d.mainEntity.map((q: { name: string }) => q.name);
      } catch {}
    });
    expect(names.length).toBe(11);
    expect(names).toContain('What Chinese zodiac is 1998?');
  });
  it('TC-CHZ-P-13: the 1998 FAQ answer gives both sides of the New Year boundary', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('1998 is the Year of the Earth Tiger (Yang). It runs 28 Jan 1998 – 15 Feb 1999. Born between 1 January 1998 and 27 Jan 1998? You belong to the previous year, the Fire Ox.');
  });
  it('TC-CHZ-N-01: no undefined or [object Object]', () => {
    renderArticle();
    enterDob('15', '06', '1988');
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-CHZ-N-02: article text > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});
