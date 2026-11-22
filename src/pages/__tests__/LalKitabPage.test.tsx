// @vitest-environment jsdom
/**
 * B18 — /lal-kitab and /hi/lal-kitab: titles shared with the prerender, routes registered,
 * the carried birth details render the Lal Kitab chart from the real /api/kundali handler, the
 * guide carries one FAQPage, and /kundali links here with the same birth details.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LalKitabPage from '../LalKitabPage';
import { GET as kundaliGET } from '../../../api/kundali';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { lalKitabFaq } from '@/content/guides/LalKitabGuide';

const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');
const { getAllRoutes } = await import('../../../scripts/prerender-routes.mjs');
const { sectionOf } = await import('../../../scripts/lib/sitemap.mjs');

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);
const wrap = (el: React.ReactNode, path: string) =>
  render(<HelmetProvider><MemoryRouter initialEntries={[path]}>{el}</MemoryRouter></HelmetProvider>);

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function stubKundaliApi() {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('/api/kundali')) return kundaliGET(new Request(`http://localhost${url}`));
    return new Response(JSON.stringify({}), { status: 200 });
  }));
}
// 13 May 1978, 19:30 IST, Jammu (carried from /kundali).
const CARRIED = '?dob=1978-05-13&time=19:30&place=Jammu&lat=32.7266&lon=74.857&tz=5.5';

describe('meta, routes and sitemap', () => {
  it.each([['/lal-kitab'], ['/hi/lal-kitab']])('%s', async route => {
    const m = GUIDE_META[route];
    expect(Array.from(m.title).length).toBeLessThanOrEqual(60);
    expect(getTitleForRoute(route)).toMatchObject({ title: m.title, description: m.description });
    expect(await getAllRoutes()).toContain(route);
  });
  it('titles use the searched words', () => {
    expect(GUIDE_META['/lal-kitab'].title).toMatch(/^Lal Kitab Kundli — Free/);
    expect(GUIDE_META['/hi/lal-kitab'].title).toMatch(/^लाल किताब कुंडली/);
  });
  it('sitemap sections', () => {
    expect(sectionOf('/lal-kitab')).toBe('vedic');
    expect(sectionOf('/hi/lal-kitab')).toBe('hindi');
  });
});

describe('/lal-kitab', () => {
  it('renders the H1, the form and the guide with one FAQPage before any input', () => {
    wrap(<LalKitabPage />, '/lal-kitab/');
    expect(document.querySelector('h1')?.textContent).toBe(GUIDE_META['/lal-kitab'].h1);
    expect(q('lk-form')).not.toBeNull();
    expect(q('guide-lal-kitab')).not.toBeNull();
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent || '{}'));
    const faq = ld.filter(d => d['@type'] === 'FAQPage');
    expect(faq).toHaveLength(1);
    expect(faq[0].mainEntity).toHaveLength(lalKitabFaq('en').length);
  });

  it('carried birth details → the Lal Kitab chart, readings, Rin and Varshphal', async () => {
    stubKundaliApi();
    wrap(<LalKitabPage />, `/lal-kitab/${CARRIED}`);
    await waitFor(() => expect(q('lk-result')).not.toBeNull(), { timeout: 20_000 });
    const rows = [...document.querySelectorAll('[data-testid="lk-planet-table"] tbody tr')];
    expect(rows).toHaveLength(9);
    const house = (p: string) => document.querySelector(`[data-planet="${p}"] td:nth-child(2)`)?.textContent;
    expect(house('Saturn')).toBe('10');
    expect(house('Ketu')).toBe('5');
    expect(document.querySelectorAll('[data-testid="lk-reading"]')).toHaveLength(9);
    expect(q('lk-rin-atma')).not.toBeNull();
    expect(q('lk-sleeping-count')?.textContent).toBe('5');
    expect(q('lk-varshphal')).not.toBeNull();
    expect(q('lk-remedies')?.textContent).toMatch(/40–43 days/);
    expect(q('lk-download-pdf')).not.toBeNull();
  }, 30_000);
});

describe('/hi/lal-kitab', () => {
  it('Hindi H1, Hindi form labels and the Hindi FAQ', async () => {
    stubKundaliApi();
    wrap(<LalKitabPage lang="hi" />, `/hi/lal-kitab/${CARRIED}`);
    expect(document.querySelector('h1')?.textContent).toBe('लाल किताब कुंडली — मुफ़्त चार्ट और उपाय');
    expect(q('lk-form')?.textContent).toContain('जन्म तिथि');
    expect(q('guide-hi-lal-kitab')).not.toBeNull();
    await waitFor(() => expect(q('lk-result')).not.toBeNull(), { timeout: 20_000 });
    expect(q('lk-rin-atma')?.textContent).toContain('आत्म');
  }, 30_000);
});

describe('PDF', () => {
  it('builds a printable Lal Kitab Kundli in both languages', async () => {
    const { buildLalKitabPdfHtml } = await import('@/lib/pdf/lalKitabPdfHtml');
    const { buildLalKitabChart, lalKitabVarshphal } = await import('@/lib/vedic/lalKitab');
    const planets = [{ name: 'Sun', house: 6 }, { name: 'Moon', house: 9 }, { name: 'Ketu', house: 5 }, { name: 'Rahu', house: 11 }];
    const chart = buildLalKitabChart(planets);
    const en = buildLalKitabPdfHtml(chart, lalKitabVarshphal(planets, 49), { name: 'Asha', dob: '1978-05-13', time: '19:30', place: 'Jammu' });
    expect(en).toContain('Asha’s Lal Kitab Kundli');
    expect(en).toContain('data-testid="lk-pdf-chart"');
    expect(en).toContain('Atma (Swa) Rin');
    expect(en).toContain('year 49 of life');
    const hi = buildLalKitabPdfHtml(chart, null, { lang: 'hi' });
    expect(hi).toContain('<html lang="hi">');
    expect(hi).toContain('लाल किताब कुंडली');
  });
});
