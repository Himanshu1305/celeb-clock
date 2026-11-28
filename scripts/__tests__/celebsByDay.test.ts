/** B22 — the /birthday/:m/:d celebrity links are current and every link points at a real profile. */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildCelebsByDay, CAP } from '../gen-celebs-by-day.mts';

describe('celebsByDay', () => {
  const built = buildCelebsByDay();
  it('C1 — committed files match the generator (run: npx tsx scripts/gen-celebs-by-day.mts)', () => {
    for (const [mm, days] of Object.entries(built)) expect(JSON.parse(readFileSync(`src/data/celebsByDay/${mm}.json`, 'utf8'))).toEqual(days);
  });
  it('C2 — every slug is a live celebrity page; Indian and global lists are separate and capped', () => {
    const meta = JSON.parse(readFileSync('scripts/celebrity-meta.json', 'utf8')) as Record<string, unknown>;
    let links = 0;
    for (const days of Object.values(built)) for (const d of Object.values(days)) {
      expect(d.india.length).toBeLessThanOrEqual(CAP); expect(d.world.length).toBeLessThanOrEqual(CAP);
      for (const x of [...d.india, ...d.world]) { expect(meta[x.s], x.s).toBeTruthy(); links++; }
    }
    expect(links).toBeGreaterThan(3000);
    expect(built['01']['01-05'].india.map(x => x.s)).toContain('deepika-padukone');
    expect(built['01']['01-05'].world.map(x => x.s)).toContain('bradley-cooper');
  });
});

// B23 — /zodiac/:sign/celebrities and /chinese-zodiac/:year lists.
import { buildCelebsBySignAndYear, sunSignOf } from '../gen-celebs-by-day.mts';
import { chineseYearForYmd } from '../../src/lib/chineseCalendar.js';
describe('celebsBySign / celebsByChineseYear', () => {
  const { bySign, byYear } = buildCelebsBySignAndYear(chineseYearForYmd);
  it('C3 — committed files match the generator', () => {
    expect(JSON.parse(readFileSync('src/data/celebsBySign.json', 'utf8'))).toEqual(bySign);
    expect(JSON.parse(readFileSync('src/data/celebsByChineseYear.json', 'utf8'))).toEqual(byYear);
  });
  it('C4 — sign boundaries; Virat Kohli is a Scorpio; Emma Watson is a 1990 Horse; every slug is a page', () => {
    expect([sunSignOf(3, 20), sunSignOf(3, 21), sunSignOf(12, 21), sunSignOf(12, 22), sunSignOf(1, 19), sunSignOf(1, 20)])
      .toEqual(['pisces', 'aries', 'sagittarius', 'capricorn', 'capricorn', 'aquarius']);
    expect(bySign.scorpio.india.map(x => x.s)).toContain('virat-kohli');
    expect(byYear['1990'].map(x => x.s)).toContain('emma-watson');
    const meta = JSON.parse(readFileSync('scripts/celebrity-meta.json', 'utf8')) as Record<string, unknown>;
    for (const v of Object.values(bySign)) for (const x of [...v.india, ...v.world]) expect(meta[x.s], x.s).toBeTruthy();
  });
});

// B24 — category hubs list every Indian profile whose (re-derived) category maps to the hub.
import { buildCelebsByHub } from '../gen-celebs-by-day.mts';
import { deriveCategory } from '../../src/lib/celebrityCategory';
describe('celebsByHub / categories', () => {
  it('C5 — committed hub file matches the generator; hubs are big enough', () => {
    const hubs = buildCelebsByHub();
    expect(JSON.parse(readFileSync('src/data/celebsByHub.json', 'utf8'))).toEqual(hubs);
    expect(hubs.bollywood.length).toBeGreaterThan(800);
    expect(hubs.sports.length).toBeGreaterThan(150);
  });
  it('C6 — derived categories follow the first role named', () => {
    expect(deriveCategory('Indian sport shooter')).toBe('Athlete');
    expect(deriveCategory('3rd President of India (1897-1969)')).toBe('Politician');
    expect(deriveCategory('Indian actor and politician')).toBe('Actor');
    expect(deriveCategory('Indian politician and actor')).toBe('Politician');
    expect(deriveCategory('Indian playback singer')).toBe('Singer');
    expect(deriveCategory('Indian television actress')).toBe('Actress');
    expect(deriveCategory('')).toBe('Celebrity');
    const data = JSON.parse(readFileSync('src/data/celebrities.json', 'utf8')) as { celebrities: Array<{ category: string }> };
    expect(data.celebrities.filter(c => c.category === 'Celebrity').length).toBeLessThan(200);
  });
});
