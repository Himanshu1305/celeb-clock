// @vitest-environment jsdom
/**
 * B18 — the eight regional languages (ta, te, bn, mr, gu, kn, ml, pa): vocabulary + copy
 * completeness, routes in sync across App / Worker / prerender / sitemap, hreflang
 * clusters, <html lang>, daily injection on a regional Rashifal page, the visible note.
 */
import { describe, it, expect, afterEach, vi, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  VOCAB, LANGS, LANG_CODES, LANG_RASHI_SLUGS, langRoutes, langRoutePatterns, langMetaFor, hreflangCluster,
  isLangRoute, regionalLangOf, switchTarget, describePath, routesForLang, langPaths,
} from '../registry.js';
import { COPY } from '../copy';
import { composeYearLang } from '../year';
import { pageLangForPath, REGIONAL_LANGS } from '@/lib/seo/pageLang.js';
import { DAILY_PAGES, dailyFilePath, matchDailyRoute, allDailyRoutes } from '@/lib/daily/registry';
import { DAILY_DATA_COMPUTERS, computeDaily } from '@/lib/daily/compute';
import { entryFromMonthFile } from '@/lib/daily/templates';
import { renderDailyBodyHtml } from '@/lib/daily/render';
import { addDaysISO } from '@/lib/daily/dates';
import { applyDailyContent } from '../../../../functions/daily';
import type { DailyMonthFile } from '@/lib/daily/types';
import type { LangCode } from '../types';
import LangLandingPage from '@/pages/lang/LangLandingPage';
import LangRashifalPage from '@/pages/lang/LangRashifalPage';
import LangYearPage from '@/pages/lang/LangYearPage';
import LangKundaliPage from '@/pages/lang/LangKundaliPage';

afterEach(() => cleanup());

/** Every string reachable in a value (functions are skipped — they are exercised below). */
function strings(x: unknown, path = ''): Array<[string, string]> {
  if (typeof x === 'string') return [[path, x]];
  if (Array.isArray(x)) return x.flatMap((y, i) => strings(y, `${path}[${i}]`));
  if (x && typeof x === 'object') return Object.entries(x).flatMap(([k, y]) => strings(y, `${path}.${k}`));
  return [];
}
const BAD = /undefined|NaN|\[object |null\b/;

describe('B18 — vocabulary packs are complete', () => {
  const ref = VOCAB.ta;
  it.each(LANG_CODES)('%s: every list has the right length and nothing is empty', code => {
    const v = VOCAB[code];
    expect(v.code).toBe(code);
    expect(v.rashis).toHaveLength(12);
    expect(v.nakshatras).toHaveLength(27);
    expect(v.houses).toHaveLength(13);
    expect(v.housesIn).toHaveLength(13);
    expect(v.houseAreas).toHaveLength(13);
    expect(v.varas).toHaveLength(7);
    expect(v.yogas).toHaveLength(27);
    expect(v.karanas).toHaveLength(11);
    expect(v.months).toHaveLength(12);
    expect(v.regionalMonths).toHaveLength(12);
    expect(v.taras).toHaveLength(10);
    for (const k of ['grahas', 'tithis', 'paksha', 'choghadiya', 'doshas', 'kootas', 'colours', 'toneWord', 'ui'] as const)
      expect(Object.keys(v[k]).sort(), `${code}.${k}`).toEqual(Object.keys(ref[k]).sort());
    for (const c of [...LANGS.find(l => l.code === code)!.cities, 'delhi']) expect(v.cities[c], `${code} city ${c}`).toBeTruthy();
    for (const [p, s] of strings(v)) if (!/^\.(houses|housesIn|houseAreas|taras)\[0\]$/.test(p)) expect(s.trim(), `${code}${p}`).not.toBe('');
    // native script, not Latin, for the rashi names
    for (const r of v.rashis) expect(/[a-z]/i.test(r), `${code} ${r}`).toBe(false);
  });

  it.each(LANG_CODES)('%s: page copy is complete and has 5–6 FAQs per page', code => {
    const cp = COPY[code];
    expect(cp, code).toBeTruthy();
    for (const [p, s] of strings(cp)) if (p !== '.year2027.houseTip[0]') expect(s.trim(), `${code}${p}`).not.toBe('');
    for (const f of [cp.landing.faq, cp.rashifal.faq, cp.year.faq, cp.kundali.faq]) {
      expect(f.length).toBeGreaterThanOrEqual(5);
      expect(f.length).toBeLessThanOrEqual(6);
    }
  });

  it.each(LANG_CODES)('%s: the 2027 view composes for all 12 rashis without gaps', code => {
    for (let i = 0; i < 12; i++) {
      const y = composeYearLang(code, VOCAB[code], COPY[code], i);
      for (const [p, s] of strings(y)) expect(s, `${code} ${i}${p}`).not.toMatch(BAD);
      expect(y.months).toHaveLength(12);
      expect(y.faq.length).toBeGreaterThanOrEqual(5);
    }
  });

  it.each(LANG_CODES)('%s: daily Rashifal + Panchang entries compose without gaps', code => {
    for (const date of ['2026-11-22', '2027-04-14']) {
      for (const slug of LANG_RASHI_SLUGS) {
        const e = computeDaily(`rashifal-${code}`, date, slug);
        for (const [p, s] of strings(e)) expect(s, `${code} ${slug}${p}`).not.toMatch(BAD);
        expect(e.faq.length).toBeGreaterThan(0);
      }
      for (const slug of ['index', ...LANGS.find(l => l.code === code)!.cities]) {
        const e = computeDaily(`panchang-${code}`, date, slug);
        for (const [p, s] of strings(e)) expect(s, `${code} ${slug}${p}`).not.toMatch(BAD);
      }
    }
  });

  it('copy rules: no "scientifically", no fear/selling words in any language', () => {
    for (const code of LANG_CODES) {
      const all = [...strings(VOCAB[code]), ...strings(COPY[code])].map(x => x[1]).join('\n');
      expect(all).not.toMatch(/scientifically|validated|guarantee[ds]? results/i);
    }
  });
});

describe('B18 — routes in sync: App, Worker, prerender, sitemap', () => {
  const routes = langRoutes();
  it('has the expected pages per language and no duplicates', () => {
    expect(new Set(routes).size).toBe(routes.length);
    for (const l of LANGS) expect(routesForLang(l)).toHaveLength(1 + 13 + 13 + 1 + l.cities.length + 1);
    expect(routes).toHaveLength(LANGS.reduce((n, l) => n + 29 + l.cities.length, 0));
  });

  it('every route is a regional route that round-trips through describePath', () => {
    for (const r of routes) {
      expect(isLangRoute(r), r).toBe(true);
      expect(isLangRoute(`${r}/`), r).toBe(true);
      expect(regionalLangOf(r)).toBe(r.split('/')[1]);
      expect(describePath(r)?.lang, r).toBe(r.split('/')[1]);
    }
    for (const bad of ['/ta/rasi-palan/notarashi', '/ta/panchangam/delhi', '/ta/panchangam/kolkata', '/bn/rashifal/mesh/2026', '/ml/x', '/ta/rashifal'])
      expect(isLangRoute(bad), bad).toBe(false);
  });

  it('App.tsx builds its routes from langRoutePatterns; every route matches a pattern', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    expect(app).toMatch(/langRoutePatterns/);
    const toRe = (p: string) => new RegExp(`^${p.replace(/:[a-z]+/g, '[a-z-]+')}$`);
    const pats = LANGS.flatMap(l => langRoutePatterns(l).map(p => toRe(p.path)));
    for (const r of routes) expect(pats.some(re => re.test(r)), r).toBe(true);
  });

  it('the Worker serves regional pages (200, html lang) and 404s invalid regional paths', async () => {
    const worker = (await import('../../../../functions/_worker')).default;
    const env = { ASSETS: { fetch: async (req: Request) => {
      const p = new URL(req.url).pathname;
      if (p.startsWith('/daily/')) return new Response('nope', { status: 404 });
      return new Response('<!doctype html><html lang="en"><head><title>x</title></head><body><div id="root"></div></body></html>', { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    } } };
    for (const p of ['/ta/', '/bn/panjika/kolkata/', '/ml/rashiphalam/meen/2027/', '/pa/kundali-milan/', '/kn/rashi-bhavishya-2027/']) {
      const res = await worker.fetch(new Request(`https://bornclock.com${p}`), env as never, {});
      expect(res.status, p).toBe(200);
      expect(await res.text(), p).toContain(`<html lang="${p.split('/')[1]}"`);
    }
    for (const p of ['/ta/rasi-palan/zzz/', '/te/panchangam/chennai/', '/gu/nothing/']) {
      const res = await worker.fetch(new Request(`https://bornclock.com${p}`), env as never, {});
      expect(res.status, p).toBe(404);
    }
  }, 60_000);

  it('every route is prerendered with its native title, and the sitemap puts it in "languages"', async () => {
    const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
    const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
    const { sectionOf } = await import('../../../../scripts/lib/sitemap.mjs');
    const all = new Set<string>(await getAllRoutes());
    const titles = new Set<string>();
    for (const r of routes) {
      expect(all.has(r), r).toBe(true);
      const meta = langMetaFor(r)!;
      expect(meta, r).toBeTruthy();
      expect(getTitleForRoute(r)?.title, r).toBe(meta.title);
      expect(titles.has(meta.title), `${r} title is unique`).toBe(false);
      titles.add(meta.title);
      expect(meta.description.length, r).toBeGreaterThan(50);
      expect(sectionOf(r), r).toBe('languages');
    }
  }, 60_000);

  it('the daily registry covers exactly the regional Rashifal + Panchang pages', () => {
    const daily = new Set(allDailyRoutes());
    for (const l of LANGS) {
      const q = langPaths(l);
      LANG_RASHI_SLUGS.forEach((_, i) => expect(daily.has(q.rashifal(i))).toBe(true));
      expect(daily.has(q.panchang(null))).toBe(true);
      for (const c of l.cities) expect(daily.has(q.panchang(c))).toBe(true);
      expect(daily.has(q.rashifalHub)).toBe(false);
      expect(daily.has(q.year(0))).toBe(false);
    }
  });
});

describe('B18 — hreflang clusters and <html lang>', () => {
  it('clusters are reciprocal, include self, and x-default points at English when it exists', () => {
    for (const r of langRoutes()) {
      const c = hreflangCluster(r);
      const self = `https://bornclock.com${r}/`;
      expect(c.find(x => x.lang === r.split('/')[1])?.url, r).toBe(self);
      for (const x of c.filter(y => y.lang !== 'x-default')) {
        const path = x.url.replace('https://bornclock.com', '').replace(/\/$/, '') || '/';
        expect(hreflangCluster(path), `${r} → ${x.url}`).toEqual(c);
      }
      const en = c.find(x => x.lang === 'en');
      if (en) expect(c.find(x => x.lang === 'x-default')?.url).toBe(en.url);
      expect(new Set(c.map(x => x.lang)).size).toBe(c.length);
    }
  });
  it('the Mesh daily cluster spans en, hi and all eight languages', () => {
    const c = hreflangCluster('/ta/rasi-palan/mesh');
    expect(c.map(x => x.lang)).toEqual(['en', 'hi', ...LANG_CODES, 'x-default']);
    expect(c[0].url).toBe('https://bornclock.com/rashifal/mesh/today/');
    expect(c[1].url).toBe('https://bornclock.com/hi/rashifal/mesha/');
  });
  it('the switcher falls back to the landing page when no equivalent exists', () => {
    expect(switchTarget('/ml/panchangam/kochi', 'ta')).toBe('/ta');
    expect(switchTarget('/ml/panchangam/kochi', 'en')).toBe('/');
    expect(switchTarget('/about', 'bn')).toBe('/bn');
    expect(switchTarget('/panchang/chennai', 'ta')).toBe('/ta/panchangam/chennai');
  });
  it('pageLang gives the regional code', () => {
    expect([...REGIONAL_LANGS].sort()).toEqual([...LANG_CODES].sort());
    for (const r of langRoutes()) expect(pageLangForPath(r), r).toBe(r.split('/')[1]);
    expect(pageLangForPath('/rashifal')).toBe('en');
  });
});

describe('B18 — daily injection on a regional Rashifal page', () => {
  const files: Record<string, unknown> = {};
  const add = (kind: string, pageSlug: string) => {
    const def = DAILY_PAGES.find(d => d.kind === kind)!;
    const ds = def.data!.slug(pageSlug);
    const data: Record<string, unknown> = {};
    for (let d = '2026-11-01'; d.startsWith('2026-11'); d = addDaysISO(d, 1)) data[d] = DAILY_DATA_COMPUTERS[def.data!.kind](d, ds);
    const file: DailyMonthFile = { kind: def.data!.kind, slug: ds, month: '2026-11', data };
    files[dailyFilePath(def, pageSlug, '2026-11')] = file;
    return file;
  };
  const fTa = add('rashifal-ta', 'mesh');
  const fBn = add('panchang-bn', 'howrah'); // (the Worker test above already loaded Kolkata's month: loadMonth caches it)
  const assets = { fetch: async (req: Request) => {
    const p = new URL(req.url).pathname;
    return files[p] ? new Response(JSON.stringify(files[p]), { headers: { 'content-type': 'application/json' } }) : new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } });
  } };
  const shell = `<html lang="ta"><head><title>x</title></head><body><h1><span data-daily="h1">x</span></h1><span data-daily="date">x</span><div data-daily="body"><p>old</p></div><script type="application/ld+json" data-daily="jsonld">{}</script></body></html>`;

  it('/ta/rasi-palan/mesh gets the day’s Tamil entry; the next day differs', async () => {
    const r = await applyDailyContent('/ta/rasi-palan/mesh/', shell, assets, 'https://bornclock.com', new Date('2026-11-12T06:00:00Z'));
    expect(r?.kind).toBe('rashifal-ta');
    expect(r?.date).toBe('2026-11-12');
    const m = matchDailyRoute('/ta/rasi-palan/mesh')!;
    const e = entryFromMonthFile(m.def, m.slug, '2026-11-12', fTa)!;
    expect(r!.html).toContain(renderDailyBodyHtml(e));
    expect(r!.html).toContain(e.h1);
    expect(r!.html).toMatch(/[஀-௿]/); // Tamil script
    expect(r!.html).not.toContain('<p>old</p>');
    expect(r!.html).toContain('"inLanguage":"ta-IN"');
    const r2 = await applyDailyContent('/ta/rasi-palan/mesh', shell, assets, 'https://bornclock.com', new Date('2026-11-13T06:00:00Z'));
    expect(r2!.html).not.toBe(r!.html);
  });

  it('/bn/panjika/howrah gets the day’s Bengali Panchang', async () => {
    const r = await applyDailyContent('/bn/panjika/howrah/', shell, assets, 'https://bornclock.com', new Date('2026-11-12T06:00:00Z'));
    const m = matchDailyRoute('/bn/panjika/howrah')!;
    const e = entryFromMonthFile(m.def, m.slug, '2026-11-12', fBn)!;
    expect(r!.html).toContain(renderDailyBodyHtml(e));
    expect(r!.html).toMatch(/[ঀ-৿]/);
  });
});

describe('B18 — pages render native H1, intro and the visible note', () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })));
  afterAll(() => vi.unstubAllGlobals());
  const mount = (url: string, pattern: string, el: JSX.Element) =>
    render(<HelmetProvider><MemoryRouter initialEntries={[url]}><Routes><Route path={pattern} element={el} /></Routes></MemoryRouter></HelmetProvider>);

  it.each(LANG_CODES)('%s: landing, Rashifal hub, 2027 page and Kundali page', (code: LangCode) => {
    const l = LANGS.find(x => x.code === code)!;
    const q = langPaths(l);
    const pats = Object.fromEntries(langRoutePatterns(l).map(p => [p.page, p.path]));
    const cases: Array<[string, string, JSX.Element]> = [
      [q.landing, pats.landing, <LangLandingPage code={code} />],
      [q.rashifalHub, pats.rashifalHub, <LangRashifalPage code={code} />],
      [q.year(4), pats.year, <LangYearPage code={code} />],
      [q.kundali, pats.kundali, <LangKundaliPage code={code} />],
    ];
    for (const [url, pattern, el] of cases) {
      const { getByTestId, unmount } = mount(url, pattern, el);
      const note = getByTestId('lang-note');
      expect(note.querySelector('a[href^="/contact"]'), url).toBeTruthy();
      expect(note.textContent, url).toContain('BornClock');
      expect(getByTestId('lang-h1').textContent?.trim(), url).toBeTruthy();
      expect(/[a-z]{4,}/i.test(getByTestId('lang-h1').textContent!.replace(/BornClock|\d+/g, '')), `${url} h1 is native`).toBe(false);
      unmount();
    }
  });
});

describe('B18 — no hard-coded hex colours in the new files', () => {
  it('uses brand tokens only', () => {
    for (const f of ['src/pages/lang/LangParts.tsx', 'src/pages/lang/LangLandingPage.tsx', 'src/pages/lang/LangRashifalPage.tsx', 'src/pages/lang/LangYearPage.tsx',
      'src/pages/lang/LangPanchangPage.tsx', 'src/pages/lang/LangKundaliPage.tsx', 'src/components/lang/OtherLanguages.tsx']) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
