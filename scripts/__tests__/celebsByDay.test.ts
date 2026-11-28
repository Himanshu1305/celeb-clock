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
