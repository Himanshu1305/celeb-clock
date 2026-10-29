/**
 * Batch 9b — per-rashi Sade Sati / Dhaiya pages (/sade-sati/:rashi, /hi/sade-sati/:rashi).
 *
 * Reference values:
 *  - fixtures/saturnIngressSwiss.json — Swiss Ephemeris (pyswisseph 2.10.03, audit venv
 *    scratchpad/engine-audit) in BornClock's documented Lahiri convention (apparent tropical
 *    Saturn − SIDM_LAHIRI mean ayanamsa + 24.4″, see vedicEngine.ts / ayanamsaDrik.test.ts);
 *    script: fixtures/swiss_saturn_ingresses.py, run 29 Oct 2026.
 *  - fixtures/saturnIngressSwissTrueLahiri.json — plain Swiss SIDM_LAHIRI (true ayanamsa,
 *    FLG_SIDEREAL), same run, for the "plain Swiss Lahiri" comparison.
 *  - Drik Panchang Shani transit tables, fetched 29 Oct 2026 (local times converted to UTC):
 *    https://www.drikpanchang.com/planet/transit/shani-transit-date-time.html?year=2022 (New Delhi, IST)
 *    https://www.drikpanchang.com/planet/transit/shani-transit-date-time.html?year=2027 (Lancaster CA, PDT)
 *    https://www.drikpanchang.com/planet/transit/shani-transit-date-time.html?year=2029 (New Delhi, IST)
 *    https://www.drikpanchang.com/planet/transit/shani-transit-date-time.html?year=2041 (Fairfield CT, EST/EDT)
 *  - Drik Sade Sati results recorded in the Round 2 audit (scratchpad/round2.txt, audit D2):
 *    Kumbha Moon resumes 20 Oct 2027 and ends 23 Feb 2028; Karka Moon Jul 2002 – Sep 2009.
 */
import { describe, it, expect } from 'vitest';
import committed from '@/data/saturnIngresses.json';
import swiss from './fixtures/saturnIngressSwiss.json';
import swissTrue from './fixtures/saturnIngressSwissTrueLahiri.json';
import { saturnIngressesBetween } from '../saturnIngressScan';
import { statusAt, periodsFor, nextPeriod, saturnSignFromTable } from '../sadeSatiRashi';
import { ssPageMeta, ssFaq, ssPath, statusText, SS_EN_SLUGS, SS_HI_SLUGS } from '../sadeSatiRashiText';

type Row = { utc: string; from: number; to: number };
const ms = (s: string) => Date.parse(s.length === 17 ? s.replace('Z', ':00Z') : s);
const ENGINE = (committed as { ingresses: Row[] }).ingresses;
const SWISS = (swiss as { ingresses: Row[] }).ingresses;
const SWISS_TRUE = (swissTrue as { ingresses: Row[] }).ingresses;
const MIN = 6e4, HOUR = 36e5, DAY = 864e5;
const Y1950 = Date.UTC(1950, 0, 1), Y2061 = Date.UTC(2061, 0, 1);
const [MESHA, VRISHABHA, MITHUNA, KARKA, , KANYA, TULA, VRISCHIKA, , MAKARA, KUMBHA, MEENA] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe('Saturn sign ingresses 1940–2071: engine table vs Swiss Ephemeris', () => {
  it('same sequence of sign changes (incl. every retrograde re-entry) as Swiss, max diff < 20 minutes', () => {
    expect(ENGINE.length).toBe(SWISS.length);
    expect(ENGINE.length).toBe(112);
    let max = 0, max5060 = 0;
    ENGINE.forEach((e, i) => {
      expect([e.from, e.to]).toEqual([SWISS[i].from, SWISS[i].to]);
      const d = Math.abs(ms(e.utc) - ms(SWISS[i].utc));
      max = Math.max(max, d);
      if (ms(SWISS[i].utc) >= Y1950 && ms(SWISS[i].utc) < Y2061) max5060 = Math.max(max5060, d);
    });
    // Measured 29 Oct 2026: 19 min (2040s station), all within 1950–2060 too.
    expect(max).toBeLessThan(20 * MIN);
    expect(max5060).toBeLessThan(20 * MIN);
  });

  it('plain Swiss SIDM_LAHIRI: same sequence; all within 1 day except the Feb 2041 station pair, where Drik agrees with the engine', () => {
    expect(SWISS_TRUE.length).toBe(ENGINE.length);
    const over: string[] = [];
    ENGINE.forEach((e, i) => {
      expect([e.from, e.to]).toEqual([SWISS_TRUE[i].from, SWISS_TRUE[i].to]);
      if (Math.abs(ms(e.utc) - ms(SWISS_TRUE[i].utc)) >= DAY) over.push(e.utc.slice(0, 10));
    });
    // Saturn barely moves near its station on the Kanya/Tula line in Jan–Feb 2041, so the
    // ~24″ + nutation gap between the two Lahiri conventions moves the crossing by ~33 h.
    expect(over).toEqual(['2041-01-29', '2041-02-05']);
  });

  it('matches Drik Panchang Shani transit tables to within 15 minutes', () => {
    const DRIK: Array<[string, number]> = [
      ['2022-04-29T06:47:00Z', 10], // 29 Apr 2022 12:17 PM IST → Kumbha
      ['2022-07-12T04:57:00Z', 9],  // 12 Jul 2022 10:27 AM IST → Makara
      ['2027-06-03T00:53:00Z', 0],  // 2 Jun 2027 05:53 PM PDT → Mesha
      ['2027-10-20T00:35:00Z', 11], // 19 Oct 2027 05:35 PM PDT → Meena
      ['2029-08-08T07:49:00Z', 1],  // 8 Aug 2029 01:19 PM IST → Vrishabha
      ['2029-10-05T10:16:00Z', 0],  // 5 Oct 2029 03:46 PM IST → Mesha
      ['2041-01-29T06:53:00Z', 6],  // 29 Jan 2041 01:53 EST → Tula
      ['2041-02-05T00:16:00Z', 5],  // 4 Feb 2041 19:16 EST → Kanya
      ['2041-09-26T02:51:00Z', 6],  // 25 Sep 2041 22:51 EDT → Tula
    ];
    for (const [utc, to] of DRIK) {
      const hit = ENGINE.find(e => e.to === to && Math.abs(ms(e.utc) - ms(utc)) < 15 * MIN);
      expect(hit, utc).toBeTruthy();
    }
  });

  it('the committed table is exactly what the engine computes today (re-run scripts/gen-saturn-ingresses.mts if this fails)', () => {
    const live = saturnIngressesBetween(Date.UTC(1940, 0, 1), Date.UTC(2071, 0, 1));
    expect(live.initialSign).toBe((committed as { initialSign: number }).initialSign);
    expect(live.ingresses).toEqual(ENGINE);
  }, 60_000);
});

describe('per-rashi periods', () => {
  const day = (iso: string) => iso.slice(0, 10);

  it('Mesha Sade Sati cycles overlapping 1950–2060 (dates = Swiss ingress days)', () => {
    const ss = periodsFor(MESHA, 'sadeSati');
    expect(ss.map(p => [day(p.start), day(p.end)])).toEqual([
      ['1966-04-09', '1973-06-10'], ['1995-06-02', '2003-04-07'], ['2025-03-29', '2032-05-30'], ['2054-05-14', '2062-03-07'],
    ]);
    // Current cycle includes every exit and re-entry (Drik 2027 + 2029 tables).
    const cur = ss[2];
    expect(cur.segments.map(s => [s.sign, day(s.start), s.inside, s.retroEntry])).toEqual([
      [MEENA, '2025-03-29', true, false],
      [MESHA, '2027-06-03', true, false],
      [MEENA, '2027-10-20', true, true],
      [MESHA, '2028-02-23', true, false],
      [VRISHABHA, '2029-08-08', true, false],
      [MESHA, '2029-10-05', true, true],
      [VRISHABHA, '2030-04-17', true, false],
    ]);
    expect(cur.segments.map(s => s.phase)).toEqual([1, 2, 1, 2, 3, 2, 3]);
  });

  it('Kumbha current cycle ends 23 Feb 2028 with the 2027 retrograde exit (Drik, round2 D2); Karka Jul 2002 – Sep 2009', () => {
    const k = periodsFor(KUMBHA, 'sadeSati').find(p => p.start.startsWith('2020'))!;
    expect(day(k.start)).toBe('2020-01-24');
    expect(day(k.end)).toBe('2028-02-23');
    const out = k.segments.filter(s => !s.inside);
    expect(out.map(s => [s.sign, day(s.start), day(s.end)])).toEqual([[MESHA, '2027-06-03', '2027-10-20']]);
    const ka = periodsFor(KARKA, 'sadeSati').find(p => p.start.startsWith('2002'))!;
    expect(day(ka.start)).toBe('2002-07-23');
    expect(day(ka.end)).toBe('2009-09-09');
  });

  it('every period is complete, ordered, and its segments tile it exactly; every rashi has 3–4 Sade Sati cycles in range', () => {
    for (let m = 0; m < 12; m++) {
      const ss = periodsFor(m, 'sadeSati');
      expect(ss.length).toBeGreaterThanOrEqual(3);
      expect(ss.length).toBeLessThanOrEqual(4);
      for (const type of ['sadeSati', 'kantaka', 'ashtama'] as const) {
        for (const p of periodsFor(m, type)) {
          expect(p.segments[0].start).toBe(p.start);
          expect(p.segments[p.segments.length - 1].end).toBe(p.end);
          expect(p.segments[0].inside && p.segments[p.segments.length - 1].inside).toBe(true);
          p.segments.forEach((s, i) => { if (i) expect(s.start).toBe(p.segments[i - 1].end); });
          if (type === 'sadeSati') {
            expect(p.segments[0].house).toBe(12);
            expect(p.segments[p.segments.length - 1].house).toBe(2);
          }
        }
      }
    }
  });
});

describe('status for fixed dates (expected signs from the Swiss sequence + Drik 2027/2041 tables)', () => {
  const kindOf = (m: number, iso: string) => {
    const s = statusAt(m, new Date(iso))!;
    return s.kind === 'sadeSati' ? `ss${s.phase}` : s.kind === 'dhaiya' ? s.type : s.kind;
  };

  it('29 Oct 2026 (Saturn in Meena)', () => {
    const got = Array.from({ length: 12 }, (_, m) => kindOf(m, '2026-10-29T06:00:00Z'));
    expect(got).toEqual(['ss1', 'none', 'none', 'none', 'ashtama', 'none', 'none', 'none', 'kantaka', 'none', 'ss3', 'ss2']);
  });

  it('1 Aug 2027 (Saturn in Mesha between 3 Jun and 20 Oct 2027)', () => {
    const got = Array.from({ length: 12 }, (_, m) => kindOf(m, '2027-08-01T06:00:00Z'));
    expect(got).toEqual(['ss2', 'ss1', 'none', 'none', 'dhaiyaPaused', 'ashtama', 'none', 'none', 'dhaiyaPaused', 'kantaka', 'sadeSatiPaused', 'ss3']);
    const k = statusAt(KUMBHA, new Date('2027-08-01T06:00:00Z'))!;
    expect(k.until.slice(0, 10)).toBe('2027-10-20'); // resumes on Drik's 19 Oct 2027 17:35 PDT
  });

  it('1 Feb 2041 (Saturn briefly in Tula) and 1 Mar 2041 (back in Kanya)', () => {
    expect(kindOf(VRISCHIKA, '2041-02-01T06:00:00Z')).toBe('ss1');
    expect(kindOf(VRISCHIKA, '2041-03-01T06:00:00Z')).toBe('sadeSatiPaused');
    expect(kindOf(TULA, '2041-02-01T06:00:00Z')).toBe('ss2');
    expect(kindOf(KANYA, '2041-03-01T06:00:00Z')).toBe('ss2');
    expect(kindOf(MAKARA, '2041-02-01T06:00:00Z')).toBe('none');
  });

  it('next periods after 29 Oct 2026', () => {
    const now = new Date('2026-10-29T06:00:00Z');
    expect(nextPeriod(VRISHABHA, now, ['sadeSati'])!.start.slice(0, 10)).toBe('2027-06-03');
    expect(nextPeriod(MESHA, now, ['sadeSati'])!.start.slice(0, 10)).toBe('2054-05-14');
    expect(nextPeriod(MITHUNA, now, ['sadeSati'])!.start.slice(0, 10)).toBe('2029-08-08');
  });

  it('status always agrees with the Swiss sign sequence (every 10 days, 1950–2060, all rashis)', () => {
    const swissSign = (t: number) => { let s = (swiss as { initialSign: number }).initialSign; for (const r of SWISS) { if (ms(r.utc) <= t) s = r.to; else break; } return s; };
    for (let t = Y1950; t < Y2061; t += 10 * DAY) {
      const sign = swissSign(t);
      // Skip instants within an hour of an ingress (engine and Swiss differ by minutes there).
      if (SWISS.some(r => Math.abs(ms(r.utc) - t) < HOUR)) continue;
      expect(saturnSignFromTable(t)).toBe(sign);
      for (let m = 0; m < 12; m++) {
        const h = ((sign - m + 12) % 12) + 1;
        const k = statusAt(m, t)!.kind;
        if (h === 12 || h === 1 || h === 2) expect(k).toBe('sadeSati');
        else if (h === 4 || h === 8) expect(k).toBe('dhaiya');
        else expect(['none', 'sadeSatiPaused', 'dhaiyaPaused']).toContain(k);
      }
    }
  });
});

describe('page text and titles', () => {
  it('24 unique titles; prerender titles/descriptions equal the page meta', async () => {
    const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
    const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
    const routes: string[] = await getAllRoutes();
    const titles = new Set<string>();
    for (let i = 0; i < 12; i++) {
      for (const lang of ['en', 'hi'] as const) {
        const path = ssPath(i, lang);
        expect(routes).toContain(path);
        const pre = getTitleForRoute(path) as { title: string; description: string };
        const meta = ssPageMeta(i, lang);
        expect(pre.title).toBe(meta.title);
        expect(pre.description).toBe(meta.description);
        titles.add(meta.title);
      }
    }
    expect(titles.size).toBe(24);
    expect(SS_EN_SLUGS).toHaveLength(12);
    expect(SS_HI_SLUGS).toHaveLength(12);
  });

  it('FAQ is phrased as fixed date ranges (never "currently"), and lists every cycle', () => {
    for (let i = 0; i < 12; i++) {
      for (const lang of ['en', 'hi'] as const) {
        const faq = ssFaq(i, lang);
        expect(faq.length).toBeGreaterThanOrEqual(5);
        const all = faq.map(f => f.answer + f.question).join(' ');
        expect(all).not.toMatch(/currently|right now|अभी/i);
        expect(faq[0].answer.split(lang === 'hi' ? '; ' : '; ').length).toBe(periodsFor(i, 'sadeSati').length);
      }
    }
  });

  it('status text is calm and names the dates', () => {
    const s = statusAt(MESHA, new Date('2026-10-29T06:00:00Z'))!;
    const t = statusText(MESHA, s, 'en');
    expect(t.headline).toBe('Mesha is in Sade Sati — Phase 1 — Rising');
    expect(t.detail).toContain('29 Mar 2025');
    expect(t.detail).toContain('3 Jun 2027');
    expect(t.detail).toMatch(/responsibility and steady effort/);
    const hi = statusText(MESHA, s, 'hi');
    expect(hi.headline).toContain('मेष');
  });
});
