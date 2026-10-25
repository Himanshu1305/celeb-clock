import { CONFIRMED_JAN1_BIRTHS, MAX_LIVING_AGE, livingAge, slugifyName, yearsBetween } from '@/lib/celebrityFacts';
// Day-8 celebrity page utilities. Field names adapted to the real
// src/data/indianCelebrities.ts shape: { name, birth_date (YYYY-MM-DD),
// category, known_for, nationality, birth_year, death_year?, tier }.
//
// ZERO-HALLUCINATION RULE: the dataset encodes "exact date unknown" celebrities
// with a birth_date ending in "-01-01" (a January-1 placeholder) and/or an
// ancient year (< 1000). Those must be treated as YEAR-ONLY so no page ever
// displays a fabricated January 1 birthday.

export interface CelebrityDOB {
  day: number;
  month: number;
  year: number;
  isFullDate: boolean; // true = day+month+year known; false = year only
}

/**
 * Parses DOB from a celebrity record.
 * Returns isFullDate=false for year-only / placeholder entries.
 * NEVER treats a "-01-01" placeholder or an ancient (< 1000) year as a real date.
 */
export function parseCelebrityDOB(celeb: Record<string, unknown>): CelebrityDOB | null {
  const fullDateField = celeb.birth_date ?? celeb.dob ?? celeb.date_of_birth;
  if (fullDateField && typeof fullDateField === 'string') {
    const parts = fullDateField.split('-').map(Number);
    if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
      const [year, month, day] = parts;
      const validParts = year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
      // "-01-01" is the dataset's placeholder for an unknown exact date — except
      // for people verified to be born on 1 January (S8, see CONFIRMED_JAN1_BIRTHS).
      const slug = String(celeb.slug ?? '') || slugifyName(String(celeb.name ?? ''));
      const isPlaceholder = month === 1 && day === 1 && !CONFIRMED_JAN1_BIRTHS.has(slug);
      if (validParts && !isPlaceholder) {
        return { year, month, day, isFullDate: true };
      }
    }
  }
  // Year-only fallback (placeholder date, ancient year, or year-only record).
  const yearOnly = celeb.birth_year ?? celeb.birthYear;
  if (yearOnly !== undefined && yearOnly !== null && Number(yearOnly) > 0) {
    return { year: Number(yearOnly), month: 0, day: 0, isFullDate: false };
  }
  // As a last resort, salvage the year from a placeholder full-date field.
  if (fullDateField && typeof fullDateField === 'string') {
    const y = Number(fullDateField.split('-')[0]);
    if (Number.isFinite(y) && y > 0) return { year: y, month: 0, day: 0, isFullDate: false };
  }
  return null;
}

/**
 * Formats DOB for display. NEVER shows January 1 for year-only entries.
 */
export function formatDOBDisplay(dob: CelebrityDOB | null): string {
  if (!dob) return 'Information not available';
  if (!dob.isFullDate) return `${dob.year} (exact date not available)`;
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  return `${months[dob.month - 1]} ${dob.day}, ${dob.year}`;
}

/**
 * Generates URL-safe slug from celebrity name.
 * Handles: apostrophes, dots, special characters, collisions.
 */
export function generateCelebritySlug(
  name: string,
  birthYear?: number,
  existingSlugs?: Set<string>
): string {
  const base = name
    .toLowerCase()
    .replace(/[''`’‘]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!base) return `celebrity-${birthYear || 'unknown'}`;
  if (!existingSlugs || !existingSlugs.has(base)) return base;

  const withYear = birthYear ? `${base}-${birthYear}` : `${base}-2`;
  if (!existingSlugs.has(withYear)) return withYear;

  let counter = 2;
  while (existingSlugs.has(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

/**
 * Generates slug map for ALL celebrities with collision detection.
 * Deterministic: iterates in array order. The prerender slug generator
 * (scripts/gen-celebrity-slugs.mjs) MUST replicate this exact algorithm.
 */
export function generateAllSlugs(
  celebrities: Record<string, unknown>[]
): Map<string, Record<string, unknown>> {
  const slugMap = new Map<string, Record<string, unknown>>();
  const usedSlugs = new Set<string>();
  celebrities.forEach(celeb => {
    const name = String(celeb.name || '');
    const birthYear = Number(celeb.birth_year || celeb.birthYear || 0) || undefined;
    const slug = generateCelebritySlug(name, birthYear, usedSlugs);
    slugMap.set(slug, celeb);
    usedSlugs.add(slug);
  });
  return slugMap;
}

/**
 * Category → hub mapping. Keys are the exact `category` strings from the data.
 * The 6 hubs each aggregate several related categories. Categories not listed
 * here (Author, Scientist, Poet, Historical, Spiritual Leader, Philosopher,
 * Journalist, Mathematician) appear only in the A-Z index, not in a hub.
 */
export const CATEGORY_CONFIG: Record<string, {
  hubSlug: string; label: string; h1: string; desc: string;
}> = {
  // ── Bollywood / film ──
  'Actor':           { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Actress':         { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Director':        { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Producer':        { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Choreographer':   { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Dancer':          { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Fashion Designer':{ hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  'Cultural Figure': { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Bollywood actors and film personalities.' },
  // ── Cricket ──
  'Cricketer':       { hubSlug: 'cricket',   label: 'Cricket',   h1: 'Indian Cricket Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian cricketers.' },
  // ── Politics ──
  'Politician':      { hubSlug: 'politics',  label: 'Politics',  h1: 'Indian Political Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian political leaders.' },
  'Freedom Fighter': { hubSlug: 'politics',  label: 'Politics',  h1: 'Indian Political Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian political leaders and freedom fighters.' },
  'Social Reformer': { hubSlug: 'politics',  label: 'Politics',  h1: 'Indian Political Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian political and social reform leaders.' },
  // ── Business ──
  'Business Leader': { hubSlug: 'business',  label: 'Business',  h1: 'Indian Business Leader Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian business leaders.' },
  'Businessman':     { hubSlug: 'business',  label: 'Business',  h1: 'Indian Business Leader Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian business leaders.' },
  'Economist':       { hubSlug: 'business',  label: 'Business',  h1: 'Indian Business Leader Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian business and economic leaders.' },
  'Engineer':        { hubSlug: 'business',  label: 'Business',  h1: 'Indian Business Leader Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian business and industry leaders.' },
  // ── Music ──
  'Singer':          { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian singers and musicians.' },
  'Music Composer':  { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian composers and musicians.' },
  'Musician':        { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian musicians.' },
  'Lyricist':        { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian lyricists and musicians.' },
  // ── Sports (non-cricket) ──
  'Athlete':         { hubSlug: 'sports',    label: 'Sports',    h1: 'Indian Sports Celebrity Birthday Profiles', desc: 'Birthday, age, zodiac and numerology profiles for Indian sports personalities.' },
};

export const HUB_SLUGS = ['bollywood', 'cricket', 'politics', 'business', 'music', 'sports'];

export function getCategoryHubSlug(category: string): string {
  return CATEGORY_CONFIG[category]?.hubSlug || category.toLowerCase().replace(/\s+/g, '-');
}

export function getHubConfig(hubSlug: string) {
  const entry = Object.values(CATEGORY_CONFIG).find(c => c.hubSlug === hubSlug);
  return entry || { hubSlug, label: hubSlug, h1: `${hubSlug} Celebrities`, desc: '' };
}

export function generateCelebrityTitle(name: string): string {
  const options = [
    `${name} — Birthday, Age, Zodiac & Life Profile | BornClock`,
    `${name} Birthday, Age & Zodiac | BornClock`,
    `${name} | BornClock`,
  ];
  return options.find(t => t.length <= 70) || options[2].slice(0, 70);
}

/**
 * True when `deathDate` is a real day (YYYY-MM-DD, same year as `deathYear`) and not
 * the DB's "YYYY-01-01" year-only placeholder.
 */
export function isDayKnownDeathDate(deathDate: string | null | undefined, deathYear?: number | null): boolean {
  if (!deathDate || !/^\d{4}-\d{2}-\d{2}/.test(deathDate)) return false;
  if (deathDate.slice(5, 10) === '01-01') return false;
  return deathYear == null || Number(deathDate.slice(0, 4)) === Number(deathYear);
}

/** Death / era facts for one celebrity (after the code-side overrides). */
export interface CelebrityLifeFacts {
  deathYear?: number | null;
  /** ISO death date (CELEB_DEATH_OVERRIDES or the DB's death_date; "-01-01" = year only). */
  deathDate?: string | null;
  /** Era text for ancient people (no birth/death years shown). */
  era?: string | null;
}

export interface CelebrityAgeInfo {
  status: 'living' | 'deceased' | 'era' | 'unknown';
  /** Text for the page's "Age" fact row (unchanged wording). */
  display: string;
  /**
   * Phrase that follows the name in meta descriptions, FAQ answers and JSON-LD,
   * e.g. "is 37 years old" / "died in 1948, aged about 79" — never a current age
   * for someone who has died. Null when nothing can honestly be said.
   */
  snippet: string | null;
}

/**
 * The ONE age logic for celebrity pages (Batch 6): the visible page, the meta
 * description, og/twitter descriptions, the FAQ JSON-LD and the prerendered
 * snippet (scripts/gen-celebrity-slugs.mts) all use this.
 */
export function celebrityAgeInfo(
  dob: CelebrityDOB | null,
  life: CelebrityLifeFacts = {},
  now: Date = new Date(),
): CelebrityAgeInfo {
  if (life.era) {
    return {
      status: 'era',
      display: `Lived in the ${life.era}; exact birth and death years are not documented`,
      snippet: `lived in the ${life.era}`,
    };
  }
  if (!dob) return { status: 'unknown', display: 'Information not available', snippet: null };
  const deathYear = life.deathYear ?? null;
  if (deathYear) {
    // Exact, birthday-aware age only when BOTH dates are known to the day. The DB uses
    // "YYYY-01-01" as a year-only placeholder for ~700 death dates (and birth dates;
    // parseCelebrityDOB already treats a 01-01 birth as year-only), so a 01-01 death
    // date counts as year-only too. Then the two possible ages are shown — never "about".
    const pad = (n: number) => String(n).padStart(2, '0');
    const isoDob = dob.isFullDate ? `${dob.year}-${pad(dob.month)}-${pad(dob.day)}` : null;
    const fullDeath = isDayKnownDeathDate(life.deathDate, deathYear) ? life.deathDate!.slice(0, 10) : null;
    const exact = isoDob && fullDeath ? yearsBetween(isoDob, fullDeath) : null;
    if (exact != null) {
      return { status: 'deceased', display: `Died in ${deathYear}, aged ${exact}`, snippet: `died in ${deathYear}, aged ${exact}` };
    }
    const hi = deathYear - dob.year;
    const ages = [hi - 1, hi].filter(n => n >= 0);
    if (ages.length > 0) {
      const aged = ages.length === 2 ? `${ages[0]} or ${ages[1]}` : String(ages[0]);
      return { status: 'deceased', display: `Died in ${deathYear}, aged ${aged}`, snippet: `died in ${deathYear}, aged ${aged}` };
    }
    return { status: 'deceased', display: 'Birth and death years uncertain', snippet: `died in ${deathYear}` };
  }
  // S7 safety cap: never show a living age above MAX_LIVING_AGE.
  if (dob.isFullDate) {
    const iso = `${dob.year}-${String(dob.month).padStart(2, '0')}-${String(dob.day).padStart(2, '0')}`;
    const age = livingAge(iso, now);
    return age == null
      ? { status: 'living', display: 'Age not shown', snippet: `was born in ${dob.year}` }
      : { status: 'living', display: `${age} years old`, snippet: `is ${age} years old` };
  }
  const approx = now.getFullYear() - dob.year;
  return approx > MAX_LIVING_AGE
    ? { status: 'living', display: 'Age not shown', snippet: `was born in ${dob.year}` }
    : { status: 'living', display: `Approximately ${approx} years old (based on birth year)`, snippet: `was born in ${dob.year}` };
}

/**
 * Meta description for /celebrity/:slug. `zodiacSign` is the Western Sun sign
 * (or, for year-only records, the Chinese animal); `rashi` is the Moon sign
 * (Rashi) text — one sign, or "Tula or Vrischika" when it changed that day.
 * `life` carries death / era facts so a deceased person never gets a current age.
 */
export function generateCelebrityMeta(
  name: string,
  dob: CelebrityDOB | null,
  zodiacSign: string,
  rashi: string,
  lifePath: number | null,
  life: CelebrityLifeFacts = {},
  now: Date = new Date(),
): string {
  const age = celebrityAgeInfo(dob, life, now);
  if (!age.snippet) {
    const fallback = `${name} — birthday profile, zodiac sign, and life path number on BornClock.`;
    return fallback.length <= 160 ? fallback : fallback.slice(0, 157) + '...';
  }
  const lp = lifePath ? `, Life Path ${lifePath}` : '';
  const sign = zodiacSign ? (rashi ? `${zodiacSign} Sun sign` : `${zodiacSign} zodiac`) : '';
  const astro = [sign + lp, rashi ? `Moon sign (Rashi) ${rashi}` : ''].filter(Boolean).join(', ').replace(/^, /, '');
  const lead = `${name} ${age.snippet}.`;
  const candidates = [
    `${lead}${astro ? ` ${astro}.` : ''} Birthday profile on BornClock.`,
    `${lead}${astro ? ` ${astro}.` : ''}`,
    `${lead}${sign ? ` ${sign}${lp}.` : ''} BornClock.`,
  ];
  const fit = candidates.find(c => c.length <= 160);
  if (fit) return fit;
  const short = `${name} (${age.snippet}): ${zodiacSign}${lp}. BornClock.`;
  return short.length <= 160 ? short : short.slice(0, 157) + '...';
}
