/**
 * Audit S1 / S2 / S4 / S5 / N2 — paid Birthday Report.
 *
 * Reference values:
 *  [SE] Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, engine-audit venv), run 23 Oct 2026:
 *       P9 1978-05-13 19:30 IST Jammu  → Moon 99.77°  Cancer, Pushya pada 2;  Asc 211.76° Scorpio
 *       P3 1990-01-15 06:30 IST Delhi  → Moon 138.02° Leo, Purva Phalguni pada 2; Asc 258.35° Sagittarius
 *       Moon over the whole calendar date (00:00 UTC+14 → 24:00 UTC−12):
 *         1978-05-13 Gemini → Cancer (changes), 1990-01-15 Leo → Virgo (changes),
 *         2000-01-03 Scorpio throughout, 2000-01-13 Pisces throughout.
 *  [R2] Audit round2.txt S1: founder's chart real Moon "Cancer / Pushya" (report showed
 *       Libra/Vishakha); P3 real "Leo/Purva Phalguni" (report showed Sagittarius/Mula).
 *  Gemstones: standard planet→stone table (Jupiter → Yellow Sapphire/Pukhraj, Mars → Red
 *  Coral/Moonga), Lagna-lord method as on /gemstones.
 */
import { describe, it, expect, vi } from 'vitest';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toVedicProfileLegacy } from '@/lib/vedic/legacyAdapters';
import { buildGemstoneReport } from '@/lib/vedic/gemstones';
import { vedicFromApi, fetchReportVedic, dateOnlyMoon, SIGN_EN } from '@/lib/reportVedic';
import { SAMPLE_BIRTH, SAMPLE_VEDIC } from '@/data/sampleReport';
import { RASHI_RATNA_DATA } from '@/data/rashiRatnaData';
import { VEDIC_SIGNS } from '@/services/VedicZodiacService';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn(), auth: { getSession: vi.fn() }, rpc: vi.fn() } }));
vi.mock('@/services/BirthdaySearchService', () => ({ getRankedBirthdayCelebrities: vi.fn().mockResolvedValue([]) }));

async function engineReport(y: number, m: number, d: number, h: number, min: number, lat: number, lon: number, tz: number) {
  const r = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { includeShadbala: true });
  return vedicFromApi(toVedicProfileLegacy(r, true) as any, { report: buildGemstoneReport(r) } as any, `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, { name: 'x', lat, lon });
}

describe('S1 — Moon sign / Nakshatra from the Kundali engine', () => {
  it('P9 (founder, 13 May 1978 19:30 Jammu) → Cancer / Pushya pada 2, Scorpio lagna [SE][R2]', async () => {
    const v = (await engineReport(1978, 5, 13, 19, 30, 32.7266, 74.857, 5.5))!;
    expect(SIGN_EN[v.moonSignIndex]).toBe('Cancer');
    expect(v.nakshatra).toBe('Pushya');
    expect(v.nakshatraNumber).toBe(8);
    expect(v.pada).toBe(2);
    expect(SIGN_EN[v.lagnaSignIndex!]).toBe('Scorpio');
    // Vedic Rashi is the MOON's sign (Karka), not the Sun's (the old report said Mesha)
    expect(VEDIC_SIGNS[v.moonSignIndex].name).toBe('Karka');
  });
  it('P3 (15 Jan 1990 06:30 New Delhi) → Leo / Purva Phalguni pada 2, Sagittarius lagna [SE][R2]', async () => {
    const v = (await engineReport(1990, 1, 15, 6, 30, 28.6139, 77.209, 5.5))!;
    expect(SIGN_EN[v.moonSignIndex]).toBe('Leo');
    expect(v.nakshatra).toBe('Purva Phalguni');
    expect(v.pada).toBe(2);
    expect(SIGN_EN[v.lagnaSignIndex!]).toBe('Sagittarius');
  });
  it('S4 — the sample page constants are exactly the engine output for the sample birth', async () => {
    const v = (await engineReport(1990, 1, 15, 6, 30, SAMPLE_BIRTH.place.lat, SAMPLE_BIRTH.place.lon, 5.5))!;
    expect(v.moonSignIndex).toBe(SAMPLE_VEDIC.moonSignIndex);
    expect(v.nakshatraNumber).toBe(SAMPLE_VEDIC.nakshatraNumber);
    expect(v.pada).toBe(SAMPLE_VEDIC.pada);
    expect(v.lagnaSignIndex).toBe(SAMPLE_VEDIC.lagnaSignIndex);
    expect(v.gem).toMatchObject({ planet: SAMPLE_VEDIC.gem.planet, gem: SAMPLE_VEDIC.gem.gem, hindi: SAMPLE_VEDIC.gem.hindi, role: SAMPLE_VEDIC.gem.role });
  });
  it('fetchReportVedic calls the engine endpoints with the birthplace (no tz guess) and maps the result', async () => {
    const calls: string[] = [];
    const fake = vi.fn(async (url: string) => {
      calls.push(url);
      if (url.startsWith('/api/vedic-profile')) return new Response(JSON.stringify({ nakshatra: { nakshatra: 'Pushya', pada: 2 }, rashi: 'Karka', lagna: { signIndex: 8 }, birthTimezone: { timezone: 'Asia/Kolkata' } }));
      return new Response(JSON.stringify({ report: { primary: { planet: 'Mars', gem: 'Red Coral', hindi: 'Moonga', role: 'Ascendant lord', reason: 'r' }, disclaimer: 'd' } }));
    });
    const v = await fetchReportVedic('1978-05-13', '19:30', { name: 'Jammu', lat: 32.7266, lon: 74.857 }, fake as any);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain('lat=32.7266');
    expect(calls[0]).toContain('h=19');
    expect(v).toMatchObject({ moonSignIndex: 3, nakshatraNumber: 8, pada: 2, lagnaSignIndex: 7, gem: { gem: 'Red Coral' }, timezone: 'Asia/Kolkata' });
  });
  it('no birth time → no engine call, null', async () => {
    const fake = vi.fn();
    expect(await fetchReportVedic('1978-05-13', '', { name: 'Jammu', lat: 1, lon: 1 }, fake as any)).toBeNull();
    expect(await fetchReportVedic('1978-05-13', '19:30', null, fake as any)).toBeNull();
    expect(fake).not.toHaveBeenCalled();
  });
});

describe('S1 — date only: Moon sign shown only when certain for the whole date', () => {
  it('days where the Moon changes sign → null (no guess) [SE]', () => {
    expect(dateOnlyMoon('1978-05-13')).toEqual({ moonSignIndex: null, nakshatraNumber: null });
    expect(dateOnlyMoon('1990-01-15')).toEqual({ moonSignIndex: null, nakshatraNumber: null });
  });
  it('days where the Moon stays in one sign everywhere → that sign [SE]', () => {
    expect(SIGN_EN[dateOnlyMoon('2000-01-03').moonSignIndex!]).toBe('Scorpio');
    expect(SIGN_EN[dateOnlyMoon('2000-01-13').moonSignIndex!]).toBe('Pisces');
  });
});

describe('S2 — Rashi Ratna box matches the Moon sign (lookup by English name)', () => {
  it('every Vedic sign finds its Rashi Ratna entry with the standard lord stone', () => {
    const expected: Record<string, string> = { Aries: 'Red Coral', Taurus: 'Diamond', Gemini: 'Emerald', Cancer: 'Pearl', Leo: 'Ruby', Virgo: 'Emerald', Libra: 'Diamond', Scorpio: 'Red Coral', Sagittarius: 'Yellow Sapphire', Capricorn: 'Blue Sapphire', Aquarius: 'Blue Sapphire', Pisces: 'Yellow Sapphire' };
    for (const sign of VEDIC_SIGNS) {
      const rr = RASHI_RATNA_DATA.find(r => r.rashiEnglish === sign.english);
      expect(rr?.primaryStone).toBe(expected[sign.english]);
      expect(rr?.caution.length).toBeGreaterThan(10);
    }
  });
});

describe('S5 / N2 — live report figures', () => {
  it('age, days lived and next birthday are computed for the viewing date, not frozen', async () => {
    const { liveReportFigures } = await import('@/services/BirthdayReportService');
    const before = liveReportFigures('2000-10-24', new Date(2026, 9, 23, 10));
    const on = liveReportFigures('2000-10-24', new Date(2026, 9, 24, 10));
    expect(before.age).toBe(25);
    expect(on.age).toBe(26);
    expect(before.daysUntilNextBirthday).toBe(1);
    expect(on.daysSinceBirth - before.daysSinceBirth).toBe(1);
    expect(liveReportFigures('2000-01-01', new Date(2000, 0, 31, 9)).daysSinceBirth).toBe(30);
  });
  it('Personal Year uses the site-wide /personal-year method for the CURRENT year (1–9, so heading and text always match)', async () => {
    const { liveReportFigures, PERSONAL_YEAR_MEANINGS } = await import('@/services/BirthdayReportService');
    const { computePersonalYear } = await import('@/lib/personalYear');
    // 15 Aug in 2026: 8 + 6 + (2026 → 10 → 1) = 15 → 6; in 2027: 8 + 6 + 2 = 16 → 7
    expect(liveReportFigures('1990-08-15', new Date(2026, 9, 23)).personalYear).toBe(6);
    expect(liveReportFigures('1990-08-15', new Date(2027, 0, 2)).personalYear).toBe(7);
    expect(liveReportFigures('1990-08-15', new Date(2027, 0, 2)).personalYearYear).toBe(2027);
    for (let t = Date.UTC(2000, 0, 1); t < Date.UTC(2001, 0, 1); t += 86_400_000) {
      const iso = new Date(t).toISOString().slice(0, 10);
      const f = liveReportFigures(iso, new Date(2026, 9, 23));
      expect(f.personalYear).toBe(computePersonalYear(new Date(t).getUTCMonth() + 1, new Date(t).getUTCDate(), 2026).number);
      expect(f.personalYear).toBeGreaterThanOrEqual(1);
      expect(f.personalYear).toBeLessThanOrEqual(9);
      expect(PERSONAL_YEAR_MEANINGS[f.personalYear]).toBeTruthy();
    }
  });
  it('generateReportData stores the shared Life Path and a Moon-based (or empty) Vedic Rashi', async () => {
    const { generateReportData } = await import('@/services/BirthdayReportService');
    const r = await generateReportData('A', '1990-08-15', '', '', 'IN');
    expect(r.lifePathNumber).toBe(6); // was 33 with the full-string method
    // 15 Aug 1990: the Moon changes sign during the date → no Rashi without birth time
    const dm = dateOnlyMoon('1990-08-15');
    expect(r.vedicRashi ? r.vedicRashi.english : null).toBe(dm.moonSignIndex != null ? SIGN_EN[dm.moonSignIndex] : null);
    expect(r.vedic).toBeNull();
  });
});
