// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { VedicReading } from '../VedicReading';
import type { ReadingPayload } from '@/services/readingService';

afterEach(cleanup);

const FACTS = {
  rashi: 'Kanya',
  nakshatra: { name: 'Uttara Phalguni', pada: 2, lord: 'Sun' },
  lagna: 'Makara',
  dasha: { maha: 'Rahu', antar: 'Moon' },
  placements: [
    { planet: 'Sun', sign: 'Tula', house: 10, retrograde: false },
    { planet: 'Moon', sign: 'Kanya', house: 9, retrograde: false },
  ],
  doshas: {
    mangal: { present: false, severityLabel: 'None' },
    kaalSarp: { present: false, isPartial: false, type: null },
    sadeSati: { active: false, phase: null },
  },
  divisional: { d9Moon: 'Makara', d10Sun: 'Mesha', d60Moon: 'Simha', d60Disclaimer: 'The Shashtiamsa (D60) is calculated using one of several classical traditions; treat it as one interpretation.' },
  warnings: [],
};

const READING = {
  snapshot: 'You bring quiet steadiness to what you do.',
  career: 'This period is traditionally associated with steady progress.',
  relationships: 'You show care through practical devotion.',
  health: 'Steady daily rhythms support your wellbeing.',
  money: 'A calm, prudent mindset brings security.',
  family: 'Home is where you seek order and support.',
  rightNow: 'This phase is traditionally associated with reflection.',
  doshas: 'Your chart is calm and free of major traditional patterns.',
  divisional: 'In one classical reading, resilience grows with maturity.',
};

const withReading: ReadingPayload = { facts: FACTS, reading: READING, degraded: false, warnings: [], source: 'local' };
const degraded: ReadingPayload = { facts: FACTS, reading: null, degraded: true, degradedReason: 'Gemini API error: 503', warnings: [], source: 'local' };
const polar: ReadingPayload = { facts: { ...FACTS, warnings: [{ code: 'POLAR_LATITUDE', message: 'polar' }] }, reading: READING, degraded: false, warnings: [{ code: 'POLAR_LATITUDE', message: 'polar' }], source: 'local' };

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('VedicReading — full reading renders all 5 sections with real text', () => {
  it('renders snapshot, 5 life areas, right-now, doshas, divisional + D60 disclaimer', () => {
    render(<VedicReading payload={withReading} />);
    expect(q('reading-snapshot')?.textContent).toContain('quiet steadiness');
    for (const area of ['career', 'relationships', 'health', 'money', 'family']) {
      expect(q(`reading-area-${area}`)).toBeTruthy();
      expect(q(`reading-area-${area}`)?.textContent?.length).toBeGreaterThan(15);
    }
    expect(q('reading-right-now')?.textContent).toContain('reflection');
    expect(q('reading-doshas')?.textContent).toContain('calm');
    expect(q('reading-divisional')?.textContent).toContain('classical');
    expect(q('reading-d60-disclaimer')?.textContent).toMatch(/one interpretation/i);
    // no polar banner for a normal chart
    expect(q('reading-polar-warning')).toBeNull();
    // no degraded notice when reading present
    expect(q('reading-degraded-notice')).toBeNull();
  });

  it('advanced-view toggle reveals the underlying chart data', () => {
    render(<VedicReading payload={withReading} />);
    expect(q('reading-advanced')).toBeNull(); // hidden by default
    fireEvent.click(q('reading-advanced-toggle') as Element);
    const adv = q('reading-advanced');
    expect(adv).toBeTruthy();
    expect(adv?.textContent).toContain('Sun');   // placement table
    expect(adv?.textContent).toContain('Makara'); // lagna/divisional
  });
});

describe('VedicReading — degraded (AI offline) shows facts, never blank or error', () => {
  it('shows a friendly notice + chart facts, no raw error text', () => {
    render(<VedicReading payload={degraded} />);
    expect(q('reading-degraded-notice')?.textContent).toMatch(/short break/i);
    // snapshot falls back to deterministic facts sentence (not empty)
    expect(q('reading-snapshot')?.textContent).toContain('Kanya');
    // advanced facts shown automatically when degraded (no blank sections)
    expect(q('reading-advanced')).toBeTruthy();
    // the raw error reason is NOT surfaced to the user
    expect(document.body.textContent).not.toContain('503');
    expect(document.body.textContent).not.toMatch(/error/i);
  });
});

describe('VedicReading — polar chart renders the warning banner in the DOM', () => {
  it('shows the polar-latitude banner', () => {
    render(<VedicReading payload={polar} />);
    const banner = q('reading-polar-warning');
    expect(banner).toBeTruthy();
    expect(banner?.textContent).toMatch(/polar|approximate/i);
  });
});
