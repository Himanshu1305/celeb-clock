/**
 * Yogini Dasha (Batch 10) — the eight-Yogini, 36-year planetary-period system.
 *
 * Classical rule (sources opened 29 Oct 2026):
 *  - vedicmarga.com/yogini-dasha/ — "Add 3 to the number of that nakshatra and divide by 8";
 *    remainder 1 Mangala … 7 Siddha, remainder 0 = Sankata; each Mahadasha splits into 8
 *    Antardashas beginning with its own Yogini, length = Mahadasha years × Antardasha years / 36.
 *  - satyori.com/jyotish/dasha/yogini/ — same start rule; the Moon's exact position inside its
 *    birth nakshatra sets how much of the first period has already elapsed at birth.
 *  - pdfcoffee.com "An Introduction to the Yogini Dasha" — worked example: Moon 7s10°00′
 *    (Anuradha, nakshatra 17) → (17 + 3) mod 8 = 4 → Bhramari, balance 24 months.
 *  - PyJHora (github.com/naturalstupid/PyJHora, src/jhora/horoscope/dhasa/graha/yogini.py):
 *    the same nakshatra → Yogini map (Mars/Bhramari = Ashwini, Ashlesha, Anuradha, P.Bhadrapada).
 *
 * Yoginis and lords: Mangala–Moon 1y, Pingala–Sun 2y, Dhanya–Jupiter 3y, Bhramari–Mars 4y,
 * Bhadrika–Mercury 5y, Ulka–Saturn 6y, Siddha–Venus 7y, Sankata–Rahu 8y (total 36 years).
 *
 * Year length: 365.25 days — the SAME convention as our Vimshottari Dasha (vedicEngine.ts),
 * so the two timelines on the Kundali page are measured the same way. (JHora/PyJHora default
 * to the sidereal year, 365.2564 days; the difference is 0.0064 days per dasha-year, i.e. under
 * a day across a whole 36-year cycle.)
 *
 * Pure and deterministic: everything follows from the birth instant and the Moon's sidereal
 * (Lahiri) longitude. Antardashas are derived on demand by `yoginiAntardashas` so the API only
 * ships the Mahadasha list.
 */

export const YOGINI_YEAR_DAYS = 365.25;
const MS_PER_YEAR = YOGINI_YEAR_DAYS * 24 * 3600 * 1000;
export const YOGINI_CYCLE_YEARS = 36;

export interface YoginiInfo { name: string; lord: string; years: number }

/** Fixed order of the eight Yoginis (remainder 1 … 8). */
export const YOGINIS: readonly YoginiInfo[] = [
  { name: 'Mangala', lord: 'Moon', years: 1 },
  { name: 'Pingala', lord: 'Sun', years: 2 },
  { name: 'Dhanya', lord: 'Jupiter', years: 3 },
  { name: 'Bhramari', lord: 'Mars', years: 4 },
  { name: 'Bhadrika', lord: 'Mercury', years: 5 },
  { name: 'Ulka', lord: 'Saturn', years: 6 },
  { name: 'Siddha', lord: 'Venus', years: 7 },
  { name: 'Sankata', lord: 'Rahu', years: 8 },
];

export interface YoginiPeriod { yogini: string; lord: string; years: number; start: string; end: string }

export interface YoginiDashaResult {
  /** 1-based birth nakshatra number (Ashwini = 1). */
  nakshatraNumber: number;
  /** Yogini running at birth. */
  startYogini: string;
  /** Share of the birth nakshatra the Moon had already crossed (0–1). */
  fractionElapsed: number;
  /** Years of the first Yogini still to run at birth. */
  balanceYears: number;
  /** Day-length of one dasha year used for every date. */
  yearDays: number;
  /** Mahadashas from the (pre-birth) start of the birth Yogini, covering ≥120 years after birth. */
  mahadashas: YoginiPeriod[];
}

/** Index (0-based into YOGINIS) of the Yogini for a 1-based nakshatra number: (n + 3) mod 8, 0 → Sankata. */
export function yoginiIndexForNakshatra(nakshatraNumber: number): number {
  const r = (nakshatraNumber + 3) % 8;
  return r === 0 ? 7 : r - 1;
}

export function buildYoginiDasha(birthUTC: Date, moonSiderealLongitude: number, coverYears = 120): YoginiDashaResult {
  const span = 360 / 27;
  const lon = ((moonSiderealLongitude % 360) + 360) % 360;
  const nakIdx = Math.min(26, Math.floor(lon / span));
  const fraction = (lon - nakIdx * span) / span;
  const first = yoginiIndexForNakshatra(nakIdx + 1);
  const firstYears = YOGINIS[first].years;
  const elapsedYears = firstYears * fraction;
  const birthMs = birthUTC.getTime();
  let cursor = birthMs - elapsedYears * MS_PER_YEAR;
  const until = birthMs + coverYears * MS_PER_YEAR;
  const mahadashas: YoginiPeriod[] = [];
  for (let i = 0; cursor < until; i++) {
    const y = YOGINIS[(first + i) % 8];
    const end = cursor + y.years * MS_PER_YEAR;
    mahadashas.push({ yogini: y.name, lord: y.lord, years: y.years, start: new Date(cursor).toISOString(), end: new Date(end).toISOString() });
    cursor = end;
  }
  return {
    nakshatraNumber: nakIdx + 1,
    startYogini: YOGINIS[first].name,
    fractionElapsed: fraction,
    balanceYears: firstYears - elapsedYears,
    yearDays: YOGINI_YEAR_DAYS,
    mahadashas,
  };
}

/** The 8 Antardashas of one Mahadasha: start from the Mahadasha's own Yogini, length = maha × antar / 36. */
export function yoginiAntardashas(maha: { yogini: string; start: string; end: string }): YoginiPeriod[] {
  const idx = YOGINIS.findIndex(y => y.name === maha.yogini);
  if (idx < 0) return [];
  const startMs = Date.parse(maha.start);
  const totalMs = Date.parse(maha.end) - startMs;
  const mahaYears = YOGINIS[idx].years;
  const out: YoginiPeriod[] = [];
  let cursor = startMs;
  for (let k = 0; k < 8; k++) {
    const y = YOGINIS[(idx + k) % 8];
    // Proportional split of the parent's real span, so the 8 parts always sum to it exactly.
    const len = totalMs * (y.years / YOGINI_CYCLE_YEARS);
    const end = k === 7 ? startMs + totalMs : cursor + len;
    out.push({ yogini: y.name, lord: y.lord, years: (mahaYears * y.years) / YOGINI_CYCLE_YEARS, start: new Date(cursor).toISOString(), end: new Date(end).toISOString() });
    cursor = end;
  }
  return out;
}

/** The Mahadasha + Antardasha running at `at` (null outside the timeline). */
export function currentYoginiPeriod(d: Pick<YoginiDashaResult, 'mahadashas'>, at: Date = new Date()) {
  const t = at.getTime();
  const maha = d.mahadashas.find(m => t >= Date.parse(m.start) && t < Date.parse(m.end));
  if (!maha) return null;
  const antar = yoginiAntardashas(maha).find(a => t >= Date.parse(a.start) && t < Date.parse(a.end)) ?? null;
  return { maha, antar };
}
