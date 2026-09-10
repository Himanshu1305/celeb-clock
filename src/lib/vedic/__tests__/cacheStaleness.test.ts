import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { currentDashaTag, buildTimingFacts } from '../yogaTiming';

// Part 3.5 — the reading cache was keyed on birth params + version only, with NO
// time component, so "current period" / "next window" language could be served
// stale forever. The fix folds currentDashaTag() into the cache key. These tests
// prove the tag is stable WITHIN a sub-period (so the AI reading is still cached)
// but changes the instant real time crosses into the next sub-period (forcing a
// regenerate before the framing goes stale).
const chart = () => calculateBirthChart(
  { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
  { includeShadbala: true, refDate: new Date(Date.UTC(2026, 8, 10)) },
);

describe('cache-staleness tag (Part 3.5)', () => {
  it('is stable within one Antardasha but changes across the boundary', async () => {
    const c = await chart();
    const now = new Date(Date.UTC(2026, 8, 10));
    const m = c.dashaTimeline!.find(x => now >= new Date(x.start) && now < new Date(x.end))!;
    const a = m.antardashas.find(x => now >= new Date(x.start) && now < new Date(x.end))!;
    const boundary = new Date(a.end).getTime();

    const within1 = new Date(boundary - 864e5 * 30);
    const within2 = new Date(boundary - 864e5 * 200); // still same antar (start is years earlier)
    const before = new Date(boundary - 864e5 * 5);
    const after = new Date(boundary + 864e5 * 5);

    // stable within the sub-period → same key → cached AI reading still served
    expect(currentDashaTag(c, within1)).toBe(currentDashaTag(c, before));
    if (within2 >= new Date(a.start)) expect(currentDashaTag(c, within2)).toBe(currentDashaTag(c, before));
    // changes across the boundary → new key → regenerate (no stale framing)
    expect(currentDashaTag(c, after)).not.toBe(currentDashaTag(c, before));
  });

  it('the "current period" the reading cites genuinely shifts across that boundary', async () => {
    const c = await chart();
    const now = new Date(Date.UTC(2026, 8, 10));
    const m = c.dashaTimeline!.find(x => now >= new Date(x.start) && now < new Date(x.end))!;
    const a = m.antardashas.find(x => now >= new Date(x.start) && now < new Date(x.end))!;
    const boundary = new Date(a.end).getTime();
    const before = buildTimingFacts(c, new Date(boundary - 864e5 * 5)).currentPeriod;
    const after = buildTimingFacts(c, new Date(boundary + 864e5 * 5)).currentPeriod;
    expect(before).not.toBe(after);        // stale text would keep showing `before`
    expect(before).toContain(a.lord);       // the ending sub-period
  });

  it('no birth-time / no timeline → a safe constant tag (no crash)', () => {
    expect(currentDashaTag({ dashaTimeline: undefined } as any, new Date())).toBe('nd');
  });
});
