import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { toKundaliLegacy } from '../legacyAdapters';

// RC3 Item 2 regression: toKundaliLegacy used to DROP `doshas` and `dashaTimeline`,
// which the engine already computes. That made /manglik and /kaal-sarp-dosha fail on
// every real submission (they read doshas.mangalDosha / doshas.kaalSarp) and silently
// hid KundaliPage's 5-level Dasha deep-dive and "What's Ahead" (both gated on
// dashaTimeline). These assert the adapter now passes both through from the real engine.
describe('toKundaliLegacy passes engine doshas + dashaTimeline through (RC3 Item 2)', () => {
  it('includes doshas.mangalDosha and doshas.kaalSarp from the real local engine', async () => {
    const r = await calculateBirthChart(
      { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857, timezoneOffset: 5.5 },
    );
    const legacy = toKundaliLegacy(r) as any;

    expect(legacy.doshas).toBeDefined();
    expect(legacy.doshas.mangalDosha).toBeDefined();
    expect(typeof legacy.doshas.mangalDosha.hasDosha).toBe('boolean');
    expect(legacy.doshas.kaalSarp).toBeDefined();
    expect(legacy.doshas.sadeSati).toBeDefined();
  });

  it('includes a non-empty dashaTimeline with nested antardashas', async () => {
    const r = await calculateBirthChart(
      { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857, timezoneOffset: 5.5 },
    );
    const legacy = toKundaliLegacy(r) as any;

    expect(Array.isArray(legacy.dashaTimeline)).toBe(true);
    expect(legacy.dashaTimeline.length).toBeGreaterThan(0);
    const first = legacy.dashaTimeline[0];
    expect(first.lord).toBeTruthy();
    expect(first.start).toBeTruthy();
    expect(first.end).toBeTruthy();
    expect(Array.isArray(first.antardashas)).toBe(true);
  });
});
