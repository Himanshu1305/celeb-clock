/**
 * Calendar age breakdown (years / months / days) — shared by the age
 * calculator, widget and celebrity cards.
 *
 * Convention (same as calculator.net / "add months, clamp to month end"):
 *   the last "monthiversary" is birth date + N whole months, where a day
 *   that does not exist in the target month is clamped to that month's
 *   last day (31 Jan + 1 month = 28/29 Feb). Days are counted from that
 *   anchor to today. This can never produce negative days.
 *
 * Only the local calendar dates of `birth` and `now` are used.
 */
export interface CalendarAge {
  years: number;
  months: number;
  days: number;
}

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** UTC-midnight timestamp of birth + `totalMonths` months, clamped to month end. */
function anchorUtc(by: number, bm: number, bd: number, totalMonths: number): number {
  const idx = bm + totalMonths;
  const y = by + Math.floor(idx / 12);
  const m = ((idx % 12) + 12) % 12;
  const d = Math.min(bd, daysInMonth(y, m));
  return Date.UTC(y, m, d);
}

export function calendarAge(birth: Date, now: Date = new Date()): CalendarAge {
  const by = birth.getFullYear(), bm = birth.getMonth(), bd = birth.getDate();
  const ny = now.getFullYear(), nm = now.getMonth(), nd = now.getDate();
  const nowUtc = Date.UTC(ny, nm, nd);

  let totalMonths = (ny - by) * 12 + (nm - bm);
  if (anchorUtc(by, bm, bd, totalMonths) > nowUtc) totalMonths -= 1;
  if (totalMonths < 0) return { years: 0, months: 0, days: 0 };

  const days = Math.round((nowUtc - anchorUtc(by, bm, bd, totalMonths)) / 86400000);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days };
}
