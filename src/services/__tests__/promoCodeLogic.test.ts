import { describe, it, expect } from 'vitest';

// ── Pure functions mirroring PromoCodeService business logic ──────────────────
// These test the decision logic in isolation — no Supabase calls.

export interface PromoCodeData {
  code: string;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  grants_premium: boolean;
}

export interface PromoValidationResult {
  valid: boolean;
  reason?: 'inactive' | 'expired' | 'limit_reached';
}

export function validatePromoCodeData(
  data: PromoCodeData,
  now: Date,
): PromoValidationResult {
  if (!data.is_active) {
    return { valid: false, reason: 'inactive' };
  }
  if (data.expires_at && new Date(data.expires_at) < now) {
    return { valid: false, reason: 'expired' };
  }
  if (data.max_uses != null && data.current_uses >= data.max_uses) {
    return { valid: false, reason: 'limit_reached' };
  }
  return { valid: true };
}

export function calculatePremiumUntil(grantedAt: Date, durationDays: number): Date {
  return new Date(grantedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// P1–P10  Promo code validation tests
// ─────────────────────────────────────────────────────────────────────────────

const NOW = new Date('2026-06-01T00:00:00.000Z');
const PAST = '2026-01-01T00:00:00.000Z';
const FUTURE = '2027-01-01T00:00:00.000Z';

function makePromo(overrides: Partial<PromoCodeData> = {}): PromoCodeData {
  return {
    code: 'TEST10',
    is_active: true,
    expires_at: null,
    max_uses: null,
    current_uses: 0,
    grants_premium: true,
    ...overrides,
  };
}

describe('P1–P10 — validatePromoCodeData', () => {
  it('P1: valid active code with no restrictions → valid', () => {
    expect(validatePromoCodeData(makePromo(), NOW)).toEqual({ valid: true });
  });

  it('P2: is_active=false → invalid, reason=inactive', () => {
    const r = validatePromoCodeData(makePromo({ is_active: false }), NOW);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('inactive');
  });

  it('P3: expired code → invalid, reason=expired', () => {
    const r = validatePromoCodeData(makePromo({ expires_at: PAST }), NOW);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('expired');
  });

  it('P4: max_uses reached → invalid, reason=limit_reached', () => {
    const r = validatePromoCodeData(makePromo({ max_uses: 10, current_uses: 10 }), NOW);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('limit_reached');
  });

  it('P5: current_uses > max_uses → invalid, reason=limit_reached', () => {
    const r = validatePromoCodeData(makePromo({ max_uses: 10, current_uses: 15 }), NOW);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('limit_reached');
  });

  it('P6: current_uses < max_uses → valid', () => {
    const r = validatePromoCodeData(makePromo({ max_uses: 10, current_uses: 9 }), NOW);
    expect(r.valid).toBe(true);
  });

  it('P7: max_uses=null (unlimited) → valid even with many uses', () => {
    const r = validatePromoCodeData(makePromo({ max_uses: null, current_uses: 9999 }), NOW);
    expect(r.valid).toBe(true);
  });

  it('P8: future expiry → valid', () => {
    const r = validatePromoCodeData(makePromo({ expires_at: FUTURE }), NOW);
    expect(r.valid).toBe(true);
  });

  it('P9: inactive beats expired — reason is inactive (checked first)', () => {
    const r = validatePromoCodeData(
      makePromo({ is_active: false, expires_at: PAST }),
      NOW,
    );
    expect(r.reason).toBe('inactive');
  });

  it('P10: calculatePremiumUntil adds exactly N days in ms', () => {
    const granted = new Date('2026-06-01T00:00:00.000Z');
    const until = calculatePremiumUntil(granted, 30);
    const expectedMs = granted.getTime() + 30 * 24 * 60 * 60 * 1000;
    expect(until.getTime()).toBe(expectedMs);
  });
});
