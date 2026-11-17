// @vitest-environment jsdom
/**
 * B14 — the 2027 pages: every sign page's text is unique and driven by the computed data,
 * the Hindi pages are Hindi (lang="hi", Devanagari), the readings follow the tone rules,
 * and the new files carry no hard-coded hex colours.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { computeYearReading, type System, type YearReading } from '../reading';
import type { Lang } from '../text';
import { pageLangForPath } from '@/lib/seo/pageLang.js';
import { year2027Routes } from '../meta.js';
import YearForecastPage from '@/pages/year2027/YearForecastPage';
import FestivalDatePage from '@/pages/year2027/FestivalDatePage';

afterEach(() => cleanup());

const textOf = (r: YearReading) => [r.headline, ...r.brief, ...r.areas.flatMap(a => [a.impact, ...a.reasons, a.todo]),
  ...r.months.map(m => `${m.verdict}. ${m.text}`), ...r.best.map(w => w.why), ...r.challenging.map(w => w.why),
  r.saturn.text, ...r.eclipses.map(e => e.text), r.lucky.text, ...r.faq.flatMap(f => [f.question, f.answer])].join('\n');
const sentences = (t: string) => new Set(t.split(/(?<=[.।!?])\s+|\n/).map(s => s.trim()).filter(s => s.length > 25));
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

const SETS: Array<[System, Lang]> = [['vedic', 'en'], ['vedic', 'hi'], ['western', 'en']];

describe.each(SETS)('B14 — %s / %s yearly pages', (system, lang) => {
  const readings = Array.from({ length: 12 }, (_, i) => computeYearReading(i, system, lang));
  const texts = readings.map(textOf);

  it('every sign page has its own text (no two pages share most sentences)', () => {
    expect(new Set(texts).size).toBe(12);
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const a = sentences(texts[i]), b = sentences(texts[j]);
        const shared = [...a].filter(s => b.has(s)).length;
        expect(shared / Math.min(a.size, b.size), `${i} vs ${j}`).toBeLessThan(0.35);
      }
    }
  });

  it('each page is long enough to be a real yearly forecast', () => {
    for (const t of texts) expect(words(t)).toBeGreaterThan(1300);
  });

  it('has 12 months, life areas, windows, eclipses and 6–8 FAQs', () => {
    for (const r of readings) {
      expect(r.months).toHaveLength(12);
      expect(r.areas.map(a => a.key)).toEqual(['love', 'career', 'money', 'health']);
      expect(r.best.length).toBeGreaterThan(0);
      expect(r.challenging.length).toBeGreaterThan(0);
      expect(r.eclipses).toHaveLength(5);
      expect(r.faq.length).toBeGreaterThanOrEqual(6);
      expect(r.faq.length).toBeLessThanOrEqual(8);
      for (const w of [...r.best, ...r.challenging]) expect(w.from <= w.to && w.from.startsWith('2027')).toBe(true);
    }
  });

  it('never states harmful predictions or claims science', () => {
    const all = texts.join('\n').toLowerCase();
    for (const bad of ['death', 'die ', 'accident', 'disease', 'illness', 'surgery', 'divorce', 'scientifically', 'guaranteed', 'मृत्यु', 'दुर्घटना', 'बीमारी']) {
      expect(all.includes(bad), bad).toBe(false);
    }
  });

  if (lang === 'hi') {
    it('Hindi text is in Devanagari', () => {
      for (const t of texts) {
        const deva = (t.match(/[\u0900-\u097F]/g) ?? []).length;
        const latin = (t.match(/[A-Za-z]/g) ?? []).length;
        expect(deva).toBeGreaterThan(latin * 5);
      }
    });
  }
});

describe('B14 — Vedic facts are computed', () => {
  it('Sade Sati in 2027 follows Saturn (Meena → Mesha → Meena)', () => {
    const status = Array.from({ length: 12 }, (_, i) => computeYearReading(i, 'vedic', 'en').saturn.status);
    // Saturn in Meena (11) and Mesha (0) in 2027: Sade Sati for Kumbha (10), Meena (11), Mesha (0), Vrishabha (1).
    expect(status[10]).toBe('sadeSati');
    expect(status[11]).toBe('sadeSati');
    expect(status[0]).toBe('sadeSati');
    expect(status[1]).toBe('sadeSati');
    // Dhaiya: Saturn 4th / 8th from the Moon — Mithuna? no; Simha (8th = Meena), Dhanu (4th = Meena), Kanya (8th = Mesha), Makara (4th = Mesha).
    expect(status[4]).toBe('dhaiya');
    expect(status[8]).toBe('dhaiya');
    expect(status[5]).toBe('dhaiya');
    expect(status[9]).toBe('dhaiya');
  });
});

describe('B14 — rendered pages', () => {
  const renderAt = (url: string, pattern: string, el: React.ReactNode) =>
    render(<HelmetProvider><MemoryRouter initialEntries={[url]}><Routes><Route path={pattern} element={el} /></Routes></MemoryRouter></HelmetProvider>);

  it('Hindi rashifal 2027 page renders in Hindi (lang="hi") with its H1', () => {
    const { container } = renderAt('/hi/rashifal/mesha/2027', '/hi/rashifal/:sign/2027', <YearForecastPage system="vedic" lang="hi" />);
    expect(container.querySelector('section[lang="hi"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="year2027-h1"]')?.textContent).toBe('मेष राशिफल 2027 — वार्षिक भविष्यफल');
    expect(container.querySelector('[data-testid="year2027-lang-switch"]')?.getAttribute('href')).toMatch(/^\/rashifal\/mesh\/2027/);
    expect(container.querySelectorAll('[data-testid="year2027-months"] h3')).toHaveLength(12);
  });

  it('every Hindi 2027 URL declares lang hi', () => {
    for (const r of year2027Routes().filter(x => x.startsWith('/hi/'))) expect(pageLangForPath(r)).toBe('hi');
    for (const r of year2027Routes().filter(x => !x.startsWith('/hi/'))) expect(pageLangForPath(r)).toBe('en');
  });

  it('Hindi festival page renders in Hindi with the engine date', () => {
    const { container } = renderAt('/hi/festivals/2027/diwali', '/hi/festivals/2027/:slug', <FestivalDatePage lang="hi" />);
    expect(container.querySelector('section[lang="hi"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="festival2027-date"]')?.getAttribute('data-date')).toBe('2027-10-29');
    expect(container.textContent).not.toMatch(/\{d:/);
  });

  it('English Vedic page links to the other 11 rashis and to Hindi', () => {
    const { container } = renderAt('/rashifal/kumbh/2027', '/rashifal/:sign/2027', <YearForecastPage system="vedic" />);
    expect(container.querySelectorAll('[data-testid="year2027-others"] a')).toHaveLength(11);
    expect(container.querySelector('[data-testid="year2027-lang-switch"]')?.getAttribute('href')).toMatch(/^\/hi\/rashifal\/kumbha\/2027/);
    expect(container.querySelector('[data-testid="jsonld-year2027-faq"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="jsonld-year2027-article"]')?.textContent).toMatch(/dateModified/);
  });
});

describe('B14 — no hard-coded hex colours in the new files', () => {
  const ROOT = path.resolve(__dirname, '../../../..');
  const files = [
    ...readdirSync(path.join(ROOT, 'src/pages/year2027')).map(f => `src/pages/year2027/${f}`),
    ...readdirSync(path.join(ROOT, 'src/lib/year2027')).filter(f => /\.(ts|tsx|js)$/.test(f)).map(f => `src/lib/year2027/${f}`),
  ];
  it.each(files)('%s', f => {
    expect(readFileSync(path.join(ROOT, f), 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?![\w-])/);
  });
});
