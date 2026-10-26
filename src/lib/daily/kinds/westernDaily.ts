/**
 * W2 — Daily Western (tropical) horoscope for the 12 Sun signs, computed from that
 * India date's real tropical sky (astronomy-engine, the same path as the Western
 * natal chart: tropicalLongitudeAt / src/lib/western/westernChart.ts). Rules:
 *
 *  • Solar houses (whole-sign, counted from the Sun sign — the standard basis of
 *    Sun-sign columns): the Moon's sign gives the day's focus (it spends ~2½ days per sign).
 *  • The Moon's sign-to-sign aspect to your sign: same sign = conjunction, 3rd/11th =
 *    sextile (60°), 4th/10th = square (90°), 5th/9th = trine (120°), 7th = opposition
 *    (180°); 2nd/6th/8th/12th = no major aspect.
 *  • Venus (love), Sun + Mars (work, drive), Mercury (talks, paperwork) by solar house,
 *    plus real ingresses (sign changes) within ±3 days and retrograde stations.
 *
 * Deterministic: same (date, sign) → same text. Tone: calm, practical, never fear.
 */
import type { DailyEntry, DailySection, DailyTone, DailyWhy, DailyFaq, DailyItem } from '../types';
import { tropicalLongitudeAt } from '../../western/westernChart';
import { addDaysISO, formatDateEn, formatLongDateEn, istInstant, istClock, istDateISO } from '../dates';
import { SUN_SIGN_SLUGS } from '../registry';
import { pick, ORD_EN } from './pick';

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const PERSONAL = ['Sun', 'Mercury', 'Venus', 'Mars'] as const;
type Personal = typeof PERSONAL[number];
const norm = (x: number) => ((x % 360) + 360) % 360;
const signAt = (body: string, t: number) => Math.floor(norm(tropicalLongitudeAt(body, new Date(t))) / 30);
/** Signed apparent daily motion (deg/day) from a ±3 h central difference. */
function speedAt(body: string, t: number): number {
  const h = 3 * 3600 * 1000;
  let d = tropicalLongitudeAt(body, new Date(t + h)) - tropicalLongitudeAt(body, new Date(t - h));
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d * 4;
}

export interface WesternEvent {
  body: Personal;
  type: 'ingress' | 'station-retrograde' | 'station-direct';
  /** India date + IST time of the event. */
  date: string;
  time: string;
  /** For ingress: the sign entered (index). */
  sign?: number;
  /** For ingress: true if the planet re-enters the previous sign while retrograde. */
  backwards?: boolean;
}

export interface WesternSky {
  date: string;
  ref: Date;
  sign: Record<Personal | 'Moon', number>;
  retro: Record<'Mercury' | 'Venus' | 'Mars', boolean>;
  moonChange: { at: string; to: number; beforeRef: boolean } | null;
  /** Ingresses and stations from 3 days before to 3 days after `date`. */
  events: WesternEvent[];
}

function bisect(lo: number, hi: number, same: (t: number) => boolean, precisionMs = 30 * 1000): number {
  let a = lo, b = hi;
  while (b - a > precisionMs) {
    const mid = (a + b) / 2;
    if (same(mid)) a = mid; else b = mid;
  }
  return b;
}

const cache = new Map<string, WesternSky>();

export function westernSky(date: string): WesternSky {
  const hit = cache.get(date);
  if (hit) return hit;
  const ref = istInstant(date, 12, 0);
  const r = ref.getTime();
  const sign = { Moon: signAt('Moon', r) } as WesternSky['sign'];
  for (const p of PERSONAL) sign[p] = signAt(p, r);
  const retro = {
    Mercury: speedAt('Mercury', r) < 0,
    Venus: speedAt('Venus', r) < 0,
    Mars: speedAt('Mars', r) < 0,
  };

  // Moon sign change during the India day.
  let moonChange: WesternSky['moonChange'] = null;
  {
    const start = istInstant(date, 0, 0).getTime();
    let prevT = start, prev = signAt('Moon', start);
    for (let t = start + 3600e3; t <= start + 24 * 3600e3; t += 3600e3) {
      const cur = signAt('Moon', t);
      if (cur !== prev) {
        const at = bisect(prevT, t, x => signAt('Moon', x) === prev);
        if (istDateISO(new Date(Math.round(at / 60000) * 60000)) === date) moonChange = { at: istClock(new Date(at)), to: cur, beforeRef: at < r };
        break;
      }
      prevT = t;
    }
  }

  // Ingresses + stations in a ±3-day window, sampled at 12:00 IST and refined.
  const events: WesternEvent[] = [];
  const days = Array.from({ length: 8 }, (_, i) => addDaysISO(date, i - 4)); // -4..+3 (pairs → -3..+3)
  for (const p of PERSONAL) {
    for (let i = 1; i < days.length; i++) {
      const t0 = istInstant(days[i - 1], 12, 0).getTime();
      const t1 = istInstant(days[i], 12, 0).getTime();
      const s0 = signAt(p, t0), s1 = signAt(p, t1);
      if (s0 !== s1) {
        const at = bisect(t0, t1, x => signAt(p, x) === s0);
        const backwards = ((s1 - s0 + 12) % 12) === 11;
        events.push({ body: p, type: 'ingress', date: istDateISO(new Date(at)), time: istClock(new Date(at)), sign: s1, backwards });
      }
      if (p !== 'Sun') {
        const v0 = speedAt(p, t0), v1 = speedAt(p, t1);
        if ((v0 < 0) !== (v1 < 0)) {
          const at = bisect(t0, t1, x => (speedAt(p, x) < 0) === (v0 < 0), 3600 * 1000);
          events.push({ body: p, type: v1 < 0 ? 'station-retrograde' : 'station-direct', date: istDateISO(new Date(at)), time: istClock(new Date(at)) });
        }
      }
    }
  }
  const lo = addDaysISO(date, -3), hi = addDaysISO(date, 3);
  const inWindow = events.filter(e => e.date >= lo && e.date <= hi).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const sky: WesternSky = { date, ref, sign, retro, moonChange, events: inWindow };
  if (cache.size > 800) cache.clear();
  cache.set(date, sky);
  return sky;
}

const solarHouse = (signIdx: number, sun: number) => (((signIdx - sun) % 12) + 12) % 12 + 1;

const THEME = ['', 'you, your image and fresh starts', 'money, possessions and self-worth', 'conversations, short trips, siblings and neighbours', 'home, family and roots', 'romance, fun, creativity and children', 'daily work, routines and wellbeing', 'partners and one-to-one relationships', 'shared money, intimacy and deep change', 'travel, study, beliefs and the bigger picture', 'career, goals and public reputation', 'friends, groups and future hopes', 'rest, privacy and recharging'];

const MOON_TIP: string[][] = [[],
  ['Your feelings are close to the surface — put your own needs first and start something new.', 'A day to show up as yourself and take the lead on a personal plan.'],
  ['Good for budgeting and enjoying simple comforts; skip impulse buys.', 'Money and what you value are in focus — a calm day to review spending.'],
  ['Messages, calls and errands flow — say what you mean, briefly.', 'A chatty, busy day; keep notes so nothing slips.'],
  ['Home and family need you — a cosy, inward day.', 'Spend time at home and let yourself recharge among people you trust.'],
  ['Make room for fun, romance or a creative hobby.', 'Play a little — creativity and affection come easily today.'],
  ['Tidy your to-do list and look after your daily habits.', 'A practical day: small chores and healthy routines pay off.'],
  ['Others take centre stage — cooperate and listen.', 'One-to-one talks matter today; meet people halfway.'],
  ['Good for sorting shared money or a heart-to-heart; be kind with confidences.', 'Deeper feelings surface — honesty helps more than control.'],
  ['Learn something, plan a trip or step back to see the bigger picture.', 'Curiosity is your friend today; read, explore or plan ahead.'],
  ['Career matters are visible — show your work.', 'A good day to be seen at work and take a step toward a goal.'],
  ['Friends and groups lift you; share your plans.', 'Reach out — a friend or community can help with a wish.'],
  ['Slow down and recharge; quiet time helps more than pushing.', 'Keep the day light, rest early and clear your head.'],
];

type Aspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'none';
const ASPECT_BY_HOUSE: Aspect[] = ['none', 'conjunction', 'none', 'sextile', 'square', 'trine', 'none', 'opposition', 'none', 'trine', 'square', 'sextile', 'none'];
const ASPECT_LINE: Record<Aspect, string> = {
  conjunction: 'The Moon is in your own sign (a conjunction) — your mood sets the tone today.',
  sextile: 'The Moon makes a sextile (60°) to your sign — small, easy openings if you act on them.',
  square: 'The Moon squares your sign (90°) — a little friction that nudges you to adjust.',
  trine: 'The Moon makes a trine (120°) to your sign — an easy, flowing day.',
  opposition: 'The Moon is opposite your sign (180°) — balance your needs with someone else’s.',
  none: 'The Moon makes no major aspect to your sign, so the day’s tone comes mainly from the area of life it lights up.',
};
const ASPECT_LABEL: Record<Aspect, string> = {
  conjunction: 'Moon in your sign (conjunction)', sextile: 'Moon sextile your sign', square: 'Moon square your sign',
  trine: 'Moon trine your sign', opposition: 'Moon opposite your sign', none: 'No major Moon aspect today',
};
const ASPECT_TONE: Record<Aspect, DailyTone> = { conjunction: 'good', sextile: 'good', trine: 'good', square: 'mixed', opposition: 'mixed', none: 'mixed' };
const HEADLINE: Record<DailyTone, string[]> = {
  good: ['an easy-going, supportive day', 'a day that tends to flow', 'a bright, workable day'],
  mixed: ['a mixed day that rewards flexibility', 'a steady day with a few adjustments', 'a day to balance give and take'],
  care: ['a day to go gently', 'a quieter day — keep plans simple'],
};

function eventText(e: WesternEvent, sun: number, today: string): string {
  const d = formatDateEn(e.date).replace(/ \d{4}$/, '');
  // Tense follows the event date relative to the page's date (ISO strings compare correctly).
  const past = e.date < today, now = e.date === today;
  if (e.type === 'ingress') {
    const h = solarHouse(e.sign!, sun);
    const verb = past ? (e.backwards ? 're-entered' : 'entered') : (e.backwards ? 're-enters' : 'enters');
    return `${e.body} ${verb} ${SIGNS[e.sign!]} ${now ? 'today' : `on ${d}`} — your ${ORD_EN[h]} house of ${THEME[h]}`;
  }
  const dir = e.type === 'station-retrograde' ? 'retrograde' : 'direct';
  return `${e.body} ${past ? 'turned' : 'turns'} ${dir} ${now ? 'today' : `on ${d}`}`;
}

export function composeWestern(date: string, sunSign: number, sky: WesternSky = westernSky(date)): DailyEntry {
  const slug = SUN_SIGN_SLUGS[sunSign];
  const name = SIGNS[sunSign];
  const dEn = formatDateEn(date);
  const mh = solarHouse(sky.sign.Moon, sunSign);
  const aspect = ASPECT_BY_HOUSE[mh];
  const tone = ASPECT_TONE[aspect];
  const headline = pick(HEADLINE[tone], date, slug, 'headline');
  const tip = pick(MOON_TIP[mh], date, slug, 'tip');
  const vh = solarHouse(sky.sign.Venus, sunSign);
  const mah = solarHouse(sky.sign.Mars, sunSign);
  const meh = solarHouse(sky.sign.Mercury, sunSign);
  const sh = solarHouse(sky.sign.Sun, sunSign);

  const moonCl = sky.moonChange
    ? sky.moonChange.beforeRef
      ? ` (since ${sky.moonChange.at} IST)`
      : ` until ${sky.moonChange.at} IST, then ${SIGNS[sky.moonChange.to]} (your ${ORD_EN[solarHouse(sky.moonChange.to, sunSign)]} house)`
    : '';

  const answer = `${name} horoscope for ${dEn}: ${headline}. The Moon is in ${SIGNS[sky.sign.Moon]}, your ${ORD_EN[mh]} solar house of ${THEME[mh]}${moonCl}. ${tip}`;

  // Love — Venus + Moon emphasis.
  const loveBase = [1, 5, 7, 11].includes(vh)
    ? pick([`Venus in your ${ORD_EN[vh]} house of ${THEME[vh]} puts affection close to hand — reach out first.`, `With Venus in your ${ORD_EN[vh]} house (${THEME[vh]}), warmth and charm come easily.`], date, slug, 'love')
    : pick([`Venus is in your ${ORD_EN[vh]} house of ${THEME[vh]}, so love grows through ${vh === 2 ? 'small comforts and generosity' : vh === 4 ? 'time at home' : vh === 6 ? 'small, practical acts of care' : vh === 8 ? 'honest, deeper conversations' : vh === 9 ? 'shared plans and adventures' : vh === 10 ? 'respect for each other’s goals' : vh === 12 ? 'quiet time together' : 'everyday conversation'}.`], date, slug, 'love');
  const loveRetro = sky.retro.Venus ? ' Venus is retrograde, a time to revisit and repair rather than rush new commitments.' : '';
  const loveMoon = mh === 7 ? ' The Moon in your partnership house makes others’ feelings especially important today.' : mh === 5 ? ' The Moon in your romance house adds a playful, affectionate mood.' : '';
  const loveTone: DailyTone = sky.retro.Venus ? 'mixed' : [1, 5, 7, 11].includes(vh) || mh === 5 ? 'good' : 'mixed';

  // Career & money — Sun season focus + Mars drive + Mercury.
  const c1 = mh === 10 ? 'The Moon lights up your career house — a good day to be visible at work.'
    : mh === 2 ? 'The Moon in your money house favours budgeting and practical value.'
    : mh === 6 ? 'The Moon in your work-routine house rewards steady, organised effort.'
    : pick(['Work moves at a normal pace — finish what is already on your plate.', 'Keep work steady today; consistent effort counts.'], date, slug, 'career1');
  const c2 = `The Sun in your ${ORD_EN[sh]} house keeps this month’s focus on ${THEME[sh]}, and Mars in your ${ORD_EN[mah]} house puts your drive into ${THEME[mah]}.`;
  const c3 = sky.retro.Mercury
    ? 'Mercury is retrograde: re-read messages and contracts, back up files and allow extra time for travel plans.'
    : `Mercury in your ${ORD_EN[meh]} house supports clear thinking about ${THEME[meh]}.`;
  const careerTone: DailyTone = sky.retro.Mercury ? 'mixed' : [10, 2, 6, 11].includes(mh) && tone === 'good' ? 'good' : 'mixed';

  // Wellbeing — care only.
  const w1 = [6, 12].includes(mh) ? 'Rest and routine matter more than usual — sleep well and keep meals regular.'
    : tone === 'good' ? 'Energy is fairly even — a good day for a walk or your usual exercise.'
    : 'Mood may swing a little — short breaks and fresh air help.';
  const w2 = sky.retro.Mars ? 'Mars is retrograde, so pace physical effort and avoid rushing.' : [1, 6].includes(mah) ? `Mars in your ${ORD_EN[mah]} house gives extra get-up-and-go — channel it into exercise, not haste.` : '';
  const wellTone: DailyTone = [6, 12].includes(mh) || sky.retro.Mars ? 'care' : tone;

  const moving: DailyItem[] = PERSONAL.map(p => {
    const h = solarHouse(sky.sign[p], sunSign);
    const r = p !== 'Sun' && sky.retro[p as 'Mercury' | 'Venus' | 'Mars'];
    const ev = sky.events.filter(e => e.body === p).map(e => eventText(e, sunSign, date)).join('; ');
    return { label: p, value: `${SIGNS[sky.sign[p]]}${r ? ' (retrograde)' : ''} — your ${ORD_EN[h]} house`, ...(ev ? { note: ev } : {}) };
  });

  const sections: DailySection[] = [
    { id: 'overview', heading: 'Overall', text: `${ASPECT_LINE[aspect]} ${tip}`, tone },
    { id: 'love', heading: 'Love & relationships', text: loveBase + loveMoon + loveRetro, tone: loveTone },
    { id: 'career', heading: 'Work & money', text: `${c1} ${c2} ${c3}`, tone: careerTone },
    { id: 'wellbeing', heading: 'Wellbeing', text: [w1, w2, 'This is general guidance, not medical advice.'].filter(Boolean).join(' '), tone: wellTone },
    { id: 'planets', heading: 'Planets on the move', items: moving },
  ];

  // Why today: Moon house, Moon aspect, and the most notable planet fact.
  const notable = sky.events[0]
    ? { label: 'This week in the sky', text: `${eventText(sky.events[0], sunSign, date)}. A sign change (ingress) or a station shifts which area of life a planet colours for you.` }
    : sky.retro.Mercury
      ? { label: 'Mercury retrograde', text: 'Mercury appears to move backwards from Earth’s view — an optical effect — and astrologers read it as a time to review, not rush, communication.' }
      : { label: `Venus in your ${ORD_EN[vh]} house`, text: `Venus, the planet of love and harmony, is in ${SIGNS[sky.sign.Venus]} — your ${ORD_EN[vh]} solar house of ${THEME[vh]}.` };
  const why: DailyWhy[] = [
    { label: `Moon in ${SIGNS[sky.sign.Moon]} — your ${ORD_EN[mh]} solar house`, text: `Solar houses count signs from your Sun sign; the Moon spends about 2½ days in each, so it sets the day’s focus: ${THEME[mh]}.` },
    { label: ASPECT_LABEL[aspect], text: ASPECT_LINE[aspect] },
    notable,
  ];

  const faq: DailyFaq[] = [
    { q: `What is the ${name} horoscope for today, ${dEn}?`, a: answer },
    {
      q: `Is this the same as my Vedic rashi?`,
      a: 'No. This is Western (tropical) astrology, read from your Sun sign. Vedic astrology uses the sidereal zodiac and reads your Moon sign (rashi), which is often a different sign — BornClock’s Vedic rashifal and Moon sign calculator show yours.',
    },
    {
      q: `How is the ${name} daily horoscope calculated?`,
      a: 'From the real tropical positions of the Moon, Sun, Mercury, Venus and Mars for this India date, computed with BornClock’s own astronomy engine. The Moon’s sign is counted from yours (solar houses) and its sign-to-sign aspect to your sign sets the tone; real sign changes and retrogrades add context. The same date always gives the same reading — reflective guidance, not certainty.',
    },
  ];

  return {
    date,
    lang: 'en',
    title: `${name} Horoscope Today, ${dEn} — Western Astrology | BornClock`,
    description: `${name} daily horoscope for ${dEn} (Western, tropical): ${headline}. Moon in ${SIGNS[sky.sign.Moon]}, your ${ORD_EN[mh]} house — love, work and wellbeing from today’s real sky.`,
    h1: `${name} Horoscope Today — ${dEn}`,
    dateLabel: formatLongDateEn(date),
    answer,
    why,
    sections,
    faq,
  };
}

export function computeWesternDaily(date: string, slug: string): DailyEntry {
  const i = (SUN_SIGN_SLUGS as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown sun sign ${slug}`);
  return composeWestern(date, i);
}

/** Batch 7 "data + render": the day's tropical sky (data kind 'western-sky', one file for
 *  all 12 signs) → the finished horoscope. Pure when `data` comes from the JSON. */
export function horoscopeFromSky(date: string, slug: string, data: unknown): DailyEntry {
  const i = (SUN_SIGN_SLUGS as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown sun sign ${slug}`);
  const d = data as WesternSky & { ref: string | Date };
  return composeWestern(date, i, { ...d, ref: new Date(d.ref) });
}
