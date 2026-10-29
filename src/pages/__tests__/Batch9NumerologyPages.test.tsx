// @vitest-environment jsdom
/**
 * Batch 9 — numerology pages: the shared Mulank/Bhagyank/name calculator on /numerology
 * and /hi/numerology-by-date-of-birth, the Chaldean-first name calculator, the
 * "As Mulank N" / "As name number N" sections on /numerology/1–9, and live titles that
 * match scripts/prerender-titles.mjs.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { BirthDateProvider } from '@/context/BirthDateContext';
import NumerologyPage from '../NumerologyPage';
import NameNumerologyPage from '../NameNumerologyPage';
import NumerologyNumber from '../NumerologyNumber';
import { HindiNumerologyArticle } from '../articles/HindiNumerologyArticle';
import { pythagoreanName } from '@/lib/numerologyExtra';
import { NUMEROLOGY_DATA } from '@/data/numerologyData';

const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');

afterEach(cleanup);
const wrap = (ui: React.ReactElement, path = '/') => render(
  <HelmetProvider><BirthDateProvider><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></BirthDateProvider></HelmetProvider>,
);
const text = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.textContent || '';

describe('/numerology calculator', () => {
  it('date input is visible before any date is entered', () => {
    wrap(<NumerologyPage />);
    expect(document.querySelector('[data-testid="num-dob"]')).toBeTruthy();
    expect(document.querySelector('h1')?.textContent).toContain('Mulank, Bhagyank & Name Number');
  });
  it('22 Jun 1949 → Mulank 4, Bhagyank 6 + Western master number 33, Life Path 33 with working', () => {
    wrap(<NumerologyPage />);
    fireEvent.change(document.querySelector('[data-testid="num-dob"]')!, { target: { value: '1949-06-22' } });
    expect(text('num-mulank')).toContain('Mulank (Indian method)');
    expect(text('num-mulank')).toMatch(/4/);
    expect(text('num-bhagyank')).toContain('Bhagyank (Indian / Vedic method)');
    expect(text('num-bhagyank')).toContain('2 + 2 + 6 + 1 + 9 + 4 + 9 = 33 → 6');
    expect(text('num-western-master')).toMatch(/Western master number[^:]*: 33/);
    expect(text('num-lifepath')).toContain('Western Life Path');
    expect(text('num-lifepath')).toContain('22 + 6 + 5 = 33');
    expect(document.body.textContent).not.toContain('undefined');
  });
  it('15 Aug 1990 → no master label (Western Life Path is 6)', () => {
    wrap(<NumerologyPage />);
    fireEvent.change(document.querySelector('[data-testid="num-dob"]')!, { target: { value: '1990-08-15' } });
    expect(document.querySelector('[data-testid="num-western-master"]')).toBeNull();
    expect(text('num-bhagyank')).toContain('= 33 → 6');
  });
  it('optional name → Chaldean name number with compound meaning', () => {
    wrap(<NumerologyPage />);
    fireEvent.change(document.querySelector('[data-testid="num-name"]')!, { target: { value: 'Shah Rukh Khan' } });
    const t = text('num-name-result');
    expect(t).toContain('Name number (Chaldean, Indian method)');
    expect(t).toContain('42 — Like 24');
    expect(t).toMatch(/→ 42 → 6/);
  });
  it('an impossible date shows a message, not numbers', () => {
    wrap(<NumerologyPage />);
    fireEvent.change(document.querySelector('[data-testid="num-dob"]')!, { target: { value: '2023-02-30' } });
    expect(document.querySelector('[data-testid="num-results"]')).toBeNull();
  });
});

describe('/name-numerology — Chaldean first, Western tab', () => {
  const calc = (name: string) => {
    wrap(<NameNumerologyPage />);
    fireEvent.change(document.querySelector('input[type="text"]')!, { target: { value: name } });
    fireEvent.click(Array.from(document.querySelectorAll('button')).find(b => /Calculate/.test(b.textContent || ''))!);
  };
  it('defaults to the Chaldean name number with compound + meaning', () => {
    calc('Shah Rukh Khan');
    expect(text('chaldean-root')).toBe('6');
    expect(text('chaldean-compound')).toContain('42 — Like 24');
    expect(document.querySelector('[data-testid="western-panel"]')).toBeNull();
  });
  it('Western tab shows the shared Pythagorean Expression number', () => {
    calc('Shah Rukh Khan');
    fireEvent.click(document.querySelector('[data-testid="tab-western"]')!);
    const panel = text('western-panel');
    expect(panel).toContain(String(pythagoreanName('Shah Rukh Khan').number));
  });
  it('David Smith: name number 6 with a separate Western master number 33', () => {
    calc('David Smith');
    expect(text('chaldean-root')).toBe('6');
    expect(text('chaldean-master')).toMatch(/Western master number[^:]*: 33/);
  });
});

describe('/hi/numerology-by-date-of-birth — Hindi calculator', () => {
  it('has the shared calculator with Hindi labels', () => {
    wrap(<HindiNumerologyArticle />);
    fireEvent.change(document.querySelector('[data-testid="num-dob"]')!, { target: { value: '1973-03-28' } });
    expect(text('num-mulank')).toContain('मूलांक (भारतीय पद्धति)');
    expect(text('num-bhagyank')).toContain('भाग्यांक (भारतीय / वैदिक पद्धति)');
    expect(text('num-bhagyank')).toContain('= 33 → 6');
  });
  it('no "free" button points at the paid report; the paid link is labelled ₹199', () => {
    wrap(<HindiNumerologyArticle />);
    const paid = Array.from(document.querySelectorAll('a')).filter(a => (a.getAttribute('href') || '').includes('/birthday-report'));
    expect(paid.length).toBeGreaterThan(0);
    for (const a of paid) {
      expect(a.textContent).not.toContain('मुफ्त');
      expect(a.textContent).toContain('₹199');
    }
  });
});

describe('/numerology/1–9 — As Mulank N / As name number N', () => {
  it.each([1, 4, 7, 9])('/numerology/%i has both Indian readings', (n) => {
    wrap(<Routes><Route path="/numerology/:number" element={<NumerologyNumber />} /></Routes>, `/numerology/${n}`);
    expect(text('as-mulank')).toContain(`As Mulank ${n}`);
    expect(text('as-name-number')).toContain(`As name number ${n}`);
    expect(text('as-mulank')).not.toBe(text('as-name-number'));
  });
  it('master numbers have no Mulank section (Mulank is always 1–9)', () => {
    wrap(<Routes><Route path="/numerology/:number" element={<NumerologyNumber />} /></Routes>, '/numerology/11');
    expect(document.querySelector('[data-testid="as-mulank"]')).toBeNull();
  });
});

describe('live titles match scripts/prerender-titles.mjs for every numerology page', () => {
  const liveTitle = (file: string) => {
    const src = readFileSync(resolve(__dirname, '..', file), 'utf8');
    const m = src.match(/title="([^"]+)"/) || src.match(/const TITLE = '([^']+)'/);
    return m?.[1];
  };
  it.each([
    ['/numerology', 'NumerologyPage.tsx'],
    ['/name-numerology', 'NameNumerologyPage.tsx'],
    ['/chaldean-numerology', 'ChaldeanNumerologyPage.tsx'],
    ['/name-correction', 'NameCorrectionPage.tsx'],
    ['/business-name-numerology', 'BusinessNameNumerologyPage.tsx'],
    ['/mobile-number-numerology', 'MobileNumberNumerologyPage.tsx'],
    ['/house-number-numerology', 'HouseNumberNumerologyPage.tsx'],
    ['/attitude-number', 'AttitudeNumberPage.tsx'],
    ['/personal-year-number', 'PersonalYearNumberPage.tsx'],
    ['/articles/numerology-by-date-of-birth', 'articles/NumerologyArticle.tsx'],
    ['/hi/numerology-by-date-of-birth', 'articles/HindiNumerologyArticle.tsx'],
    ['/answers/what-is-my-life-path-number', 'answers/WhatIsMyLifePathNumber.tsx'],
    ['/articles/life-path-number-compatibility', 'articles/LifePathCompatibilityArticle.tsx'],
  ])('%s', (route, file) => {
    expect(liveTitle(file)).toBe((getTitleForRoute(route) as { title: string }).title);
  });
  it.each(NUMEROLOGY_DATA.map(d => d.number))('/numerology/%i', (n) => {
    const d = NUMEROLOGY_DATA.find(x => x.number === n)!;
    expect(d.seoTitle).toBe((getTitleForRoute(`/numerology/${n}`) as { title: string }).title);
  });
});
