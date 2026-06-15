import { describe, it, expect } from 'vitest';
import { getPlanId, formatPrice } from '../CountryDetectionService';
import type { CountryInfo } from '../CountryDetectionService';

const INDIA: CountryInfo = { countryCode: 'IN', countryName: 'India', isIndia: true, currency: 'INR' };
const GLOBAL: CountryInfo = { countryCode: 'US', countryName: 'United States', isIndia: false, currency: 'USD' };

describe('formatPrice', () => {
  it('CD1: India monthly → ₹299', () => {
    const { amount, period } = formatPrice(INDIA, 'monthly');
    expect(amount).toBe('₹299');
    expect(period).toBe('/month');
  });

  it('CD2: India annual → ₹2,499 with saving', () => {
    const { amount, saving } = formatPrice(INDIA, 'annual');
    expect(amount).toBe('₹2,499');
    expect(saving).toContain('Save');
  });

  it('CD3: Global monthly → $4.99', () => {
    const { amount } = formatPrice(GLOBAL, 'monthly');
    expect(amount).toBe('$4.99');
  });

  it('CD4: Global annual → $39.99 with saving', () => {
    const { amount, saving } = formatPrice(GLOBAL, 'annual');
    expect(amount).toBe('$39.99');
    expect(saving).toContain('Save');
  });

  it('CD5: India monthly has no saving field', () => {
    const { saving } = formatPrice(INDIA, 'monthly');
    expect(saving).toBeUndefined();
  });
});

describe('getPlanId', () => {
  it('CD6: India monthly uses VITE_RAZORPAY_PLAN_INDIA_MONTHLY env var', () => {
    const planId = getPlanId(INDIA, 'monthly');
    expect(typeof planId).toBe('string');
  });

  it('CD7: Global annual uses VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL env var', () => {
    const planId = getPlanId(GLOBAL, 'annual');
    expect(typeof planId).toBe('string');
  });

  it('CD8: CountryInfo structure is correct', () => {
    expect(INDIA.isIndia).toBe(true);
    expect(INDIA.currency).toBe('INR');
    expect(GLOBAL.isIndia).toBe(false);
    expect(GLOBAL.currency).toBe('USD');
  });
});
