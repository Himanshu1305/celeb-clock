// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { INDIAN_EVENTS, getEventsForDate } from '../../data/indianHistoricalEvents';
import { OnThisDay } from '../../components/OnThisDay';

describe('TC-HIST', () => {
  afterEach(() => cleanup());

  it('TC-HIST-P-01: >= 50 events', () => expect(INDIAN_EVENTS.length).toBeGreaterThanOrEqual(50));
  it('TC-HIST-P-02: Aug 15 returns Independence Day', () => { const e = getEventsForDate(8, 15); expect(e.length).toBeGreaterThan(0); expect(e.some(x => x.event.toLowerCase().includes('independence'))).toBe(true); });
  it('TC-HIST-P-03: Jan 26 returns Republic Day', () => expect(getEventsForDate(1, 26).some(e => e.event.toLowerCase().includes('republic'))).toBe(true));
  it('TC-HIST-P-04: Oct 2 returns Gandhi', () => expect(getEventsForDate(10, 2).some(e => e.event.toLowerCase().includes('gandhi'))).toBe(true));
  it('TC-HIST-P-05: Apr 14 returns Ambedkar', () => expect(getEventsForDate(4, 14).some(e => e.event.toLowerCase().includes('ambedkar'))).toBe(true));
  it('TC-HIST-P-06: all events have year and event string', () => { INDIAN_EVENTS.forEach(([, , y, event]) => { expect(y).toBeGreaterThan(1000); expect(event.length).toBeGreaterThan(10); }); });
  it('TC-HIST-N-01: date with no events returns empty array', () => expect(Array.isArray(getEventsForDate(2, 3))).toBe(true));
  it('TC-HIST-N-02: OnThisDay renders without crash', () => { render(<OnThisDay month={8} day={15} />); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-HIST-EDGE-01: Feb 29 no crash', () => expect(() => getEventsForDate(2, 29)).not.toThrow());
});
