/**
 * W7 — Panchang, Rahu Kaal and Choghadiya city pages as daily entries (shared
 * daily-page mechanism, see ../index.ts).
 *
 * One DayPanchang per (place, date) from our engine (src/lib/vedic/panchangDay.ts) is
 * turned into a DailyEntry for each of the three page kinds. The same builder runs at
 * build time (400-day precompute for the 50 built-in cities + the three index pages,
 * which show Delhi) and in the browser for any other date or any searched place — so the
 * words are always the same for the same input.
 */
import type { DailyEntry, DailyItem, DailySection, DailyFaq } from '../types';
import { formatDateEn, formatLongDateEn } from '../dates';
import {
  computeDayPanchang, dayWindowsLite, addDaysKey, panchangCityBySlug, sunriseSunset, WINDOW_PARTS,
  type DayPanchang, type TimeWindow,
} from '../../vedic/panchangDay';
import { karanaName } from '../../vedic/panchang';
import { pageAnswer, pageMeta, indexMeta, windowText, windowsText, cityContrast, goodDaySlots, type PanchangPageKind } from '../../vedic/panchangText';

export const PANCHANG_INDEX_SLUG = 'index';

export interface PanchangPlaceInput { name: string; lat: number; lon: number; tz: number; slug?: string }

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const clockIST = (x: Date) => new Date(Math.round((x.getTime() + 5.5 * 3600e3) / 60000) * 60000).toISOString().slice(11, 16);

// Small memo so the three kinds (and the week table) share one computation per place/day.
const memo = new Map<string, DayPanchang>();
function dayFor(place: PanchangPlaceInput, date: string): DayPanchang {
  const key = `${place.lat},${place.lon},${place.tz},${date}`;
  let p = memo.get(key);
  if (!p) {
    if (memo.size > 400) memo.clear();
    p = computeDayPanchang(new Date(date + 'T12:00:00Z'), place.lat, place.lon, place.tz, place.name);
    memo.set(key, p);
  }
  return p;
}
const delhiMemo = new Map<string, { sunrise: string; sunset: string }>();
function delhiSun(date: string) {
  let v = delhiMemo.get(date);
  if (!v) {
    const d = panchangCityBySlug('delhi')!;
    const r = sunriseSunset(new Date(date + 'T12:00:00Z'), d.lat, d.lon, 5.5);
    v = { sunrise: clockIST(r.rise), sunset: clockIST(r.set) };
    if (delhiMemo.size > 1000) delhiMemo.clear();
    delhiMemo.set(date, v);
  }
  return v;
}

const w = (x: TimeWindow) => windowText(x);
const item = (label: string, value: string, note?: string): DailyItem => (note ? { label, value, note } : { label, value });
const choghItems = (list: TimeWindow[]): DailyItem[] =>
  list.map(c => item(c.name, `${c.start}–${c.end}`, c.quality === 'good' ? 'good' : c.quality === 'bad' ? 'avoid for new starts' : 'neutral'));

function limbsSection(p: DayPanchang): DailySection {
  return {
    id: 'limbs', heading: 'The five limbs at sunrise',
    items: [
      item('Tithi (lunar day)', `${p.paksha} ${p.tithiName}`, `till ${p.tithiEnd}`),
      item('Nakshatra (Moon’s star)', p.nakshatra, `till ${p.nakshatraEnd}`),
      item('Yoga', p.yoga, `till ${p.yogaEnd}`),
      item('Karana (half of a Tithi)', karanaName(p.karana), `till ${p.karanaEnd}`),
      item('Vara (weekday)', p.weekday),
    ],
  };
}
function goodSection(p: DayPanchang): DailySection {
  return {
    id: 'good-times', heading: 'Good times', tone: 'good',
    items: [
      item('Brahma Muhurta', w(p.brahmaMuhurta), 'the quiet stretch before dawn, valued for prayer and study'),
      item('Abhijit Muhurta', p.abhijitApplies ? w(p.abhijit) : 'not used on Wednesday', p.abhijitApplies ? 'the midday muhurta' : 'on Wednesday this muhurta is Dur Muhurtam'),
      item('Amrit Kalam', windowsText(p.amritKalam), 'a favourable slice of the day’s Nakshatra'),
    ],
  };
}
function avoidSection(p: DayPanchang): DailySection {
  return {
    id: 'avoid', heading: 'Times to avoid for new starts', tone: 'care',
    text: 'Traditional guides for beginning something new — work already under way can carry on.',
    items: [
      item('Rahu Kaal', w(p.rahuKaal)),
      item('Gulika Kaal', w(p.gulikaKaal)),
      item('Yamaganda', w(p.yamaganda)),
      item('Dur Muhurtam', windowsText(p.durMuhurtam)),
      item('Varjyam', windowsText(p.varjyam)),
    ],
  };
}
function choghSections(p: DayPanchang): DailySection[] {
  return [
    { id: 'choghadiya-day', heading: `Day Choghadiya (sunrise ${p.sunrise} → sunset ${p.sunset})`, items: choghItems(p.dayChoghadiya) },
    { id: 'choghadiya-night', heading: 'Night Choghadiya (sunset → next sunrise)', items: choghItems(p.nightChoghadiya) },
  ];
}
function sunSection(place: PanchangPlaceInput, p: DayPanchang): DailySection {
  const delhi = place.slug && place.slug !== 'delhi' ? delhiSun(p.date) : null;
  return {
    id: 'sun', heading: `Sun in ${place.name}`,
    text: cityContrast(place.name, p, delhi),
    items: [item('Sunrise', p.sunrise), item('Sunset', p.sunset)],
  };
}

function whyItems(kind: PanchangPageKind, place: PanchangPlaceInput, p: DayPanchang) {
  const day = WINDOW_PARTS.rahu[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(p.weekday)];
  const sun = { label: `Sunrise ${p.sunrise}, sunset ${p.sunset} in ${place.name}`, text: 'Every window here is a share of the real local daylight or night, so the clock times are this city’s own.' };
  if (kind === 'rahu-kaal') return [sun, { label: `${p.weekday}: the ${ORD[day]} eighth of daylight`, text: 'Daylight is split into eight equal parts; the weekday decides which part is Rahu Kaal.' }];
  if (kind === 'choghadiya') return [sun, { label: `${p.weekday} starts with ${p.dayChoghadiya[0].name}`, text: 'The weekday fixes the first slot; the day and the night are each split into eight slots.' }];
  return [sun, { label: `Moon in ${p.nakshatra}, ${p.paksha} ${p.tithiName}`, text: 'The Moon’s position at sunrise gives the Tithi and Nakshatra; it also places Amrit Kalam and Varjyam.' }];
}

function faqFor(kind: PanchangPageKind, place: PanchangPlaceInput, p: DayPanchang): DailyFaq[] {
  const d = formatDateEn(p.date);
  if (kind === 'rahu-kaal') return [
    { q: `What is the Rahu Kaal time in ${place.name} today?`, a: `On ${formatLongDateEn(p.date)}, Rahu Kaal in ${place.name} is ${w(p.rahuKaal)} local time, from a sunrise of ${p.sunrise} and a sunset of ${p.sunset}.` },
    { q: `When are Gulika Kaal and Yamaganda in ${place.name} on ${d}?`, a: `Gulika Kaal is ${w(p.gulikaKaal)} and Yamaganda is ${w(p.yamaganda)}.` },
  ];
  if (kind === 'choghadiya') {
    const good = goodDaySlots(p).map(c => `${c.name} ${c.start}–${c.end}`).join(', ');
    return [
      { q: `What is the Choghadiya in ${place.name} today?`, a: `On ${formatLongDateEn(p.date)} the day Choghadiya starts with ${p.dayChoghadiya[0].name} at ${p.sunrise} and the night Choghadiya with ${p.nightChoghadiya[0].name} at ${p.sunset}.` },
      { q: `Which Choghadiya slots are good in ${place.name} on ${d}?`, a: good ? `The good daytime slots are ${good}.` : 'There is no Amrit, Shubh or Labh slot in the daytime on this date.' },
    ];
  }
  return [
    { q: `What is the Tithi in ${place.name} today?`, a: `At sunrise (${p.sunrise}) on ${formatLongDateEn(p.date)} the Tithi is ${p.paksha} ${p.tithiName}, until ${p.tithiEnd}. The Nakshatra is ${p.nakshatra}, until ${p.nakshatraEnd}.` },
    { q: `What is the Rahu Kaal in ${place.name} on ${d}?`, a: `Rahu Kaal is ${w(p.rahuKaal)}; Gulika Kaal ${w(p.gulikaKaal)}; Yamaganda ${w(p.yamaganda)}.` },
  ];
}

function weekSection(place: PanchangPlaceInput, date: string): DailySection {
  const items = Array.from({ length: 7 }, (_, i) => {
    const day = addDaysKey(date, i);
    const x = dayWindowsLite(new Date(day + 'T12:00:00Z'), place.lat, place.lon, place.tz);
    return item(`${x.weekday.slice(0, 3)}, ${formatDateEn(day).replace(/ \d{4}$/, '')}`, `${x.rahuKaal.start}–${x.rahuKaal.end}`, `Gulika ${x.gulikaKaal.start}–${x.gulikaKaal.end} · Yamaganda ${x.yamaganda.start}–${x.yamaganda.end}`);
  });
  return { id: 'week', heading: `Rahu Kaal for the next 7 days in ${place.name}`, items };
}

/**
 * The entry for one page kind, place and date. `index` = the /panchang, /rahu-kaal,
 * /choghadiya index pages (they show Delhi but have their own title and H1).
 */
export function buildPanchangEntry(kind: PanchangPageKind, place: PanchangPlaceInput, date: string, index = false): DailyEntry {
  const p = dayFor(place, date);
  const meta = pageMeta(kind, place.name, p);
  const im = index ? indexMeta(kind) : null;
  const dl = formatDateEn(date);
  let sections: DailySection[];
  if (kind === 'rahu-kaal') {
    sections = [
      { id: 'rahu-today', heading: `Rahu Kaal today in ${place.name}`, tone: 'care', items: [item('Rahu Kaal', w(p.rahuKaal)), item('Gulika Kaal', w(p.gulikaKaal)), item('Yamaganda', w(p.yamaganda))] },
      { id: 'other-avoid', heading: 'Other windows avoided for new starts', items: [item('Dur Muhurtam', windowsText(p.durMuhurtam)), item('Varjyam', windowsText(p.varjyam))] },
      weekSection(place, date),
      goodSection(p),
    ];
  } else if (kind === 'choghadiya') {
    const good = goodDaySlots(p);
    sections = [
      { id: 'good-slots', heading: 'Good daytime slots', tone: 'good', items: good.length ? good.map(c => item(c.name, `${c.start}–${c.end}`)) : [item('Today', 'no Amrit, Shubh or Labh slot in the daytime')] },
      ...choghSections(p),
      { id: 'also-today', heading: 'Also today', items: [item('Rahu Kaal', w(p.rahuKaal)), item('Abhijit Muhurta', p.abhijitApplies ? w(p.abhijit) : 'not used on Wednesday')] },
    ];
  } else {
    sections = [limbsSection(p), sunSection(place, p), goodSection(p), avoidSection(p), ...choghSections(p)];
  }
  return {
    date, lang: 'en',
    title: im ? im.title.replace(' | BornClock', ` (${dl}) | BornClock`) : meta.title,
    description: im ? `${place.name}, ${dl}: ${meta.description.replace(/^[^:]+:\s*/, '')}` : meta.description,
    h1: im ? im.h1 : meta.h1,
    dateLabel: formatLongDateEn(date),
    answer: pageAnswer(kind, p, place.name),
    why: whyItems(kind, place, p),
    sections,
    faq: faqFor(kind, place, p),
  };
}

function computerFor(kind: PanchangPageKind) {
  return (date: string, slug: string): DailyEntry => {
    const index = slug === PANCHANG_INDEX_SLUG;
    const c = panchangCityBySlug(index ? 'delhi' : slug);
    if (!c) throw new Error(`panchang daily: unknown city "${slug}"`);
    return buildPanchangEntry(kind, { name: c.name, lat: c.lat, lon: c.lon, tz: c.tz, slug: c.slug }, date, index);
  };
}
export const computePanchangDaily = computerFor('panchang');
export const computeRahuKaalDaily = computerFor('rahu-kaal');
export const computeChoghadiyaDaily = computerFor('choghadiya');
