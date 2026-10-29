/**
 * Batch 10 — "tomorrow" views of the daily rashifal / Western horoscope
 * (/rashifal/:rashi/tomorrow, /zodiac/:sign/tomorrow): the next India date's entry, with
 * distinct dated titles, "tomorrow" wording and labels; the sky facts are the same
 * precomputed day data as the /today page for that date.
 */
import { describe, it, expect } from 'vitest';
import { computeDaily } from '../compute';
import { DAILY_PAGES, dailyPageDate, matchDailyRoute, RASHI_SLUGS, SUN_SIGN_SLUGS } from '../registry';
import { toTomorrowText } from '../kinds/tomorrow';

describe('tomorrow pages', () => {
  it('are registered with offsetDays 1 on their own URLs', () => {
    const r = DAILY_PAGES.find(d => d.kind === 'rashifal-tomorrow')!;
    const h = DAILY_PAGES.find(d => d.kind === 'horoscope-tomorrow')!;
    expect(r.offsetDays).toBe(1);
    expect(h.offsetDays).toBe(1);
    expect(matchDailyRoute('/rashifal/mesh/tomorrow/')?.def.kind).toBe('rashifal-tomorrow');
    expect(matchDailyRoute('/zodiac/leo/tomorrow')?.def.kind).toBe('horoscope-tomorrow');
    expect(r.slugs).toEqual(RASHI_SLUGS);
    expect(h.slugs).toEqual(SUN_SIGN_SLUGS);
  });

  it('page date = India date + 1 (also across a month end, and late evening UTC)', () => {
    const r = DAILY_PAGES.find(d => d.kind === 'rashifal-tomorrow')!;
    expect(dailyPageDate(r, new Date('2026-10-31T19:00:00Z'))).toBe('2026-11-02'); // 00:30 IST 1 Nov → tomorrow 2 Nov
    expect(dailyPageDate(r, new Date('2026-10-31T10:00:00Z'))).toBe('2026-11-01');
    expect(dailyPageDate(DAILY_PAGES.find(d => d.kind === 'rashifal'), new Date('2026-10-31T10:00:00Z'))).toBe('2026-10-31');
  });

  it('Vedic: "Mesh Rashifal Tomorrow, <date>" title, no "today" left, tomorrow labels, same facts as that day’s /today page', () => {
    const t = computeDaily('rashifal-tomorrow', '2026-10-30', 'mesh');
    const same = computeDaily('rashifal', '2026-10-30', 'mesh');
    expect(t.title).toBe('Mesh Rashifal Tomorrow, 30 October 2026 — Mesha (Aries) Horoscope | BornClock');
    expect(t.h1).toBe('Mesh Rashifal Tomorrow — 30 October 2026');
    expect(t.labels).toMatchObject({ answer: 'Tomorrow in brief', why: 'Why tomorrow', faq: 'Questions about tomorrow' });
    expect(JSON.stringify(t)).not.toMatch(/\btoday\b/i);
    expect(t.faq[0].q).toBe('What is the Mesh rashifal for tomorrow, 30 October 2026?');
    expect(t.dateLabel).toBe(same.dateLabel);
    expect(t.sections.map(s => s.id)).toEqual(same.sections.map(s => s.id));
    expect(t.title).not.toBe(same.title);
  });

  it('Western: "Leo Horoscope Tomorrow, <date>", no "today" left', () => {
    const t = computeDaily('horoscope-tomorrow', '2026-10-30', 'leo');
    expect(t.title).toBe('Leo Horoscope Tomorrow, 30 October 2026 — Western Astrology | BornClock');
    expect(JSON.stringify(t)).not.toMatch(/\btoday\b/i);
  });

  it('every rashi and sign renders, titles unique per sign and per date', () => {
    const titles = new Set<string>();
    for (const s of RASHI_SLUGS) titles.add(computeDaily('rashifal-tomorrow', '2026-11-05', s).title);
    for (const s of SUN_SIGN_SLUGS) titles.add(computeDaily('horoscope-tomorrow', '2026-11-05', s).title);
    expect(titles.size).toBe(24);
    expect(computeDaily('rashifal-tomorrow', '2026-11-06', 'mesh').title).not.toBe(computeDaily('rashifal-tomorrow', '2026-11-05', 'mesh').title);
  });

  it('wording swap is word-bounded and case-preserving', () => {
    expect(toTomorrowText('Today in brief — today’s sky, todays')).toBe('Tomorrow in brief — tomorrow’s sky, todays');
  });
});
