import { describe, it, expect } from 'vitest';
import { computeFunnel, FUNNEL_STAGES, type AnalyticsEventRow } from '../funnel';

const ev = (session_id: string, event_type: string, event_name: string): AnalyticsEventRow => ({ session_id, event_type, event_name });

describe('computeFunnel (P5-2 conversion funnel)', () => {
  it('returns one stage per defined step in order', () => {
    const f = computeFunnel([]);
    expect(f.map(s => s.key)).toEqual(FUNNEL_STAGES.map(s => s.key));
    expect(f.every(s => s.sessions === 0)).toBe(true);
  });

  it('counts unique sessions per stage (dedup within a session)', () => {
    const events: AnalyticsEventRow[] = [
      // s1: visit -> chart (twice) -> checkout -> purchase
      ev('s1', 'page_view', '/'),
      ev('s1', 'funnel', 'chart_generated'),
      ev('s1', 'funnel', 'chart_generated'),
      ev('s1', 'funnel', 'checkout_opened'),
      ev('s1', 'funnel', 'purchase_completed'),
      // s2: visit -> chart, no checkout
      ev('s2', 'page_view', '/kundali'),
      ev('s2', 'funnel', 'chart_generated'),
      // s3: visit only
      ev('s3', 'page_view', '/blog'),
    ];
    const f = computeFunnel(events);
    const by = Object.fromEntries(f.map(s => [s.key, s]));
    expect(by.visit.sessions).toBe(3);
    expect(by.chart_generated.sessions).toBe(2); // s1 counted once despite two events
    expect(by.checkout_opened.sessions).toBe(1);
    expect(by.purchase_completed.sessions).toBe(1);
  });

  it('computes pctOfTop and pctOfPrev', () => {
    const events: AnalyticsEventRow[] = [
      ev('a', 'page_view', '/'), ev('b', 'page_view', '/'), ev('c', 'page_view', '/'), ev('d', 'page_view', '/'),
      ev('a', 'funnel', 'chart_generated'), ev('b', 'funnel', 'chart_generated'),
      ev('a', 'funnel', 'report_preview_viewed'),
      ev('a', 'funnel', 'checkout_opened'),
    ];
    const f = Object.fromEntries(computeFunnel(events).map(s => [s.key, s]));
    expect(f.visit.pctOfTop).toBe(100);
    expect(f.chart_generated.sessions).toBe(2);
    expect(f.chart_generated.pctOfTop).toBe(50);   // 2 of 4
    expect(f.chart_generated.pctOfPrev).toBe(50);  // 2 of 4
    // checkout_opened's previous stage is report_preview_viewed (1 session) → 100%
    expect(f.report_preview_viewed.sessions).toBe(1);
    expect(f.checkout_opened.pctOfPrev).toBe(100); // 1 of 1 preview
  });

  it('ignores events without a session id', () => {
    const f = computeFunnel([{ session_id: null, event_type: 'page_view', event_name: '/' } as AnalyticsEventRow]);
    expect(f[0].sessions).toBe(0);
  });

  it('non-funnel feature_use events do not leak into funnel stages', () => {
    const events: AnalyticsEventRow[] = [
      ev('x', 'page_view', '/'),
      ev('x', 'feature_use', 'chart_generated'), // same NAME but wrong type — must not count
    ];
    const f = Object.fromEntries(computeFunnel(events).map(s => [s.key, s]));
    expect(f.visit.sessions).toBe(1);
    expect(f.chart_generated.sessions).toBe(0);
  });
});
