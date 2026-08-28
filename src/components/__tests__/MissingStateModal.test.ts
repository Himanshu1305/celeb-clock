// Gate logic for the one-time missing-state modal: it must show for a premium
// user with no place-of-supply, close on success, and never otherwise.
import { describe, it, expect } from 'vitest';
import { shouldShowMissingStateModal, isMissingStateModalOpen } from '@/components/missingStateGate';

describe('shouldShowMissingStateModal', () => {
  it('renders when the user is premium AND has no state', () => {
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: null })).toBe(true);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: undefined })).toBe(true);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '' })).toBe(true);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '   ' })).toBe(true); // whitespace = missing
  });

  it('does NOT render when the state is set to any non-null, non-empty value', () => {
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '36' })).toBe(false);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: '01' })).toBe(false);
    expect(shouldShowMissingStateModal({ isPremium: true, buyerStateCode: 'anything' })).toBe(false);
  });

  it('does NOT render for a non-premium user (even with no state)', () => {
    expect(shouldShowMissingStateModal({ isPremium: false, buyerStateCode: null })).toBe(false);
    expect(shouldShowMissingStateModal({ isPremium: false, buyerStateCode: '36' })).toBe(false);
  });
});

describe('isMissingStateModalOpen — closes on success', () => {
  it('is OPEN for a premium user with no state before they submit', () => {
    expect(isMissingStateModalOpen({ isPremium: true, buyerStateCode: null, dismissed: false })).toBe(true);
  });

  it('CLOSES after a successful save (dismissed set), even before the profile refetches', () => {
    // Simulates the success handler flipping `dismissed` while buyer_state_code is
    // still null locally — the modal must close immediately.
    expect(isMissingStateModalOpen({ isPremium: true, buyerStateCode: null, dismissed: true })).toBe(false);
  });

  it('stays CLOSED once the persisted state lands on a later profile refetch', () => {
    expect(isMissingStateModalOpen({ isPremium: true, buyerStateCode: '36', dismissed: false })).toBe(false);
  });

  it('never opens for a non-premium user', () => {
    expect(isMissingStateModalOpen({ isPremium: false, buyerStateCode: null, dismissed: false })).toBe(false);
  });
});
