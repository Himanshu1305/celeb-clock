/**
 * B18 — daily Rashifal and Panchang in the regional languages, through the shared daily
 * mechanism (src/lib/daily): the SAME precomputed data as the English and Hindi pages
 * (data kinds 'vedic-sky' and 'panchang-day'), narrated by the language pack
 * (src/lib/lang/vocab/<code>.js). Pure and Worker-safe: the Worker injects today's text,
 * the browser renders the same entry.
 */
import type { DailyEntry, DailySection, DailyTone } from '../daily/types';
import { factors } from '../daily/kinds/rashifalDaily';
import { reviveVedicSky } from '../daily/kinds/rashifalDaily';
import { houseFrom, bestChoghadiya, type VedicSky } from '../daily/kinds/vedicSky';
import { pick } from '../daily/kinds/pick';
import { weekdayOf } from '../daily/dates';
import { RASHIS } from '../vedic/rashifal';
import { expandPanchangDay, PANCHANG_INDEX_SLUG, type PanchangDayData } from '../daily/kinds/panchangTemplate';
import { karanaName } from '../vedic/panchang';
import type { TimeWindow } from '../vedic/panchangDay';
import { LANG_RASHI_SLUGS } from './langs.js';
import { VOCAB } from './registry.js';
import type { ColourKey, DailyCtx, LangCode, LangVocab, PanchangCtx } from './types';

const COLOUR_KEY: Record<string, ColourKey> = {
  Red: 'red', White: 'white', Green: 'green', 'Silver-white': 'silverWhite', Gold: 'gold', Yellow: 'yellow', Blue: 'blue',
};
export const colourKeyOfRashi = (i: number): ColourKey => COLOUR_KEY[RASHIS[i].luckyColor] ?? 'white';

/** "22 நவம்பர் 2026" — day, native month, year (Indian-English digits). */
export function langDate(v: LangVocab, iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${v.months[m - 1]} ${y}`;
}
export function langLongDate(v: LangVocab, iso: string): string {
  return `${v.varas[weekdayOf(iso)]}, ${langDate(v, iso)}`;
}

export function dailyCtx(code: LangCode, date: string, rashi: number, sky: VedicSky): DailyCtx {
  const v = VOCAB[code];
  const f = factors(sky, rashi);
  const mc = sky.moonSignChanges[0];
  const nc = sky.moonNakChanges.find(x => !x.beforeRef);
  const best = bestChoghadiya(sky);
  const seed = `${code}:${LANG_RASHI_SLUGS[rashi]}`;
  return {
    date,
    dateText: langDate(v, date),
    rashiName: v.rashis[rashi],
    moonHouse: f.moonHouse,
    moonTone: f.moonTone,
    moonRashi: v.rashis[sky.sign.Moon],
    nak: v.nakshatras[sky.moonNak],
    moonChange: mc ? { at: mc.at, before: mc.beforeRef, house: mc.beforeRef ? houseFrom((mc.to + 11) % 12, rashi) : houseFrom(mc.to, rashi) } : undefined,
    nakChange: nc ? { at: nc.at, to: v.nakshatras[nc.to] } : undefined,
    venus: f.venus, mercury: f.mercury, mars: f.mars, jupiter: f.jupiter, rahu: f.rahu, saturn: f.saturn,
    taras: f.taras.map(t => ({ nak: v.nakshatras[t.nak], tara: t.tara, tone: t.tone })),
    best: best ? { name: v.choghadiya[best.name as keyof LangVocab['choghadiya']] ?? best.name, start: best.start, end: best.end } : null,
    rahuKaal: { start: sky.rahuKaal.start, end: sky.rahuKaal.end },
    city: v.cities.delhi,
    colour: v.colours[colourKeyOfRashi(rashi)],
    numbers: RASHIS[rashi].luckyNumbers,
    pick: (options, key) => pick(options, date, seed, key),
  };
}

export function composeRashifalLang(code: LangCode, date: string, rashi: number, sky: VedicSky): DailyEntry {
  const v = VOCAB[code];
  const N = v.daily;
  const c = dailyCtx(code, date, rashi, sky);
  const headline = c.pick(N.headline[c.moonTone], 'headline');
  const slow = N.slow(c);
  const answer = N.answer(c, headline, slow.answer);
  const loveT: DailyTone = c.venus.tone === 'good' && c.moonTone !== 'care' ? 'good' : c.venus.tone === 'care' && c.moonTone === 'care' ? 'care' : 'mixed';
  const careerT: DailyTone = c.moonTone === 'good' && c.mercury.tone === 'good' ? 'good' : c.moonTone === 'care' && c.mercury.tone !== 'good' ? 'care' : 'mixed';
  const healthT: DailyTone = c.moonTone === 'care' || c.mars.tone === 'care' ? 'care' : c.moonTone === 'good' ? 'good' : 'mixed';
  const sections: DailySection[] = [
    { id: 'overview', heading: N.headings.overview, text: N.overview(c), tone: c.moonTone },
    { id: 'love', heading: N.headings.love, text: N.love(c), tone: loveT },
    { id: 'career', heading: N.headings.career, text: N.career(c), tone: careerT },
    { id: 'health', heading: N.headings.health, text: N.health(c), tone: healthT },
    { id: 'lucky', heading: N.headings.lucky, items: N.lucky(c) },
  ];
  return {
    date,
    lang: code,
    title: N.title(c),
    description: N.description(c),
    h1: N.h1(c),
    dateLabel: langLongDate(v, date),
    answer,
    why: [N.chandrabala(c), N.tarabala(c), { label: slow.label, text: slow.text }],
    sections,
    faq: N.faq(c, answer).map(x => ({ q: x.q, a: x.a })),
    labels: { ...v.ui.dailyLabels, good: v.toneWord.good, mixed: v.toneWord.mixed, care: v.toneWord.care },
  };
}

/** Daily template for kind 'rashifal-<code>' (data kind 'vedic-sky'). */
export const rashifalLangTemplate = (code: LangCode) => (date: string, slug: string, data: unknown): DailyEntry => {
  const i = LANG_RASHI_SLUGS.indexOf(slug);
  if (i < 0) throw new Error(`unknown rashi slug ${slug}`);
  return composeRashifalLang(code, date, i, reviveVedicSky(data));
};

// ── Panchang ──────────────────────────────────────────────────────────────────

const KARANA_ORDER = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
const YOGA_ORDER = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const WEEKDAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function renderPanchangLang(code: LangCode, slug: string, date: string, data: PanchangDayData): DailyEntry {
  const v = VOCAB[code];
  const P = v.panchangText;
  const L = P.labels;
  const index = slug === PANCHANG_INDEX_SLUG;
  const citySlug = index ? 'delhi' : slug;
  const city = v.cities[citySlug] ?? citySlug;
  const p = expandPanchangDay(date, data, city);
  const end = (s: string) => s.replace(' (next day)', ` (${L.nextDay})`);
  const win = (w: TimeWindow) => `${w.start}–${w.end}${w.endNextDay ? ` (${L.nextDay})` : ''}`;
  const wins = (ws: TimeWindow[]) => (ws.length ? ws.map(win).join(` ${L.and} `) : L.none);
  const chog = (ws: TimeWindow[]) => ws.map(w => ({ label: v.choghadiya[w.name as keyof LangVocab['choghadiya']] ?? w.name, value: `${w.start}–${w.end}` }));
  const c: PanchangCtx = {
    city, index,
    dateText: langDate(v, date),
    longDate: langLongDate(v, date),
    sunrise: p.sunrise,
    sunset: end(p.sunset),
    tithi: `${v.paksha[p.paksha]} ${v.tithis[p.tithiName] ?? p.tithiName}`,
    tithiEnd: end(p.tithiEnd),
    nak: v.nakshatras[p.nakshatraIndex],
    nakEnd: end(p.nakshatraEnd),
    yoga: v.yogas[YOGA_ORDER.indexOf(p.yoga)] ?? p.yoga,
    yogaEnd: end(p.yogaEnd),
    karana: v.karanas[KARANA_ORDER.indexOf(karanaName(p.karana))] ?? karanaName(p.karana),
    karanaEnd: end(p.karanaEnd),
    vara: v.varas[WEEKDAY_ORDER.indexOf(p.weekday)],
    rahu: win(p.rahuKaal), gulika: win(p.gulikaKaal), yama: win(p.yamaganda),
    abhijit: p.abhijitApplies ? win(p.abhijit) : null,
    brahma: win(p.brahmaMuhurta),
    amrit: wins(p.amritKalam), durmuhurtam: wins(p.durMuhurtam), varjyam: wins(p.varjyam),
  };
  const meta = v.meta.panchang(city, index);
  return {
    date, lang: code,
    title: P.title(c),
    description: P.description(c),
    h1: meta.h1,
    dateLabel: c.longDate,
    answer: P.answer(c),
    why: P.why(c),
    sections: [
      { id: 'limbs', heading: L.limbs, items: [
        { label: L.tithi, value: c.tithi, note: L.until(c.tithiEnd) },
        { label: L.nakshatra, value: c.nak, note: L.until(c.nakEnd) },
        { label: L.yoga, value: c.yoga, note: L.until(c.yogaEnd) },
        { label: L.karana, value: c.karana, note: L.until(c.karanaEnd) },
        { label: L.vara, value: c.vara },
      ] },
      { id: 'sun', heading: L.sun(city), items: [{ label: L.sunrise, value: c.sunrise }, { label: L.sunset, value: c.sunset }] },
      { id: 'good-times', heading: L.good, tone: 'good', items: [
        { label: L.brahma, value: c.brahma, note: L.brahmaNote },
        { label: L.abhijit, value: c.abhijit ?? L.noAbhijit, note: L.abhijitNote },
        { label: L.amrit, value: c.amrit, note: L.amritNote },
      ] },
      { id: 'avoid', heading: L.avoid, tone: 'care', text: L.avoidNote, items: [
        { label: L.rahu, value: c.rahu },
        { label: L.gulika, value: c.gulika },
        { label: L.yama, value: c.yama },
        { label: L.durmuhurtam, value: c.durmuhurtam },
        { label: L.varjyam, value: c.varjyam },
      ] },
      { id: 'choghadiya-day', heading: L.choghDay(c.sunrise, c.sunset), items: chog(p.dayChoghadiya) },
      { id: 'choghadiya-night', heading: L.choghNight, items: chog(p.nightChoghadiya) },
    ],
    faq: P.faq(c).map(x => ({ q: x.q, a: x.a })),
    labels: { ...v.ui.dailyLabels, good: v.toneWord.good, mixed: v.toneWord.mixed, care: v.toneWord.care },
  };
}

/** Daily template for kind 'panchang-<code>' (data kind 'panchang-day'). */
export const panchangLangTemplate = (code: LangCode) => (date: string, slug: string, data: unknown): DailyEntry =>
  renderPanchangLang(code, slug, date, data as PanchangDayData);
