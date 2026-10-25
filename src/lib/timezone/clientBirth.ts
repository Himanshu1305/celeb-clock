/**
 * Browser-side glue for the shared birth-timezone resolver (fix-timezone-accuracy).
 * Every client call that sends birth data to the API builds its query through
 * `birthQuery()` so the request always names the IANA zone (`tzid`) that belongs to
 * the chosen place (or the user's manual choice). The server recomputes the offset
 * itself from the same shared function; `tz` is only sent for older deployments.
 */
import { resolveBirthTimezoneFromStrings, timezoneForCoordinates, type BirthTimezone } from './birthTimezone';

export interface BirthPlaceLike {
  lat: number;
  lon: number;
  timezone?: string;
  manualTimezone?: boolean;
}

/** The IANA zone to use for a place: the manual choice, else looked up from lat/lon. */
export function zoneForPlace(place: BirthPlaceLike): string {
  if (place.manualTimezone && place.timezone) return place.timezone;
  return timezoneForCoordinates(place.lat, place.lon);
}

/** Resolve zone + offset + UTC instant for a birth (for display and the `tz` field). */
export function resolveForPlace(dob: string, time: string | undefined | null, place: BirthPlaceLike): BirthTimezone {
  return resolveBirthTimezoneFromStrings(dob, time, place.lat, place.lon, place.manualTimezone ? place.timezone : null);
}

/** Query params for a birth: y, m, d, h, min, lat, lon, tz, tzid (with optional suffix). */
export function birthQuery(dob: string, time: string | undefined | null, place: BirthPlaceLike, suffix = ''): Record<string, string> {
  const [y, m, d] = dob.split('-');
  const [h, min] = (time || '12:00').split(':');
  const r = resolveForPlace(dob, time, place);
  const q: Record<string, string> = {
    ['y' + suffix]: y, ['m' + suffix]: m, ['d' + suffix]: d, ['h' + suffix]: h, ['min' + suffix]: min,
    ['lat' + suffix]: String(place.lat), ['lon' + suffix]: String(place.lon),
    ['tz' + suffix]: String(r.utcOffsetHours),
    // Cache-buster: responses cached by browsers before the fix (max-age up to 24h)
    // were keyed on URLs without this, so they can never be served for new requests.
    tzv: TZ_PARAM_VERSION,
  };
  // f5-city-picker: the IANA zone of the PICKED place (or the manual choice) is always sent,
  // so the server computes with exactly the zone shown in the confirm line. The server marks
  // it "manual" only when it differs from the zone of the coordinates.
  q['tzid' + suffix] = r.timezone;
  return q;
}

export const TZ_PARAM_VERSION = '2';
