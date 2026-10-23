/**
 * Vedic data for the paid Birthday Report (audit S1/S2).
 *
 * The report used to show a Moon sign + Nakshatra from a constant-speed "lunar cycle"
 * guess (wrong 8 of 8 tested), a "Vedic Rashi" that was really the Sun's sign, and a
 * "Vedic Ratna" picked by Gregorian birth month. This module replaces all three:
 *
 *  • With birth TIME + PLACE: the same engine the Kundali uses (`/api/vedic-profile`
 *    and `/api/gemstones` → calculateBirthChart, Lahiri, birthplace time zone resolved
 *    from the coordinates by the shared resolver). Moon rashi, Nakshatra + pada, Lagna
 *    and the chart-based (Lagna-lord / Yogakaraka) gemstone are stored on the report.
 *  • Date only: `dateOnlyMoon` reports the Moon sign ONLY when it is the same for the
 *    whole calendar date in every time zone on Earth (UTC−12 … UTC+14); otherwise the
 *    report says plainly that birth time and place are needed. Same for the Nakshatra.
 */
import { birthQuery, zoneForPlace } from '@/lib/timezone/clientBirth';
import { getSiderealLongitude, NAKSHATRA_NAMES } from '@/lib/vedic/engine/vedicEngine';

/** Sidereal sign index 0–11 → English sign name used by the site's Moon-sign texts. */
export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
/** Short rashi names exactly as /api/vedic-profile returns them. */
const RASHI_SHORT = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

export interface ReportBirthPlace {
  name: string;
  lat: number;
  lon: number;
  /** IANA zone (only meaningful with manualTimezone). */
  timezone?: string;
  manualTimezone?: boolean;
}

export interface ReportGem {
  planet: string;
  gem: string;
  hindi: string;
  role: string;
  reason: string;
}

/** Chart-based Vedic data stored on a report generated with birth time + place. */
export interface ReportVedic {
  basis: 'birth-chart';
  birthTime: string;              // "HH:MM" local
  place: ReportBirthPlace;
  timezone: string;               // IANA zone used
  moonSignIndex: number;          // 0–11 sidereal (Lahiri)
  nakshatra: string;
  nakshatraNumber: number;        // 1–27
  pada: number;                   // 1–4
  lagnaSignIndex: number | null;  // 0–11
  gem: ReportGem | null;          // Lagna-based primary stone
  gemDisclaimer: string | null;
}

interface VedicProfileResponse {
  nakshatra?: { nakshatra?: string; pada?: number };
  rashi?: string | null;
  lagna?: { signIndex?: number } | null;
  birthTimezone?: { timezone?: string };
}
interface GemstonesResponse {
  report?: { primary?: ReportGem | null; disclaimer?: string };
}

/** Map the two engine API responses onto the stored report shape (pure; exported for tests). */
export function vedicFromApi(
  profile: VedicProfileResponse,
  gems: GemstonesResponse | null,
  birthTime: string,
  place: ReportBirthPlace,
): ReportVedic | null {
  const nkName = profile?.nakshatra?.nakshatra;
  const nkIndex = nkName ? NAKSHATRA_NAMES.indexOf(nkName) : -1;
  const moonSignIndex = profile?.rashi ? RASHI_SHORT.indexOf(profile.rashi) : -1;
  if (nkIndex < 0 || moonSignIndex < 0) return null;
  const lagnaIdx = profile.lagna?.signIndex;
  const primary = gems?.report?.primary ?? null;
  return {
    basis: 'birth-chart',
    birthTime,
    place,
    timezone: profile.birthTimezone?.timezone || zoneForPlace(place),
    moonSignIndex,
    nakshatra: nkName!,
    nakshatraNumber: nkIndex + 1,
    pada: Number(profile.nakshatra?.pada) || 1,
    // legacy adapter's signIndex is 1-based
    lagnaSignIndex: typeof lagnaIdx === 'number' && lagnaIdx >= 1 && lagnaIdx <= 12 ? lagnaIdx - 1 : null,
    gem: primary ? { planet: primary.planet, gem: primary.gem, hindi: primary.hindi, role: primary.role, reason: primary.reason } : null,
    gemDisclaimer: gems?.report?.disclaimer ?? null,
  };
}

/**
 * Compute the chart-based Vedic block via the same endpoints the Kundali uses.
 * Returns null when time/place are missing or the engine is unavailable — the report
 * then falls back to the honest date-only wording.
 */
export async function fetchReportVedic(
  dob: string,
  birthTime: string | null | undefined,
  place: ReportBirthPlace | null | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<ReportVedic | null> {
  if (!birthTime || !/^\d{2}:\d{2}$/.test(birthTime) || !place) return null;
  try {
    const qs = new URLSearchParams(birthQuery(dob, birthTime, place)).toString();
    const [pRes, gRes] = await Promise.all([
      fetchImpl(`/api/vedic-profile?${qs}`),
      fetchImpl(`/api/gemstones?${qs}`).catch(() => null),
    ]);
    if (!pRes.ok) return null;
    const profile = await pRes.json();
    const gems = gRes && gRes.ok ? await gRes.json() : null;
    return vedicFromApi(profile, gems, birthTime, place);
  } catch {
    return null;
  }
}

export interface DateOnlyMoon {
  /** 0–11 when the Moon stays in one sidereal sign for the whole date everywhere, else null. */
  moonSignIndex: number | null;
  /** 1–27 when the Moon stays in one Nakshatra for the whole date everywhere, else null. */
  nakshatraNumber: number | null;
}

/**
 * Date-only Moon: the calendar date runs from 00:00 at UTC+14 to 24:00 at UTC−12
 * (50 hours of UTC). The Moon only moves forward, so if it is in the same sign (or
 * Nakshatra) at both ends of that window, it was in it for anyone born that day,
 * anywhere. Otherwise we do not guess.
 */
export function dateOnlyMoon(dobIso: string): DateOnlyMoon {
  const [y, m, d] = dobIso.slice(0, 10).split('-').map(Number);
  const startUtc = new Date(Date.UTC(y, m - 1, d, 0, 0) - 14 * 3600_000);
  const endUtc = new Date(Date.UTC(y, m - 1, d, 24, 0) + 12 * 3600_000);
  const a = getSiderealLongitude('Moon', startUtc);
  const b = getSiderealLongitude('Moon', endUtc);
  const span = ((b - a) % 360 + 360) % 360; // forward arc, < 30° over 50 h
  const nkSpan = 360 / 27;
  const sameSign = Math.floor(a / 30) === Math.floor(b / 30) && span < 30;
  const sameNk = Math.floor(a / nkSpan) === Math.floor(b / nkSpan) && span < nkSpan;
  return {
    moonSignIndex: sameSign ? Math.floor(a / 30) : null,
    nakshatraNumber: sameNk ? Math.floor(a / nkSpan) + 1 : null,
  };
}
