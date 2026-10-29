/**
 * Batch 10 — solar and lunar eclipses 2026–2030 for the /eclipses pages.
 *
 * The eclipses themselves come from the same astronomy-engine search that
 * src/lib/vedic/festivals.ts uses (computeEclipses — every date and type already matches
 * NASA, see festivals.test.ts and /accuracy); this module adds the time of greatest
 * eclipse in IST and the lunar phase durations, and two sourced reference tables:
 *
 *  NASA — Fred Espenak's decade tables, opened 29 Oct 2026:
 *    https://eclipse.gsfc.nasa.gov/SEdecade/SEdecade2021.html  (solar)
 *    https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html  (lunar)
 *    → greatest-eclipse time (TD), magnitude, durations and the "geographic region of
 *      eclipse visibility", copied as printed. Our computed times are checked against
 *      these in __tests__/eclipses.test.ts.
 *  timeanddate.com — "Next Eclipses in India" (https://timeanddate.com/eclipse/in/india)
 *    and "Next Eclipses in Delhi" (https://timeanddate.com/eclipse/in/india/delhi-state),
 *    opened 29 Oct 2026: the eclipses of 2026–2030 those pages list as visible from India
 *    and from Delhi. Visibility from India is stated ONLY from these lists.
 *
 * Sutak timings are not given: we did not find a published rule we could cite and check.
 */
import * as Astronomy from 'astronomy-engine';

export const ECLIPSE_RANGE = { from: 2026, to: 2030 } as const;

export interface NasaRef {
  /** NASA calendar date (UT) YYYY-MM-DD */
  date: string;
  /** Greatest eclipse, Terrestrial Dynamical Time, as printed */
  td: string;
  type: 'Total' | 'Annular' | 'Partial' | 'Penumbral' | 'Hybrid';
  /** Eclipse magnitude (solar) / umbral magnitude (lunar) */
  magnitude: number;
  /** Lunar: partial / total phase duration as printed ("03h27m"); solar: central duration ("02m20s") */
  partial?: string; total?: string; central?: string;
  region: string;
}

/** NASA solar eclipses 2026–2030 (SEdecade2021). */
export const NASA_SOLAR: NasaRef[] = [
  { date: '2026-02-17', td: '12:13:05', type: 'Annular', magnitude: 0.963, central: '02m20s', region: 's Argentina & Chile, s Africa, Antarctica. [Annular: Antarctica]' },
  { date: '2026-08-12', td: '17:47:05', type: 'Total', magnitude: 1.039, central: '02m18s', region: 'n N. America, w Africa, Europe. [Total: Arctic, Greenland, Iceland, Spain]' },
  { date: '2027-02-06', td: '16:00:47', type: 'Annular', magnitude: 0.928, central: '07m51s', region: 'S. America, Antarctica, w & s Africa. [Annular: Chile, Argentina, Atlantic]' },
  { date: '2027-08-02', td: '10:07:49', type: 'Total', magnitude: 1.079, central: '06m23s', region: 'Africa, Europe, Mid East, w & s Asia. [Total: Morocco, Spain, Algeria, Libya, Egypt, Saudi Arabia, Yemen, Somalia]' },
  { date: '2028-01-26', td: '15:08:58', type: 'Annular', magnitude: 0.921, central: '10m27s', region: 'e N. America, C. & S. America, w Europe, nw Africa. [Annular: Ecuador, Peru, Brazil, Suriname, Spain, Portugal]' },
  { date: '2028-07-22', td: '02:56:39', type: 'Total', magnitude: 1.056, central: '05m10s', region: 'SE Asia, E. Indies, Australia, N.Z. [Total: Australia, N. Z.]' },
  { date: '2029-01-14', td: '17:13:47', type: 'Partial', magnitude: 0.871, region: 'N. America, C. America' },
  { date: '2029-06-12', td: '04:06:13', type: 'Partial', magnitude: 0.458, region: 'Arctic, Scandanavia, Alaska, n Asia, n Canada' },
  { date: '2029-07-11', td: '15:37:18', type: 'Partial', magnitude: 0.230, region: 's Chile, s Argentina' },
  { date: '2029-12-05', td: '15:03:57', type: 'Partial', magnitude: 0.891, region: 's Argentina, s Chile, Antarctica' },
  { date: '2030-06-01', td: '06:29:13', type: 'Annular', magnitude: 0.944, central: '05m21s', region: 'Europe, n Africa, Mid East, Asia, Arctic, Alaska. [Annular: Algeria, Tunisia, Greece, Turkey, Russia, n. China, Japan]' },
  { date: '2030-11-25', td: '06:51:37', type: 'Total', magnitude: 1.047, central: '03m44s', region: 's Africa, s Indian Oc., E. Indies, Australia, Antarctica. [Total: Botswana, S. Africa, Australia]' },
];

/** NASA lunar eclipses 2026–2030 (LEdecade2021). */
export const NASA_LUNAR: NasaRef[] = [
  { date: '2026-03-03', td: '11:34:52', type: 'Total', magnitude: 1.151, partial: '03h27m', total: '00h58m', region: 'e Asia, Australia, Pacific, Americas' },
  { date: '2026-08-28', td: '04:14:04', type: 'Partial', magnitude: 0.930, partial: '03h18m', region: 'e Pacific, Americas, Europe, Africa' },
  { date: '2027-02-20', td: '23:14:06', type: 'Penumbral', magnitude: -0.057, region: 'Americas, Europe, Africa, Asia' },
  { date: '2027-07-18', td: '16:04:09', type: 'Penumbral', magnitude: -1.068, region: 'e Africa, Asia, Australia, Pacific' },
  { date: '2027-08-17', td: '07:14:59', type: 'Penumbral', magnitude: -0.525, region: 'Pacific, Americas' },
  { date: '2028-01-12', td: '04:14:13', type: 'Partial', magnitude: 0.066, partial: '00h56m', region: 'Americas, Europe, Africa' },
  { date: '2028-07-06', td: '18:20:57', type: 'Partial', magnitude: 0.389, partial: '02h21m', region: 'Europe, Africa, Asia, Australia' },
  { date: '2028-12-31', td: '16:53:15', type: 'Total', magnitude: 1.246, partial: '03h29m', total: '01h11m', region: 'Europe, Africa, Asia, Australia, Pacific' },
  { date: '2029-06-26', td: '03:23:22', type: 'Total', magnitude: 1.844, partial: '03h40m', total: '01h42m', region: 'Americas, Europe, Africa, Mid East' },
  { date: '2029-12-20', td: '22:43:12', type: 'Total', magnitude: 1.117, partial: '03h33m', total: '00h54m', region: 'Americas, Europe, Africa, Asia' },
  { date: '2030-06-15', td: '18:34:34', type: 'Partial', magnitude: 0.502, partial: '02h24m', region: 'Europe, Africa, Asia, Australia' },
  { date: '2030-12-09', td: '22:28:51', type: 'Penumbral', magnitude: -0.163, region: 'Americas, Europe, Africa, Asia' },
];

/** timeanddate.com: eclipses (NASA UT date) listed as visible from India / from Delhi. */
export const VISIBLE_FROM_INDIA = new Set(['2026-03-03', '2027-02-20', '2027-08-02', '2028-01-12', '2028-07-06', '2028-07-22', '2028-12-31', '2029-06-26', '2029-12-20', '2030-06-01', '2030-06-15', '2030-12-09']);
export const VISIBLE_FROM_DELHI = new Set(['2026-03-03', '2027-02-20', '2027-08-02', '2028-07-06', '2028-12-31', '2029-12-20', '2030-06-01', '2030-06-15', '2030-12-09']);

export interface EclipseInfo {
  /** NASA calendar date (UT) — the key into the tables above */
  date: string;
  body: 'solar' | 'lunar';
  type: NasaRef['type'];
  name: string;
  /** Greatest eclipse (computed, UT) */
  peak: Date;
  /** IST civil date / clock time of greatest eclipse */
  istDate: string; istTime: string;
  /** Lunar: computed partial and total phase lengths in minutes (0 if none) */
  partialMin?: number; totalMin?: number;
  nasa: NasaRef;
  india: boolean; delhi: boolean;
}

const KIND: Record<string, NasaRef['type']> = { penumbral: 'Penumbral', partial: 'Partial', annular: 'Annular', total: 'Total', hybrid: 'Hybrid' };
const IST = 5.5 * 3600_000;
const istParts = (d: Date) => { const x = new Date(Math.round((d.getTime() + IST) / 60000) * 60000).toISOString(); return { istDate: x.slice(0, 10), istTime: x.slice(11, 16) }; };

const cache = new Map<number, EclipseInfo[]>();
/** Every solar and lunar eclipse of a year in 2026–2030, in time order. */
export function eclipsesOfYear(year: number): EclipseInfo[] {
  if (year < ECLIPSE_RANGE.from || year > ECLIPSE_RANGE.to) return [];
  const hit = cache.get(year);
  if (hit) return hit;
  const out: EclipseInfo[] = [];
  const from = new Date(Date.UTC(year, 0, 1) - 2 * 86400_000), to = Date.UTC(year + 1, 0, 1);
  const inYear = (d: Date) => d.getUTCFullYear() === year;
  for (let e = Astronomy.SearchLunarEclipse(from); e.peak.date.getTime() < to; e = Astronomy.NextLunarEclipse(e.peak)) {
    if (!inYear(e.peak.date)) continue;
    const date = e.peak.date.toISOString().slice(0, 10);
    const nasa = NASA_LUNAR.find(n => n.date === date);
    if (!nasa) continue;
    out.push({
      date, body: 'lunar', type: KIND[e.kind], name: `${KIND[e.kind]} Lunar Eclipse (Chandra Grahan)`, peak: e.peak.date, ...istParts(e.peak.date),
      partialMin: Math.round(2 * e.sd_partial), totalMin: Math.round(2 * e.sd_total), nasa,
      india: VISIBLE_FROM_INDIA.has(date), delhi: VISIBLE_FROM_DELHI.has(date),
    });
  }
  for (let e = Astronomy.SearchGlobalSolarEclipse(from); e.peak.date.getTime() < to; e = Astronomy.NextGlobalSolarEclipse(e.peak)) {
    if (!inYear(e.peak.date)) continue;
    const date = e.peak.date.toISOString().slice(0, 10);
    const nasa = NASA_SOLAR.find(n => n.date === date);
    if (!nasa) continue;
    out.push({
      date, body: 'solar', type: KIND[e.kind], name: `${KIND[e.kind]} Solar Eclipse (Surya Grahan)`, peak: e.peak.date, ...istParts(e.peak.date), nasa,
      india: VISIBLE_FROM_INDIA.has(date), delhi: VISIBLE_FROM_DELHI.has(date),
    });
  }
  out.sort((a, b) => a.peak.getTime() - b.peak.getTime());
  cache.set(year, out);
  return out;
}

/** Page title / description / H1 (mirrored in scripts/prerender-titles.mjs). */
export function eclipsesMeta(year?: number) {
  if (!year) return {
    title: 'Eclipses 2026–2030 — Surya & Chandra Grahan in India | BornClock',
    description: 'Every solar and lunar eclipse from 2026 to 2030 — date, time of greatest eclipse in IST, type, how long it lasts, where it is seen, and which ones are visible from India and Delhi.',
    h1: 'Solar and lunar eclipses 2026–2030',
  };
  return {
    title: `Eclipses ${year} — Surya & Chandra Grahan, IST Times | BornClock`,
    description: `Every solar (Surya Grahan) and lunar (Chandra Grahan) eclipse of ${year}: date, time of greatest eclipse in IST, type, duration, where it is seen, and whether it is visible from India.`,
    h1: `Eclipses in ${year} — Surya and Chandra Grahan`,
  };
}

export const ECLIPSE_YEARS_LIST = Array.from({ length: ECLIPSE_RANGE.to - ECLIPSE_RANGE.from + 1 }, (_, i) => ECLIPSE_RANGE.from + i);

/** "3 h 27 min" from minutes. */
export function durationText(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
}
