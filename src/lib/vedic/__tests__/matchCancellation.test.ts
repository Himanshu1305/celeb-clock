/**
 * B14 F3 / F4 (accuracy audit, 17 Nov 2026) — dosha cancellation NOTES. Scores never change.
 *
 * F3 Bhakoot: classically cancelled when the two Moon-sign lords are the same planet
 *    (Aries/Scorpio, Taurus/Libra, Capricorn/Aquarius) or mutual friends. Reported as a
 *    note; the Bhakoot score stays 0, as AstroSage counts it (the AstroSage couples
 *    P9×P3 = 17.5 and Y1×P3 = 17 only add up with Bhakoot = 0).
 * F4 Nadi / Gana: "cancelled" only by the strict rules or MUTUAL friendship — a one-way
 *    friendship (Moon→Mercury friend, Mercury→Moon enemy) no longer counts.
 * Natural friendships: engine/sthanaBala.ts FRIENDS / ENEMIES (BPHS).
 */
import { describe, it, expect } from 'vitest';
import { calculateGunaMilan, type PersonInput } from '../matchmaking';

const P = (nakshatra: string, pada: number, rashiIndex: number): PersonInput => ({ nakshatra, pada, rashiIndex });
const dosha = (a: PersonInput, b: PersonInput, name: string) => calculateGunaMilan(a, b).doshas.find(d => d.name === name)!;
const bhakootScore = (a: PersonInput, b: PersonInput) => calculateGunaMilan(a, b).kootas.find(k => k.key === 'bhakoot')!.score;

describe('F3: Bhakoot dosha cancellation is reported, score stays 0', () => {
  it('Cancer × Leo (2/12; Moon and Sun are mutual friends) → cancelled, 0 of 7', () => {
    const a = P('Pushya', 2, 3), b = P('Magha', 1, 4);
    const d = dosha(a, b, 'Bhakoot Dosha');
    expect([d.present, d.cancelled]).toEqual([true, true]);
    expect(d.reason).toMatch(/mutual friends \(Moon\/Sun\)/);
    expect(d.reason).toMatch(/score stays 0 of 7/);
    expect(bhakootScore(a, b)).toBe(0);
  });
  it('Sagittarius × Leo (5/9; Jupiter–Sun mutual friends) → cancelled, 0 of 7', () => {
    const a = P('Mula', 1, 8), b = P('Magha', 1, 4);
    expect(dosha(a, b, 'Bhakoot Dosha').cancelled).toBe(true);
    expect(bhakootScore(a, b)).toBe(0);
  });
  it('Aries × Scorpio, Taurus × Libra, Capricorn × Aquarius (same lord) → cancelled', () => {
    expect(dosha(P('Ashwini', 1, 0), P('Anuradha', 1, 7), 'Bhakoot Dosha').reason).toMatch(/same planet \(Mars\)/);
    expect(dosha(P('Rohini', 1, 1), P('Swati', 1, 6), 'Bhakoot Dosha').reason).toMatch(/same planet \(Venus\)/);
    expect(dosha(P('Shravana', 1, 9), P('Shatabhisha', 1, 10), 'Bhakoot Dosha').reason).toMatch(/same planet \(Saturn\)/);
  });
  it('Gemini × Cancer (2/12; Mercury→Moon enemy, one-way only) → NOT cancelled', () => {
    const d = dosha(P('Ardra', 1, 2), P('Pushya', 1, 3), 'Bhakoot Dosha');
    expect([d.present, d.cancelled]).toEqual([true, false]);
  });
  it('Taurus × Sagittarius (6/8; Venus–Jupiter not friends) → NOT cancelled', () => {
    expect(dosha(P('Rohini', 1, 1), P('Mula', 1, 8), 'Bhakoot Dosha').cancelled).toBe(false);
  });
  it('no dosha → nothing to cancel', () => {
    const d = dosha(P('Ashwini', 1, 0), P('Ardra', 1, 2), 'Bhakoot Dosha'); // Aries × Gemini = 3/11
    expect([d.present, d.cancelled]).toEqual([false, false]);
  });
});

describe('F4: Nadi / Gana cancelled only by strict rules or mutual friendship', () => {
  it('Nadi: Ardra (Gemini) × Punarvasu-4 (Cancer), both Adi, Mercury/Moon one-way → NOT cancelled', () => {
    const d = dosha(P('Ardra', 2, 2), P('Punarvasu', 4, 3), 'Nadi Dosha');
    expect([d.present, d.cancelled]).toEqual([true, false]);
  });
  it('Nadi: same Nakshatra, different pada still cancels; same sign, different Nakshatra still cancels', () => {
    expect(dosha(P('Rohini', 1, 1), P('Rohini', 3, 1), 'Nadi Dosha').cancelled).toBe(true);
    // Ardra and Punarvasu 1-3 are both Adi Nadi and both in Gemini.
    expect(dosha(P('Ardra', 1, 2), P('Punarvasu', 1, 2), 'Nadi Dosha').cancelled).toBe(true);
  });
  it('Nadi: mutual-friend sign lords still cancel (Ashwini/Aries × Mula/Sagittarius, Mars–Jupiter)', () => {
    const d = dosha(P('Ashwini', 1, 0), P('Mula', 2, 8), 'Nadi Dosha');
    expect([d.present, d.cancelled]).toEqual([true, true]);
    expect(d.reason).toMatch(/mutual friends \(Mars\/Jupiter\)/);
  });
  it('Gana: Ardra (Manushya, Gemini) × Ashlesha (Rakshasa, Cancer) — one-way lords → NOT cancelled', () => {
    const d = dosha(P('Ardra', 1, 2), P('Ashlesha', 1, 3), 'Gana Dosha');
    expect([d.present, d.cancelled]).toEqual([true, false]);
  });
  it('scores are unchanged by the cancellation notes', () => {
    const r = calculateGunaMilan(P('Ardra', 2, 2), P('Punarvasu', 4, 3));
    expect(r.kootas.find(k => k.key === 'nadi')!.score).toBe(0);
    expect(r.total).toBe(r.kootas.reduce((s, k) => s + k.score, 0));
  });
});
