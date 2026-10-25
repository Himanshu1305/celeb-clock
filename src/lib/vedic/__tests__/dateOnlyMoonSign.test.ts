/**
 * Batch 6 regression — date-only Moon sign (Rashi) / Nakshatra and celebrity snippets.
 *
 * REFERENCE: Swiss Ephemeris (pyswisseph, swe.FLG_SWIEPH | swe.FLG_SIDEREAL,
 * swe.set_sid_mode(swe.SIDM_LAHIRI), ephemeris files sepl/semo_18) run in
 * scratchpad/engine-audit/venv — Moon sidereal longitude at 00:00 and 23:59 IST
 * (UTC+05:30) on each birth date. Values copied verbatim below. The old code
 * (calculateVedicRashi) returned the Western Sun sign renamed, e.g. "Tula" for
 * Gandhi (Sun in Libra) — his Moon was in Karka/Simha that day.
 */
import { describe, it, expect } from 'vitest';
import { moonSignsForDate, birthDayWindowForNationality, describeAlternatives, IST_WINDOW } from '../dateOnlyMoonSign';
import { celebrityAgeInfo, generateCelebrityMeta } from '@/utils/celebrityUtils';
import { celebrityProfileFacts } from '@/lib/celebrityProfile';

type Ref = [label: string, date: string, startLon: number, endLon: number, signs: string[], naks: string[]];
const REF: Ref[] = [
  // Gandhi — pre-1900, Moon changes sign that day
  ['Mahatma Gandhi', '1869-10-02', 113.119, 127.607, ['Karka', 'Simha'], ['Ashlesha', 'Magha']],
  ['Jawaharlal Nehru', '1889-11-14', 96.475, 108.320, ['Karka'], ['Pushya', 'Ashlesha']],
  // Tagore — pre-1900, sign changes across the Meena → Mesha wrap
  ['Rabindranath Tagore', '1861-05-07', 349.322, 1.168, ['Meena', 'Mesha'], ['Revati', 'Ashwini']],
  ['Swami Vivekananda', '1863-01-12', 164.091, 177.277, ['Kanya'], ['Hasta', 'Chitra']],
  ['Bhimrao Ambedkar', '1891-04-14', 64.705, 77.408, ['Mithuna'], ['Mrigashira', 'Ardra']],
  ['Lata Mangeshkar', '1929-09-28', 93.574, 107.868, ['Karka'], ['Pushya', 'Ashlesha']],
  ['A. P. J. Abdul Kalam', '1931-10-15', 222.286, 236.369, ['Vrischika'], ['Anuradha', 'Jyeshtha']],
  ['Amitabh Bachchan', '1942-10-11', 181.516, 195.630, ['Tula'], ['Chitra', 'Swati']],
  ['Narendra Modi', '1950-09-17', 212.207, 226.563, ['Vrischika'], ['Vishakha', 'Anuradha']],
  ['Shah Rukh Khan', '1965-11-02', 290.310, 302.195, ['Makara', 'Kumbha'], ['Shravana', 'Dhanishtha']],
  ['Sachin Tendulkar', '1973-04-24', 258.165, 270.061, ['Dhanu', 'Makara'], ['Purva Ashadha', 'Uttara Ashadha']],
  ['Priyanka Chopra', '1982-07-18', 48.853, 63.717, ['Vrishabha', 'Mithuna'], ['Rohini', 'Mrigashira']],
  ['Virat Kohli', '1988-11-05', 145.183, 156.999, ['Simha', 'Kanya'], ['Purva Phalguni', 'Uttara Phalguni']],
];

const angDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('moonSignsForDate — Swiss Ephemeris reference (IST, 00:00 and 23:59)', () => {
  for (const [label, date, a, b, signs, naks] of REF) {
    it(`${label} ${date} → ${describeAlternatives(signs)}`, () => {
      const r = moonSignsForDate(date, IST_WINDOW)!;
      expect(angDiff(r.startLongitude, a)).toBeLessThan(0.02);
      expect(angDiff(r.endLongitude, b)).toBeLessThan(0.02);
      expect(r.signNames).toEqual(signs);
      expect(r.nakshatraNames).toEqual(naks);
    });
  }

  it('one sign all day → shown alone; a change → "X or Y (depends on birth time)"', () => {
    expect(describeAlternatives(moonSignsForDate('1889-11-14')!.signNames)).toBe('Karka');
    expect(describeAlternatives(moonSignsForDate('1869-10-02')!.signNames)).toBe('Karka or Simha (depends on birth time)');
  });

  it('default window is IST; India and unknown nationality use IST', () => {
    expect(birthDayWindowForNationality('IN')).toEqual(IST_WINDOW);
    expect(birthDayWindowForNationality(null)).toEqual(IST_WINDOW);
    expect(moonSignsForDate('1869-10-02')!.window).toEqual(IST_WINDOW);
  });

  it('a multi-zone country widens the day (never narrower than any single zone in it)', () => {
    const us = moonSignsForDate('1965-11-02', birthDayWindowForNationality('US'))!;
    const ist = moonSignsForDate('1965-11-02')!;
    const span = (x: typeof us) => ((x.endLongitude - x.startLongitude) + 360) % 360;
    expect(span(us)).toBeGreaterThan(span(ist));
  });

  it('is fast enough for ~3,100 prerendered pages (cached)', () => {
    const t0 = Date.now();
    for (let y = 1900; y < 2000; y++) for (let m = 1; m <= 12; m++) moonSignsForDate(`${y}-${String(m).padStart(2, '0')}-15`);
    expect(Date.now() - t0).toBeLessThan(3000);
  });
});

describe('celebrity snippets — deceased people never get a current age', () => {
  const NOW = new Date('2026-10-25T12:00:00');
  // death_date as exported from celebrity_sitelinks (read-only select, 25 Oct 2026).
  const gandhi = { name: 'Mahatma Gandhi', slug: 'mahatma-gandhi', birth_date: '1869-10-02', birth_year: 1869, death_year: 1948, death_date: '1948-01-30', nationality_code: 'IN' };
  const kohli = { name: 'Virat Kohli', slug: 'virat-kohli', birth_date: '1988-11-05', birth_year: 1988, death_year: null, nationality_code: 'IN' };

  it('Gandhi (2 Oct 1869 – 30 Jan 1948): exact age 78, no "years old", Moon sign Karka or Simha, never "Tula Rashi"', () => {
    const f = celebrityProfileFacts(gandhi, 'mahatma-gandhi', NOW);
    expect(f.description).toBe('Mahatma Gandhi died in 1948, aged 78. Libra Sun sign, Life Path 9, Moon sign (Rashi) Karka or Simha. Birthday profile on BornClock.');
    expect(f.description).not.toMatch(/years old|about/);
    expect(f.description).not.toMatch(/Tula/);
    expect(f.age.display).toBe('Died in 1948, aged 78');
    expect(f.deathDateKnown).toBe('1948-01-30');
    expect(f.moon!.rashiText).toBe('Karka or Simha (depends on birth time)');
  });

  it('living person meta: birthday-aware current age', () => {
    const f = celebrityProfileFacts(kohli, 'virat-kohli', NOW);
    expect(f.description).toBe('Virat Kohli is 37 years old. Scorpio Sun sign, Life Path 6, Moon sign (Rashi) Simha or Kanya. Birthday profile on BornClock.');
  });

  it('death-date override gives the exact age at death (Jimmy Carter)', () => {
    const f = celebrityProfileFacts(
      { name: 'Jimmy Carter', slug: 'jimmy-carter', birth_date: '1924-10-01', birth_year: 1924, death_year: null, nationality_code: 'US' },
      'jimmy-carter', NOW,
    );
    expect(f.age.snippet).toBe('died in 2024, aged 100');
    expect(f.description.startsWith('Jimmy Carter died in 2024, aged 100.')).toBe(true);
  });

  it('01-01 death date is a year-only placeholder → the two possible ages, never "about"', () => {
    // Sarojini Naidu: born 13 Feb 1879; DB death_date "1949-01-01" (placeholder).
    const f = celebrityProfileFacts(
      { name: 'Sarojini Naidu', slug: 'sarojini-naidu', birth_date: '1879-02-13', birth_year: 1879, death_year: 1949, death_date: '1949-01-01', nationality_code: 'IN' },
      'sarojini-naidu', NOW,
    );
    expect(f.age.display).toBe('Died in 1949, aged 69 or 70');
    expect(f.age.snippet).toBe('died in 1949, aged 69 or 70');
    expect(f.deathDateKnown).toBeNull(); // JSON-LD then uses the year only
    expect(f.description).not.toMatch(/about/);
  });

  it('only a death year (no date) → the two possible ages', () => {
    const a = celebrityAgeInfo({ year: 1869, month: 10, day: 2, isFullDate: true }, { deathYear: 1948 }, NOW);
    expect(a.snippet).toBe('died in 1948, aged 78 or 79');
  });

  it('01-01 birth placeholder (year-only DOB) with a full death date → the two possible ages', () => {
    const a = celebrityAgeInfo({ year: 1900, month: 0, day: 0, isFullDate: false }, { deathYear: 1970, deathDate: '1970-05-10' }, NOW);
    expect(a.display).toBe('Died in 1970, aged 69 or 70');
  });

  it('generateCelebrityMeta with death facts never says "is N years old"', () => {
    const dob = { year: 1869, month: 10, day: 2, isFullDate: true };
    const m = generateCelebrityMeta('Mahatma Gandhi', dob, 'Libra', 'Karka or Simha', 9, { deathYear: 1948 }, NOW);
    expect(m).not.toMatch(/years old/);
    expect(m.length).toBeLessThanOrEqual(160);
  });

  it('age info: living age above the safety cap is not shown', () => {
    const a = celebrityAgeInfo({ year: 1900, month: 5, day: 5, isFullDate: true }, {}, NOW);
    expect(a.display).toBe('Age not shown');
    expect(a.snippet).toBe('was born in 1900');
  });
});
