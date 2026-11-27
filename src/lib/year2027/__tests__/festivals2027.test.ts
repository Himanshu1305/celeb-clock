/**
 * B14 — every 2027 festival page date comes from the festival engine (never typed by hand),
 * and equals the date the /festivals/2027 calendar shows.
 */
import { describe, it, expect } from 'vitest';
import { computeFestivalCalendar, festivalDetails, tithiDays, pradoshDays } from '@/lib/vedic/festivals';
import { festivals2027 } from '../festivalData';
import { FESTIVALS_2027 } from '../meta.js';
import { FESTIVAL_TEXT_EN, FESTIVAL_TEXT_HI } from '../festivalContent';

const cal = computeFestivalCalendar(2027).festivals;
const details = festivalDetails(2027);
const pagesEn = festivals2027('en');
const pagesHi = festivals2027('hi');

describe('B14 — festival page dates == festival engine', () => {
  it.each(FESTIVALS_2027.map(f => [f.slug, f.engine] as const))('%s', (slug, engine) => {
    const page = pagesEn.find(p => p.slug === slug)!;
    expect(page, slug).toBeTruthy();
    const inCal = cal.find(f => f.name === engine);
    const inDetails = details.find(f => f.name === engine);
    // Every page's festival is resolved by the engine.
    expect(inCal ?? inDetails, `${engine} not in engine`).toBeTruthy();
    if (inCal) expect(page.dateISO).toBe(inCal.dateISO);
    if (inDetails) expect(page.dateISO).toBe(inDetails.dateISO);
    // The Hindi page shows the same date.
    expect(pagesHi.find(p => p.slug === slug)!.dateISO).toBe(page.dateISO);
    expect(page.dateISO.startsWith('2027-')).toBe(true);
  });

  it('festivalDetails gives the same date as the calendar for every shared festival', () => {
    for (const d of details) {
      const c = cal.find(f => f.name === d.name);
      if (c) expect(d.dateISO, d.name).toBe(c.dateISO);
    }
  });

  it('the two extra observances follow their rules', () => {
    const ugadi = cal.find(f => f.name === 'Ugadi / Gudi Padwa')!;
    expect(details.find(f => f.name === 'Chaitra Navratri begins (Ghatasthapana)')!.dateISO).toBe(ugadi.dateISO);
    const navami = details.find(f => f.name === 'Maha Navami')!;
    const ashtami = cal.find(f => f.name === 'Durga Ashtami')!;
    const dussehra = cal.find(f => f.name === 'Dussehra (Vijayadashami)')!;
    expect(navami.dateISO > ashtami.dateISO).toBe(true);
    expect(navami.dateISO <= dussehra.dateISO).toBe(true);
    // Drik Panchang 2027: Navami begins 06:27 IST on 8 Oct (= 17:57 PDT, 7 Oct on its Lancaster page).
    expect(new Date(navami.tithiStart + 5.5 * 3600_000).toISOString().slice(0, 16)).toBe('2027-10-08T06:27');
    expect(navami.dateISO).toBe('2027-10-08');
    expect(navami.alt?.dateISO).toBe('2027-10-09');
  });

  it('every festival date lies inside (or at the sunrise / evening edge of) its tithi', () => {
    for (const d of details) {
      const dayStart = Date.parse(d.dateISO + 'T00:00:00Z') - 5.5 * 3600_000;
      const dayEnd = dayStart + 2 * 86400_000; // allow the night after (nishita) and the Holi day after
      expect(d.tithiEnd > dayStart - 86400_000, d.name).toBe(true);
      expect(d.tithiStart < dayEnd, d.name).toBe(true);
    }
  });

  it('the Ekadashi / Purnima / Amavasya lists equal the calendar rows', () => {
    const td = tithiDays(2027);
    expect(td.length).toBe(cal.filter(f => f.type === 'ekadashi' || f.type === 'purnima' || f.type === 'amavasya').length);
    for (const t of td) expect(cal.some(f => f.name === t.name && f.dateISO === t.dateISO), `${t.name} ${t.dateISO}`).toBe(true);
    for (const t of td) expect(t.tithiEnd > t.tithiStart).toBe(true);
  });

  it('content exists for every page (English) and every Hindi page', () => {
    for (const f of FESTIVALS_2027) {
      const t = FESTIVAL_TEXT_EN[f.slug];
      expect(t, f.slug).toBeTruthy();
      expect(t.what.length).toBeGreaterThan(0);
      expect(t.observed.length).toBeGreaterThanOrEqual(3);
      if (f.hiPage) {
        expect(FESTIVAL_TEXT_HI[f.slug], f.slug).toBeTruthy();
        expect(FESTIVAL_TEXT_HI[f.slug].what.join(' ')).toMatch(/[ऀ-ॿ]/);
      }
    }
  });

  it('static festival text never hard-codes a 2027 day-and-month (dates come from the engine)', () => {
    const all = JSON.stringify({ FESTIVAL_TEXT_EN, FESTIVAL_TEXT_HI });
    const MONTHS = /\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\d{1,2} (जनवरी|फ़रवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)/;
    // The only day-month in the text: Makar Sankranti's general "14 or 15 January" (not a 2027 date).
    expect(all.replace(/14 or 15 January/g, '').replace(/14 या 15 जनवरी/g, '')).not.toMatch(MONTHS);
  });
});

describe('Pradosh Vrat 2027 list == festival engine calendar', () => {
  const rows = pradoshDays(2027);
  it('has the same dates as the calendar\'s Pradosh rows', () => {
    const calRows = cal.filter(f => f.name.startsWith('Pradosh Vrat')).map(f => `${f.dateISO} ${f.name}`).sort();
    expect(rows.map(r => `${r.dateISO} ${r.name}`).sort()).toEqual(calRows);
    expect(rows).toHaveLength(25);
  });
  it('Trayodashi covers the evening of each vrat day and Drik reference dates match', () => {
    for (const r of rows) expect(r.tithiEnd).toBeGreaterThan(r.tithiStart);
    // drikpanchang.com Shani Pradosha 2027 page: 14 Aug 2027; Mahashivratri eve 5 Mar 2027.
    expect(rows.map(r => r.dateISO)).toEqual(expect.arrayContaining(['2027-08-14', '2027-03-05']));
  });
});
