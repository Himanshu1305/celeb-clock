// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { calculateAshtakoota } from '../../utils/ashtakoota';
import KundaliMatchPage from '../KundaliMatchPage';

const renderKundaliMatch = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/kundali-match']}><KundaliMatchPage /></MemoryRouter></HelmetProvider>);
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-KMATCH', () => {
  afterEach(() => cleanup());

  it('TC-KMATCH-P-01: same Nadi = Nadi Dosha = 0 pts', () => {
    const r = calculateAshtakoota('Ashwini', 'Ardra', 1, 3); // both Adi nadi
    expect(r.nadi).toBe(0); expect(r.nadi_dosha).toBe(true);
  });
  it('TC-KMATCH-P-02: different Nadi = 8 pts', () => {
    const r = calculateAshtakoota('Ashwini', 'Bharani', 1, 1); // Adi vs Madhya
    expect(r.nadi).toBe(8); expect(r.nadi_dosha).toBe(false);
  });
  it('TC-KMATCH-P-03: Deva+Deva gana = 6', () => {
    const r = calculateAshtakoota('Ashwini', 'Punarvasu', 1, 3);
    expect(r.gana).toBe(6);
  });
  it('TC-KMATCH-P-04: Deva+Rakshasa gana = 1', () => {
    const r = calculateAshtakoota('Ashwini', 'Vishakha', 1, 7);
    expect(r.gana).toBe(1);
  });
  it('TC-KMATCH-P-05: total is 0-36', () => {
    const r = calculateAshtakoota('Anuradha', 'Hasta', 8, 6);
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.total).toBeLessThanOrEqual(36);
  });
  it('TC-KMATCH-P-06: all 8 factors present', () => {
    const r = calculateAshtakoota('Anuradha', 'Punarvasu', 8, 3);
    ['varna', 'vashya', 'tara', 'yoni', 'graha_maitri', 'gana', 'bhakoot', 'nadi'].forEach(k => expect(r).toHaveProperty(k));
  });
  it('TC-KMATCH-P-07: compatibility label valid', () => {
    const r = calculateAshtakoota('Ashwini', 'Bharani', 1, 1);
    expect(['Excellent', 'Good', 'Acceptable', 'Challenging']).toContain(r.compatibility);
  });
  it('TC-KMATCH-P-08: /kundali-match page renders', () => { renderKundaliMatch(); expect(q('kmatch-page')).toBeTruthy(); });
  it('TC-KMATCH-P-09: two DOB inputs present', () => { renderKundaliMatch(); expect(q('kmatch-dob-a')).toBeTruthy(); expect(q('kmatch-dob-b')).toBeTruthy(); });
  it('TC-KMATCH-N-01: calculate button disabled without both DOBs', () => { renderKundaliMatch(); expect((q('kmatch-calculate-btn') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KMATCH-N-02: no undefined', () => { renderKundaliMatch(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KMATCH-EDGE-01: same Nakshatra both no crash', () => expect(() => calculateAshtakoota('Anuradha', 'Anuradha', 8, 8)).not.toThrow());
  it('TC-KMATCH-EDGE-02: unknown Nakshatra no crash', () => expect(() => calculateAshtakoota('Unknown', 'Unknown', 1, 1)).not.toThrow());
  it('TC-KMATCH-EDGE-03: Manushya+Rakshasa gana = 0', () => {
    const r = calculateAshtakoota('Bharani', 'Vishakha', 1, 7);
    expect(r.gana).toBe(0);
  });
});
