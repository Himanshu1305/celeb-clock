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
      // "-01-01" is the dataset's placeholder for an unknown exact date.
      const isPlaceholder = month === 1 && day === 1;
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

export function generateCelebrityMeta(
  name: string,
  dob: CelebrityDOB | null,
  zodiacSign: string,
  rashi: string,
  lifePath: number | null
): string {
  if (!dob) {
    const fallback = `${name} — birthday profile, zodiac sign, and life path number on BornClock.`;
    return fallback.length <= 160 ? fallback : fallback.slice(0, 157) + '...';
  }
  const ageStr = dob.isFullDate
    ? `${new Date().getFullYear() - dob.year} years old`
    : `born in ${dob.year}`;
  const full = `${name} is ${ageStr}. ${zodiacSign} zodiac${lifePath ? `, Life Path ${lifePath}` : ''}${rashi ? `, ${rashi} Rashi` : ''}. Birthday profile on BornClock.`;
  if (full.length <= 160) return full;
  const short = `${name} (${ageStr}): ${zodiacSign}${lifePath ? `, Life Path ${lifePath}` : ''}. BornClock.`;
  return short.length <= 160 ? short : short.slice(0, 157) + '...';
}
