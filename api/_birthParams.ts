import { resolveBirthTimezone, type BirthTimezone } from '../src/lib/timezone/birthTimezone.js';

// Part T — shared birth-parameter RANGE validation for the compute endpoints.
//
// Malformed input (e.g. month=13, day=45, impossible latitude, or an
// injection string parsed to a number) should return a clean 400 with a
// message — NOT fall through to the engine / ProKerala fallback and surface as
// a 500/502 (and, for /api/kundali, waste a real ProKerala API call on garbage).
//
// /api/vedic-reading already returned 400 via BirthChartInputError; this helper
// makes every compute endpoint behave the same way, consistently, up front.
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function birthRangeError(p: {
  m: number; d: number; h: number; min: number; lat: number; lon: number; tz: number;
  /** Optional year — when given, the day is also checked against the real calendar (M12: 30 Feb). */
  y?: number;
}): string | null {
  const { m, d, h, min, lat, lon, tz, y } = p;
  if ([h, min, lat, lon, tz].some(v => !Number.isFinite(v))) return 'Invalid birth details (non-numeric time/location)';
  if (m < 1 || m > 12 || d < 1 || d > 31) return 'Invalid birth date (month/day out of range)';
  if (typeof y === 'number' && Number.isFinite(y)) {
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    if (d > dim) return `Invalid birth date: ${MONTH_NAMES[m - 1]} ${y} has only ${dim} days.`;
  }
  if (h < 0 || h > 23 || min < 0 || min > 59) return 'Invalid birth time (out of range)';
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 'Invalid location (latitude/longitude out of range)';
  if (tz < -14 || tz > 14) return 'Invalid timezone offset';
  return null;
}

/**
 * fix-timezone-accuracy — the ONE server-side place a birth UTC offset is decided.
 *
 * The offset is ALWAYS computed by the shared resolveBirthTimezone() from the birth
 * coordinates + local date/time (or from an explicit, user-chosen IANA zone sent as
 * `tzid`). A numeric `tz` query parameter from older clients/saved links is NOT
 * trusted any more (that is how non-Indian births were silently computed in IST);
 * it is only range-checked for backward-compatible 400s.
 */
export function resolveRequestBirthTz(
  get: (key: string) => string | null | undefined,
  p: { y: number; m: number; d: number; h: number; min: number; lat: number; lon: number },
  suffix = '',
): { tz: number; birthTimezone: BirthTimezone } | { error: string } {
  const tzid = get('tzid' + suffix);
  if (![p.y, p.m, p.d, p.h, p.min].every(Number.isFinite)) return { error: 'Invalid birth details (non-numeric date/time)' };
  try {
    const birthTimezone = resolveBirthTimezone({
      lat: p.lat, lon: p.lon, year: p.y, month: p.m, day: p.d, hour: p.h, minute: p.min,
      timezone: tzid ? String(tzid) : null,
    });
    return { tz: birthTimezone.utcOffsetHours, birthTimezone };
  } catch (e) {
    return { error: tzid ? 'Invalid time zone' : 'Invalid location (latitude/longitude out of range)' };
  }
}
