// Part T — shared birth-parameter RANGE validation for the compute endpoints.
//
// Malformed input (e.g. month=13, day=45, impossible latitude, or an
// injection string parsed to a number) should return a clean 400 with a
// message — NOT fall through to the engine / ProKerala fallback and surface as
// a 500/502 (and, for /api/kundali, waste a real ProKerala API call on garbage).
//
// /api/vedic-reading already returned 400 via BirthChartInputError; this helper
// makes every compute endpoint behave the same way, consistently, up front.
export function birthRangeError(p: {
  m: number; d: number; h: number; min: number; lat: number; lon: number; tz: number;
}): string | null {
  const { m, d, h, min, lat, lon, tz } = p;
  if ([h, min, lat, lon, tz].some(v => !Number.isFinite(v))) return 'Invalid birth details (non-numeric time/location)';
  if (m < 1 || m > 12 || d < 1 || d > 31) return 'Invalid birth date (month/day out of range)';
  if (h < 0 || h > 23 || min < 0 || min > 59) return 'Invalid birth time (out of range)';
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 'Invalid location (latitude/longitude out of range)';
  if (tz < -14 || tz > 14) return 'Invalid timezone offset';
  return null;
}
