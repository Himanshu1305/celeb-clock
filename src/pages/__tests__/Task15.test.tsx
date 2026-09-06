// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { NAKSHATRA_AKSHARAS, VALID_27_NAKSHATRAS } from '../../__tests__/testData';
import BabyNamesPage from '../BabyNamesPage';

const renderBabyNames = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/baby-names']}><BabyNamesPage /></MemoryRouter></HelmetProvider>);
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-BABY', () => {
  afterEach(() => cleanup());

  it('TC-BABY-P-01: all 27 Nakshatras have aksharas', () => {
    VALID_27_NAKSHATRAS.forEach(n => {
      expect(NAKSHATRA_AKSHARAS[n], `Missing: ${n}`).toBeTruthy();
      expect(NAKSHATRA_AKSHARAS[n].length).toBe(4);
    });
  });
  it('TC-BABY-P-02: Anuradha aksharas = Na Ni Nu Ne', () => expect(NAKSHATRA_AKSHARAS['Anuradha']).toEqual(['Na', 'Ni', 'Nu', 'Ne']));
  it('TC-BABY-P-03: Ashwini aksharas = Chu Che Cho La', () => expect(NAKSHATRA_AKSHARAS['Ashwini']).toEqual(['Chu', 'Che', 'Cho', 'La']));
  it('TC-BABY-P-04: /baby-names page renders', () => { renderBabyNames(); expect(q('baby-names-page')).toBeTruthy(); });
  it('TC-BABY-P-05: DOB input present', () => { renderBabyNames(); expect(q('baby-dob-input')).toBeTruthy(); });
  it('TC-BABY-P-06: entering Nov 5 no crash / no undefined', () => {
    renderBabyNames();
    const dob = q('baby-dob-input') as HTMLInputElement;
    if (dob) fireEvent.change(dob, { target: { value: '1988-11-05' } });
    expect(document.body.textContent).not.toContain('undefined');
  });
  it('TC-BABY-N-01: no undefined', () => { renderBabyNames(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BABY-N-02: no [object Object]', () => { renderBabyNames(); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-BABY-EDGE-01: Feb 29 no crash', () => { renderBabyNames(); const dob = q('baby-dob-input') as HTMLInputElement; if (dob) fireEvent.change(dob, { target: { value: '1988-02-29' } }); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BABY-EDGE-02: all aksharas are 4 strings', () => { VALID_27_NAKSHATRAS.forEach(n => { expect(NAKSHATRA_AKSHARAS[n]).toHaveLength(4); NAKSHATRA_AKSHARAS[n].forEach(a => expect(typeof a).toBe('string')); }); });
});
