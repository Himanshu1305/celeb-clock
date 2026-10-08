import { describe, it, expect } from 'vitest';
import { buildChildKundli } from '../childKundli';

const base = {
  rashi: 'Vrisha',
  nakshatra: { nakshatra: 'Rohini', pada: 2 },
  planets: [
    { name: 'Sun', signIndex: 2, house: 11, longitude: 40 },
    { name: 'Moon', signIndex: 2, house: 11, longitude: 48 },
    { name: 'Mercury', signIndex: 5, house: 2, longitude: 130 },
    { name: 'Jupiter', signIndex: 4, house: 1, longitude: 95 },
    { name: 'Venus', signIndex: 5, house: 5, longitude: 135 },
    { name: 'Mars', signIndex: 4, house: 4, longitude: 100 },
    { name: 'Saturn', signIndex: 5, house: 5, longitude: 140 },
    { name: 'Rahu', signIndex: 7, house: 7, longitude: 200 },
    { name: 'Ketu', signIndex: 1, house: 1, longitude: 20 },
  ],
  dashaTimeline: [
    { lord: 'Jupiter', start: '2024-01-01', end: '2040-01-01' },
    { lord: 'Saturn', start: '2040-01-01', end: '2059-01-01' },
    { lord: 'Mercury', start: '2059-01-01', end: '2076-01-01' },
  ],
};

describe('buildChildKundli', () => {
  it('returns all sections with real content', () => {
    const c = buildChildKundli(base)!;
    expect(c).not.toBeNull();
    expect(c.temperament.body).toContain('Rohini');
    expect(c.learning.body.length).toBeGreaterThan(20);
    expect(c.talents.body.length).toBeGreaterThan(20);
    expect(c.nameLetters.aksharas.length).toBeGreaterThan(0); // Rohini has O/Va/Vi/Vu
    expect(c.favourablePeriods.body).toContain('Jupiter');
  });

  it('health section is wellbeing-only: never diagnosis, always paediatrician', () => {
    const c = buildChildKundli(base)!;
    const h = c.health.body.toLowerCase();
    expect(h).toContain('paediatrician');
    expect(h).toContain('never');
    expect(/\bwill (be|get|develop|suffer)\b/.test(h)).toBe(false);
  });

  it('mool-star child gets a calm, no-medical-meaning note', () => {
    const mool = buildChildKundli({ ...base, nakshatra: { nakshatra: 'Mula', pada: 1 } })!;
    expect(mool.doshas.body.toLowerCase()).toContain('no medical meaning');
  });

  it('returns null without a nakshatra or planets', () => {
    expect(buildChildKundli({ planets: [] })).toBeNull();
    expect(buildChildKundli({ nakshatra: { nakshatra: 'Rohini', pada: 1 } })).toBeNull();
  });
});
