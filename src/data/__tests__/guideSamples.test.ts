/**
 * B14 — the worked sample outputs on the astrology guides must be exactly what the engine
 * produces (no hand-typed numbers). Re-runs the builder and compares with the committed JSON.
 * If this fails: npx tsx scripts/gen-guide-samples.mts
 */
import { describe, it, expect } from 'vitest';
import samples from '@/data/guideSamples.json';
import { buildGuideSamples } from '@/lib/guides/buildGuideSamples';
import { NAK_ORDER } from '@/lib/vedic/nakshatraAttributes';

describe('guide samples', () => {
  it('committed guideSamples.json equals a fresh engine run', async () => {
    const fresh = JSON.parse(JSON.stringify(await buildGuideSamples()));
    expect(samples).toEqual(fresh);
  }, 60_000);

  it('the /nakshatra worked arithmetic agrees with the engine', () => {
    const c = samples.dasha.chart;
    const span = 360 / 27;
    const idx = Math.floor(c.moonLongitude / span);
    expect(NAK_ORDER[idx]).toBe(c.nakshatra.name);
    expect(Math.floor((c.moonLongitude - idx * span) / (span / 4)) + 1).toBe(c.nakshatra.pada);
  });

  it('sample matching totals add up from the kootas', () => {
    for (const m of [samples.match, samples.matchHi, samples.nameMatch.result!]) {
      expect(m.kootas.reduce((s, k) => s + k.score, 0)).toBe(m.total);
      expect(m.kootas.reduce((s, k) => s + k.max, 0)).toBe(36);
    }
  });
});
