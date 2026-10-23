import { describe, it, expect } from 'vitest';
import { zoneDateISO, zoneDay, zoneMonth, zoneLabel, IST_ZONE } from '../viewerTime';

// Plain time-zone arithmetic: 2026-12-05T19:00Z is 6 Dec 00:30 in IST (+5:30) and 5 Dec 11:00 in Los Angeles (−8).
describe('viewerTime', () => {
  const at = '2026-12-05T19:00:00Z';
  it('formats the same instant per zone', () => {
    expect(zoneDateISO(at, IST_ZONE)).toBe('2026-12-06');
    expect(zoneDateISO(at, 'America/Los_Angeles')).toBe('2026-12-05');
    expect(zoneDay(at, IST_ZONE)).toBe('6 December 2026');
    expect(zoneMonth('2026-12-31T20:00:00Z', IST_ZONE)).toBe('January 2027');
    expect(zoneMonth('2026-12-31T20:00:00Z', 'Europe/London')).toBe('December 2026');
  });
  it('labels IST and other zones', () => {
    expect(zoneLabel(IST_ZONE)).toBe('Indian Standard Time (IST)');
    expect(zoneLabel('Europe/London', new Date('2026-07-01T00:00:00Z'))).toBe('your local time (Europe/London, BST)');
  });
});
