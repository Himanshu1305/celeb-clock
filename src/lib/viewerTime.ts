/**
 * Viewer time-zone display for transit / Sade Sati dates.
 * The underlying instants never change; only how they are written does.
 * India (and any viewer whose zone can't be read) sees Indian Standard Time.
 */
export const IST_ZONE = 'Asia/Kolkata';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function detectViewerTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === 'Asia/Calcutta') return IST_ZONE;
    return tz;
  } catch {
    return IST_ZONE;
  }
}

/** Calendar date (YYYY-MM-DD) of an instant in the given IANA zone. */
export function zoneDateISO(at: Date | number | string, tz: string): string {
  const d = new Date(at);
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  }
}

/** "5 December 2026" in the zone. */
export function zoneDay(at: Date | number | string, tz: string): string {
  const [y, m, d] = zoneDateISO(at, tz).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "December 2026" in the zone. */
export function zoneMonth(at: Date | number | string, tz: string): string {
  const [y, m] = zoneDateISO(at, tz).split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Human label for the zone, e.g. "Indian Standard Time (IST)" or "your local time (Europe/London, GMT+1)". */
export function zoneLabel(tz: string, at: Date = new Date()): string {
  if (tz === IST_ZONE) return 'Indian Standard Time (IST)';
  let short = '';
  try {
    short = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(at).find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch { /* ignore */ }
  return `your local time (${tz.replace(/_/g, ' ')}${short ? `, ${short}` : ''})`;
}
