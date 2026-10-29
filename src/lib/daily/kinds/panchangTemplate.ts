/**
 * W7 — pure templates for the Panchang / Rahu Kaal / Choghadiya pages (English) and the
 * Hindi Panchang page, built from compact per-day DATA (the "data + render" variant of the
 * shared daily mechanism, see ../registry.ts DailyPageDef.data).
 *
 * The build stores one small PanchangDayData per city per day (times as minutes since
 * local midnight, ids for the Tithi / Nakshatra / Yoga / Karana); these functions turn it
 * into the page text. They are the ONLY text builders: the Worker (injection), the browser
 * (precomputed JSON, other dates, searched places) and the tests all call them, so the
 * words are always identical for the same data. No engine imports here (Worker-safe).
 */
import type { DailyEntry, DailyItem, DailySection, DailyFaq } from '../types';
import { formatDateEn, formatLongDateEn, formatDateHi, formatLongDateHi, addDaysISO, weekdayOf, WEEKDAYS_EN } from '../dates';
import type { DayPanchang, TimeWindow } from '../../vedic/panchangDay';
import { karanaName, PANCHANG_TABLES } from '../../vedic/panchang';
import { pageAnswer, pageMeta, indexMeta, windowText, windowsText, cityContrast, goodDaySlots, type PanchangPageKind } from '../../vedic/panchangText';
import { TITHI_HI, PAKSHA_HI, NAKSHATRA_HI, YOGA_HI, KARANA_HI, CHOGH_HI, WEEKDAY_HI, cityHi, hiEnd } from '../../vedic/panchangHindi';
import panchangCities from '../../../data/panchangCities.json';
import { VRAT_NAMES, VRAT_SLUG_SET, vratPath, type VratSlug } from '../../vedic/vrats/meta';

export const PANCHANG_INDEX_SLUG = 'index';
export interface PlaceRef { name: string; slug?: string }

const T = PANCHANG_TABLES;
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

/**
 * Compact per-day data for one place. Times are whole minutes since local midnight of
 * the date (≥ 1440 = after the next midnight, < 0 = before this midnight).
 */
export interface PanchangDayData {
  /** sunrise, sunset */
  r: number; s: number;
  /** daylight length (min) */
  dl: number;
  /** [index, end] — Tithi 0..29 (Shukla 1 = 0), Nakshatra 0..26, Yoga 0..26, Karana 1..60 */
  t: [number, number]; n: [number, number]; y: [number, number]; k: [number, number];
  /** Rahu, Gulika, Yamaganda, Abhijit, Brahma Muhurta — [start, end] × 5 */
  w: number[];
  /** Dur Muhurtam, Varjyam, Amrit Kalam — flat [start, end, …] */
  du: number[]; v: number[]; a: number[];
  /** Choghadiya boundaries: 8 day starts, sunset, 7 night starts, next sunrise (17) */
  c: number[];
  /** Next 7 days: [rahuS, rahuE, gulS, gulE, yamaS, yamaE] × 7 */
  wk: number[];
  /** Delhi's sunrise / sunset that day (for the city comparison line; not on Delhi itself) */
  dz?: [number, number];
  /** Batch 10: vrat pages for this date (src/lib/vedic/vrats — New Delhi festival dates + weekday vrats) */
  vr?: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');
/** "HH:MM" of a minute count (wrapping past midnight). */
export const hhmm = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
const endText = (m: number) => hhmm(m) + (m >= 1440 ? ' (next day)' : '');
const win = (name: string, s: number, e: number, quality: TimeWindow['quality']): TimeWindow => {
  const x: TimeWindow = { name, start: hhmm(s), end: hhmm(e), quality };
  if (s >= 1440) x.startNextDay = true;
  if (e >= 1440) x.endNextDay = true;
  return x;
};
const pairs = (a: number[], name: string, q: TimeWindow['quality']) => {
  const out: TimeWindow[] = [];
  for (let i = 0; i + 1 < a.length; i += 2) out.push(win(name, a[i], a[i + 1], q));
  return out;
};

/** Rebuild the page-facing day (same fields and strings as computeDayPanchang) from data. */
export function expandPanchangDay(date: string, d: PanchangDayData, city: string): DayPanchang {
  const wd = weekdayOf(date);
  const ti = d.t[0];
  const paksha = ti < 15 ? 'Shukla' : 'Krishna';
  const within = ti % 15;
  const tithiName = within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : T.TITHI_NAMES[within];
  const dayStart = T.DAY_START_IDX[wd];
  const nightStart = (dayStart + 5) % 7;
  const chog = (start: number, step: number, from: number) => Array.from({ length: 8 }, (_, i) => {
    const name = T.CHOGH_CYCLE[(start + i * step) % 7];
    return { name, start: hhmm(d.c[from + i]), end: hhmm(d.c[from + i + 1]), quality: T.CHOGH_QUALITY[name] } as TimeWindow;
  });
  return {
    date, weekday: T.WEEKDAYS[wd],
    tithi: within + 1, tithiName, paksha,
    nakshatra: T.NAKSHATRAS[d.n[0]], nakshatraIndex: d.n[0],
    yoga: T.YOGAS[d.y[0]], karana: d.k[0],
    rahuKalam: { start: hhmm(d.w[0]), end: hhmm(d.w[1]) },
    city,
    sunrise: hhmm(d.r), sunset: hhmm(d.s),
    rahuKaal: win('Rahu Kaal', d.w[0], d.w[1], 'bad'),
    gulikaKaal: win('Gulika Kaal', d.w[2], d.w[3], 'bad'),
    yamaganda: win('Yamaganda', d.w[4], d.w[5], 'bad'),
    dayChoghadiya: chog(dayStart, 1, 0),
    nightChoghadiya: chog(nightStart, 5, 8),
    tithiEnd: endText(d.t[1]), nakshatraEnd: endText(d.n[1]), yogaEnd: endText(d.y[1]), karanaEnd: endText(d.k[1]),
    abhijit: win('Abhijit Muhurta', d.w[6], d.w[7], 'good'),
    abhijitApplies: wd !== 3,
    brahmaMuhurta: win('Brahma Muhurta', d.w[8], d.w[9], 'good'),
    durMuhurtam: pairs(d.du, 'Dur Muhurtam', 'bad'),
    varjyam: pairs(d.v, 'Varjyam', 'bad'),
    amritKalam: pairs(d.a, 'Amrit Kalam', 'good'),
    dayLengthMin: d.dl,
  };
}

/** City name for a page slug ('index' pages show Delhi). */
export function placeForSlug(slug: string): PlaceRef {
  const s = slug === PANCHANG_INDEX_SLUG ? 'delhi' : slug;
  const c = (panchangCities as { cities: Array<{ slug: string; name: string }> }).cities.find(x => x.slug === s);
  if (!c) throw new Error(`panchang template: unknown city "${slug}"`);
  return { name: c.name, slug: c.slug };
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
function sunSection(place: PlaceRef, p: DayPanchang, delhi: { sunrise: string; sunset: string } | null): DailySection {
  return {
    id: 'sun', heading: `Sun in ${place.name}`,
    text: cityContrast(place.name, p, delhi),
    items: [item('Sunrise', p.sunrise), item('Sunset', p.sunset)],
  };
}

function whyItems(kind: PanchangPageKind, place: PlaceRef, p: DayPanchang) {
  const day = PANCHANG_TABLES.RAHU_PART[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(p.weekday)];
  const sun = { label: `Sunrise ${p.sunrise}, sunset ${p.sunset} in ${place.name}`, text: 'Every window here is a share of the real local daylight or night, so the clock times are this city’s own.' };
  if (kind === 'rahu-kaal') return [sun, { label: `${p.weekday}: the ${ORD[day]} eighth of daylight`, text: 'Daylight is split into eight equal parts; the weekday decides which part is Rahu Kaal.' }];
  if (kind === 'choghadiya') return [sun, { label: `${p.weekday} starts with ${p.dayChoghadiya[0].name}`, text: 'The weekday fixes the first slot; the day and the night are each split into eight slots.' }];
  return [sun, { label: `Moon in ${p.nakshatra}, ${p.paksha} ${p.tithiName}`, text: 'The Moon’s position at sunrise gives the Tithi and Nakshatra; it also places Amrit Kalam and Varjyam.' }];
}

function faqFor(kind: PanchangPageKind, place: PlaceRef, p: DayPanchang): DailyFaq[] {
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

function weekSection(place: PlaceRef, date: string, wk: number[]): DailySection {
  const items = Array.from({ length: 7 }, (_, i) => {
    const day = addDaysISO(date, i);
    const [rs, re, gs, ge, ys, ye] = wk.slice(i * 6, i * 6 + 6).map(hhmm);
    return item(`${WEEKDAYS_EN[weekdayOf(day)].slice(0, 3)}, ${formatDateEn(day).replace(/ \d{4}$/, '')}`, `${rs}–${re}`, `Gulika ${gs}–${ge} · Yamaganda ${ys}–${ye}`);
  });
  return { id: 'week', heading: `Rahu Kaal for the next 7 days in ${place.name}`, items };
}

/**
 * The entry for one page kind, place and date. `index` = the /panchang, /rahu-kaal,
 * /choghadiya index pages (they show Delhi but have their own title and H1).
 */
export function renderPanchangEntry(kind: PanchangPageKind, place: PlaceRef, date: string, data: PanchangDayData, index = false): DailyEntry {
  const p = expandPanchangDay(date, data, place.name);
  const delhi = data.dz ? { sunrise: hhmm(data.dz[0]), sunset: hhmm(data.dz[1]) } : null;
  const meta = pageMeta(kind, place.name, p);
  const im = index ? indexMeta(kind) : null;
  const dl = formatDateEn(date);
  let sections: DailySection[];
  if (kind === 'rahu-kaal') {
    sections = [
      { id: 'rahu-today', heading: `Rahu Kaal today in ${place.name}`, tone: 'care', items: [item('Rahu Kaal', w(p.rahuKaal)), item('Gulika Kaal', w(p.gulikaKaal)), item('Yamaganda', w(p.yamaganda))] },
      { id: 'other-avoid', heading: 'Other windows avoided for new starts', items: [item('Dur Muhurtam', windowsText(p.durMuhurtam)), item('Varjyam', windowsText(p.varjyam))] },
      weekSection(place, date, data.wk),
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
    const vrat = vratTodaySection(data.vr, 'en');
    sections = [limbsSection(p), ...(vrat ? [vrat] : []), sunSection(place, p, delhi), goodSection(p), avoidSection(p), ...choghSections(p)];
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


/**
 * Batch 10: "Vrat today" — links to the vrat katha + puja vidhi pages for the vrats that fall
 * on this date (festival dates are for New Delhi, as on /festivals; Monday / Tuesday vrats
 * every week).
 */
export function vratTodaySection(vr: string[] | undefined, lang: 'en' | 'hi'): DailySection | null {
  const list = (vr ?? []).filter(s => VRAT_SLUG_SET.has(s)) as VratSlug[];
  if (!list.length) return null;
  const hi = lang === 'hi';
  return {
    id: 'vrat-today',
    heading: hi ? 'आज का व्रत — कथा और पूजा विधि' : 'Vrat today — katha and puja vidhi',
    text: hi
      ? 'आज पड़ने वाले व्रत (त्योहार की तिथियाँ नई दिल्ली के अनुसार; दूसरे शहर में कभी-कभी एक दिन का अंतर हो सकता है)।'
      : 'Vrats that fall today (festival dates are for New Delhi; another city can occasionally differ by a day).',
    links: list.map(s => ({ label: VRAT_NAMES[s][hi ? 'hi' : 'en'], href: vratPath(s, lang) })),
  };
}

/** Template for the registered English kinds: (date, page slug, data) → entry. */
export const panchangTemplate = (kind: PanchangPageKind) => (date: string, slug: string, data: unknown): DailyEntry =>
  renderPanchangEntry(kind, placeForSlug(slug), date, data as PanchangDayData, slug === PANCHANG_INDEX_SLUG);

// ── Hindi Panchang (/hi/panchang, /hi/panchang/:city) ────────────────────────────
const winHi = (x: TimeWindow) => `${x.start}–${x.end}${x.endNextDay ? ' (अगले दिन)' : ''}`;
const winsHi = (xs: TimeWindow[]) => (xs.length ? xs.map(winHi).join(' और ') : 'आज नहीं');
const tithiHi = (p: DayPanchang) => `${PAKSHA_HI[p.paksha]} ${TITHI_HI[p.tithiName] || p.tithiName}`;
const nakHi = (p: DayPanchang) => NAKSHATRA_HI[p.nakshatra] || p.nakshatra;
const choghHi = (list: TimeWindow[]): DailyItem[] =>
  list.map(c => ({ label: CHOGH_HI[c.name] || c.name, value: `${c.start}–${c.end}`, note: c.quality === 'good' ? 'शुभ' : c.quality === 'bad' ? 'नए कार्य के लिए टालें' : 'सामान्य' }));

/** Static (undated) Hindi title / description / H1 — mirrors scripts/prerender-titles.mjs. */
export function hindiPanchangMeta(slug: string): { title: string; description: string; h1: string } {
  if (slug === PANCHANG_INDEX_SLUG) return {
    title: 'आज का पंचांग — तिथि, नक्षत्र, राहु काल व चौघड़िया | BornClock',
    description: 'आज का पंचांग: तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त, राहु काल, गुलिक, यमगण्ड और दिन-रात का चौघड़िया — वास्तविक सूर्योदय/सूर्यास्त से गणना।',
    h1: 'आज का पंचांग',
  };
  const n = cityHi(slug, placeForSlug(slug).name);
  return {
    title: `${n} का आज का पंचांग — तिथि, नक्षत्र व राहु काल | BornClock`,
    description: `${n} का आज का पंचांग: तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त, राहु काल और चौघड़िया — वास्तविक सूर्योदय/सूर्यास्त से गणना।`,
    h1: `आज का पंचांग — ${n}`,
  };
}

/**
 * Hindi entry for a built-in page slug ('index' or one of the 10 Hindi cities), or —
 * with `custom` (batch 8) — for any searched place, whose name is shown as given.
 */
export function renderPanchangHiEntry(slug: string, date: string, data: PanchangDayData, custom?: { name: string }): DailyEntry {
  const index = !custom && slug === PANCHANG_INDEX_SLUG;
  const place = custom ? { name: custom.name } : placeForSlug(slug);
  const city = custom ? custom.name : cityHi(place.slug!, place.name);
  const p = expandPanchangDay(date, data, place.name);
  const dHi = formatDateHi(date);
  const dLong = formatLongDateHi(date);
  const abh = p.abhijitApplies ? `अभिजित मुहूर्त ${winHi(p.abhijit)} है।` : 'बुधवार को अभिजित मुहूर्त नहीं लिया जाता।';
  const kar = KARANA_HI[karanaName(p.karana)] || karanaName(p.karana);
  const meta = custom ? { h1: `पंचांग — ${city}` } : hindiPanchangMeta(slug);
  const vratHi = vratTodaySection(data.vr, 'hi');
  return {
    date, lang: 'hi',
    title: index ? `आज का पंचांग (${dHi}) — तिथि, नक्षत्र, राहु काल | BornClock` : `${city} का पंचांग (${dHi}) — तिथि, राहु काल | BornClock`,
    description: `${city} का पंचांग, ${dHi}: ${tithiHi(p)} तिथि, ${nakHi(p)} नक्षत्र, ${YOGA_HI[p.yoga] || p.yoga} योग, ${kar} करण। सूर्योदय ${p.sunrise}, राहु काल ${winHi(p.rahuKaal)}।`,
    h1: meta.h1,
    dateLabel: dLong,
    answer: `${dLong} को ${city} में सूर्योदय ${p.sunrise} और सूर्यास्त ${p.sunset} पर है। `
      + `सूर्योदय के समय ${tithiHi(p)} तिथि (${hiEnd(p.tithiEnd)} तक) और ${nakHi(p)} नक्षत्र (${hiEnd(p.nakshatraEnd)} तक) है। `
      + `राहु काल ${winHi(p.rahuKaal)} है; ${abh}`,
    why: [
      { label: `${city} में सूर्योदय ${p.sunrise}, सूर्यास्त ${p.sunset}`, text: 'इस पृष्ठ का हर समय स्थानीय दिन या रात का एक भाग है, इसलिए घड़ी का समय इसी शहर का अपना है।' },
      { label: `चंद्रमा ${nakHi(p)} नक्षत्र में, ${tithiHi(p)}`, text: 'सूर्योदय के समय चंद्रमा की स्थिति से तिथि और नक्षत्र तय होते हैं; अमृत काल और वर्ज्यम् भी इसी से निकलते हैं।' },
    ],
    sections: [
      { id: 'limbs', heading: 'सूर्योदय के समय पंचांग के पाँच अंग', items: [
        { label: 'तिथि (चंद्र दिवस)', value: tithiHi(p), note: `${hiEnd(p.tithiEnd)} तक` },
        { label: 'नक्षत्र (चंद्रमा का तारा)', value: nakHi(p), note: `${hiEnd(p.nakshatraEnd)} तक` },
        { label: 'योग', value: YOGA_HI[p.yoga] || p.yoga, note: `${hiEnd(p.yogaEnd)} तक` },
        { label: 'करण (तिथि का आधा भाग)', value: kar, note: `${hiEnd(p.karanaEnd)} तक` },
        { label: 'वार', value: WEEKDAY_HI[p.weekday] || p.weekday },
      ] },
      ...(vratHi ? [vratHi] : []),
      { id: 'sun', heading: `${city} में सूर्य`, items: [{ label: 'सूर्योदय', value: p.sunrise }, { label: 'सूर्यास्त', value: p.sunset }] },
      { id: 'good-times', heading: 'शुभ समय', tone: 'good', items: [
        { label: 'ब्रह्म मुहूर्त', value: winHi(p.brahmaMuhurta), note: 'भोर से पहले का शांत समय — पूजा, ध्यान और पढ़ाई के लिए' },
        { label: 'अभिजित मुहूर्त', value: p.abhijitApplies ? winHi(p.abhijit) : 'बुधवार को नहीं', note: p.abhijitApplies ? 'दोपहर का मुहूर्त' : 'बुधवार को यह मुहूर्त दुर्मुहूर्त होता है' },
        { label: 'अमृत काल', value: winsHi(p.amritKalam), note: 'दिन के नक्षत्र का शुभ भाग' },
      ] },
      { id: 'avoid', heading: 'नया कार्य शुरू करने के लिए टालें', tone: 'care',
        text: 'नया कार्य शुरू करने के लिए पारंपरिक मार्गदर्शन — चल रहा कार्य जारी रख सकते हैं।',
        items: [
          { label: 'राहु काल', value: winHi(p.rahuKaal) },
          { label: 'गुलिक काल', value: winHi(p.gulikaKaal) },
          { label: 'यमगण्ड', value: winHi(p.yamaganda) },
          { label: 'दुर्मुहूर्त', value: winsHi(p.durMuhurtam) },
          { label: 'वर्ज्यम्', value: winsHi(p.varjyam) },
        ] },
      { id: 'choghadiya-day', heading: `दिन का चौघड़िया (सूर्योदय ${p.sunrise} → सूर्यास्त ${p.sunset})`, items: choghHi(p.dayChoghadiya) },
      { id: 'choghadiya-night', heading: 'रात का चौघड़िया (सूर्यास्त → अगला सूर्योदय)', items: choghHi(p.nightChoghadiya) },
    ],
    faq: [
      { q: `आज ${city} में तिथि क्या है?`, a: `${dLong} को सूर्योदय (${p.sunrise}) के समय ${tithiHi(p)} तिथि है, ${hiEnd(p.tithiEnd)} तक। नक्षत्र ${nakHi(p)} है, ${hiEnd(p.nakshatraEnd)} तक।` },
      { q: `${dHi} को ${city} में राहु काल कब है?`, a: `राहु काल ${winHi(p.rahuKaal)}; गुलिक काल ${winHi(p.gulikaKaal)}; यमगण्ड ${winHi(p.yamaganda)}।` },
    ],
  };
}
