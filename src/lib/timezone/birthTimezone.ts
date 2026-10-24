/**
 * THE single source of truth for birth time zones (fix-timezone-accuracy).
 *
 *   (lat, lon, local date, local time [, manual IANA zone]) → IANA zone + the UTC
 *   offset that was actually in force at that place on that date + the UTC instant.
 *
 * Used by every path where birth data enters BornClock — the browser (forms, saved
 * profiles, Kundali, Matching, reports, calculators, AI chat) AND the Worker API
 * (api/_birthParams.ts → every compute endpoint). Never defaults to IST: the zone
 * always comes from the coordinates (or an explicit, user-chosen IANA zone).
 *
 *  • lat/lon → IANA zone: @photostructure/tz-lookup (maintained fork of tz-lookup,
 *    CC0, ~70 KB of data — fits the Worker bundle).
 *  • zone + local wall time → offset: the runtime's Intl tz database (full IANA
 *    history: DST, Arizona/Queensland no-DST, India 1942–45 +6:30, Nepal +5:45,
 *    Singapore +7:30 before 1982, …). Browsers and Cloudflare Workers both ship it.
 *  • DST changeover: an AMBIGUOUS local time (clocks fall back, the hour happens
 *    twice) takes the EARLIER occurrence; a NON-EXISTENT local time (clocks spring
 *    forward) is read with the offset in force just before the change — i.e. the
 *    RFC 5545 / Temporal "compatible" rule. Both set a `note` for the UI.
 */
import tzlookup from '@photostructure/tz-lookup';

export interface BirthTimezoneInput {
  lat: number;
  lon: number;
  year: number;
  month: number;   // 1-12
  day: number;
  hour: number;
  minute: number;
  /** Optional user-chosen IANA zone ("Advanced: set timezone manually"). */
  timezone?: string | null;
}

export interface BirthTimezone {
  /** IANA zone used, e.g. "America/Detroit". */
  timezone: string;
  /** Offset in force at the birth instant, hours east of UTC (e.g. -5, 5.5, 5.75). */
  utcOffsetHours: number;
  /** "UTC−05:00" style label. */
  utcOffsetLabel: string;
  /** Birth instant as ISO-8601 UTC. */
  utcISO: string;
  ambiguous: boolean;
  nonexistent: boolean;
  /** Plain-language note for a DST-changeover time, else null. */
  note: string | null;
  source: 'coordinates' | 'manual';
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function formatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

/** True when the runtime knows this IANA zone name. */
export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try { formatter(tz); return true; } catch { return false; }
}

/** IANA zone for a coordinate (never IST by default — an ocean point gets Etc/GMT±N). */
export function timezoneForCoordinates(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new RangeError(`Invalid coordinates: ${lat}, ${lon}`);
  }
  return tzlookup(lat, lon);
}

/** Zone for the coordinates, or null when they are invalid (never throws). */
function coordinateZoneOrNull(lat: number, lon: number): string | null {
  try { return timezoneForCoordinates(lat, lon); } catch { return null; }
}

/** Offset (in SECONDS east of UTC) of `tz` at the UTC instant `utcMs`. */
export function offsetSecondsAt(tz: string, utcMs: number): number {
  const parts = formatter(tz).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  const whole = Math.floor(utcMs / 1000) * 1000;
  return Math.round((wall - whole) / 1000);
}

export function formatUtcOffset(hours: number): string {
  const sign = hours < 0 ? '−' : '+';
  const totalMin = Math.round(Math.abs(hours) * 60);
  return `UTC${sign}${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

/** Local wall time in `tz` → UTC instant, with DST-changeover handling. */
export function localToUtc(tz: string, year: number, month: number, day: number, hour: number, minute: number) {
  const wallMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const DAY = 86400000;
  const before = offsetSecondsAt(tz, wallMs - DAY);
  const after = offsetSecondsAt(tz, wallMs + DAY);
  const candidates = Array.from(new Set([before, after]))
    .filter(off => offsetSecondsAt(tz, wallMs - off * 1000) === off)
    .sort((a, b) => b - a); // larger offset first = earlier UTC instant
  if (candidates.length === 0) {
    // Non-existent wall time (spring-forward gap) → offset in force before the change.
    return { utcMs: wallMs - before * 1000, offsetSeconds: before, ambiguous: false, nonexistent: true };
  }
  return {
    utcMs: wallMs - candidates[0] * 1000,
    offsetSeconds: candidates[0],
    ambiguous: candidates.length > 1,
    nonexistent: false,
  };
}

/** THE shared function — see file header. Throws RangeError on bad coordinates/zone. */
export function resolveBirthTimezone(input: BirthTimezoneInput): BirthTimezone {
  const manual = input.timezone != null && input.timezone !== '';
  if (manual && !isValidTimezone(input.timezone)) throw new RangeError(`Unknown time zone: ${input.timezone}`);
  const tz = manual ? (input.timezone as string) : timezoneForCoordinates(input.lat, input.lon);
  const r = localToUtc(tz, input.year, input.month, input.day, input.hour, input.minute);
  const utcOffsetHours = r.offsetSeconds / 3600;
  const label = formatUtcOffset(utcOffsetHours);
  let note: string | null = null;
  if (r.ambiguous) {
    note = `This local time happened twice that night (clocks went back). We used the first occurrence (${label}). If the birth was in the repeated hour, choose the other offset under "Advanced: set timezone manually".`;
  } else if (r.nonexistent) {
    note = `This local time did not exist that night (clocks went forward). We read it with the offset in force just before the change (${label}). Please double-check the birth time.`;
  }
  return {
    timezone: tz,
    utcOffsetHours,
    utcOffsetLabel: label,
    utcISO: new Date(r.utcMs).toISOString(),
    ambiguous: r.ambiguous,
    nonexistent: r.nonexistent,
    note,
    source: manual && tz !== coordinateZoneOrNull(input.lat, input.lon) ? 'manual' : 'coordinates',
  };
}

/** Convenience: same as resolveBirthTimezone but from "YYYY-MM-DD" + "HH:MM" strings. */
export function resolveBirthTimezoneFromStrings(
  dob: string, time: string | undefined | null, lat: number, lon: number, timezone?: string | null,
): BirthTimezone {
  const [y, m, d] = dob.split('-').map(Number);
  const [h, min] = (time || '12:00').split(':').map(Number);
  return resolveBirthTimezone({ lat, lon, year: y, month: m, day: d, hour: h, minute: min, timezone });
}

/** All IANA zones the runtime knows (for the manual-timezone control). */
export function listTimezones(): string[] {
  try {
    const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (sv) return sv('timeZone');
  } catch { /* fall through */ }
  return ['UTC', 'Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix',
    'America/Los_Angeles', 'America/Toronto', 'Europe/London', 'Europe/Berlin', 'Australia/Sydney',
    'Australia/Brisbane', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Kathmandu'];
}

// ── Boundary + method copy (shared by Kundali, Matching and reports) ─────────────
export const METHOD_LINE = 'Sidereal (Lahiri), computed from your exact birthplace and local time.';
const NAK_SPAN = 360 / 27;

/** Distance (degrees) from a sidereal longitude to the nearest sign / nakshatra boundary. */
export function boundaryDistance(siderealLon: number): { sign: number; nakshatra: number } {
  const inSign = ((siderealLon % 30) + 30) % 30;
  const inNak = ((siderealLon % NAK_SPAN) + NAK_SPAN) % NAK_SPAN;
  return { sign: Math.min(inSign, 30 - inSign), nakshatra: Math.min(inNak, NAK_SPAN - inNak) };
}

/** The required boundary warning, or null when ≥ 1° from every sign/nakshatra edge. */
export function boundaryNote(body: 'Moon' | 'Lagna', siderealLon: number): string | null {
  if (!Number.isFinite(siderealLon)) return null;
  const d = boundaryDistance(siderealLon);
  if (d.sign >= 1 && d.nakshatra >= 1) return null;
  return `${body} is near a sign boundary. A small birth-time difference can change this result. Please double-check the birth time.`;
}
