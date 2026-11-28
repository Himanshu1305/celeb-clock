/**
 * B23 — facts that are specific to ONE calendar date, for /birthday/:month/:day. Round 2 found that
 * dates sharing a Sun sign and a birth-day number read 89% alike; these rows differ for every date.
 * All computed from the calendar (no prediction): day of the year, how far the Sun is through its
 * sign and which decan that is, cusp dates, the month's birthstone and flowers, national days,
 * and the famous people born that day (src/lib/celebsByDay.ts).
 */
import { getZodiacBySlug } from '@/data/zodiacData';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { MONTH_HUB_DATA } from '@/data/monthHubData';
import { getNationalDays } from '@/data/nationalDays';

const MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Traditional triplicity decan rulers (1st, 2nd, 3rd ten degrees of each sign). */
export const DECAN_RULERS: Record<string, [string, string, string]> = {
  Aries: ['Mars', 'Sun', 'Jupiter'], Leo: ['Sun', 'Jupiter', 'Mars'], Sagittarius: ['Jupiter', 'Mars', 'Sun'],
  Taurus: ['Venus', 'Mercury', 'Saturn'], Virgo: ['Mercury', 'Saturn', 'Venus'], Capricorn: ['Saturn', 'Venus', 'Mercury'],
  Gemini: ['Mercury', 'Venus', 'Saturn'], Libra: ['Venus', 'Saturn', 'Mercury'], Aquarius: ['Saturn', 'Mercury', 'Venus'],
  Cancer: ['Moon', 'Mars', 'Jupiter'], Scorpio: ['Mars', 'Jupiter', 'Moon'], Pisces: ['Jupiter', 'Moon', 'Mars'],
};
const ord = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 >= 11 && n % 100 <= 13) ? 0 : (n % 10 <= 3 ? n % 10 : 0)]}`;
const doy = (m: number, d: number) => MONTH_LEN.slice(0, m - 1).reduce((a, b) => a + b, 0) + d;
/** Days from (m1,d1) forward to (m2,d2) in a common year. */
const span = (m1: number, d1: number, m2: number, d2: number) => ((doy(m2, d2) - doy(m1, d1)) + 365) % 365;

export interface DateFactRow { label: string; value: string }

export function birthdayDateFacts(month: number, day: number, sign: string, famous: { india: number; world: number; top: string[] }): DateFactRow[] {
  const rows: DateFactRow[] = [];
  const leapDay = month === 2 && day === 29;
  const n = leapDay ? 60 : doy(month, day);
  rows.push({ label: 'Day of the year', value: leapDay ? 'Day 60 — the leap day, only in leap years' : `Day ${n} of 365 (day ${month > 2 ? n + 1 : n} in a leap year), with ${365 - n} days left in the year` });
  const z = getZodiacBySlug(sign.toLowerCase());
  if (z && !leapDay) {
    const len = span(z.startMonth, z.startDay, z.endMonth, z.endDay) + 1;
    const into = span(z.startMonth, z.startDay, month, day);
    const deg = Math.min(29, Math.floor(((into + 0.5) / len) * 30));
    const decan = Math.min(3, Math.floor(deg / 10) + 1);
    const ruler = DECAN_RULERS[z.name]?.[decan - 1];
    rows.push({ label: 'Sun position', value: `About ${deg}° ${z.name} — the ${ord(decan)} decan of ${z.name}${ruler ? `, traditionally ruled by ${ruler}` : ''}` });
    if (into <= 1) rows.push({ label: 'Cusp', value: `On the cusp: the Sun enters ${z.name} around ${MONTHS[z.startMonth - 1]} ${z.startDay}, and the exact moment shifts by a day from year to year — check the birth year.` });
    else if (len - 1 - into <= 1) rows.push({ label: 'Cusp', value: `On the cusp: the Sun leaves ${z.name} around ${MONTHS[z.endMonth - 1]} ${z.endDay}, and the exact moment shifts by a day from year to year — check the birth year.` });
  }
  const stone = BIRTHSTONE_DATA[month - 1];
  if (stone) rows.push({ label: 'Birthstone', value: `${stone.primaryStone} (${MONTHS[month - 1]})` });
  const hub = MONTH_HUB_DATA[month - 1];
  if (hub?.birthFlowers?.length) rows.push({ label: 'Birth flowers', value: hub.birthFlowers.map(f => f.name).join(' and ') });
  const nd = getNationalDays(month, day);
  if (nd.length) rows.push({ label: 'National days', value: nd.slice(0, 3).map(x => `${x.country}: ${x.dayName}`).join(' · ') });
  const hm = ((month + 5) % 12) + 1;
  const hd = Math.min(day, MONTH_LEN[hm - 1]);
  rows.push({ label: 'Half-birthday', value: `${MONTHS[hm - 1]} ${hd}` });
  if (famous.top.length) rows.push({ label: 'Famous birthdays', value: `${famous.top.slice(0, 3).join(', ')}${famous.india + famous.world > 3 ? ` and ${famous.india + famous.world - 3}+ more with BornClock profiles` : ''}` });
  return rows;
}
