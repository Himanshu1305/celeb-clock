// Shared daily-page mechanism (src/lib/daily): Worker injection, renderer contract,
// registry, date helpers. Uses the real W1/W2 compute functions for fixed dates.
import { describe, it, expect } from 'vitest';
import { injectDailyHtml } from '../inject';
import { renderDailyBodyHtml, dailyJsonLd, canonicalFor } from '../render';
import { matchDailyRoute, allDailyRoutes, DAILY_PAGES, dailyJsonPath } from '../registry';
import { computeDaily, DAILY_COMPUTERS } from '../compute';
import { istDateISO, addDaysISO, msUntilNextIstMidnight, istInstant, formatDateEn } from '../dates';
import { applyDailyContent } from '../../../../functions/daily';
import type { DailyMonthFile } from '../types';

/** A prerendered-shell lookalike with every marker the page components render. */
function shell(): string {
  return `<!doctype html><html lang="en"><head><title>Mesha (Aries) Daily Horoscope — Rashifal | BornClock</title>` +
    `<meta name="description" content="old description"><meta property="og:title" content="old"><meta property="og:description" content="old">` +
    `<meta name="twitter:title" content="old"><meta name="twitter:description" content="old">` +
    `<link rel="canonical" href="https://bornclock.com/rashifal/mesh/today/"></head><body><div id="root">` +
    `<h1><span data-daily="h1">Mesh Rashifal Today — 1 January 2026</span></h1><p><span data-daily="date">old date</span></p>` +
    `<div class="x" data-daily="body" data-testid="daily-body"><section><h2>old</h2><p>old body text</p></section></div>` +
    `<script type="application/ld+json" data-daily="jsonld">{}</script><footer><div>footer</div></footer></div></body></html>`;
}

const D1 = '2026-10-26';
const D2 = '2026-10-27';

describe('daily registry', () => {
  it('every registered kind has a compute function', () => {
    for (const d of DAILY_PAGES) expect(DAILY_COMPUTERS[d.kind], d.kind).toBeTypeOf('function');
  });
  it('matches routes with and without trailing slash, nothing else', () => {
    expect(matchDailyRoute('/rashifal/mesh/today')?.slug).toBe('mesh');
    expect(matchDailyRoute('/rashifal/mesh/today/')?.def.kind).toBe('rashifal');
    expect(matchDailyRoute('/hi/rashifal/mesha/')?.def.kind).toBe('rashifal-hi');
    expect(matchDailyRoute('/zodiac/leo/today/')?.def.kind).toBe('horoscope');
    expect(matchDailyRoute('/rashifal/mesh/week')).toBeNull();
    expect(matchDailyRoute('/zodiac/leo')).toBeNull();
    expect(matchDailyRoute('/rashifal/notarashi/today')).toBeNull();
  });
  it('lists 36 daily routes (12 rashifal EN + 12 HI + 12 Western) + 153 Panchang (W7: 3 kinds × 51)', () => {
    expect(allDailyRoutes()).toHaveLength(36 + 153);
    expect(new Set(allDailyRoutes()).size).toBe(36 + 153);
  });
});

describe('India date helpers', () => {
  it('IST date flips at 18:30 UTC', () => {
    expect(istDateISO(new Date('2026-10-25T18:29:00Z'))).toBe('2026-10-25');
    expect(istDateISO(new Date('2026-10-25T18:30:00Z'))).toBe('2026-10-26');
  });
  it('midnight countdown and calendar maths', () => {
    expect(msUntilNextIstMidnight(new Date('2026-10-25T18:00:00Z'))).toBe(30 * 60 * 1000);
    expect(addDaysISO('2026-12-31', 1)).toBe('2027-01-01');
    expect(istInstant('2026-10-26', 12, 0).toISOString()).toBe('2026-10-26T06:30:00.000Z');
  });
});

describe('renderer contract', () => {
  it('body HTML never contains a <div> (the injector relies on it)', () => {
    for (const d of DAILY_PAGES) for (const slug of d.slugs.slice(0, 3)) {
      const html = renderDailyBodyHtml(computeDaily(d.kind, D1, slug));
      expect(html).not.toMatch(/<\/?div\b/i);
    }
  });
  it('escapes HTML in entry text', () => {
    const e = { ...computeDaily('rashifal', D1, 'mesh'), answer: '<script>x</script> & "q"' };
    expect(renderDailyBodyHtml(e)).toContain('&lt;script&gt;x&lt;/script&gt; &amp; &quot;q&quot;');
  });
  it('JSON-LD carries dateModified and an FAQPage with the visible FAQ', () => {
    const e = computeDaily('horoscope', D1, 'leo');
    const ld = dailyJsonLd(e, canonicalFor('/zodiac/leo/today')) as { '@graph': Record<string, unknown>[] };
    const page = ld['@graph'].find(g => g['@type'] === 'WebPage')!;
    expect(page.dateModified).toBe(D1);
    expect(page.url).toBe('https://bornclock.com/zodiac/leo/today/');
    const faq = ld['@graph'].find(g => g['@type'] === 'FAQPage') as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map(q => q.name)).toEqual(e.faq.map(f => f.q));
  });
});

describe('Worker injection (fixed date)', () => {
  const e1 = computeDaily('rashifal', D1, 'mesh');
  const e2 = computeDaily('rashifal', D2, 'mesh');
  const r1 = injectDailyHtml(shell(), { kind: 'rashifal', slug: 'mesh', path: '/rashifal/mesh/today', entry: e1 });
  const r2 = injectDailyHtml(shell(), { kind: 'rashifal', slug: 'mesh', path: '/rashifal/mesh/today', entry: e2 });

  it('replaces every marker', () => {
    expect(r1.replaced).toEqual({ title: true, description: true, h1: true, date: true, body: true, jsonld: true });
  });
  it('the HTML contains that date and that day’s text', () => {
    expect(r1.html).toContain('<title>Mesh Rashifal Today, 26 October 2026');
    expect(r1.html).toContain('Mesh Rashifal Today — 26 October 2026');
    expect(r1.html).toContain('Monday, 26 October 2026');
    expect(r1.html).toContain('"dateModified":"2026-10-26"');
    expect(r1.html).toContain(e1.sections[0].text!.slice(0, 60).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;'));
    expect(r1.html).not.toContain('old body text');
    expect(r1.html).not.toContain('old description');
    // The footer after the content block survives untouched.
    expect(r1.html).toContain('<footer><div>footer</div></footer>');
  });
  it('the next day’s HTML differs', () => {
    expect(r2.html).toContain('27 October 2026');
    expect(r2.html).not.toBe(r1.html);
    expect(e2.answer).not.toBe(e1.answer);
  });
  it('never adds noindex and keeps the canonical', () => {
    expect(r1.html).not.toMatch(/noindex/i);
    expect(r1.html).toContain('<link rel="canonical" href="https://bornclock.com/rashifal/mesh/today/">');
  });
  it('is idempotent (one embedded data script after re-injection)', () => {
    const again = injectDailyHtml(r1.html, { kind: 'rashifal', slug: 'mesh', path: '/rashifal/mesh/today', entry: e2 });
    expect(again.html.match(/id="daily-data"/g)).toHaveLength(1);
    expect(again.html).toContain('27 October 2026');
    expect(again.html).not.toContain('26 October 2026');
  });
});

describe('functions/daily.ts — applyDailyContent with fake static assets', () => {
  const month = (kind: string, slug: string, m: string): DailyMonthFile => {
    const days: DailyMonthFile['days'] = {};
    for (let d = '2026-10-24'; d.startsWith('2026-10'); d = addDaysISO(d, 1)) days[d] = computeDaily(kind, d, slug);
    return { kind, slug, month: m, days };
  };
  const files: Record<string, unknown> = {
    [dailyJsonPath('rashifal', 'mesh', '2026-10')]: month('rashifal', 'mesh', '2026-10'),
    [dailyJsonPath('horoscope', 'leo', '2026-10')]: month('horoscope', 'leo', '2026-10'),
  };
  const assets = {
    fetch: async (req: Request) => {
      const p = new URL(req.url).pathname;
      if (files[p]) return new Response(JSON.stringify(files[p]), { headers: { 'content-type': 'application/json' } });
      return new Response('<!doctype html><html></html>', { headers: { 'content-type': 'text/html' } }); // SPA fallback
    },
  };

  it('injects the India date’s entry (UTC evening already counts as the next India day)', async () => {
    const now = new Date('2026-10-25T19:00:00Z'); // 00:30 IST on 26 Oct
    const r = await applyDailyContent('/rashifal/mesh/today/', shell(), assets, 'https://bornclock.com', now);
    expect(r?.date).toBe('2026-10-26');
    expect(r?.html).toContain(formatDateEn('2026-10-26'));
    expect(r!.maxAge).toBeGreaterThan(0);
    expect(r!.maxAge).toBeLessThanOrEqual(24 * 3600);
  });
  it('returns null for a non-daily path and when the day is missing', async () => {
    expect(await applyDailyContent('/zodiac/leo', shell(), assets, 'https://bornclock.com')).toBeNull();
    const far = new Date('2030-01-01T06:00:00Z');
    expect(await applyDailyContent('/rashifal/mesh/today', shell(), assets, 'https://bornclock.com', far)).toBeNull();
  });
});
