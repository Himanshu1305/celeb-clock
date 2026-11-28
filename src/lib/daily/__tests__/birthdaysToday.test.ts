/**
 * B23 — /todays-birthdays and /todays-birthdays/india daily kinds: the data comes from
 * celebrities.json, the template is Worker-safe, and the Worker injection carries today's names.
 */
import { describe, it, expect } from 'vitest';
import { computeDaily } from '../compute';
import { injectDailyHtml } from '../inject';
import { matchDailyRoute } from '../registry';
import { birthdaysDayData } from '../kinds/birthdaysDay';
import { ageNote } from '../kinds/birthdaysTemplate';

describe('birthdays-today daily kinds', () => {
  it('BT1 — 5 November: Virat Kohli leads the Indian list, with his age that day', () => {
    const d = birthdaysDayData('2026-11-05');
    expect(d.india[0][1]).toBe('Virat Kohli');
    expect(ageNote(d.india[0], 2026)).toBe('turns 38 today');
    const e = computeDaily('birthdays-today-india', '2026-11-05', 'index');
    expect(e.title).toBe('Aaj Kiska Birthday Hai? Indian Celebrity Birthdays Today (5 Nov)');
    expect(e.title.length).toBeLessThanOrEqual(70);
    expect(e.answer).toContain('Virat Kohli');
    expect(e.faq[0].q).toBe('Aaj kiska birthday hai?');
    const links = e.sections.flatMap(s => s.links ?? []);
    expect(links.some(l => l.href === '/celebrity/virat-kohli/')).toBe(true);
    expect(links.some(l => l.href === '/born-on/november-5/india/')).toBe(true);
  });
  it('BT2 — every day of a leap year has a global entry with a ≤70-char title and real profile links', () => {
    for (let t = Date.UTC(2028, 0, 1); t < Date.UTC(2029, 0, 1); t += 86_400_000) {
      const iso = new Date(t).toISOString().slice(0, 10);
      const e = computeDaily('birthdays-today', iso, 'index');
      expect(e.title.length, iso).toBeLessThanOrEqual(70);
      expect(e.sections.flatMap(s => s.links ?? []).filter(l => l.href.startsWith('/celebrity/')).length, iso).toBeGreaterThan(0);
    }
  });
  it('BT3 — deceased people get born/died years, never an age', () => {
    expect(ageNote(['x', 'X', 1919, 2002, ''], 2026)).toBe('born 1919, died 2002');
  });
  it('BT4 — the Worker injection replaces the title, H1 and list', () => {
    expect(matchDailyRoute('/todays-birthdays/india/')?.def.kind).toBe('birthdays-today-india');
    const shell = '<html><head><title>x</title><meta name="description" content="x"></head><body><h1><span data-daily="h1">x</span></h1><div data-daily="body" data-daily-date="">old</div><script type="application/ld+json" data-daily="jsonld">{}</script></body></html>';
    const e = computeDaily('birthdays-today-india', '2026-11-05', 'index');
    const { html, replaced } = injectDailyHtml(shell, { kind: 'birthdays-today-india', slug: 'index', path: '/todays-birthdays/india', entry: e });
    expect(replaced).toMatchObject({ title: true, h1: true, body: true, jsonld: true });
    expect(html).toContain('/celebrity/virat-kohli/');
    expect(html).not.toContain('<div data-daily="body" data-daily-date="">old');
  });
});
