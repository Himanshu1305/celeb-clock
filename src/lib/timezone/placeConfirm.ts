/**
 * Birthplace confirm line (f5-city-picker). After a place is picked from the
 * suggestions, every birth form shows ONE plain-language line, e.g.
 *
 *   Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−5 on that date, standard time)
 *   Born in London, England, UK · time zone Europe/London (UTC+1 on that date, daylight saving)
 *   Born in Delhi, Delhi, India · time zone Asia/Kolkata (UTC+6:30 on that date, war time — clocks were 1 hour ahead of the usual UTC+5:30)
 *
 * The offset is the one in force at that place ON THE BIRTH DATE (historical
 * IANA rules: DST, war time, older standard offsets) — the same shared resolver
 * the APIs use (src/lib/timezone/birthTimezone.ts), so what is shown is what is
 * calculated.
 */
import { offsetSecondsAt } from './birthTimezone';
import { resolveForPlace, type BirthPlaceLike } from './clientBirth';

export type ZoneKind = 'standard' | 'dst' | 'war' | 'historical' | 'fixed';

export interface BirthZoneSummary {
  timezone: string;
  utcOffsetHours: number;
  /** Short label, e.g. "UTC−4", "UTC+5:30", "UTC+0". */
  offsetShort: string;
  kind: ZoneKind;
  /** Words after the offset inside the brackets, e.g. "daylight saving" (empty for 'fixed'). */
  kindText: string;
  /** True when no valid birth date was given and today's offset is shown instead. */
  today: boolean;
  /** Plain note for births before 1970, else null. */
  pre1970Note: string | null;
  /** DST-changeover note from the resolver (time happened twice / did not exist), else null. */
  changeoverNote: string | null;
}

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "UTC−4", "UTC+5:30", "UTC+0" (true minus sign, like formatUtcOffset). */
export function formatOffsetShort(hours: number): string {
  const totalMin = Math.round(Math.abs(hours) * 60);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  const sign = hours < 0 && totalMin > 0 ? '−' : '+';
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

const midYearOffsets = (tz: string, year: number) => {
  const jan = offsetSecondsAt(tz, Date.UTC(year, 0, 15, 12)) / 3600;
  const jul = offsetSecondsAt(tz, Date.UTC(year, 6, 15, 12)) / 3600;
  return { jan, jul };
};

/** WWII clock regimes (US "War Time", British double summer time, India +6:30 …). */
function inWarPeriod(dob: string): boolean {
  return dob >= '1939-09-01' && dob <= '1945-12-31';
}

/**
 * Describe the zone + offset for a birth. `now` is injectable for tests (used only to
 * decide the zone's present-day standard offset, to spot war-time/historical clocks).
 */
export function describeBirthZone(dob: string | undefined, time: string | undefined, place: BirthPlaceLike, now: Date = new Date()): BirthZoneSummary {
  const hasDate = !!dob && DOB_RE.test(dob);
  const date = hasDate ? (dob as string) : now.toISOString().slice(0, 10);
  const r = resolveForPlace(date, hasDate ? time : '12:00', place);
  const tz = r.timezone;
  const off = r.utcOffsetHours;
  const year = Number(date.slice(0, 4));

  const thenYear = midYearOffsets(tz, year);
  const seasonal = thenYear.jan !== thenYear.jul;
  const nowYear = midYearOffsets(tz, now.getUTCFullYear());
  const usualNow = Math.min(nowYear.jan, nowYear.jul);

  let kind: ZoneKind;
  let kindText: string;
  if (hasDate && inWarPeriod(date) && off > usualNow) {
    kind = 'war';
    const diff = off - usualNow;
    const mins = Math.round(diff * 60);
    const ahead = mins % 60 === 0 ? `${mins / 60} hour${mins === 60 ? '' : 's'}` : `${mins} minutes`;
    kindText = `war time — clocks were ${ahead} ahead of the usual ${formatOffsetShort(usualNow)}`;
  } else if (seasonal && off > Math.min(thenYear.jan, thenYear.jul)) {
    kind = 'dst'; kindText = 'daylight saving';
  } else if (seasonal) {
    kind = 'standard'; kindText = 'standard time';
  } else if (hasDate && off !== usualNow) {
    kind = 'historical'; kindText = `the local clock in ${year}; today this zone uses ${formatOffsetShort(usualNow)}`;
  } else {
    kind = 'fixed'; kindText = '';
  }

  const pre1970Note = hasDate && year < 1970
    ? 'For births before 1970 we use the historical time-zone records for this place (IANA time-zone database). If the birth record shows a different local clock, choose the zone under “Advanced: set timezone manually”.'
    : null;

  return {
    timezone: tz, utcOffsetHours: off, offsetShort: formatOffsetShort(off),
    kind, kindText, today: !hasDate, pre1970Note, changeoverNote: r.note,
  };
}

/** The one-line confirmation shown after a place is picked. */
export function birthPlaceConfirmLine(label: string, s: BirthZoneSummary, manual = false): string {
  const when = s.today ? 'today — add the birth date to see the offset for that day' : 'on that date';
  const extra = s.kindText ? `, ${s.kindText}` : '';
  return `Born in ${label} · time zone ${s.timezone} (${s.offsetShort} ${when}${extra})${manual ? ' · set manually' : ''}`;
}
