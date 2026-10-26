/**
 * Batch 8 — weekly (Monday–Sunday) / monthly / yearly Vedic rashifal on the shared
 * daily-page mechanism (see ../index.ts). The build stores ONE small sky per period
 * (rashifalSky in src/lib/vedic/rashifal.ts → /daily/rashifal-period/<period>/<key>.json),
 * and this pure template turns it into the page for a rashi — in the Worker and in the
 * browser alike — so the period's dates and text are always the current week / month /
 * year, never the build's.
 *
 * The reading itself is unchanged: rashifalFromSky() is the same gochar engine the page
 * used before (house from the Moon sign, classical good/hard houses, Sade Sati / Dhaiya,
 * year split at real sign changes). Tone rules: calm, practical, care not fear.
 */
import type { DailyEntry, DailyFaq, DailyItem, DailySection, DailyTone, DailyWhy } from '../types';
import { RASHIS, rashifalFromSky, rangeLabel, transitWhy, type Grade, type RashifalSky, type Tone, type TransitReading } from '../../vedic/rashifal';
import { RASHI_SLUGS } from '../registry';
import { formatDateEn, formatShortDateEn, MONTHS_EN, type DailyPeriod } from '../dates';
import { ORD_EN } from './pick';
import type { DailyTemplate } from '../templates';

const WORD: Record<DailyPeriod, { adj: string; noun: string }> = {
  week: { adj: 'Weekly', noun: 'week' },
  month: { adj: 'Monthly', noun: 'month' },
  year: { adj: 'Yearly', noun: 'year' },
};

const toT3 = (t: Tone): DailyTone => (t === 'favourable' ? 'good' : t === 'challenging' ? 'care' : 'mixed');
const TONE_WORD: Record<Tone, string> = { favourable: 'supportive', mixed: 'mixed', challenging: 'needs care' };
const HEADLINE: Record<Tone, string> = { favourable: 'broadly supportive', mixed: 'mixed', challenging: 'demanding but workable' };
const GRADE_RANK: Record<Grade, number> = { strong: 3, moderate: 2, mild: 1 };
const SLOW = new Set(['Jupiter', 'Saturn', 'Rahu', 'Ketu']);

/** Short period name for titles: "26 Oct – 1 Nov 2026", "October 2026", "2026". */
export function periodShortLabel(period: DailyPeriod, startISO: string, endISO: string): string {
  if (period === 'week') return `${formatShortDateEn(startISO, startISO.slice(0, 4) !== endISO.slice(0, 4))} – ${formatShortDateEn(endISO)}`;
  if (period === 'month') return `${MONTHS_EN[Number(startISO.slice(5, 7)) - 1]} ${startISO.slice(0, 4)}`;
  return startISO.slice(0, 4);
}

/** Visible dates: "26 October – 1 November 2026", "1–31 October 2026", "1 January – 31 December 2026". */
export function periodDateLabel(period: DailyPeriod, startISO: string, endISO: string): string {
  const [ys, ms, ds] = startISO.split('-').map(Number);
  const [ye, me, de] = endISO.split('-').map(Number);
  if (period === 'month') return `${ds}–${de} ${MONTHS_EN[ms - 1]} ${ys}`;
  if (ys !== ye) return `${formatDateEn(startISO)} – ${formatDateEn(endISO)}`;
  return `${ds} ${MONTHS_EN[ms - 1]} – ${de} ${MONTHS_EN[me - 1]} ${ye}`;
}

function transitLabel(t: TransitReading): string {
  const flags = [t.sadeSati ? 'Sade Sati' : '', t.dhaiya ? 'Dhaiya' : ''].filter(Boolean).join(', ');
  return `${t.planet}${t.fromISO ? `, ${rangeLabel(t.fromISO, t.toISO!)}` : ''}${flags ? ` (${flags})` : ''}`;
}

export function rashifalPeriodEntry(period: DailyPeriod, date: string, slug: string, sky: RashifalSky): DailyEntry {
  const idx = (RASHI_SLUGS as readonly string[]).indexOf(slug);
  if (idx < 0) throw new Error(`rashifal-${period}: unknown rashi "${slug}"`);
  if (sky.p !== period) throw new Error(`rashifal-${period}: data is for "${sky.p}"`);
  const r = rashifalFromSky(idx, sky);
  const meta = RASHIS[idx];
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  const W = WORD[period];
  const { startISO, endISO } = r.dateRange;
  const short = periodShortLabel(period, startISO, endISO);
  const dateLabel = periodDateLabel(period, startISO, endISO);
  const overview = r.sections[0];

  // "Why": the strongest factors — slow planets first, then by grade and share of the period.
  const ranked = [...r.transits].sort((a, b) =>
    GRADE_RANK[b.grade] - GRADE_RANK[a.grade] || Number(SLOW.has(b.planet)) - Number(SLOW.has(a.planet)) || (b.share ?? 1) - (a.share ?? 1));
  const why: DailyWhy[] = ranked.slice(0, 3).map(t => ({
    label: `${t.planet} — ${ORD_EN[t.house]} house from your Moon${t.fromISO ? ` (${rangeLabel(t.fromISO, t.toISO!)})` : ''}`,
    text: transitWhy(t),
  }));
  const lead = ranked[0];

  const sections: DailySection[] = r.sections.slice(1).map(s => ({ id: s.key, heading: s.title, text: s.text, tone: toT3(s.tone) }));

  const planets: DailyItem[] = r.transits.map(t => ({
    label: transitLabel(t),
    value: `${ORD_EN[t.house]} house from your Moon — ${t.grade}, ${TONE_WORD[t.tone]}`,
  }));
  sections.push({ id: 'planets', heading: `Where each planet is this ${W.noun}`, items: planets });

  if (r.ingressItems.length) {
    sections.push({
      id: 'moves',
      heading: `Key planetary moves this ${W.noun}`,
      items: r.ingressItems.map(m => ({
        label: m.planet,
        value: `enters ${RASHIS[m.signIndex].sanskrit} (${RASHIS[m.signIndex].english}) on ${formatDateEn(m.dateISO)}`,
        note: `Your ${ORD_EN[m.house]} house from the Moon.`,
      })),
    });
  }

  sections.push({
    id: 'lucky',
    heading: 'Traditional lucky colour and numbers',
    items: [
      { label: 'Lucky colour', value: r.lucky.color },
      { label: 'Lucky numbers', value: r.lucky.numbers.join(', ') },
    ],
    text: `These are the traditional colour and numbers for ${meta.sanskrit}; they do not change with the transits.`,
  });

  const updates = period === 'week' ? 'every Monday (India time)' : period === 'month' ? 'on the 1st of every month' : 'on 1 January';
  const faq: DailyFaq[] = [
    {
      q: `Which dates does this ${W.adj.toLowerCase()} rashifal cover?`,
      a: `${dateLabel}${period === 'week' ? ' (Monday to Sunday)' : ''}. The page moves to the next ${W.noun} automatically ${updates}.`,
    },
    {
      q: `How is the ${meta.sanskrit} rashifal calculated?`,
      a: 'It is a gochar (transit) reading. We compute where each planet actually sits in the sky for this period using the sidereal (Lahiri) zodiac, then read each one by the classical "house from your Moon sign" method. Because the planets move, the reading changes with the dates — it is not a fixed, pre-written paragraph.',
    },
    {
      q: 'Is rashifal based on my Sun sign or Moon sign?',
      a: 'Vedic rashifal is read from your Moon sign (Chandra rashi), not the Sun sign used in most Western horoscopes. If you are not sure of your Moon sign, generate your free Kundli to find it.',
    },
    {
      q: 'What do "strong", "moderate" and "mild" mean here?',
      a: 'They grade how pronounced an influence is. Strong = a clear, headline influence (usually a slow planet like Saturn or Jupiter in a notable house); moderate = a real but secondary influence; mild = a light background note. Nothing here is a guarantee — it is how the tradition reads the sky for this period.',
    },
    {
      q: 'Should I make decisions based on this?',
      a: 'Treat it as reflective guidance, not instruction. It never names dates for illness, loss or other sensitive events, and it is not a substitute for medical, financial or legal advice.',
    },
  ];

  return {
    date,
    lang: 'en',
    title: `${name} ${W.adj} Rashifal ${short} — ${meta.sanskrit} (${meta.english}) | BornClock`,
    description: `${name} (${meta.sanskrit}, ${meta.english}) ${W.adj.toLowerCase()} rashifal for ${short}: a ${HEADLINE[overview.tone]} ${W.noun}, led by ${lead.planet} in your ${ORD_EN[lead.house]} house from the Moon. Love, career, money and health from the real sidereal transits.`,
    h1: `${name} ${W.adj} Rashifal — ${short}`,
    dateLabel,
    answer: overview.text,
    why,
    sections,
    faq,
    labels: { answer: `This ${W.noun} in brief`, why: `Why — the transits behind this ${W.noun}`, faq: 'Questions about this rashifal' },
  };
}

/** DAILY_TEMPLATES entry for a period kind. */
export const rashifalPeriodTemplate = (period: DailyPeriod): DailyTemplate =>
  (date, slug, data) => rashifalPeriodEntry(period, date, slug, data as RashifalSky);
