/**
 * B23 — "Famous birthdays today" (/todays-birthdays) and "Aaj kiska birthday hai" (/todays-birthdays/india):
 * the celebrities born on today's India date, each linking to their BornClock profile.
 *
 * Data kind 'birthdays-day' (one shared file per month): per date, the Indian and the global list,
 * ranked like every BornClock date page (curated Indian profiles first, then Wikipedia language
 * editions). Computed at build time from src/data/celebrities.json by ./birthdaysDay.ts.
 * This template is engine-free and Worker-safe: the Worker, the browser and the tests all call it,
 * so the injected HTML is always today's list (not the build day's).
 */
import type { DailyEntry, DailyFaq, DailySection } from '../types';
import { MONTHS_EN, formatLongDateEn } from '../dates';

/** [slug, name, birth year, death year or 0, short role] */
export type BirthdayRow = [string, string, number, number, string];
export interface BirthdaysDayData { india: BirthdayRow[]; world: BirthdayRow[] }

const MONTH_SLUG = MONTHS_EN.map(m => m.toLowerCase());

function parts(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, month: MONTHS_EN[m - 1], mon: MONTHS_EN[m - 1].slice(0, 3) };
}

/** "turns 38 today" / "born 1919, died 2002" — the age is exact because today is the birthday. */
export function ageNote(row: BirthdayRow, year: number): string {
  const [, , by, dy] = row;
  if (!by) return '';
  if (dy) return `born ${by}, died ${dy}`;
  const age = year - by;
  return age > 0 && age < 120 ? `turns ${age} today` : `born ${by}`;
}

const listText = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const who = (r: BirthdayRow, year: number) => { const a = ageNote(r, year); return a ? `${r[1]} (${a.replace(' today', '')})` : r[1]; };

function peopleSection(id: string, heading: string, rows: BirthdayRow[], year: number): DailySection {
  return {
    id, heading,
    links: rows.map(r => {
      const a = ageNote(r, year);
      return { label: [r[1], r[4], a].filter(Boolean).join(' · '), href: `/celebrity/${r[0]}/` };
    }),
  };
}

export const BIRTHDAYS_STATIC = {
  index: {
    title: 'Famous Birthdays Today — Celebrities Born Today | BornClock',
    description: 'Which celebrities were born today? The famous people — Indian and global — who share today’s birthday, with their ages, each with a full birthday and zodiac profile.',
    h1: 'Famous Birthdays Today',
  },
  india: {
    title: 'Aaj Kiska Birthday Hai? Indian Celebrity Birthdays Today | BornClock',
    description: 'Aaj kiska birthday hai? The Indian actors, cricketers, singers and leaders born today, with their ages — each with a birthday, zodiac and Rashi profile.',
    h1: 'Aaj Kiska Birthday Hai? Indian Celebrity Birthdays Today',
  },
} as const;

export function birthdaysTemplate(slug: 'index' | 'india') {
  return (date: string, _slug: string, raw: unknown): DailyEntry => {
    const data = (raw ?? { india: [], world: [] }) as BirthdaysDayData;
    const { y, m, d, month, mon } = parts(date);
    const dayLabel = `${d} ${month}`;
    const bornOn = `/born-on/${MONTH_SLUG[m - 1]}-${d}/`;
    const india = data.india ?? [], world = data.world ?? [];
    const top3 = (rows: BirthdayRow[]) => rows.slice(0, 3).map(r => who(r, y));
    const faq: DailyFaq[] = [];
    let title: string, description: string, h1: string, answer: string;
    const sections: DailySection[] = [];

    if (slug === 'india') {
      title = `Aaj Kiska Birthday Hai? Indian Celebrity Birthdays Today (${d} ${mon})`;
      h1 = `Aaj Kiska Birthday Hai? Indian Celebrities Born Today, ${dayLabel}`;
      description = india.length
        ? `Aaj kiska birthday hai? Today, ${dayLabel}, is the birthday of ${listText(india.slice(0, 2).map(r => r[1]))}${india.length > 2 ? ` and ${india.length - 2} more famous Indians` : ''}. Ages and profiles inside.`
        : `Aaj kiska birthday hai? The famous Indians born on ${dayLabel}, with their ages and profiles.`;
      answer = india.length
        ? `Aaj (${dayLabel}) ${listText(top3(india))} ka birthday hai. Today is the birthday of ${listText(india.slice(0, 3).map(r => r[1]))}${india.length > 3 ? `, along with ${india.length - 3} more well-known Indians listed below` : ''}.`
        : `We have no well-known Indian birthdays recorded for ${dayLabel}; the global list is on the Famous Birthdays Today page.`;
      if (india.length) sections.push(peopleSection('india', `Indian celebrities born on ${dayLabel}`, india, y));
      if (world.length) sections.push(peopleSection('world', `Also born on ${dayLabel} around the world`, world.slice(0, 6), y));
      sections.push({ id: 'more', heading: 'More about this date', links: [
        { label: `Indians born on ${dayLabel} — full list`, href: `${bornOn}india/` },
        { label: `${month} ${d} birthday personality and zodiac sign`, href: `/birthday/${m}/${d}/` },
        { label: 'Famous birthdays today (global)', href: '/todays-birthdays/' },
      ] });
      faq.push(
        { q: 'Aaj kiska birthday hai?', a: india.length ? `Aaj ${dayLabel} ko ${listText(top3(india))} ka birthday hai.` : `${dayLabel} ko janme Indian celebrities ki list is page par hai.` },
        { q: `Which Indian celebrity has a birthday today (${dayLabel})?`, a: india.length ? `${listText(india.slice(0, 3).map(r => r[1]))} were born on ${dayLabel}.` : `See the list of Indians born on ${dayLabel} on this page.` },
        { q: 'How is this list ranked?', a: 'Curated Indian profiles first, then by global recognition — the number of Wikipedia language editions that have an article about the person.' },
      );
    } else {
      const all = [...world, ...india];
      title = `Famous Birthdays Today (${mon} ${d}) — Celebrities Born Today | BornClock`;
      h1 = `Famous Birthdays Today — ${month} ${d}`;
      const lead = [...world.slice(0, 2), ...india.slice(0, 1)];
      description = lead.length
        ? `Who was born today, ${month} ${d}? ${listText(lead.map(r => r[1]))} and more celebrities share today's birthday. Ages and full profiles.`
        : BIRTHDAYS_STATIC.index.description;
      answer = all.length
        ? `Today, ${month} ${d}, is the birthday of ${listText(top3(world.length ? world : india))}${india.length ? `. Famous Indians born today include ${listText(india.slice(0, 2).map(r => r[1]))}` : ''}.`
        : `See the famous people born on ${month} ${d} below.`;
      if (world.length) sections.push(peopleSection('world', `Famous people born on ${month} ${d}`, world, y));
      if (india.length) sections.push(peopleSection('india', `Indian celebrities born today`, india.slice(0, 8), y));
      sections.push({ id: 'more', heading: 'More about this date', links: [
        { label: `Everyone born on ${month} ${d}`, href: bornOn },
        { label: 'Aaj kiska birthday hai — Indian birthdays today', href: '/todays-birthdays/india/' },
        { label: `${month} ${d} zodiac sign and birthday personality`, href: `/birthday/${m}/${d}/` },
      ] });
      faq.push(
        { q: `Who was born today, ${month} ${d}?`, a: all.length ? `${listText(top3(world.length ? world : india))} were born on ${month} ${d}.` : `See the list on this page.` },
        { q: 'Which Indian celebrities have a birthday today?', a: india.length ? `${listText(india.slice(0, 3).map(r => r[1]))}.` : `None of the Indian profiles we track were born on ${month} ${d}.` },
        { q: 'How is this list ranked?', a: 'By global recognition — the number of Wikipedia language editions that have an article about the person (curated Indian profiles are listed first in the Indian list).' },
      );
    }

    return {
      date, lang: 'en', title, description, h1,
      dateLabel: formatLongDateEn(date),
      // B24: today's "born on" card names who was born today — the share preview changes daily.
      ogImage: `https://bornclock.com/og/born-on/${MONTH_SLUG[m - 1]}-${d}.webp`,
      answer,
      why: [],
      sections,
      faq,
      labels: { answer: 'Born today', faq: 'Questions about today’s birthdays' },
    };
  };
}
