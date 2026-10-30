// Batch 10 — vrat katha + puja vidhi pages: sourcing, next-date computation, timings
// (checked against Drik Panchang pages opened 29 Oct 2026), unique titles and wiring.
import { describe, it, expect, vi, afterAll } from 'vitest';
import { VRAT_CONTENT, EKADASHI_ROWS, vratSources } from '../content';
import { VRAT_INDEX_SLUG, VRAT_PAGE_SLUGS, VRAT_SLUGS, vratMeta, vratPath, vratSlugForFestival } from '../meta';
import { computeVratNextData, istStamp, moonriseDelhi, navratriSpans, nightParts, pradoshPujaWindow, upcomingOccurrences, vratsOnDate } from '../next';
import { renderVratEntry } from '../../../daily/kinds/vratTemplate';
import { computeDaily, DAILY_DATA_COMPUTERS } from '../../../daily/compute';
import { matchDailyRoute, allDailyRoutes } from '../../../daily/registry';
import { renderDailyBodyHtml } from '../../../daily/render';
import { renderPanchangEntry, renderPanchangHiEntry, placeForSlug } from '../../../daily/kinds/panchangTemplate';
import { computePanchangDayDataForCity } from '../../../daily/kinds/panchangDaily';
import { sunriseSunset } from '../../panchangDay';
import { computeFestivalCalendar } from '../../festivals';

const LANGS = ['en', 'hi'] as const;
const okUrl = (u: string) => /^https:\/\/(en\.wikipedia\.org|www\.drikpanchang\.com)\//.test(u) || u === '/festivals/'; // Batch 11: internal source link in canonical slash form

describe('vrat content — every section is sourced, bilingual and calm', () => {
  it('has content for all ten vrats', () => {
    expect(Object.keys(VRAT_CONTENT).sort()).toEqual([...VRAT_SLUGS].sort());
  });

  for (const slug of VRAT_SLUGS) {
    const c = VRAT_CONTENT[slug];
    it(`${slug}: every section has a source URL and both languages`, () => {
      expect(c.sections.length).toBeGreaterThanOrEqual(6);
      for (const id of ['about', 'katha', 'samagri', 'steps', 'timing', 'regional'] as const) {
        expect(c.sections.some(s => s.id === id), `${slug} ${id}`).toBe(true);
      }
      for (const s of c.sections) {
        expect(s.sources.length, `${slug}/${s.id}`).toBeGreaterThan(0);
        for (const src of s.sources) { expect(okUrl(src.url), src.url).toBe(true); expect(src.label).toBeTruthy(); }
        for (const l of LANGS) expect(s.heading[l].trim(), `${slug}/${s.id} heading ${l}`).toBeTruthy();
        const texts = [...(s.paras ?? []), ...(s.list ?? []), ...(s.steps ?? []), ...(s.rows ?? []).flatMap(r => [r.label, r.text])];
        expect(texts.length, `${slug}/${s.id} has content`).toBeGreaterThan(0);
        for (const t of texts) for (const l of LANGS) expect(t[l].trim(), `${slug}/${s.id} ${l}`).toBeTruthy();
        // Hindi text is actually Hindi (Devanagari), not a copy of the English.
        for (const t of texts) expect(/[ऀ-ॿ]/.test(t.hi), `${slug}/${s.id}: ${t.hi.slice(0, 40)}`).toBe(true);
      }
      expect(c.faqSources.length).toBeGreaterThan(0);
      for (const src of c.faqSources) expect(okUrl(src.url)).toBe(true);
      expect(vratSources(c).length).toBeGreaterThan(0);
    });

    it(`${slug}: mantras only with transliteration + meaning from a source`, () => {
      for (const m of c.mantras) {
        expect(m.deva).toMatch(/[ऀ-ॿ]/);
        expect(m.translit).toMatch(/^[A-Za-z]/);
        for (const l of LANGS) { expect(m.meaning[l]).toBeTruthy(); expect(m.use[l]).toBeTruthy(); }
        expect(m.source.url).toMatch(/^https:\/\/www\.drikpanchang\.com\//);
      }
    });

    it(`${slug}: FAQ is complete in both languages, calm wording`, () => {
      expect(c.faq.length).toBeGreaterThanOrEqual(3);
      const all = [c.summary, ...c.faq.flatMap(f => [f.q, f.a])].map(x => x.en).join(' ');
      expect(all).not.toMatch(/\b(curse(?:d)?|disaster|doom|danger(?:ous)?|death will|bad luck|must not miss)\b/i);
      for (const f of c.faq) for (const l of LANGS) { expect(f.q[l]).toBeTruthy(); expect(f.a[l]).toBeTruthy(); }
    });
  }

  it('lists all 24 Ekadashis plus the two leap-month ones, in both languages', () => {
    expect(EKADASHI_ROWS.length).toBe(26);
    for (const r of EKADASHI_ROWS) for (const l of LANGS) { expect(r.label[l]).toBeTruthy(); expect(r.text[l]).toBeTruthy(); }
  });

  it('no section on any page sells anything', () => {
    const txt = JSON.stringify(VRAT_CONTENT);
    expect(txt).not.toMatch(/\b(buy|book a puja|order now|₹)\b/i);
  });
});

describe('next-date computation (from the festival engine, Drik-checked)', () => {
  it('from 29 Oct 2026: Karwa Chauth and Sankashti today, Rama Ekadashi 5 Nov, Purnima 24 Nov', () => {
    const d = computeVratNextData('2026-10-29');
    // Karwa Chauth 2026 = 29 Oct (Drik, festivals.test.ts; Wikipedia "Karva Chauth" also lists 29 Oct 2026).
    expect(d['karwa-chauth'][0].d).toBe('2026-10-29');
    expect(d['sankashti-chaturthi'][0].d).toBe('2026-10-29');
    // Drik Smarta Ekadashi / Purnima lists (festivals.test.ts DRIK_EKADASHI / DRIK_PURNIMA 2026).
    expect(d.ekadashi[0]).toMatchObject({ d: '2026-11-05', ek: 'Rama' });
    expect(d.ekadashi.map(o => o.d)).toEqual(['2026-11-05', '2026-11-20', '2026-12-04', '2026-12-20']);
    expect(d['satyanarayan-katha'].map(o => o.d)).toEqual(['2026-11-24', '2026-12-23', '2027-01-22']);
    // Annual vrats: Maha Shivratri 6 Mar 2027 and Janmashtami 25 Aug 2027 (Drik, festivals.test.ts).
    expect(d.mahashivratri[0].d).toBe('2027-03-06');
    expect(d.janmashtami[0].d).toBe('2027-08-25');
    // Navratri: Chaitra (Ugadi day, 7 Apr 2027) then Sharad (Ghatasthapana 30 Sep 2027).
    expect(d.navratri.map(o => [o.d, o.nv])).toEqual([['2027-04-07', 'Chaitra'], ['2027-09-30', 'Sharad']]);
  });

  it('from 1 Jan 2026: Janmashtami 4 Sep, Chaitra Navratri 19 Mar, Sharad Navratri 11 Oct (Wikipedia dates)', () => {
    expect(upcomingOccurrences('janmashtami', '2026-01-01')[0].d).toBe('2026-09-04');
    expect(upcomingOccurrences('navratri', '2026-01-01').map(o => o.d)).toEqual(['2026-03-19', '2026-10-11']);
    // Wikipedia "Navaratri": 2026 Vasanta 19–27 March, Sharada 11–19 October.
    expect(navratriSpans(2026)).toEqual([['2026-03-19', '2026-03-26'], ['2026-10-11', '2026-10-19']]);
  });

  it('weekly vrats: the next Monday / Tuesday (today when it is one)', () => {
    expect(upcomingOccurrences('somvar-vrat', '2026-10-29').map(o => o.d)).toEqual(['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23']);
    expect(upcomingOccurrences('somvar-vrat', '2026-11-02')[0].d).toBe('2026-11-02');
    expect(upcomingOccurrences('mangalvar-vrat', '2026-10-29')[0].d).toBe('2026-11-03');
  });

  it('an occurrence date is never in the past and the list is in order', () => {
    for (const date of ['2026-10-29', '2026-12-31', '2027-03-06']) {
      const d = computeVratNextData(date);
      for (const s of VRAT_SLUGS) {
        const ds = d[s].map(o => o.d);
        expect(ds.length, `${s} ${date}`).toBeGreaterThan(0);
        expect(ds[0] >= date, `${s} ${date}`).toBe(true);
        expect([...ds].sort(), s).toEqual(ds);
      }
    }
    expect(computeVratNextData('2027-03-06').mahashivratri[0].d).toBe('2027-03-06');
  });

  it('every pradosh / sankashti / karwa / ekadashi / purnima / shivratri / janmashtami festival entry maps to its page', () => {
    const c = computeFestivalCalendar(2026).festivals;
    const count = (slug: string) => c.filter(f => vratSlugForFestival(f) === slug).length;
    expect(count('ekadashi')).toBe(24);
    expect(count('satyanarayan-katha')).toBe(13);
    expect(count('pradosh-vrat')).toBeGreaterThanOrEqual(24);
    expect(count('sankashti-chaturthi')).toBeGreaterThanOrEqual(12);
    expect(count('karwa-chauth')).toBe(1);
    expect(count('mahashivratri')).toBe(1);
    expect(count('janmashtami')).toBe(1);
  });
});

describe('timings match Drik Panchang (New Delhi unless noted)', () => {
  const hm = (ms: number) => istStamp(ms).slice(11, 16);
  it('moonrise: Bhalachandra Sankashti 31 Mar 2021 = 21:45 (drikpanchang.com sankashti/bhalachandra ?year=2021)', () => {
    expect(hm(moonriseDelhi('2021-03-31'))).toBe('21:45');
  });
  it('pradosh puja window: Shani Pradosh 15 Jan 2022 = 17:46–20:28 (drikpanchang.com vrats/pradoshdates ?year=2022)', () => {
    const w = pradoshPujaWindow('2022-01-15', 'Shukla')!;
    expect([hm(w[0]), hm(w[1])]).toEqual(['17:46', '20:28']);
  });
  it('Nishita + four prahars: Maha Shivaratri 4 Mar 2019, Lancaster CA (the page Drik served) — 23:39–00:29; 17:51/20:57/00:04/03:10/06:17', () => {
    // Lancaster, California (34.6868 N, 118.1542 W), PST (UTC−8) before the 10 Mar 2019 DST change.
    const { set, nextRise } = sunriseSunset(new Date('2019-03-04T12:00:00Z'), 34.6868, -118.1542, -8);
    const n = nightParts(set.getTime(), nextRise.getTime());
    const pst = (ms: number) => new Date(Math.round((ms - 8 * 3600e3) / 60000) * 60000).toISOString().slice(11, 16);
    const near = (got: string, want: string) => {
      const m = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
      const diff = Math.abs(m(got) - m(want));
      expect(Math.min(diff, 1440 - diff), `${got} vs ${want}`).toBeLessThanOrEqual(1);
    };
    near(pst(n.nishita[0]), '23:39'); near(pst(n.nishita[1]), '00:29');
    ['17:51', '20:57', '00:04', '03:10', '06:17'].forEach((want, i) => near(pst(n.prahars[i]), want));
  });
  it('Karwa Chauth 2026 (29 Oct) moonrise is 20:17 in New Delhi and the fast starts at sunrise 06:31', () => {
    const t = computeVratNextData('2026-10-29')['karwa-chauth'][0].t!;
    expect(t.moon).toBe('2026-10-29T20:17');
    expect(t.rise).toBe('2026-10-29T06:31');
  });
});

describe('vrat pages: titles, template and wiring', () => {
  it('titles are unique across English and Hindi, and equal the prerender titles', async () => {
    const { getTitleForRoute } = await import('../../../../../scripts/prerender-titles.mjs');
    const titles = new Set<string>();
    for (const slug of VRAT_PAGE_SLUGS) for (const l of LANGS) {
      const m = vratMeta(slug, l);
      expect(titles.has(m.title), m.title).toBe(false);
      titles.add(m.title);
      const pre = getTitleForRoute(vratPath(slug, l));
      expect(pre?.title, vratPath(slug, l)).toBe(m.title);
      expect(pre?.description, vratPath(slug, l)).toBe(m.description);
    }
  });

  it('every vrat route is prerendered, a daily route, and in the route list', async () => {
    const { getAllRoutes } = await import('../../../../../scripts/prerender-routes.mjs');
    const routes = new Set<string>(await getAllRoutes());
    for (const slug of VRAT_PAGE_SLUGS) for (const l of LANGS) {
      const p = vratPath(slug, l);
      expect(routes.has(p), p).toBe(true);
      expect(matchDailyRoute(p)?.slug, p).toBe(slug);
      expect(allDailyRoutes()).toContain(p);
    }
  }, 60_000);

  it('the template keeps the static title / H1 and dates the answer; the next day reads differently', () => {
    const d1 = DAILY_DATA_COMPUTERS['vrat-next']('2026-10-30', 'all') as never;
    const d2 = DAILY_DATA_COMPUTERS['vrat-next']('2026-10-31', 'all') as never;
    for (const l of LANGS) {
      const a = renderVratEntry('ekadashi', '2026-10-30', d1, l);
      const b = renderVratEntry('ekadashi', '2026-10-31', d2, l);
      expect(a.title).toBe(vratMeta('ekadashi', l).title);
      expect(a.h1).toBe(vratMeta('ekadashi', l).h1);
      expect(a.answer).not.toBe(b.answer);
      expect(a.faq).toEqual([]); // the page's one FAQPage block is the static FAQ
    }
    const en = renderVratEntry('ekadashi', '2026-10-30', d1, 'en');
    expect(en.answer).toContain('Rama Ekadashi');
    expect(en.answer).toContain('Thursday, 5 November 2026');
    expect(en.answer).toContain('in 6 days');
    const hi = renderVratEntry('ekadashi', '2026-10-30', d1, 'hi');
    expect(hi.answer).toContain('रमा एकादशी');
    const hub = renderVratEntry(VRAT_INDEX_SLUG, '2026-10-29', computeVratNextData('2026-10-29'), 'en');
    expect(hub.answer).toMatch(/^Today \(Thursday, 29 October 2026\) is /);
    expect(hub.sections[0].items!.length).toBe(10);
  });

  it('computeDaily renders every vrat page for a date without error', () => {
    for (const slug of VRAT_PAGE_SLUGS) {
      for (const kind of ['vrat', 'vrat-hi']) {
        const e = computeDaily(kind, '2026-10-29', slug);
        expect(e.answer.length, `${kind}/${slug}`).toBeGreaterThan(40);
        expect(renderDailyBodyHtml(e)).not.toContain('<div');
      }
    }
  });

  it('the daily Panchang links the vrats that fall on the day (English + Hindi)', () => {
    expect(vratsOnDate('2026-10-29')).toEqual(['sankashti-chaturthi', 'karwa-chauth']);
    expect(vratsOnDate('2026-11-02')).toEqual(['somvar-vrat']);
    expect(vratsOnDate('2026-10-15')).toContain('navratri'); // inside Sharad Navratri 2026
    const data = computePanchangDayDataForCity('2026-10-29', 'delhi');
    expect(data.vr).toEqual(['sankashti-chaturthi', 'karwa-chauth']);
    const en = renderPanchangEntry('panchang', placeForSlug('delhi'), '2026-10-29', data);
    const sec = en.sections.find(s => s.id === 'vrat-today')!;
    expect(sec.links!.map(l => l.href)).toEqual(['/vrat/sankashti-chaturthi', '/vrat/karwa-chauth']);
    expect(renderDailyBodyHtml(en)).toContain('href="/vrat/karwa-chauth/"'); // Batch 11: canonical slash form
    const hi = renderPanchangHiEntry('delhi', '2026-10-29', data);
    expect(hi.sections.find(s => s.id === 'vrat-today')!.links!.map(l => l.href)).toEqual(['/hi/vrat/sankashti-chaturthi', '/hi/vrat/karwa-chauth']);
    // A day with no vrat gets no box.
    const plain = computePanchangDayDataForCity('2026-10-30', 'delhi');
    expect(plain.vr).toBeUndefined();
    expect(renderPanchangEntry('panchang', placeForSlug('delhi'), '2026-10-30', plain).sections.some(s => s.id === 'vrat-today')).toBe(false);
  }, 60_000);
});

describe('functions/_worker.ts serves vrat pages (fixed date)', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-29T03:00:00Z'));
  afterAll(() => vi.useRealTimers());
  const SHELL = (path: string) => `<!doctype html><html><head><title>static</title><meta name="description" content="static">` +
    `<link rel="canonical" href="https://bornclock.com${path}/"></head><body><div id="root"><h1><span data-daily="h1">static h1</span></h1>` +
    `<span data-daily="date"></span><div data-daily="body"><p>static body</p></div><script type="application/ld+json" data-daily="jsonld">{}</script></div></body></html>`;
  const env = {
    ASSETS: {
      fetch: async (req: Request) => {
        const p = new URL(req.url).pathname;
        if (p.startsWith('/daily/vrat-next/all/')) {
          const month = p.split('/').pop()!.replace('.json', '');
          const data: Record<string, unknown> = {};
          for (const d of ['2026-10-28', '2026-10-29', '2026-10-30']) if (d.startsWith(month)) data[d] = DAILY_DATA_COMPUTERS['vrat-next'](d, 'all');
          return new Response(JSON.stringify({ kind: 'vrat-next', slug: 'all', month, data }), { headers: { 'content-type': 'application/json' } });
        }
        return new Response(SHELL(p.replace(/\/$/, '')), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
      },
    },
  };
  it('injects the next-date answer, keeps the static title, and 404s an unknown vrat', async () => {
    const worker = (await import('../../../../../functions/_worker')).default;
    const res = await worker.fetch(new Request('https://bornclock.com/vrat/karwa-chauth/'), env as never, {});
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain(`<title>${vratMeta('karwa-chauth', 'en').title.replace(/&/g, '&amp;')}</title>`);
    expect(html).toContain('Today, Thursday, 29 October 2026, is Karwa Chauth.');
    expect(html).not.toContain('static body');
    expect(html).not.toMatch(/noindex/i);
    const hi = await worker.fetch(new Request('https://bornclock.com/hi/vrat/karwa-chauth/'), env as never, {});
    expect(await hi.text()).toContain('करवा चौथ');
    const bad = await worker.fetch(new Request('https://bornclock.com/vrat/not-a-vrat/'), env as never, {});
    expect(bad.status).toBe(404);
  }, 60_000);
});
