// @vitest-environment jsdom
/**
 * Batch 10 tool pages: render, answer-first results, ONE FAQPage JSON-LD whose answers are
 * all visible in the HTML, live titles = scripts/prerender-titles.mjs, routes wired.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'fs';
import LoShuGridPage, { LO_SHU_META, LO_SHU_PATH } from '../LoShuGridPage';
import KuaNumberPage, { KUA_META, KUA_PATH } from '../KuaNumberPage';
import VehicleNumberNumerologyPage, { VEHICLE_META, VEHICLE_PATH } from '../VehicleNumberNumerologyPage';
import LoveCalculatorPage, { LOVE_META, LOVE_PATH } from '../LoveCalculatorPage';
import JanmaTithiPage, { JANMA_TITHI_META, JANMA_TITHI_PATH } from '../JanmaTithiPage';
import MarriageBiodataPage, { BIODATA_META, BIODATA_PATH } from '../MarriageBiodataPage';
import RashifalSign from '../RashifalSign';
import ZodiacToday from '../ZodiacToday';

const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');
const { getAllRoutes } = await import('../../../scripts/prerender-routes.mjs');

afterEach(cleanup);
const wrap = (ui: React.ReactElement, path = '/') => render(
  <HelmetProvider><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></HelmetProvider>,
);
const text = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.textContent || '';

function faqChecks() {
  const lds = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => JSON.parse(s.textContent || '{}')).filter(j => j['@type'] === 'FAQPage');
  expect(lds).toHaveLength(1);
  const body = document.body.textContent || '';
  for (const q of lds[0].mainEntity) {
    expect(body).toContain(q.name);
    expect(body).toContain(q.acceptedAnswer.text);
  }
}

const PAGES = [
  { path: LO_SHU_PATH, meta: LO_SHU_META, el: <LoShuGridPage /> },
  { path: KUA_PATH, meta: KUA_META, el: <KuaNumberPage /> },
  { path: VEHICLE_PATH, meta: VEHICLE_META, el: <VehicleNumberNumerologyPage /> },
  { path: LOVE_PATH, meta: LOVE_META, el: <LoveCalculatorPage /> },
  { path: JANMA_TITHI_PATH, meta: JANMA_TITHI_META, el: <JanmaTithiPage /> },
  { path: BIODATA_PATH, meta: BIODATA_META, el: <MarriageBiodataPage /> },
];

describe('Batch 10 pages: titles, routes, FAQ', () => {
  it('prerender titles/descriptions equal the live page constants; routes prerendered + wired', async () => {
    const routes: string[] = await getAllRoutes();
    const app = readFileSync('src/App.tsx', 'utf8');
    for (const p of PAGES) {
      expect(getTitleForRoute(p.path)).toEqual({ title: p.meta.title, description: p.meta.description });
      expect(routes).toContain(p.path);
      expect(app).toContain(`path="${p.path}"`);
      expect(p.meta.title.length).toBeLessThanOrEqual(70);
    }
  });
  for (const p of PAGES) {
    it(`${p.path}: H1, one FAQPage JSON-LD with visible answers, method & sources`, () => {
      wrap(p.el, p.path);
      expect(document.querySelector('h1')?.textContent).toBeTruthy();
      faqChecks();
      expect(document.querySelector('[data-testid$="-sources"]')).toBeTruthy();
      // Pricing wording ("free"/"paid") is the founder's call: none in the new copy.
      expect(`${p.meta.title} ${p.meta.description} ${text(`${document.querySelector('[data-testid$="-faq"]')?.getAttribute('data-testid')}`)}`).not.toMatch(/\bfree\b/i);
    });
  }
});

describe('calculators', () => {
  it('Lo Shu: 15 Aug 1982 → grid, missing 3 4 6 7, Will plane complete', () => {
    wrap(<LoShuGridPage />);
    fireEvent.change(document.querySelector('[data-testid="ls-dob"]')!, { target: { value: '1982-08-15' } });
    expect(text('ls-cell-1')).toContain('11');
    expect(text('ls-cell-3')).toContain('missing');
    expect(text('ls-answer')).toContain('3, 4, 6, 7');
    expect(text('ls-plane-will')).toContain('Complete');
  });
  it('Kua: woman 15 Jul 1990 → 8, West group, wealth South-west', () => {
    wrap(<KuaNumberPage />);
    fireEvent.change(document.querySelector('[data-testid="kua-dob"]')!, { target: { value: '1990-07-15' } });
    fireEvent.click(document.querySelector('[data-testid="kua-female"]')!);
    expect(text('kua-number')).toBe('8');
    expect(text('kua-answer')).toContain('West group');
    expect(text('kua-directions')).toContain('South-west');
    expect(text('kua-working')).toContain('Kua 5 is not used');
  });
  it('Kua: January birth uses the previous solar year', () => {
    wrap(<KuaNumberPage />);
    fireEvent.change(document.querySelector('[data-testid="kua-dob"]')!, { target: { value: '2000-01-20' } });
    fireEvent.click(document.querySelector('[data-testid="kua-male"]')!);
    expect(text('kua-number')).toBe('1');
    expect(text('kua-working')).toContain('Solar year used: 1999');
  });
  it('Vehicle: MH 12 PK 4521 → all digits 15 → 6; full plate 34 → 7; Mulank harmony', () => {
    wrap(<VehicleNumberNumerologyPage />);
    fireEvent.change(document.querySelector('[data-testid="vn-input"]')!, { target: { value: 'MH 12 PK 4521' } });
    fireEvent.change(document.querySelector('[data-testid="vn-day"]')!, { target: { value: '24' } });
    fireEvent.click(document.querySelector('[data-testid="vn-calc"]')!);
    expect(text('vn-main')).toContain('= 15 → 6');
    expect(text('vn-full')).toContain('= 34 → 7');
    expect(text('vn-last')).toContain('4 + 5 + 2 + 1 = 12 → 3');
    expect(text('vn-harmony')).toMatch(/Mulank.*6: Same as your Mulank/);
  });
  it('Love: deterministic, framed as fun, links to real Kundali matching', () => {
    wrap(<LoveCalculatorPage />);
    fireEvent.change(document.querySelector('[data-testid="love-a"]')!, { target: { value: 'Shah Rukh Khan' } });
    fireEvent.change(document.querySelector('[data-testid="love-b"]')!, { target: { value: 'Gauri Khan' } });
    fireEvent.click(document.querySelector('[data-testid="love-go"]')!);
    const first = text('love-result');
    fireEvent.click(document.querySelector('[data-testid="love-go"]')!);
    expect(text('love-result')).toBe(first);
    expect(text('love-side-a')).toContain('Chaldean total 42 → 6');
    expect(document.querySelector('[data-testid="love-real"] a[href="/kundali-match"]')).toBeTruthy();
    expect(document.body.textContent).toContain('not an astrology prediction');
  });
  it('Janma Tithi: form with optional time, celebration place and the stated rules', () => {
    wrap(<JanmaTithiPage />);
    expect(document.querySelector('[data-testid="jt-dob"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="jt-notime"]')).toBeTruthy();
    expect(text('jt-rules')).toContain('vriddhi');
    expect(text('jt-rules')).toContain('Adhik Maas');
    expect((document.querySelector('[data-testid="jt-go"]') as HTMLButtonElement).disabled).toBe(true);
  });
  it('Biodata: privacy note, live preview updates, Hindi labels, horoscope needs time + place', () => {
    wrap(<MarriageBiodataPage />);
    expect(text('bd-privacy')).toContain('stay in this browser tab');
    fireEvent.change(document.querySelector('[data-testid="bd-fullName"]')!, { target: { value: 'Asha Verma' } });
    const iframe = () => document.querySelector('[data-testid="bd-preview"] iframe') as HTMLIFrameElement;
    expect(iframe().getAttribute('srcdoc')).toContain('Asha Verma');
    fireEvent.change(document.querySelector('[data-testid="bd-lang"]')!, { target: { value: 'hi' } });
    expect(iframe().getAttribute('srcdoc')).toContain('विवाह परिचय');
    fireEvent.click(document.querySelector('[data-testid="bd-fill-horo"]')!);
    expect(text('bd-horo-msg')).toContain('exact birth time');
  });
});

describe('tomorrow views render their own page', () => {
  it('/rashifal/mesh/tomorrow: Tomorrow tab active, tomorrow note, links to today', () => {
    wrap(<Routes><Route path="/rashifal/:rashi/:period" element={<RashifalSign />} /></Routes>, '/rashifal/mesh/tomorrow');
    expect(document.querySelector('h1')?.textContent).toContain('Mesh Rashifal Tomorrow');
    expect(document.querySelector('[data-testid="rashifal-periods"] a.bg-primary')?.textContent).toBe('Tomorrow');
    expect(text('rashifal-tomorrow-note')).toContain('tomorrow');
  });
  it('/zodiac/leo/tomorrow: own H1 and day tabs', () => {
    wrap(<Routes><Route path="/zodiac/:sign/tomorrow" element={<ZodiacToday when="tomorrow" />} /></Routes>, '/zodiac/leo/tomorrow');
    expect(document.querySelector('h1')?.textContent).toContain('Leo Horoscope Tomorrow');
    expect(text('horoscope-days')).toContain('Today');
  });
});
