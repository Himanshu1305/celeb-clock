/**
 * Shared facts for one /celebrity/:slug page (Batch 6). CelebrityPage AND the
 * prerender meta generator (scripts/gen-celebrity-slugs.mts) both call this, so
 * the age wording, the Moon sign (Rashi) and the meta description can never
 * disagree between the visible page, the <meta>/og/twitter descriptions and the
 * JSON-LD.
 */
import {
  parseCelebrityDOB, generateCelebrityMeta, celebrityAgeInfo, isDayKnownDeathDate,
  type CelebrityDOB, type CelebrityAgeInfo,
} from '@/utils/celebrityUtils';
import {
  calculateWesternZodiac, calculateChineseZodiac, calculateLifePathNumber, calculateDateOnlyRashi,
  type ZodiacInfo, type ChineseZodiacInfo, type DateOnlyRashi,
} from '@/utils/celebrityCalculations';
import { CELEB_DEATH_OVERRIDES, CELEB_ERA_OVERRIDES } from '@/lib/celebrityFacts';

export interface CelebrityProfileFacts {
  dob: CelebrityDOB | null;
  isFull: boolean;
  era: string | null;
  deathYear: number | null;
  deathDate: string | null;
  /** deathDate when it is a real day (not a "-01-01" year-only placeholder), else null. */
  deathDateKnown: string | null;
  age: CelebrityAgeInfo;
  /** Western (tropical) Sun sign. */
  western: ZodiacInfo | null;
  chinese: ChineseZodiacInfo | null;
  lifePath: number | null;
  /** Moon sign (Rashi) + Nakshatra from the date only (one, or "X or Y"). */
  moon: DateOnlyRashi | null;
  description: string;
}

export function celebrityProfileFacts(
  celeb: Record<string, unknown>,
  slug: string,
  now: Date = new Date(),
): CelebrityProfileFacts {
  const name = String(celeb.name || '');
  const era = CELEB_ERA_OVERRIDES[slug] ?? null;
  // S7: deaths missing from the data (code-side override until the DB is updated).
  // Full death date: code override first, then the exported DB death_date.
  const deathDate = CELEB_DEATH_OVERRIDES[slug]
    ?? (typeof celeb.death_date === 'string' && celeb.death_date ? celeb.death_date.slice(0, 10) : null);
  const deathYear = deathDate
    ? Number(deathDate.slice(0, 4))
    : (celeb.death_year != null && celeb.death_year !== '' ? Number(celeb.death_year) : null);
  const dob = era ? null : parseCelebrityDOB(celeb);
  const isFull = !!dob?.isFullDate;
  const western = isFull ? calculateWesternZodiac(dob!.day, dob!.month) : null;
  const chinese = dob
    ? (isFull ? calculateChineseZodiac(dob.year, dob.month, dob.day) : calculateChineseZodiac(dob.year))
    : null;
  const lifePath = isFull ? calculateLifePathNumber(dob!.day, dob!.month, dob!.year) : null;
  const moon = isFull
    ? calculateDateOnlyRashi(dob!.day, dob!.month, dob!.year, (celeb.nationality_code as string | null) ?? null)
    : null;
  const life = { deathYear: Number.isFinite(deathYear) ? deathYear : null, deathDate, era };
  const age = celebrityAgeInfo(dob, life, now);
  const description = generateCelebrityMeta(
    name, dob, western?.sign || (chinese?.animal ?? ''), moon?.rashiShort || '', lifePath, life, now,
  );
  const deathDateKnown = isDayKnownDeathDate(deathDate, life.deathYear) ? deathDate : null;
  return { dob, isFull, era, deathYear: life.deathYear, deathDate, deathDateKnown, age, western, chinese, lifePath, moon, description };
}
