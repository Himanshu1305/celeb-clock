/**
 * Code-side corrections for celebrity data (S7, S8, S9, S14).
 *
 * Celebrity rows come from Supabase (celebrity_sitelinks) and from the static
 * export src/data/celebrities.json. Until the founder applies
 * supabase/migrations/NOTES-celebrity-data-corrections.sql, these overrides are
 * applied wherever celebrity data is loaded so pages are correct regardless.
 *
 * Every date below was checked against the person's English Wikipedia infobox
 * (WebFetch, 23 Oct 2026). Do not add an entry without a source.
 */

/** "Pope Francis" → "pope-francis" (same shape as the site's celebrity slugs). */
export function slugifyName(name: string): string {
  return name
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/['’.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** S7 — deaths missing from the data. Keyed by slug. */
export const CELEB_DEATH_OVERRIDES: Record<string, string> = {
  'jimmy-carter': '2024-12-29',   // en.wikipedia.org/wiki/Jimmy_Carter
  'pope-francis': '2025-04-21',   // en.wikipedia.org/wiki/Pope_Francis
  'rohit-bal': '2024-11-01',      // en.wikipedia.org/wiki/Rohit_Bal
  'dharmendra': '2025-11-24',     // en.wikipedia.org/wiki/Dharmendra
  'asrani': '2025-10-20',         // en.wikipedia.org/wiki/Asrani
  'm-karunanidhi': '2018-08-07',  // en.wikipedia.org/wiki/M._Karunanidhi (DB had 2018-01-01)
};

/** S6 — birth dates wrong in the DB (static data was fixed in place). */
export const CELEB_BIRTH_OVERRIDES: Record<string, string> = {
  'rohit-bal': '1961-05-08',      // en.wikipedia.org/wiki/Rohit_Bal
  'ilayaraja': '1943-06-03',      // en.wikipedia.org/wiki/Ilaiyaraaja (infobox: 3 June 1943)
};

/**
 * S9 — people whose dates are not known to the day/year (ancient, BCE).
 * The import stored BCE years as CE (Chanakya "371 → 283", i.e. "died aged
 * -88"). For these we show the era text and never compute an age.
 */
export const CELEB_ERA_OVERRIDES: Record<string, string> = {
  // en.wikipedia.org/wiki/Chanakya — only an era is given, no birth/death year.
  chanakya: '4th–3rd century BCE',
};

/**
 * S8 — the data has no date-precision field, and many imported rows use
 * YYYY-01-01 as a stand-in for "year only". These people really were born on
 * 1 January (en.wikipedia.org infobox, checked 23 Oct 2026), so their pages
 * must show the full date, zodiac and numerology.
 */
export const CONFIRMED_JAN1_BIRTHS = new Set<string>([
  'vidya-balan',        // 1 January 1979
  'nana-patekar',       // 1 January 1951
  'satyen-bose',        // Satyendra Nath Bose, 1 January 1894
  'satyendra-nath-bose',
  'asrani',             // 1 January 1941
  'christine-lagarde',  // 1 January 1956
]);

/** S14 — never list these people as "celebrity birthday twins". */
const BLOCKED_SLUGS = new Set<string>([
  'dawood-ibrahim', 'osama-bin-laden', 'pablo-escobar', 'ayman-al-zawahiri',
  'anders-behring-breivik', 'ted-bundy', 'jeffrey-dahmer', 'joaquin-guzman-loera',
  'andrei-chikatilo', 'albert-fish', 'timothy-mcveigh', 'salvatore-riina',
  'john-wayne-gacy', 'aileen-wuornos', 'john-gotti', 'ed-gein', 'jihadi-john',
  'h-h-holmes', 'richard-ramirez', 'abimael-guzman', 'harold-shipman',
  'salah-abdeslam', 'seung-hui-cho', 'edmund-kemper', 'gary-ridgway',
  'dennis-rader', 'issei-sagawa', 'whitey-bulger', 'atique-ahmed', 'afzal-guru',
  'lucky-luciano', 'bugsy-siegel', 'meyer-lansky',
]);
// Description guard for rows not in the list. "murdered by"/"killed by" (victims) don't match.
const CRIMINAL_DESC = /\b(gangster|terrorist|serial killer|drug lord|mobster|crime boss|mafia (?:boss|don)|mass murderer)\b/i;

export function isBlockedCelebrity(name: string, description?: string | null): boolean {
  if (BLOCKED_SLUGS.has(slugifyName(name))) return true;
  return !!description && CRIMINAL_DESC.test(description);
}

/** Oldest age we will ever show for someone recorded as living. */
export const MAX_LIVING_AGE = 105;

const yearOf = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const y = parseInt(iso.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
};

/** Whole years between two ISO dates (birthday-aware). Null if either is missing or order is impossible. */
export function yearsBetween(birthIso: string | null | undefined, endIso: string | null | undefined): number | null {
  if (!birthIso || !endIso) return null;
  const b = birthIso.slice(0, 10).split('-').map(Number);
  const e = endIso.slice(0, 10).split('-').map(Number);
  if (b.length < 3 || e.length < 3 || b.some(n => !Number.isFinite(n)) || e.some(n => !Number.isFinite(n))) return null;
  let age = e[0] - b[0];
  if (e[1] < b[1] || (e[1] === b[1] && e[2] < b[2])) age -= 1;
  return age >= 0 ? age : null;
}

export interface CelebDatesIn {
  name: string;
  birthDate: string | null | undefined;
  deathDate: string | null | undefined;
}
export interface CelebDatesOut {
  birthDate: string | null;
  deathDate: string | null;
  isLiving: boolean;
  /** e.g. "4th–3rd century BCE" — when set, never show a birth year or age. */
  era: string | null;
  /** True when the stored dates can't be trusted for an age (death before birth, BCE stored as CE). */
  datesUnreliable: boolean;
}

/** Apply the overrides above to one celebrity's dates. */
export function correctCelebDates(row: CelebDatesIn): CelebDatesOut {
  const slug = slugifyName(row.name);
  const birthDate = CELEB_BIRTH_OVERRIDES[slug] ?? row.birthDate ?? null;
  const deathDate = CELEB_DEATH_OVERRIDES[slug] ?? row.deathDate ?? null;
  const era = CELEB_ERA_OVERRIDES[slug] ?? null;
  const by = yearOf(birthDate), dy = yearOf(deathDate);
  const datesUnreliable = !!era || (by != null && dy != null && dy < by);
  return { birthDate, deathDate, isLiving: !deathDate && !era, era, datesUnreliable };
}

/** Age at death, or null when it can't honestly be stated. */
export function ageAtDeath(d: CelebDatesOut): number | null {
  if (d.datesUnreliable || !d.deathDate) return null;
  return yearsBetween(d.birthDate, d.deathDate);
}

/** Current age of a living person, or null ("age not shown") above MAX_LIVING_AGE. */
export function livingAge(birthIso: string | null | undefined, now: Date = new Date()): number | null {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const age = yearsBetween(birthIso, today);
  if (age == null || age > MAX_LIVING_AGE) return null;
  return age;
}

/** S8 — the record's own nationality text, else the country name for its ISO code ("US" → "United States"). Null if neither. */
export function nationalityLabel(nationality: string | null | undefined, code: string | null | undefined): string | null {
  if (nationality && nationality.trim()) return nationality.trim();
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(code.toUpperCase()) ?? null;
  } catch {
    return null;
  }
}

/**
 * Years and age for a celebrity card. Applies the overrides, never shows an age
 * computed from unreliable (BCE / death-before-birth) dates, and returns
 * age = null for a "living" person older than MAX_LIVING_AGE.
 */
export function celebYearsForDisplay(
  row: CelebDatesIn & { datesUnreliable?: boolean },
  now: Date = new Date(),
): { birthYear: number | null; deathYear: number | null; age: number | null; isLiving: boolean; era: string | null } {
  const d = correctCelebDates(row);
  if (d.datesUnreliable || row.datesUnreliable) {
    return { birthYear: null, deathYear: null, age: null, isLiving: false, era: d.era };
  }
  const birthYear = yearOf(d.birthDate);
  const deathYear = yearOf(d.deathDate);
  const age = d.isLiving ? livingAge(d.birthDate, now) : ageAtDeath(d);
  return { birthYear, deathYear, age, isLiving: d.isLiving, era: null };
}
