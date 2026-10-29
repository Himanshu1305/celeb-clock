/**
 * Batch 10 — pure template for the monthly Panchang calendar (/panchang-calendar): a month
 * grid with the Tithi and Nakshatra at local sunrise, sunrise / sunset, and the festivals
 * and vrats of each day (BornClock's festival engine, src/lib/vedic/festivals.ts — dates
 * reckoned for New Delhi, as on /festivals). Built from compact data computed by
 * ./panchangMonth.ts; no engine imports (Worker-safe).
 */
import type { DailyEntry, DailyItem, DailySection } from '../types';
import { MONTHS_EN, WEEKDAYS_EN, formatShortDateEn, weekdayOf } from '../dates';
import { PANCHANG_TABLES } from '../../vedic/panchang';

/** One month for one place. */
export interface PanchangMonthData {
  /** YYYY-MM */
  m: string;
  /** Per day of the month: [sunrise, sunset, tithi 0..29, tithi end, nakshatra 0..26, nakshatra end]
   *  (minutes since local midnight; ends ≥ 1440 are after the next midnight). */
  d: number[][];
  /** Festivals / vrats: [day of month, name, type] (festival engine types). */
  f: Array<[number, string, string]>;
}

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
const SHORT_WD = WEEKDAYS_EN.map(w => w.slice(0, 3));

export function tithiLabel(idx: number): { paksha: 'Shukla' | 'Krishna'; name: string } {
  const paksha = idx < 15 ? 'Shukla' : 'Krishna';
  const within = idx % 15;
  return { paksha, name: within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : PANCHANG_TABLES.TITHI_NAMES[within] };
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS_EN[m - 1]} ${y}`;
}

export const PANCHANG_CALENDAR_STATIC = {
  title: 'Panchang Calendar — Monthly Tithi, Nakshatra & Festivals | BornClock',
  description: 'Monthly Hindu Panchang calendar: the Tithi and Nakshatra at sunrise for every day, sunrise and sunset, and the festivals, Ekadashi, Purnima and Amavasya dates — for any city and any month.',
  h1: 'Panchang calendar',
};

const TAG: Record<string, string> = { purnima: 'Purnima', amavasya: 'Amavasya', ekadashi: 'Ekadashi', eclipse: 'Eclipse', festival: 'Festival', sankranti: 'Sankranti' };
const TAG_ORDER = ['eclipse', 'festival', 'purnima', 'amavasya', 'ekadashi', 'sankranti'];

/**
 * The month entry. `date` = the day the page is shown for (today on the daily page, or the
 * 1st for another month); it is marked "Today" when it falls in the month and `today` is set.
 */
export function renderPanchangMonth(date: string, place: { name: string }, data: PanchangMonthData, opts: { today?: boolean; india?: boolean } = {}): DailyEntry {
  const ml = monthLabel(data.m);
  const [y, mo] = data.m.split('-').map(Number);
  const iso = (day: number) => `${data.m}-${pad(day)}`;
  const byDay = new Map<number, Array<[string, string]>>();
  for (const [day, name, type] of data.f) {
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push([name, type]);
  }
  const of = (type: string) => data.f.filter(f => f[2] === type).map(f => formatShortDateEn(iso(f[0]), false));
  const purnima = of('purnima'), amavasya = of('amavasya'), ekadashi = of('ekadashi');
  const major = data.f.filter(f => f[2] === 'festival' || f[2] === 'eclipse');
  const cells: DailyItem[] = data.d.map((v, i) => {
    const day = i + 1;
    const t = tithiLabel(v[2]);
    const fest = byDay.get(day) ?? [];
    const tagType = TAG_ORDER.find(tp => fest.some(f => f[1] === tp));
    const isToday = opts.today && iso(day) === date;
    const cell: DailyItem = {
      label: `${day} ${SHORT_WD[weekdayOf(iso(day))]}`,
      value: `${t.paksha === 'Shukla' ? 'Shukla' : 'Krishna'} ${t.name} · ${PANCHANG_TABLES.NAKSHATRAS[v[4]]}`,
      note: [`Sunrise ${hhmm(v[0])} · Sunset ${hhmm(v[1])}`, ...fest.map(f => f[0])].join(' · '),
    };
    if (isToday) cell.tag = 'Today';
    else if (tagType) cell.tag = TAG[tagType];
    return cell;
  });
  const festItems: DailyItem[] = [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, fs]) => ({
    label: `${formatShortDateEn(iso(day), false)} (${SHORT_WD[weekdayOf(iso(day))]})`,
    value: fs.map(f => f[0]).join('; '),
  }));
  const where = opts.india === false
    ? 'Festival dates follow the Indian reckoning (New Delhi), as most families abroad keep them; the Tithi, Nakshatra, sunrise and sunset in each box are for '
    : 'Festival dates are reckoned for New Delhi (a city far to the east or west can occasionally keep one a day apart); the Tithi, Nakshatra, sunrise and sunset in each box are for ';
  const sections: DailySection[] = [
    {
      id: 'calendar', heading: `${ml} day by day — ${place.name}`, layout: 'calendar',
      text: `Each day shows the Tithi and Nakshatra at local sunrise, then sunrise and sunset and any festival or vrat. ${where}${place.name}.`,
      columns: SHORT_WD, startCol: weekdayOf(iso(1)) + 1, items: cells,
    },
    { id: 'festivals', heading: `Festivals and vrats in ${ml}`, items: festItems.length ? festItems : [{ label: ml, value: 'no listed festival this month' }] },
  ];
  const majorText = major.length ? `Festivals: ${major.slice(0, 6).map(f => `${f[1]} (${formatShortDateEn(iso(f[0]), false)})`).join(', ')}${major.length > 6 ? ' and more' : ''}. ` : '';
  const listText = (xs: string[]) => (xs.length ? xs.join(' and ') : 'none this month');
  return {
    date, lang: 'en',
    title: `Panchang Calendar ${ml} — Tithi & Festivals | BornClock`,
    description: `${ml} Panchang calendar for ${place.name}: Tithi and Nakshatra at sunrise for every day, sunrise and sunset, Purnima ${listText(purnima)}, Amavasya ${listText(amavasya)}, Ekadashi ${listText(ekadashi)}.`,
    h1: `Panchang calendar — ${ml}`,
    dateLabel: `${ml} · ${place.name}`,
    answer: `In ${ml}, Purnima (full Moon) falls on ${listText(purnima)}, Amavasya (new Moon) on ${listText(amavasya)} and Ekadashi on ${listText(ekadashi)}. ${majorText}`
      + `Every day below shows the Tithi and Nakshatra at sunrise in ${place.name}.`,
    why: [
      { label: 'Read at sunrise', text: 'A Hindu calendar day runs from sunrise to sunrise; the Tithi and Nakshatra that hold at sunrise name the day, even if they change later in the day.' },
      { label: 'Computed, not copied', text: 'Every value comes from the real sidereal (Lahiri) positions of the Sun and Moon — the same engine as the daily Panchang, checked against Drik Panchang.' },
    ],
    sections,
    faq: [
      { q: `When is Purnima in ${ml}?`, a: purnima.length ? `Purnima (the full-Moon Tithi at sunrise, New Delhi) falls on ${listText(purnima)} ${y}.` : `No Purnima day falls in ${ml} by the New Delhi reckoning; see the next month.` },
      { q: `When is Amavasya in ${ml}?`, a: amavasya.length ? `Amavasya (the new-Moon Tithi at sunrise, New Delhi) falls on ${listText(amavasya)} ${y}.` : `No Amavasya day falls in ${ml} by the New Delhi reckoning; see the next month.` },
      { q: 'Why does the Tithi in a day’s box sometimes differ from the festival listed?', a: 'Each box shows the Tithi at sunrise in the chosen place. Some festivals are kept by another time of day — Diwali by the evening (pradosh), Janmashtami by midnight, Sharad Purnima by moonrise — so a festival can sit on the day before or after the box whose sunrise Tithi matches it.' },
      { q: `Which Ekadashi dates are in ${ml}?`, a: ekadashi.length ? `Ekadashi falls on ${listText(ekadashi)} ${y} (New Delhi; the fasting day follows the Smarta rule used on BornClock’s festival calendar).` : `No Ekadashi falls in ${ml}.` },
    ],
    labels: { answer: `${MONTHS_EN[mo - 1]} in brief`, why: 'How this calendar is worked out', faq: `Questions about ${ml}` },
  };
}
