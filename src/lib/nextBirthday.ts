/**
 * Next-birthday countdown (S11). Pure, local-calendar based.
 * 29 February births: in non-leap years the birthday is celebrated on 28 February
 * (the date used for the countdown); `nextLeapDay` gives the next real 29 February.
 */
export interface NextBirthday {
  isToday: boolean;
  /** Local midnight at the start of the next birthday (today's if isToday is false and it hasn't passed). */
  next: Date;
  /** Whole calendar days from today to `next` (0 never occurs — on the day we count to next year). */
  days: number;
  weekday: string;
  turningAge: number;
  isLeapling: boolean;
  nextLeapDay: Date | null;
}

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function birthdayIn(year: number, m: number, d: number): Date {
  if (m === 1 && d === 29 && !isLeap(year)) return new Date(year, 1, 28);
  return new Date(year, m, d);
}
const dayNumber = (dt: Date) => Math.round(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 86400000);

export function nextBirthday(birth: Date, now: Date = new Date()): NextBirthday {
  const m = birth.getMonth(), d = birth.getDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = birthdayIn(now.getFullYear(), m, d);
  const isToday = dayNumber(thisYear) === dayNumber(today);
  const next = dayNumber(thisYear) > dayNumber(today) ? thisYear : birthdayIn(now.getFullYear() + 1, m, d);
  const isLeapling = m === 1 && d === 29;
  let nextLeapDay: Date | null = null;
  if (isLeapling) {
    let y = now.getFullYear();
    while (!(isLeap(y) && dayNumber(new Date(y, 1, 29)) >= dayNumber(today))) y++;
    nextLeapDay = new Date(y, 1, 29);
  }
  return {
    isToday,
    next,
    days: dayNumber(next) - dayNumber(today),
    weekday: WEEKDAYS[next.getDay()],
    turningAge: next.getFullYear() - birth.getFullYear(),
    isLeapling,
    nextLeapDay,
  };
}
