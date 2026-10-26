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

/**
 * Batch 8 (bug 1): completed whole years — the age people say out loud. Birthday-aware:
 * the number goes up ON the birthday, never a day early or late (days ÷ 365.25 was wrong
 * on the birthday itself for about half of birth years). Local calendar dates only.
 */
export function completedYears(birth: Date, now: Date = new Date()): number {
  return calendarAge(birth, now).years;
}

/**
 * Same, for server code that holds a birth INSTANT and a fixed UTC offset (hours): both
 * instants are read as calendar dates in that offset (the birthplace's), so the result
 * does not depend on the server's own time zone.
 */
export function completedYearsAtOffset(birth: Date | number, now: Date | number, tzHours: number): number {
  const shift = (t: Date | number) => {
    const d = new Date((typeof t === 'number' ? t : t.getTime()) + tzHours * 3600_000);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  };
  return completedYears(shift(birth), shift(now));
}

/** Parse a "YYYY-MM-DD" date of birth as a LOCAL calendar date (new Date('YYYY-MM-DD') is UTC). */
export function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Live age for the birthday results page: calendar years/months/days (birthday-aware) plus
 * running totals. Total days are counted between local calendar dates (DST-safe).
 */
export function liveAgeBreakdown(birthDate: Date, now: Date = new Date()) {
  const seconds = Math.floor((now.getTime() - birthDate.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const totalDays = Math.round(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      - Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())) / 86400000,
  );
  const cal = calendarAge(birthDate, now);
  return {
    years: cal.years, months: cal.months, days: cal.days, totalDays,
    hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60,
    totalSeconds: seconds, totalMinutes: minutes, totalHours: hours,
  };
}
