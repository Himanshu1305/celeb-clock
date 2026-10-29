/**
 * Batch 10 — Gowri Panchangam (Tamil Nalla Neram), Tarabalam and Chandrabalam vs Drik
 * Panchang, pages opened with WebFetch on 29 Oct 2026:
 *   Gowri:  https://www.drikpanchang.com/tamil/tamil-gowri-panchangam.html — New Delhi Thu
 *           29 Oct 2026 and Sun 25 Oct 2026; Lancaster, California Thu 26 Feb 2026 (the page
 *           served these dates/cities; it ignored other date / city parameters).
 *   Tara / Chandra: https://www.drikpanchang.com/malayalam/panchangam/malayalam-day-panchangam.html
 *           ?date=06%2F08%2F2021 and ?date=22%2F08%2F2021 (New Delhi), and
 *           https://www.drikpanchang.com/panchang/day-panchang.html (served Lancaster CA,
 *           Fri 14 Nov 2025). Malayalam star names mapped to the standard ones
 *           (Ashwathi = Ashwini, Thiruvathira = Ardra, Pooyam = Pushya, …).
 * So Drik covers 3 dates in 2 cities for each feature (New Delhi ×2 + Lancaster ×1). Gowri
 * Gowri boundaries are the Choghadiya boundaries (8 equal parts of day and night), whose
 * sunrise / sunset are already checked against Drik for Chennai, Mumbai, Kolkata and Srinagar
 * in panchangDrik.test.ts. (Chennai pages on epanchang.com and prokerala.com were also read;
 * they use sunrises 2–3 min away from Drik's, so they are not used as references.)
 * Times: Drik prints HH:MM; ours are rounded to the nearest minute → within 1 minute
 * (Nakshatra / Moon-sign change instants within 2, as for the Panchang limbs).
 * Lancaster coordinates: GeoNames 34.69804, −118.13674 (Drik does not print them there).
 */
import { describe, it, expect } from 'vitest';
import { computePanchangDayData } from '../../daily/kinds/panchangDaily';
import { renderPanchangEntry, hhmm } from '../../daily/kinds/panchangTemplate';
import { renderDailyBodyHtml } from '../../daily/render';
import { gowriSlots, goodTarabalam, goodChandrabalam, ashtamaChandraSign, taraOf, chandraHouse, GOWRI_DAY, GOWRI_NIGHT, RASHI_NAMES } from '../gowriTara';
import { PANCHANG_TABLES } from '../panchang';

const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;
const DELHI = { name: 'New Delhi', lat: dms(28, 39, 7), lon: dms(77, 13, 53), tz: 5.5 };
const LANCASTER = { name: 'Lancaster', lat: 34.69804, lon: -118.13674, tz: -8 };
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const near = (got: number, want: string, what: string, tol = 1) => {
  const d = Math.abs((((got - toMin(want)) % 1440) + 1440 + 720) % 1440 - 720);
  expect(d, `${what}: got ${hhmm(got)}, ref ${want}`).toBeLessThanOrEqual(tol);
};

// [name, start] × 8 day and × 8 night (24-hour form of Drik's 12-hour times).
interface GowriRef { place: typeof DELHI; date: string; weekday: number; day: Array<[string, string]>; night: Array<[string, string]>; end: string; src: string }
const GOWRI: GowriRef[] = [
  { place: DELHI, date: '2026-10-29', weekday: 4, src: 'Drik', end: '06:31',
    day: [['Dhanam', '06:31'], ['Sugam', '07:54'], ['Soram', '09:18'], ['Uthi', '10:41'], ['Amirdha', '12:05'], ['Visham', '13:28'], ['Rogam', '14:52'], ['Laabam', '16:15']],
    night: [['Amirdha', '17:38'], ['Visham', '19:15'], ['Rogam', '20:52'], ['Laabam', '22:28'], ['Dhanam', '00:05'], ['Sugam', '01:42'], ['Soram', '03:18'], ['Uthi', '04:55']] },
  { place: DELHI, date: '2026-10-25', weekday: 0, src: 'Drik', end: '06:29',
    day: [['Uthi', '06:28'], ['Amirdha', '07:52'], ['Rogam', '09:16'], ['Laabam', '10:41'], ['Dhanam', '12:05'], ['Sugam', '13:29'], ['Soram', '14:53'], ['Visham', '16:18']],
    night: [['Dhanam', '17:42'], ['Sugam', '19:18'], ['Soram', '20:54'], ['Visham', '22:29'], ['Uthi', '00:05'], ['Amirdha', '01:41'], ['Rogam', '03:17'], ['Laabam', '04:53']] },
  { place: LANCASTER, date: '2026-02-26', weekday: 4, src: 'Drik', end: '06:24',
    day: [['Dhanam', '06:25'], ['Sugam', '07:50'], ['Soram', '09:15'], ['Uthi', '10:41'], ['Amirdha', '12:06'], ['Visham', '13:31'], ['Rogam', '14:56'], ['Laabam', '16:21']],
    night: [['Amirdha', '17:46'], ['Visham', '19:21'], ['Rogam', '20:56'], ['Laabam', '22:30'], ['Dhanam', '00:05'], ['Sugam', '01:40'], ['Soram', '03:15'], ['Uthi', '04:49']] },
];

describe('Gowri Panchangam vs Drik Panchang ', () => {
  for (const g of GOWRI) {
    it(`${g.place.name} ${g.date} (${g.src})`, () => {
      const d = computePanchangDayData(g.place, g.date);
      const s = gowriSlots(g.weekday, d.c);
      expect(s.day.map(x => x.name)).toEqual(g.day.map(x => x[0]));
      expect(s.night.map(x => x.name)).toEqual(g.night.map(x => x[0]));
      s.day.forEach((x, i) => near(x.start, g.day[i][1], `day ${i + 1} ${x.name}`, 1));
      s.night.forEach((x, i) => near(x.start, g.night[i][1], `night ${i + 1} ${x.name}`, 1));
      near(s.night[7].end, g.end, 'next sunrise', 1);
    });
  }

  // Weekday orders read off the other sources named in ../gowriTara.ts (29 Oct 2026).
  it('weekday orders agree with the published weekly tables', () => {
    // kundligpt.com 7-day table, Thu 29 Oct – Wed 4 Nov 2026 (day + night).
    const KG: Array<[number, string, string]> = [
      [4, 'Dhanam Sugam Soram Uthi Amirdha Visham Rogam Laabam', 'Amirdha Visham Rogam Laabam Dhanam Sugam Soram Uthi'],
      [5, 'Sugam Soram Uthi Visham Amirdha Rogam Laabam Dhanam', 'Rogam Laabam Dhanam Sugam Soram Uthi Visham Amirdha'],
      [6, 'Soram Uthi Visham Amirdha Rogam Laabam Dhanam Sugam', 'Laabam Dhanam Sugam Soram Uthi Visham Amirdha Rogam'],
      [0, 'Uthi Amirdha Rogam Laabam Dhanam Sugam Soram Visham', 'Dhanam Sugam Soram Visham Uthi Amirdha Rogam Laabam'],
      [1, 'Amirdha Visham Rogam Laabam Dhanam Sugam Soram Uthi', 'Sugam Soram Uthi Amirdha Visham Rogam Laabam Dhanam'],
      [2, 'Rogam Laabam Dhanam Sugam Soram Uthi Visham Amirdha', 'Soram Uthi Visham Amirdha Rogam Laabam Dhanam Sugam'],
      [3, 'Laabam Dhanam Sugam Soram Visham Uthi Amirdha Rogam', 'Uthi Amirdha Rogam Laabam Dhanam Sugam Soram Visham'],
    ];
    for (const [wd, day, night] of KG) {
      expect(GOWRI_DAY[wd].join(' '), `day ${wd}`).toBe(day);
      expect(GOWRI_NIGHT[wd].join(' '), `night ${wd}`).toBe(night);
    }
    // muhuratam.in Chennai, Wed 19 Aug 2026 (day + night); Rajkot Sat 9 May 2026 (day).
    expect(GOWRI_DAY[3].join(' ')).toBe('Laabam Dhanam Sugam Soram Visham Uthi Amirdha Rogam');
    expect(GOWRI_NIGHT[3].join(' ')).toBe('Uthi Amirdha Rogam Laabam Dhanam Sugam Soram Visham');
    expect(GOWRI_DAY[6].join(' ')).toBe('Soram Uthi Visham Amirdha Rogam Laabam Dhanam Sugam');
  });
});

// Drik's Tarabalam / Chandrabalam lists, by span (till the change, then till next sunrise).
interface TaraRef { place: typeof DELHI; date: string; nak: Array<[string, string | null, string[]]>; rashi: Array<[string, string | null, string[], string]> }
const N = (s: string) => s.split(', ');
const TARA: TaraRef[] = [
  { place: DELHI, date: '2021-08-06',
    nak: [
      ['Ardra', '06:38', N('Ashwini, Krittika, Mrigashira, Punarvasu, Pushya, Magha, Uttara Phalguni, Chitra, Vishakha, Anuradha, Mula, Uttara Ashadha, Dhanishtha, Purva Bhadrapada, Uttara Bhadrapada')],
      ['Punarvasu', null, N('Bharani, Rohini, Ardra, Pushya, Ashlesha, Purva Phalguni, Hasta, Swati, Anuradha, Jyeshtha, Purva Ashadha, Shravana, Shatabhisha, Uttara Bhadrapada, Revati')],
    ],
    rashi: [
      ['Mithuna', '01:55', N('Mesha, Mithuna, Simha, Kanya, Dhanu, Makara'), 'Vrishchika'],
      ['Karka', null, N('Vrishabha, Karka, Kanya, Tula, Makara, Kumbha'), 'Dhanu'],
    ] },
  { place: DELHI, date: '2021-08-22',
    nak: [
      ['Dhanishtha', '19:40', N('Bharani, Rohini, Ardra, Punarvasu, Ashlesha, Purva Phalguni, Hasta, Swati, Vishakha, Jyeshtha, Purva Ashadha, Shravana, Shatabhisha, Purva Bhadrapada, Revati')],
      ['Shatabhisha', null, N('Ashwini, Krittika, Mrigashira, Punarvasu, Pushya, Magha, Uttara Phalguni, Chitra, Vishakha, Anuradha, Mula, Uttara Ashadha, Dhanishtha, Purva Bhadrapada, Uttara Bhadrapada')],
    ],
    rashi: [
      ['Makara', '07:57', N('Mesha, Karka, Simha, Vrishchika, Makara, Meena'), 'Mithuna'],
      ['Kumbha', null, N('Mesha, Vrishabha, Simha, Kanya, Dhanu, Kumbha'), 'Karka'],
    ] },
  { place: LANCASTER, date: '2025-11-14',
    nak: [
      ['Purva Phalguni', '07:50', N('Ashwini, Krittika, Rohini, Ardra, Pushya, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Shravana, Shatabhisha, Uttara Bhadrapada')],
      ['Uttara Phalguni', null, N('Bharani, Rohini, Mrigashira, Punarvasu, Ashlesha, Purva Phalguni, Hasta, Chitra, Vishakha, Jyeshtha, Purva Ashadha, Shravana, Dhanishtha, Purva Bhadrapada, Revati')],
    ],
    rashi: [
      ['Simha', '14:21', N('Mithuna, Simha, Tula, Vrishchika, Kumbha, Meena'), 'Makara'],
      ['Kanya', null, N('Mesha, Karka, Kanya, Vrishchika, Dhanu, Meena'), 'Kumbha'],
    ] },
];

describe('Tarabalam and Chandrabalam vs Drik Panchang (3 dates, 2 cities)', () => {
  for (const t of TARA) {
    it(`${t.place.name} ${t.date}`, () => {
      const d = computePanchangDayData(t.place, t.date);
      const nextRise = d.c[16];
      const ns: Array<[number, number]> = [], ms: Array<[number, number]> = [];
      for (let i = 0; i < d.ns!.length; i += 2) ns.push([d.ns![i], d.ns![i + 1]]);
      for (let i = 0; i < d.ms!.length; i += 2) ms.push([d.ms![i], d.ms![i + 1]]);
      expect(ns.length).toBe(t.nak.length);
      t.nak.forEach(([nak, till, list], i) => {
        expect(PANCHANG_TABLES.NAKSHATRAS[ns[i][0]]).toBe(nak);
        if (till) near(ns[i][1], till, `${nak} ends`, 2); else expect(ns[i][1]).toBeGreaterThanOrEqual(nextRise);
        expect(goodTarabalam(ns[i][0]).map(n => PANCHANG_TABLES.NAKSHATRAS[n])).toEqual(list);
      });
      expect(ms.length).toBe(t.rashi.length);
      t.rashi.forEach(([sign, till, list, ashtama], i) => {
        expect(RASHI_NAMES[ms[i][0]]).toBe(sign);
        if (till) near(ms[i][1], till, `Moon in ${sign} ends`, 2); else expect(ms[i][1]).toBeGreaterThanOrEqual(nextRise);
        expect(goodChandrabalam(ms[i][0]).map(s => RASHI_NAMES[s]).sort()).toEqual([...list].sort());
        expect(RASHI_NAMES[ashtamaChandraSign(ms[i][0])]).toBe(ashtama);
      });
    });
  }
  it('rule: good taras 2, 4, 6, 8, 9 and Chandra houses 1, 3, 6, 7, 10, 11', () => {
    expect(taraOf(0, 0)).toBe(1);
    expect(taraOf(0, 9)).toBe(1);
    expect(taraOf(26, 0)).toBe(2);
    expect(goodTarabalam(5)).toHaveLength(15);
    expect(chandraHouse(9, 4)).toBe(8); // Makara-born, Moon in Simha → Ashtama (Drik, 14 Nov 2025)
  });
});

describe('Panchang page carries the new sections (answer-first page unchanged)', () => {
  it('New Delhi 29 Oct 2026', () => {
    const d = computePanchangDayData(DELHI, '2026-10-29');
    const e = renderPanchangEntry('panchang', { name: 'New Delhi' }, '2026-10-29', d);
    const ids = e.sections.map(s => s.id);
    expect(ids.slice(-4)).toEqual(['gowri-day', 'gowri-night', 'tarabalam', 'chandrabalam']);
    expect(e.faq.at(-1)!.a).toContain('Dhanam 06:31–07:54, Sugam 07:54–09:18, Uthi 10:41–12:05, Amirdha 12:05–13:28, Laabam 16:15–17:38');
    const html = renderDailyBodyHtml(e);
    expect(html).toContain('Gowri Panchangam');
    expect(html).not.toContain('<div');
    // Rahu Kaal / Choghadiya pages are unchanged by Batch 10.
    expect(renderPanchangEntry('rahu-kaal', { name: 'New Delhi' }, '2026-10-29', d).sections.map(s => s.id)).not.toContain('gowri-day');
  });
});
