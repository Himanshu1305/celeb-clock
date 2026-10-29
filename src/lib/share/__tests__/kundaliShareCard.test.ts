// @vitest-environment jsdom
/**
 * Batch 9b: the "Share my Kundali" image. The SVG must carry Lagna, Rashi, Nakshatra, a
 * chart thumbnail and the site URL — and NO name / birth date / time / place unless the
 * visitor opted in. Sample chart: the real engine output for 15 Aug 1990 10:30 New Delhi.
 */
import { describe, it, expect } from 'vitest';
import { buildKundaliShareSvg, shareBirthLines, SHARE_URL_LABEL, type ShareCardData } from '../kundaliShareCard';

const data: ShareCardData = {
  lagna: { sign: 'Kanya', signIndex: 6 },
  rashi: 'Vrisha',
  nakshatra: { nakshatra: 'Rohini', pada: 3 },
  planets: [
    { name: 'Sun', signIndex: 4, house: 11 }, { name: 'Moon', signIndex: 2, house: 9 },
    { name: 'Mercury', signIndex: 5, house: 12 }, { name: 'Venus', signIndex: 4, house: 11 },
    { name: 'Mars', signIndex: 1, house: 8 }, { name: 'Jupiter', signIndex: 4, house: 11 },
    { name: 'Saturn', signIndex: 9, house: 4 }, { name: 'Rahu', signIndex: 10, house: 5 },
    { name: 'Ketu', signIndex: 4, house: 11 },
  ],
};
const birth = { name: 'Asha', dob: '1990-08-15', time: '10:30', place: 'New Delhi' };
const PRIVATE = ['Asha', '1990', '15 Aug', '10:30', 'New Delhi', 'Born '];
const parse = (svg: string) => new DOMParser().parseFromString(svg, 'image/svg+xml');

describe('Kundali share image', () => {
  it('shows Lagna, Rashi, Nakshatra, a chart thumbnail and the URL', () => {
    const svg = buildKundaliShareSvg(data, { birth });
    expect(svg).toContain('Kanya (Virgo)');
    expect(svg).toContain('Vrisha (Taurus)');
    expect(svg).toContain('Rohini · pada 3');
    expect(svg).toContain(SHARE_URL_LABEL);
    const doc = parse(svg);
    expect(doc.querySelector('parsererror')).toBeNull();
    const chart = doc.querySelector('svg svg')!;
    expect(chart.getAttribute('data-chart-style')).toBe('north');
    expect(chart.querySelector('g[data-house="1"] text')!.textContent).toBe('6');
  });

  it('carries NO name, birth date, time or place by default — even when they are passed', () => {
    const svg = buildKundaliShareSvg(data, { birth });
    for (const s of PRIVATE) expect(svg, s).not.toContain(s);
    expect(shareBirthLines({ birth })).toEqual([]);
    expect(buildKundaliShareSvg(data, { birth, includeBirthDetails: false })).toBe(svg);
  });

  it('adds them only when the visitor opts in', () => {
    const svg = buildKundaliShareSvg(data, { birth, includeBirthDetails: true });
    expect(svg).toContain('Asha’s Kundali');
    expect(svg).toContain('Born 15 Aug 1990 · 10:30 · New Delhi');
  });

  it('follows the chosen chart style', () => {
    const doc = parse(buildKundaliShareSvg(data, { chartStyle: 'south' }));
    expect(doc.querySelector('svg svg')!.getAttribute('data-chart-style')).toBe('south');
  });
});
