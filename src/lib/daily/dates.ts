/**
 * India-date helpers for daily pages. A "day" on BornClock's daily pages is the
 * calendar date in Asia/Kolkata (IST, UTC+05:30, no DST). Dependency-free (Worker-safe).
 */

const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

export const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
export const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/** India calendar date (YYYY-MM-DD) of an instant. */
export function istDateISO(at: Date): string {
  return new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM-DD plus n days (calendar arithmetic, timezone-free). */
export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * DAY_MS).toISOString().slice(0, 10);
}

/** "YYYY-MM" month key of a YYYY-MM-DD date. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** The UTC instant of an IST wall-clock time on an India date. */
export function istInstant(iso: string, hh = 0, mm = 0): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MS);
}

/** Milliseconds from `now` until the next India midnight (00:00 IST). */
export function msUntilNextIstMidnight(now: Date): number {
  const next = istInstant(addDaysISO(istDateISO(now), 1));
  return next.getTime() - now.getTime();
}

/** Weekday (0 = Sunday) of an India date. */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "26 October 2026" */
export function formatDateEn(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_EN[m - 1]} ${y}`;
}

/** "Monday, 26 October 2026" */
export function formatLongDateEn(iso: string): string {
  return `${WEEKDAYS_EN[weekdayOf(iso)]}, ${formatDateEn(iso)}`;
}

/** "26 अक्टूबर 2026" */
export function formatDateHi(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_HI[m - 1]} ${y}`;
}

/** "सोमवार, 26 अक्टूबर 2026" */
export function formatLongDateHi(iso: string): string {
  return `${WEEKDAYS_HI[weekdayOf(iso)]}, ${formatDateHi(iso)}`;
}

/** "HH:MM" in IST of an instant, rounded to the nearest minute. */
export function istClock(at: Date): string {
  const t = new Date(Math.round((at.getTime() + IST_OFFSET_MS) / 60000) * 60000);
  return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
}

/** "14:05" → "2:05 pm" */
export function clock12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}
