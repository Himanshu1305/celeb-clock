/**
 * Celebrity birth-time reliability — P4-CELEB-BIRTHTIME.
 *
 * A full Vedic Kundli for a public figure only means something if the birth
 * TIME is actually on record — the Ascendant (Lagna), the house placements,
 * the Nakshatra and the Dasha timeline all swing wildly with a few minutes'
 * difference. Most "celebrity kundli" sites quietly default to noon or sunrise
 * and present the result as fact. We do not.
 *
 * This file is the single source of truth for which celebrities have a
 * trustworthy recorded birth time. It ships EMPTY on purpose (Rule 8 —
 * honesty): we never fabricate a birth time or invent a source. A verified,
 * properly-licensed birth-time dataset (e.g. Rodden-rated records sourced from
 * birth certificates) is a data/licensing decision for the person — drop
 * entries in here and the matching profiles light up automatically. Until an
 * entry exists, a celebrity is reported honestly as "birth time: not on
 * record", and the time-dependent sections of the chart are not shown.
 *
 * Rodden rating is the astrology field's standard reliability scale for a
 * recorded birth time:
 *   AA — from a birth certificate / official record (most reliable)
 *   A  — from the person, family, or a quoted memory
 *   B  — from a biography / autobiography
 *   C  — origin uncertain / caution
 *   DD — conflicting data (dirty)
 *   X  — time unknown (only the date is known)
 *   XX — date itself unverified
 */

export type RoddenRating = 'AA' | 'A' | 'B' | 'C' | 'DD' | 'X' | 'XX';
export type BirthTimeReliability = 'reliable' | 'approximate' | 'unknown';

export interface CelebrityBirthTime {
  /** Local birth time, 24-hour "HH:MM". */
  time: string;
  /** Rodden rating of the record (see file header). */
  rodden: RoddenRating;
  /** Human-readable citation — never fabricated. */
  source: string;
  /** Birthplace, needed to actually compute a time-dependent chart. */
  place?: { name: string; lat: number; lon: number };
}

/**
 * slug → verified birth time. EMPTY until a verified dataset is supplied
 * (see file header). Keyed by the same slug as `/celebrity/:slug`.
 */
export const CELEBRITY_BIRTH_TIMES: Record<string, CelebrityBirthTime> = {};

/** Map a Rodden rating to the plain-language reliability band we surface. */
export function roddenToReliability(r: RoddenRating | undefined): BirthTimeReliability {
  switch (r) {
    case 'AA':
    case 'A':
      return 'reliable';
    case 'B':
    case 'C':
      return 'approximate';
    default:
      return 'unknown';
  }
}

export function getCelebrityBirthTime(slug: string | null | undefined): CelebrityBirthTime | null {
  if (!slug) return null;
  return CELEBRITY_BIRTH_TIMES[slug] ?? null;
}

export function getBirthTimeReliability(slug: string | null | undefined): BirthTimeReliability {
  return roddenToReliability(getCelebrityBirthTime(slug)?.rodden);
}

/**
 * Whether the time-dependent sections of a celebrity chart (Nakshatra,
 * Ascendant / Lagna, house placements, Dasha) may be rendered. They may only
 * render when we hold a recorded birth time AND a birthplace to compute from —
 * never from a day/month approximation.
 */
export function canRenderTimeDependent(slug: string | null | undefined): boolean {
  const bt = getCelebrityBirthTime(slug);
  return !!bt && !!bt.place && roddenToReliability(bt.rodden) !== 'unknown';
}
