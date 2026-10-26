// W1 (daily Vedic rashifal, EN + HI) and W2 (daily Western horoscope): astronomical
// regression values + rules/tone checks.
//
// REFERENCE VALUES: Swiss Ephemeris 2.10.03 (pyswisseph) via the audit venv
// (scratchpad/engine-audit/venv, ephe files in engine-audit/ephe), computed 25 Oct 2026
// with scratchpad/b7ref/ref.py. Instant = 12:00 IST (06:30 UTC) on each date — the
// reference instant the daily pages use. Sidereal = SIDM_LAHIRI; Rahu = mean node;
// tropical = geocentric apparent; retrograde = SE longitude speed < 0. Sign index 0 = Aries/Mesha.
import { describe, it, expect } from 'vitest';
import { vedicSky, bestChoghadiya, nakshatrasInRashi } from '../kinds/vedicSky';
import { westernSky } from '../kinds/westernDaily';
import { rashifalFactors } from '../kinds/rashifalDaily';
import { computeDaily } from '../compute';
import { RASHI_SLUGS, RASHI_SLUGS_HI, SUN_SIGN_SLUGS } from '../registry';
import { addDaysISO } from '../dates';
import type { DailyEntry } from '../types';

const REF: Record<string, { sid: Record<string, number>; nak: number; trop: Record<string, number>; retro: Record<string, boolean> }> = {
  '2026-10-26': { sid: { Sun: 6, Moon: 0, Mercury: 6, Venus: 6, Mars: 3, Jupiter: 3, Saturn: 11, Rahu: 10 }, nak: 0, trop: { Sun: 7, Moon: 1, Mercury: 7, Venus: 6, Mars: 4 }, retro: { Mercury: true, Venus: true, Mars: false } },
  '2026-11-01': { sid: { Sun: 6, Moon: 3, Mercury: 6, Venus: 6, Mars: 3, Jupiter: 4, Saturn: 11, Rahu: 10 }, nak: 7, trop: { Sun: 7, Moon: 4, Mercury: 7, Venus: 6, Mars: 4 }, retro: { Mercury: true, Venus: true, Mars: false } },
  '2026-12-15': { sid: { Sun: 7, Moon: 10, Mercury: 7, Venus: 6, Mars: 4, Jupiter: 4, Saturn: 11, Rahu: 9 }, nak: 23, trop: { Sun: 8, Moon: 11, Mercury: 8, Venus: 7, Mars: 5 }, retro: { Mercury: false, Venus: false, Mars: false } },
  '2027-01-15': { sid: { Sun: 9, Moon: 11, Mercury: 9, Venus: 7, Mars: 4, Jupiter: 4, Saturn: 11, Rahu: 9 }, nak: 26, trop: { Sun: 9, Moon: 0, Mercury: 10, Venus: 8, Mars: 5 }, retro: { Mercury: false, Venus: false, Mars: true } },
  '2027-03-10': { sid: { Sun: 10, Moon: 11, Mercury: 9, Venus: 9, Mars: 3, Jupiter: 3, Saturn: 11, Rahu: 9 }, nak: 26, trop: { Sun: 11, Moon: 0, Mercury: 10, Venus: 10, Mars: 4 }, retro: { Mercury: false, Venus: false, Mars: true } },
  '2027-06-21': { sid: { Sun: 2, Moon: 9, Mercury: 2, Venus: 1, Mars: 4, Jupiter: 3, Saturn: 0, Rahu: 9 }, nak: 20, trop: { Sun: 2, Moon: 9, Mercury: 3, Venus: 2, Mars: 5 }, retro: { Mercury: true, Venus: false, Mars: false } },
  '2027-09-05': { sid: { Sun: 4, Moon: 6, Mercury: 5, Venus: 4, Mars: 6, Jupiter: 4, Saturn: 0, Rahu: 9 }, nak: 14, trop: { Sun: 5, Moon: 7, Mercury: 6, Venus: 5, Mars: 7 }, retro: { Mercury: false, Venus: false, Mars: false } },
};

/** Moon sign changes during the India day (IST, SE bisection to 10 s). */
const MOON_CHANGES: { date: string; sidereal?: [number, string]; tropical?: [number, string] }[] = [
  { date: '2026-10-26', tropical: [1, '05:04:48'] },
  { date: '2026-11-01', sidereal: [3, '00:00:56'], tropical: [4, '09:48:16'] },
  { date: '2026-12-15', tropical: [11, '10:05:44'] },
  { date: '2027-01-15', sidereal: [0, '23:51:19'] },
  { date: '2027-06-21', sidereal: [9, '11:49:20'], tropical: [10, '23:30:35'] },
];
const minutes = (hhmm: string) => { const [h, m, s = 0] = hhmm.split(':').map(Number); return h * 60 + m + s / 60; };

describe('Vedic daily sky vs Swiss Ephemeris (Lahiri, 12:00 IST)', () => {
  for (const [date, r] of Object.entries(REF)) {
    it(`${date}: sidereal signs of all 9 grahas + Moon nakshatra`, () => {
      const s = vedicSky(date);
      for (const p of Object.keys(r.sid)) expect(s.sign[p as keyof typeof s.sign], p).toBe(r.sid[p]);
      expect(s.sign.Ketu).toBe((r.sid.Rahu + 6) % 12);
      expect(s.moonNak).toBe(r.nak);
    });
  }
  it('Moon sidereal sign-change times within 1 minute', () => {
    for (const c of MOON_CHANGES.filter(x => x.sidereal)) {
      const got = vedicSky(c.date).moonSignChanges;
      expect(got, c.date).toHaveLength(1);
      expect(got[0].to).toBe(c.sidereal![0]);
      expect(Math.abs(minutes(got[0].at) - minutes(c.sidereal![1])), c.date).toBeLessThanOrEqual(1);
    }
    for (const d of ['2026-10-26', '2026-12-15', '2027-03-10', '2027-09-05']) expect(vedicSky(d).moonSignChanges, d).toHaveLength(0);
  });
});

describe('Western daily sky vs Swiss Ephemeris (tropical, 12:00 IST)', () => {
  for (const [date, r] of Object.entries(REF)) {
    it(`${date}: tropical signs + retrogrades`, () => {
      const s = westernSky(date);
      for (const p of Object.keys(r.trop)) expect(s.sign[p as keyof typeof s.sign], p).toBe(r.trop[p]);
      for (const p of Object.keys(r.retro)) expect(s.retro[p as keyof typeof s.retro], p).toBe(r.retro[p]);
    });
  }
  it('Moon tropical sign-change times within 1 minute', () => {
    for (const c of MOON_CHANGES.filter(x => x.tropical)) {
      const got = westernSky(c.date).moonChange;
      expect(got, c.date).toBeTruthy();
      expect(got!.to).toBe(c.tropical![0]);
      expect(Math.abs(minutes(got!.at) - minutes(c.tropical![1])), c.date).toBeLessThanOrEqual(1);
    }
  });
  it('ingresses and stations in the ±3-day window match SE dates', () => {
    // SE: Mercury stations retrograde 2026-10-24 12:45 IST; Venus (retrograde) re-enters
    // Libra 2026-10-25 14:39 IST; Sun enters Scorpio 2026-10-23 15:08 IST.
    const ev = westernSky('2026-10-26').events;
    expect(ev.find(e => e.body === 'Mercury' && e.type === 'station-retrograde')?.date).toBe('2026-10-24');
    const venus = ev.find(e => e.body === 'Venus' && e.type === 'ingress')!;
    expect(venus.date).toBe('2026-10-25');
    expect(venus.sign).toBe(6);
    expect(venus.backwards).toBe(true);
    expect(Math.abs(minutes(venus.time) - minutes('14:39'))).toBeLessThanOrEqual(20);
    const sun = ev.find(e => e.body === 'Sun')!;
    expect([sun.date, sun.sign]).toEqual(['2026-10-23', 7]);
    expect(Math.abs(minutes(sun.time) - minutes('15:08'))).toBeLessThanOrEqual(2);
    // SE: Mercury enters Aquarius 2027-01-13 11:36 IST.
    const me = westernSky('2027-01-15').events.find(e => e.body === 'Mercury')!;
    expect([me.date, me.sign]).toEqual(['2027-01-13', 10]);
    expect(Math.abs(minutes(me.time) - minutes('11:36'))).toBeLessThanOrEqual(2);
    // SE: Mars stations retrograde 2027-01-10 18:33 IST — outside 15 Jan's ±3-day window.
    expect(westernSky('2027-01-15').events.some(e => e.body === 'Mars')).toBe(false);
    expect(westernSky('2027-01-12').events.find(e => e.body === 'Mars')?.type).toBe('station-retrograde');
  });
});

describe('W1 rules: Chandrabala, Tarabala, Sade Sati / Dhaiya', () => {
  it('Moon house is counted from the rashi (SE Moon in Mesha on 2026-10-26)', () => {
    expect(rashifalFactors('2026-10-26', 0).moonHouse).toBe(1);   // Mesh
    expect(rashifalFactors('2026-10-26', 7).moonHouse).toBe(6);   // Vrishchik: Mesha is 6th
    expect(rashifalFactors('2026-10-26', 1).moonHouse).toBe(12);  // Vrishabh: 12th
  });
  it('Chandrabala tone follows the classical table (1,3,6,7,10,11 good; 4,8,12 care)', () => {
    for (let r = 0; r < 12; r++) {
      const f = rashifalFactors('2026-10-26', r);
      const want = [1, 3, 6, 7, 10, 11].includes(f.moonHouse) ? 'good' : [4, 8, 12].includes(f.moonHouse) ? 'care' : 'mixed';
      expect(f.moonTone, `rashi ${r}`).toBe(want);
    }
  });
  it('Tarabala for the 3 Mesha nakshatras (SE Moon in Ashwini on 2026-10-26)', () => {
    expect(nakshatrasInRashi(0)).toEqual([0, 1, 2]);
    expect(nakshatrasInRashi(1)).toEqual([2, 3, 4]);
    expect(nakshatrasInRashi(11)).toEqual([24, 25, 26]);
    const t = rashifalFactors('2026-10-26', 0).taras;
    expect(t.map(x => x.tara)).toEqual([1, 9, 8]); // Janma, Parama Mitra, Mitra
  });
  it('Sade Sati + Dhaiya from SE Saturn in Meena (2026-10-26)', () => {
    const phase = (r: number) => rashifalFactors('2026-10-26', r).saturn;
    expect(phase(10).sadeSati).toBe('setting'); // Kumbh: 2nd
    expect(phase(11).sadeSati).toBe('peak');    // Meen: 1st
    expect(phase(0).sadeSati).toBe('rising');   // Mesh: 12th
    expect(phase(8).dhaiya).toBe(true);         // Dhanu: 4th (Kantaka)
    expect(phase(4).dhaiya).toBe(true);         // Simha: 8th (Ashtama)
    expect(phase(2).sadeSati).toBe('');
    expect(phase(2).dhaiya).toBe(false);
  });
  it('lucky time is a good Choghadiya that avoids Rahu Kaal (New Delhi)', () => {
    for (let i = 0; i < 14; i++) {
      const d = addDaysISO('2026-10-26', i);
      const s = vedicSky(d);
      const b = bestChoghadiya(s)!;
      expect(['Amrit', 'Shubh', 'Labh']).toContain(b.name);
      expect(b.end <= s.rahuKaal.start || b.start >= s.rahuKaal.end, d).toBe(true);
    }
  });
});

const allText = (e: DailyEntry) => [e.title, e.description, e.h1, e.answer, ...e.why.flatMap(w => [w.label, w.text]),
  ...e.sections.flatMap(s => [s.heading, s.text ?? '', ...(s.items ?? []).flatMap(i => [i.label, i.value, i.note ?? ''])]),
  ...e.faq.flatMap(f => [f.q, f.a])].join('\n');

const FEAR = /\b(death|die|dies|dying|disease|illness|accident|danger(ous)?|doom|surgery|fatal|disaster|curse[d]?|tragedy|misfortune)\b/i;
const FEAR_HI = /(मृत्यु|मौत|दुर्घटना|बीमारी|रोग होगा|ख़तरा|खतरा|अशुभ समाचार|विनाश)/;

describe('W1/W2 text rules', () => {
  const days = Array.from({ length: 30 }, (_, i) => addDaysISO('2026-10-26', i));
  const kinds: [string, readonly string[]][] = [['rashifal', RASHI_SLUGS], ['rashifal-hi', RASHI_SLUGS_HI], ['horoscope', SUN_SIGN_SLUGS]];

  it('deterministic: same (date, sign) gives byte-identical entries', () => {
    for (const [k, slugs] of kinds) expect(JSON.stringify(computeDaily(k, '2026-11-03', slugs[5]))).toBe(JSON.stringify(computeDaily(k, '2026-11-03', slugs[5])));
  });

  it('dated title / meta / H1 / visible date; answer-first is 2–4 sentences', () => {
    const e = computeDaily('rashifal', '2026-10-26', 'mesh');
    expect(e.title).toContain('26 October 2026');
    expect(e.description).toContain('26 October 2026');
    expect(e.h1).toBe('Mesh Rashifal Today — 26 October 2026');
    expect(e.dateLabel).toBe('Monday, 26 October 2026');
    const hi = computeDaily('rashifal-hi', '2026-10-26', 'mesha');
    expect(hi.title).toContain('26 अक्टूबर 2026');
    expect(hi.dateLabel).toBe('सोमवार, 26 अक्टूबर 2026');
    const w = computeDaily('horoscope', '2026-10-26', 'aries');
    expect(w.title).toBe('Aries Horoscope Today, 26 October 2026 — Western Astrology | BornClock');
    for (const x of [e, w]) {
      const n = x.answer.split(/(?<=[.!?])\s+/).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it('different days read differently (beyond the date) for every sign', () => {
    for (const [k, slugs] of kinds) for (const slug of slugs) {
      const texts = days.slice(0, 7).map(d => computeDaily(k, d, slug).sections[0].text);
      expect(new Set(texts).size, `${k}/${slug}`).toBeGreaterThanOrEqual(4);
    }
  });

  it('why-today has 2–3 factors, health is care-only, no fear words, no "undefined"', () => {
    for (const [k, slugs] of kinds) for (const slug of slugs) for (const d of days) {
      const e = computeDaily(k, d, slug);
      const t = allText(e);
      expect(e.why.length).toBeGreaterThanOrEqual(2);
      expect(e.why.length).toBeLessThanOrEqual(3);
      expect(t).not.toMatch(/undefined|NaN|\[object/);
      expect(FEAR.test(t), `${k}/${slug}/${d}: ${t.match(FEAR)?.[0]}`).toBe(false);
      if (k === 'rashifal-hi') {
        expect(FEAR_HI.test(t), `${slug}/${d}`).toBe(false);
        expect(e.answer).toMatch(/[ऀ-ॿ]/);
      }
      const health = e.sections.find(s => s.id === 'health' || s.id === 'wellbeing')!;
      expect(health.text).toMatch(/not medical advice|चिकित्सा सलाह नहीं/);
    }
  });

  it('Hindi and English readings use the same factors (same Moon house + nakshatra)', () => {
    for (let r = 0; r < 12; r++) {
      const en = computeDaily('rashifal', '2026-11-01', RASHI_SLUGS[r]);
      const hi = computeDaily('rashifal-hi', '2026-11-01', RASHI_SLUGS_HI[r]);
      const f = rashifalFactors('2026-11-01', r);
      expect(en.why[0].label).toContain(`${['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'][f.moonHouse]} house`);
      expect(hi.why[0].label).toContain(['', 'पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे', 'सातवें', 'आठवें', 'नौवें', 'दसवें', 'ग्यारहवें', 'बारहवें'][f.moonHouse]);
      expect(en.why[1].label).toContain('Pushya'); // SE: Moon nakshatra index 7 at 12:00 IST
      expect(hi.why[1].label).toContain('पुष्य');
    }
  });

  it('Western page is labelled Western (tropical) and points to the Vedic rashi', () => {
    const e = computeDaily('horoscope', '2026-10-26', 'leo');
    expect(e.description).toMatch(/Western, tropical/);
    expect(e.faq.some(f => /Vedic/.test(f.q) && /Moon sign \(rashi\)/.test(f.a))).toBe(true);
  });
});
