// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ChineseZodiac from '../ChineseZodiac';
import ChineseZodiacSign from '../ChineseZodiacSign';
import ChineseHoroscope from '../ChineseHoroscope';
import { CHINESE_SIGN_EXTENDED } from '@/services/ChineseZodiacService';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const at = (iso: string) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
};
const renderAt = (path: string) => render(
  <HelmetProvider>
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/chinese-zodiac" element={<ChineseZodiac />} />
        <Route path="/chinese-zodiac/:animal" element={<ChineseZodiacSign />} />
        <Route path="/chinese-horoscope" element={<ChineseHoroscope />} />
        <Route path="/chinese-horoscope/:animal" element={<ChineseHoroscope />} />
      </Routes>
    </MemoryRouter>
  </HelmetProvider>,
);

describe('/chinese-zodiac', () => {
  it('in Jan 2027 the lead still names the Fire Horse year (no hard-coded "2026 is")', () => {
    at('2027-01-15T06:00:00Z');
    renderAt('/chinese-zodiac');
    const text = document.body.textContent || '';
    expect(text).toContain('The current Chinese year is the Year of the Fire Horse (17 Feb 2026 – 5 Feb 2027)');
    expect(text).not.toContain('2026 is the Year of the');
  });
  it('after 6 Feb 2027 the lead names the Fire Goat', () => {
    at('2027-02-10T06:00:00Z');
    renderAt('/chinese-zodiac');
    expect(document.body.textContent).toContain('Year of the Fire Goat (6 Feb 2027 – 25 Jan 2028)');
  });
  it('the 12-animal grid lists every year with its date range', () => {
    renderAt('/chinese-zodiac');
    const tiger = document.querySelector('[data-testid="cz-years-tiger"]')?.textContent || '';
    expect(tiger).toContain('1998 28 Jan 1998 – 15 Feb 1999');
    const horse = document.querySelector('[data-testid="cz-years-horse"]')?.textContent || '';
    expect(horse).toContain('2026 17 Feb 2026 – 5 Feb 2027');
    expect(document.querySelectorAll('[data-testid^="cz-years-"] li').length).toBe(108);
  });
  it('yin/yang FAQ states the rule correctly (2026 even = Yang)', () => {
    renderAt('/chinese-zodiac');
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/Odd-numbered years in the cycle are Yang/);
    expect(text).toContain('2026, the Fire Horse year, is Yang');
    expect(text).toContain('Goat (also called Sheep)');
  });
});

describe('/chinese-zodiac/:animal', () => {
  it('has no fixed 2026 outlook; links to the yearly horoscope with the current year', () => {
    at('2027-01-15T06:00:00Z');
    renderAt('/chinese-zodiac/rat');
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/2026 Outlook/);
    expect(text).toContain("What is the Rat's outlook this year?");
    expect(text).toContain('Year of the Fire Horse (17 Feb 2026 – 5 Feb 2027)');
    const hrefs = Array.from(document.querySelectorAll('a')).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/chinese-horoscope/rat');
    expect(hrefs).toContain('/articles/chinese-zodiac-by-year#1996');
  });
  it('no sign data carries a dated outlook field', () => {
    for (const d of Object.values(CHINESE_SIGN_EXTENDED)) expect('outlook_2026' in d).toBe(false);
  });
});

describe('/chinese-horoscope (the yearly page)', () => {
  it('names the current Chinese year with its dates; Jan 2027 is still 2026', () => {
    at('2027-01-20T06:00:00Z');
    renderAt('/chinese-horoscope');
    expect(document.querySelector('h1')?.textContent).toBe('2026 Chinese Zodiac: Year of the Fire Horse');
    expect(document.querySelector('[data-testid="cz-current-year"]')?.textContent).toContain('17 Feb 2026 – 5 Feb 2027');
  });
  it('animal page forecasts the Chinese year (Jan 2027 → 2026 and 2027)', () => {
    at('2027-01-20T06:00:00Z');
    renderAt('/chinese-horoscope/rat');
    expect(document.querySelector('[data-testid="cz-forecast-2026"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="cz-forecast-2027"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="cz-forecast-2028"]')).toBeNull();
  });
});
