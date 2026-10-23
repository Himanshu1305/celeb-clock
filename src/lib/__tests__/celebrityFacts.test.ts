import { describe, it, expect } from 'vitest';
import {
  correctCelebDates, ageAtDeath, livingAge, celebYearsForDisplay, isBlockedCelebrity,
  nationalityLabel, slugifyName, yearsBetween,
} from '../celebrityFacts';
import { parseCelebrityDOB } from '@/utils/celebrityUtils';
import celebritiesData from '@/data/celebrities.json';

// Reference: English Wikipedia infoboxes fetched 23 Oct 2026 (see comments in celebrityFacts.ts).
const NOW = new Date(2026, 9, 23, 12);

describe('S7 death overrides', () => {
  it.each([
    ['Jimmy Carter', '1924-10-01', '2024-12-29', 100],
    ['Pope Francis', '1936-12-17', '2025-04-21', 88],
    ['Rohit Bal', '1961-05-08', '2024-11-01', 63],
    ['Dharmendra', '1935-12-08', '2025-11-24', 89],
    ['Asrani', '1941-01-01', '2025-10-20', 84],
  ])('%s is shown as deceased with the right age', (name, birth, death, age) => {
    const d = correctCelebDates({ name, birthDate: birth, deathDate: null });
    expect(d.isLiving).toBe(false);
    expect(d.deathDate).toBe(death);
    expect(ageAtDeath(d)).toBe(age);
  });
  it('never shows a living age above 105', () => {
    expect(livingAge('1915-01-05', NOW)).toBeNull();
    expect(livingAge('1921-10-23', NOW)).toBe(105);
    const card = celebYearsForDisplay({ name: 'Someone Old', birthDate: '1900-03-03', deathDate: null }, NOW);
    expect(card.age).toBeNull();
  });
});

describe('S9 BCE / impossible dates', () => {
  it('Chanakya gets an era and no age (was "died aged approximately -88")', () => {
    const d = correctCelebDates({ name: 'Chanakya', birthDate: '0371-01-01', deathDate: '0283-01-01' });
    expect(d.era).toBe('4th–3rd century BCE');
    expect(ageAtDeath(d)).toBeNull();
    expect(celebYearsForDisplay({ name: 'Chanakya', birthDate: '0371-01-01', deathDate: '0283-01-01' }).age).toBeNull();
  });
  it('any death-before-birth row yields no age', () => {
    // DB row "Stephen I": birth 0300-01-01, death 0257-08-02
    const d = correctCelebDates({ name: 'Stephen I', birthDate: '0300-01-01', deathDate: '0257-08-02' });
    expect(d.datesUnreliable).toBe(true);
    expect(ageAtDeath(d)).toBeNull();
    expect(yearsBetween('0300-01-01', '0257-08-02')).toBeNull();
  });
});

describe('S14 blocklist', () => {
  it('blocks Dawood Ibrahim and criminal descriptions, not victims', () => {
    expect(isBlockedCelebrity('Dawood Ibrahim')).toBe(true);
    expect(isBlockedCelebrity('Somebody', 'American serial killer (1946–1989)')).toBe(true);
    expect(isBlockedCelebrity('Giovanni Falcone', 'Italian magistrate murdered by the Mafia (1939-1992)')).toBe(false);
    expect(isBlockedCelebrity('Shah Rukh Khan', 'Indian actor')).toBe(false);
  });
});

describe('S8 nationality and 1 January births', () => {
  it('uses the record nationality code', () => {
    expect(nationalityLabel(null, 'US')).toBe('United States');
    expect(nationalityLabel(null, 'GB')).toBe('United Kingdom');
    expect(nationalityLabel('Indian', 'IN')).toBe('Indian');
    expect(nationalityLabel(null, null)).toBeNull();
  });
  it('real 1 Jan births keep their full date; placeholders stay year-only', () => {
    expect(parseCelebrityDOB({ slug: 'vidya-balan', name: 'Vidya Balan', birth_date: '1979-01-01' })?.isFullDate).toBe(true);
    expect(parseCelebrityDOB({ slug: 'nana-patekar', name: 'Nana Patekar', birth_date: '1951-01-01' })?.isFullDate).toBe(true);
    expect(parseCelebrityDOB({ slug: 'mirabai', name: 'Mirabai', birth_date: '1498-01-01', birth_year: 1498 })?.isFullDate).toBe(false);
    expect(parseCelebrityDOB({ slug: 'george-iii-of-great-britain', name: 'George III', birth_date: '1738-01-01', birth_year: 1738 })?.isFullDate).toBe(false);
  });
  it('slugifyName matches site slugs', () => {
    expect(slugifyName('Pope Francis')).toBe('pope-francis');
    expect(slugifyName('M. Karunanidhi')).toBe('m-karunanidhi');
    expect(slugifyName('Joaquín Guzmán Loera')).toBe('joaquin-guzman-loera');
  });
});

describe('S6 June celebrities in the static export', () => {
  const bySlug = new Map((celebritiesData.celebrities as Array<Record<string, unknown>>).map(c => [String(c.slug), c]));
  it.each([
    ['sunil-dutt', '1929-06-06'], ['shilpa-shetty', '1975-06-08'], ['anna-hazare', '1937-06-15'],
    ['lakshmi-mittal', '1950-06-15'], ['sonam-kapoor', '1985-06-09'], ['nargis', '1929-06-01'],
    ['rohit-bal', '1961-05-08'],
  ])('%s born %s (Wikipedia infobox)', (slug, iso) => {
    const c = bySlug.get(slug)!;
    expect(c.birth_date).toBe(iso);
    expect(c.birth_month_day).toBe(iso.slice(5));
  });
});
