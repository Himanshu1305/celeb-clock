// Gate logic for the one-time missing-state modal: it must show for a premium
// user with no place-of-supply, and never otherwise.
import { describe, it, expect } from 'vitest';
import { shouldShowMissingStateModal } from '@/components/missingStateGate';

describe('shouldShowMissingStateModal', () => {
  it('renders when the user is premium AND has no state', () => {
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: null })).toBe(true);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: undefined })).toBe(true);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '' })).toBe(true);
  });

  it('does NOT render when the state is already set', () => {
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '36' })).toBe(false);
  });

  it('does NOT render for a non-premium user (even with no state)', () => {
    expect(shouldShowMissingStateModal({ isPremium: false, buyerStateCode: null })).toBe(false);
    expect(shouldShowMissingStateModal({ isPremium: false, buyerStateCode: '36' })).toBe(false);
  });
});
