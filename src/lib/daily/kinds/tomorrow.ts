/**
 * Batch 10 — "tomorrow" views of the daily rashifal and Western horoscope
 * (/rashifal/:rashi/tomorrow, /zodiac/:sign/tomorrow).
 *
 * The page shows the entry for the NEXT India date (DailyPageDef.offsetDays = 1), built
 * from the same precomputed sky by the same composer as the /today page, then re-worded
 * for tomorrow: every "today" in the reading becomes "tomorrow", and the title, H1,
 * description, block headings and FAQ say "Tomorrow" with the date. So:
 *   • the title is distinct ("Mesh Rashifal Tomorrow, 30 October 2026 — …") and each URL
 *     is canonical to itself;
 *   • at any moment the /tomorrow page shows a different date (and different sky facts)
 *     from the /today page, so the two never carry the same content at the same time.
 * Pure + Worker-safe (no engine imports).
 */
import type { DailyEntry, DailySection } from '../types';
import type { DailyTemplate } from '../templates';

/** "today" → "tomorrow" in English reading text (word-boundary, case-preserving). */
export function toTomorrowText(s: string): string {
  return s.replace(/\bToday\b/g, 'Tomorrow').replace(/\btoday\b/g, 'tomorrow').replace(/\bTODAY\b/g, 'TOMORROW');
}

const T = toTomorrowText;

export function toTomorrowEntry(e: DailyEntry): DailyEntry {
  const sections: DailySection[] = e.sections.map(s => ({
    ...s,
    heading: T(s.heading),
    ...(s.text !== undefined ? { text: T(s.text) } : {}),
    ...(s.items ? { items: s.items.map(it => ({ ...it, label: T(it.label), value: T(it.value), ...(it.note !== undefined ? { note: T(it.note) } : {}) })) } : {}),
  }));
  return {
    ...e,
    title: T(e.title),
    description: T(e.description),
    h1: T(e.h1),
    answer: T(e.answer),
    why: e.why.map(w => ({ label: T(w.label), text: T(w.text) })),
    sections,
    faq: e.faq.map(f => ({ q: T(f.q), a: T(f.a) })),
    labels: { answer: 'Tomorrow in brief', why: 'Why tomorrow', faq: 'Questions about tomorrow', ...(e.labels ?? {}) },
  };
}

/** Wrap a "today" template into its "tomorrow" variant (the date passed in is tomorrow's). */
export const tomorrowOf = (tpl: DailyTemplate): DailyTemplate => (date, slug, data) => toTomorrowEntry(tpl(date, slug, data));
