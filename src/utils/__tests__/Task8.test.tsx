// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { getCelebrityCountForDate, getBirthdayRarityScore } from '../birthdayStatistics';
import { BirthdayRarityCard } from '../../components/BirthdayRarityCard';

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-STATS', () => {
  afterEach(() => cleanup());

  it('TC-STATS-P-01: Nov 5 count >= 1', () => expect(getCelebrityCountForDate(11, 5)).toBeGreaterThanOrEqual(1));
  it('TC-STATS-P-02: rarity label valid', () => expect(['Rare', 'Uncommon', 'Common', 'Very Common']).toContain(getBirthdayRarityScore(11, 5).label));
  it('TC-STATS-P-03: percentile 0-100', () => { const s = getBirthdayRarityScore(11, 5); expect(s.percentile).toBeGreaterThanOrEqual(0); expect(s.percentile).toBeLessThanOrEqual(100); });
  it('TC-STATS-P-04: BirthdayRarityCard renders', () => { render(<BirthdayRarityCard month={11} day={5} />); expect(q('birthday-rarity-card')).toBeTruthy(); });
  it('TC-STATS-P-05: card shows a number', () => { render(<BirthdayRarityCard month={11} day={5} />); expect(q('birthday-rarity-card')?.textContent).toMatch(/\d+/); });
  it('TC-STATS-P-06: description mentions celebrities/people', () => expect(getBirthdayRarityScore(11, 5).description.toLowerCase()).toMatch(/celebrities|celebrity|people|person/));
  it('TC-STATS-N-01: count never negative', () => { for (let m = 1; m <= 12; m++) expect(getCelebrityCountForDate(m, 15)).toBeGreaterThanOrEqual(0); });
  it('TC-STATS-N-02: no undefined in card', () => { render(<BirthdayRarityCard month={11} day={5} />); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-STATS-EDGE-01: Feb 29 no crash', () => expect(() => getBirthdayRarityScore(2, 29)).not.toThrow());
});
