import { describe, it, expect } from 'vitest';

// ── Pure function under test ───────────────────────────────────────────────────
// This is the logic that SHOULD live in useAuth.ts once the trial feature ships.
// Writing it as a pure function here lets us test it without mocking Supabase.

export interface TrialStatus {
  isInTrial: boolean;
  trialDaysRemaining: number;
  isExpired: boolean;
}

export function calculateTrialStatus(
  signedUpAt: Date,
  now: Date,
  trialDays = 7,
): TrialStatus {
  const elapsedMs = now.getTime() - signedUpAt.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const isInTrial = elapsedDays < trialDays;
  const trialDaysRemaining = isInTrial
    ? Math.ceil(trialDays - elapsedDays)
    : 0;
  return { isInTrial, trialDaysRemaining, isExpired: !isInTrial };
}

// ─────────────────────────────────────────────────────────────────────────────
// T1–T8  Trial status tests
// ─────────────────────────────────────────────────────────────────────────────

function daysAfter(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

const BASE = new Date('2026-01-01T00:00:00.000Z');

describe('T1–T8 — calculateTrialStatus', () => {
  it('T1: signup moment → isInTrial=true, trialDaysRemaining=7', () => {
    const r = calculateTrialStatus(BASE, BASE);
    expect(r.isInTrial).toBe(true);
    expect(r.trialDaysRemaining).toBe(7);
    expect(r.isExpired).toBe(false);
  });

  it('T2: 3 days in → isInTrial=true, trialDaysRemaining=4', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 3));
    expect(r.isInTrial).toBe(true);
    expect(r.trialDaysRemaining).toBe(4);
  });

  it('T3: 6 days in → isInTrial=true, trialDaysRemaining=1', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 6));
    expect(r.isInTrial).toBe(true);
    expect(r.trialDaysRemaining).toBe(1);
  });

  it('T4: exactly 7 days → isInTrial=false (trial ends)', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 7));
    expect(r.isInTrial).toBe(false);
    expect(r.trialDaysRemaining).toBe(0);
    expect(r.isExpired).toBe(true);
  });

  it('T5: 8 days after → isInTrial=false, isExpired=true', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 8));
    expect(r.isInTrial).toBe(false);
    expect(r.trialDaysRemaining).toBe(0);
    expect(r.isExpired).toBe(true);
  });

  it('T6: 30 days after → long-expired', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 30));
    expect(r.isInTrial).toBe(false);
    expect(r.isExpired).toBe(true);
  });

  it('T7: 1ms before expiry → still in trial', () => {
    const almostExpired = new Date(daysAfter(BASE, 7).getTime() - 1);
    const r = calculateTrialStatus(BASE, almostExpired);
    expect(r.isInTrial).toBe(true);
  });

  it('T8: custom trialDays=14 → 14-day window', () => {
    const r = calculateTrialStatus(BASE, daysAfter(BASE, 13), 14);
    expect(r.isInTrial).toBe(true);
    expect(r.trialDaysRemaining).toBe(1);
    const rExpired = calculateTrialStatus(BASE, daysAfter(BASE, 14), 14);
    expect(rExpired.isInTrial).toBe(false);
  });
});
