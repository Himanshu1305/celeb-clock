import { describe, it, expect, afterEach, vi } from 'vitest';
import { chineseHoroscopeIndexTitle, chineseHoroscopeIndexDescription } from '@/lib/chineseCalendar.js';
import { CHINESE_BY_YEAR_DESC as PAGE_DESC, CHINESE_BY_YEAR_TITLE } from '@/lib/chineseCalendar.js';

const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');

afterEach(() => vi.useRealTimers());

describe('prerender titles — Chinese zodiac pages', () => {
  it('/chinese-horoscope title rolls over at Chinese New Year (build-time date)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-01-20T06:00:00Z'));
    expect(getTitleForRoute('/chinese-horoscope').title)
      .toBe('2026 Chinese Zodiac: Year of the Fire Horse (17 Feb 2026 – 5 Feb 2027) | BornClock');
    vi.setSystemTime(new Date('2027-03-01T06:00:00Z'));
    expect(getTitleForRoute('/chinese-horoscope').title)
      .toBe('2027 Chinese Zodiac: Year of the Fire Goat (6 Feb 2027 – 25 Jan 2028) | BornClock');
  });

  it('prerender title/description match the live <SEO> helpers', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-29T06:00:00Z'));
    const m = getTitleForRoute('/chinese-horoscope');
    expect(m.title).toBe(chineseHoroscopeIndexTitle(2026));
    expect(m.description).toBe(chineseHoroscopeIndexDescription(2026));
  });

  it('/chinese-zodiac/:animal description no longer says "Jyotish" (that is Vedic)', () => {
    for (const a of ['rat', 'goat', 'horse']) {
      expect(getTitleForRoute(`/chinese-zodiac/${a}`).description).not.toMatch(/jyotish/i);
    }
  });

  it('/articles/chinese-zodiac-by-year targets "Chinese zodiac by year" and matches the page', () => {
    const m = getTitleForRoute('/articles/chinese-zodiac-by-year');
    expect(m.title.toLowerCase()).toContain('chinese zodiac by year');
    expect(m.description).toBe(PAGE_DESC);
    expect(m.title).toBe(CHINESE_BY_YEAR_TITLE);
  });
});
