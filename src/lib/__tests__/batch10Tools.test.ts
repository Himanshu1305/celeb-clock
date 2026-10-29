/**
 * Batch 10 tool libraries, each checked against a public calculator / published worked
 * example (all pages opened 29 Oct 2026; cited in the library files):
 *  • Lo Shu grid — astromedha.in worked example 15 Aug 1982.
 *  • Kua number — lovetoknow.com worked examples (1981, 1985, 2005), roxyapi.com documented
 *    examples (man 20 Jan 2000 → solar 1999 → 1; woman 15 Jul 1990 → raw 5 → 8); Lichun
 *    instants vs the Hong Kong Observatory solar-term tables (2014, 2015) and its 2026
 *    calendar (Spring Commences 4 Feb 2026).
 *  • Vehicle number — astromitra.com (MH 12 PK 4521 → 34 → 7, Chaldean full plate) and
 *    astroyogi.com (DL-12-XY-1234, last block 1+2+3+4 = 10 → 1).
 *  • Love calculator — Chaldean letter values as astromitra prints them (M4 H5 P8 K2);
 *    deterministic and order-independent.
 *  • Biodata horoscope — Swiss Ephemeris golden charts (moon sign, lagna, nakshatra-pada)
 *    and AstroSage's Manglik column for the round-2 panel.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { loShuGrid } from '../loShuGrid';
import { kuaNumber, kuaForSolarYear, lichunInstant } from '../kuaNumber';
import { vehicleNumber, vehicleOwnerHarmony } from '../numerologyTools';
import { nameLove } from '../nameLove';
import { biodataHoroscope } from '../vedic/biodataHoroscope';
import { buildBiodataHtml } from '../pdf/biodataPdfHtml';
import golden from '../vedic/__tests__/golden/goldenCharts.json';

describe('Lo Shu grid', () => {
  it('astromedha example 15 Aug 1982: digits 1,5,8,1,9,8,2; 1 and 8 twice; missing 3,4,6,7', () => {
    const r = loShuGrid('1982-08-15');
    expect(r.digits).toEqual([1, 5, 8, 1, 9, 8, 2]);
    expect(r.counts).toMatchObject({ 1: 2, 2: 1, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 2, 9: 1 });
    expect(r.missing).toEqual([3, 4, 6, 7]);
    expect(r.repeated).toEqual([{ n: 1, count: 2 }, { n: 8, count: 2 }]);
    expect(r.completePlanes.map(p => p.id)).toEqual(['will', 'silver']); // 9-5-1 and 2-5-8
  });
  it('zeros are struck out and the magic square adds to 15 on every line', () => {
    expect(loShuGrid('2000-10-01').digits).toEqual([1, 1, 2]);
    for (const p of loShuGrid('2000-10-01').planes) expect(p.numbers.reduce((a, b) => a + b, 0)).toBe(15);
  });
  it('no fear words in readings', () => {
    const t = JSON.stringify(loShuGrid('1999-09-09'));
    expect(t).not.toMatch(/curse|danger|bad luck|unlucky|doom/i);
  });
});

describe('Kua number', () => {
  it.each([
    [1981, 'female', 5], [1981, 'male', 1], [1985, 'female', 9], [1985, 'male', 6], [2005, 'female', 2], [2005, 'male', 4],
  ] as const)('lovetoknow: %i %s → raw %i', (y, g, raw) => {
    expect(kuaForSolarYear(y, g).raw).toBe(raw);
  });
  it('Kua 5 → 2 for men, 8 for women (SCMP); groups and directions (lovetoknow)', () => {
    const f = kuaForSolarYear(1981, 'female');
    expect(f).toMatchObject({ raw: 5, kua: 8, reassigned: true, group: 'West' });
    expect(f.lucky).toEqual({ wealth: 'SW', love: 'W', health: 'NW', growth: 'NE' });
    expect(kuaForSolarYear(1981, 'male')).toMatchObject({ kua: 1, group: 'East', lucky: { wealth: 'SE', love: 'S', health: 'E', growth: 'N' } });
  });
  it('roxyapi examples: man 20 Jan 2000 → solar year 1999 → 1; woman 15 Jul 1990 → 8', () => {
    const m = kuaNumber('2000-01-20', 'male');
    expect(m.boundary).toBe('before');
    expect(m.main).toMatchObject({ solarYear: 1999, kua: 1, group: 'East' });
    expect(kuaNumber('1990-07-15', 'female').main).toMatchObject({ raw: 5, kua: 8 });
  });
  it('men: equals SCMP’s “11 − four-digit sum” for every year 1900–2099 (0 → 9)', () => {
    const red = (n: number) => { let v = n; while (v > 9) v = String(v).split('').reduce((s, d) => s + +d, 0); return v; };
    for (let y = 1900; y <= 2099; y++) expect(kuaForSolarYear(y, 'male').raw, String(y)).toBe(red(11 - red(String(y).split('').reduce((s, d) => s + +d, 0))) || 9);
  });
  it('Lichun = Hong Kong Observatory times (Spring Commences, HKT = UTC+8) within 2 minutes', () => {
    const hkt = (d: Date) => new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 16);
    const near = (got: Date, want: string) => Math.abs(got.getTime() - Date.parse(`${want}:00+08:00`)) < 2 * 60000;
    expect(near(lichunInstant(2014), '2014-02-04T06:03'), hkt(lichunInstant(2014))).toBe(true);
    expect(near(lichunInstant(2015), '2015-02-04T11:58'), hkt(lichunInstant(2015))).toBe(true);
    expect(hkt(lichunInstant(2026)).slice(0, 10)).toBe('2026-02-04');
  });
  it('born on the Lichun date → both readings shown', () => {
    const r = kuaNumber('2026-02-04', 'female');
    expect(r.boundary).toBe('on');
    expect(r.main.solarYear).toBe(2026);
    expect(r.alternative?.solarYear).toBe(2025);
    expect(kuaNumber('2026-02-03', 'female').main.solarYear).toBe(2025);
  });
});

describe('Vehicle number', () => {
  it('astromitra: MH 12 PK 4521 full plate (Chaldean letters) = 34 → 7', () => {
    const v = vehicleNumber('MH 12 PK 4521');
    expect(v.fullPlate.letters.map(l => `${l.ch}${l.value}`)).toEqual(['M4', 'H5', 'P8', 'K2']);
    expect(v.fullPlate).toMatchObject({ total: 34, root: 7 });
  });
  it('astroyogi: DL-12-XY-1234 last block = 10 → 1; all digits 1+2+1+2+3+4 = 13 → 4', () => {
    const v = vehicleNumber('DL-12-XY-1234');
    expect(v.lastBlock).toMatchObject({ sum: 10, root: 1 });
    expect(v.allDigits).toMatchObject({ sum: 13, root: 4 });
  });
  it('harmony with Mulank uses the friendly-number table', () => {
    expect(vehicleOwnerHarmony(4, 4)).toBe('same');
    expect(vehicleOwnerHarmony(1, 3)).toBe('harmonious');
    expect(vehicleOwnerHarmony(8, 1)).toBe('neutral');
  });
});

describe('Love calculator (for fun, deterministic)', () => {
  it('Chaldean name numbers; order does not matter; same input → same output', () => {
    const r1 = nameLove('Shah Rukh Khan', 'Gauri Khan')!;
    const r2 = nameLove('Gauri Khan', 'Shah Rukh Khan')!;
    expect(r1.a.total).toBe(42);           // same as the /numerology Chaldean test
    expect(r1.a.number).toBe(6);
    expect(r1.tier).toBe(r2.tier);
    expect(JSON.stringify(nameLove('Shah Rukh Khan', 'Gauri Khan'))).toBe(JSON.stringify(r1));
  });
  it('tiers: same number / friendly / different rhythms', () => {
    expect(nameLove('A', 'I')!.tier).toBe('same');           // 1 and 1
    expect(nameLove('A', 'C')!.tier).toBe('harmonious');     // 1 and 3
    expect(nameLove('F', 'A')!.tier).toBe('growth');         // 8 and 1
  });
  it('never uses randomness', () => {
    expect(readFileSync('src/lib/nameLove.ts', 'utf8')).not.toMatch(/Math\.random|crypto\./);
  });
  it('empty names give no result', () => { expect(nameLove('123', 'Ravi')).toBeNull(); });
});

type GoldenChart = {
  id: string; edgeCase: string; utc: string; birth: { lat: number; lon: number };
  expected: { lagna: string; moonSign: string; nakshatra: string; pada: number; manglik: { level: 'None' | 'Low' | 'High'; astrosageLevel?: 'None' | 'Low' | 'High' } };
};
const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

describe('Biodata horoscope (browser chart) = Swiss Ephemeris golden charts + AstroSage Manglik', () => {
  // All 20 golden charts (incl. the cusp, DST and polar edge cases): Swiss positions with the
  // stated Manglik rule applied (expected.manglik.level) and, where recorded, AstroSage's level.
  const panel = (golden as unknown as { charts: GoldenChart[] }).charts;
  it('has the 20 golden charts', () => expect(panel.length).toBe(20));
  for (const c of panel) {
    it(`${c.id}: Moon sign, Lagna, nakshatra-pada, Manglik`, () => {
      const h = biodataHoroscope(new Date(c.utc), c.birth.lat, c.birth.lon, 'en');
      expect(RASHI[h.facts.moonSignIndex]).toBe(c.expected.moonSign);
      expect(RASHI[h.facts.lagnaSignIndex]).toBe(c.expected.lagna);
      expect(h.facts.nakshatra).toBe(c.expected.nakshatra);
      expect(h.facts.pada).toBe(c.expected.pada);
      expect(h.facts.manglikLevel).toBe(c.expected.manglik.level);
      if (c.expected.manglik.astrosageLevel) expect(h.facts.manglikLevel).toBe(c.expected.manglik.astrosageLevel);
      expect(h.manglik.startsWith(h.facts.manglikLevel === 'None' ? 'No' : 'Yes')).toBe(true);
    });
  }
  it('Hindi values', () => {
    const c = panel[0];
    const h = biodataHoroscope(new Date(c.utc), c.birth.lat, c.birth.lon, 'hi');
    expect(h.rashi).toMatch(/[ऀ-ॿ]/);
    expect(h.nakshatra).toContain('चरण');
  });
});

describe('Biodata A4 HTML', () => {
  const data = { fullName: 'Asha <Verma>', dob: '1996-08-31', birthTime: '13:04', education: 'B.Com', gotra: 'Kashyap', fatherName: 'R. Verma', expectations: 'Kind & honest' };
  it('escapes text, formats date/time and leaves empty fields off the page', () => {
    const html = buildBiodataHtml(data, { template: 'classic', lang: 'en' });
    expect(html).toContain('Asha &lt;Verma&gt;');
    expect(html).toContain('31 August 1996');
    expect(html).toContain('1:04 PM');
    expect(html).toContain('Kind &amp; honest');
    expect(html).not.toContain('Height');           // blank → omitted
    expect(html).not.toContain('Contact');          // whole empty section omitted
    expect(html).toContain('@page { size: A4');
  });
  it('Hindi labels and three distinct templates', () => {
    expect(buildBiodataHtml(data, { template: 'modern', lang: 'hi' })).toContain('गोत्र');
    const t = (['classic', 'modern', 'traditional'] as const).map(template => buildBiodataHtml(data, { template, lang: 'en' }));
    expect(new Set(t).size).toBe(3);
  });
  it('only image data URLs are accepted for the photo', () => {
    expect(buildBiodataHtml({ ...data, photo: 'javascript:alert(1)' }, { template: 'classic', lang: 'en' })).not.toContain('javascript:');
    expect(buildBiodataHtml({ ...data, photo: 'data:image/png;base64,iVBORw0KGgo=' }, { template: 'classic', lang: 'en' })).toContain('<img src="data:image/png;base64,iVBORw0KGgo="');
  });
  it('no network: the biodata page code never calls fetch or supabase', () => {
    const src = readFileSync('src/pages/MarriageBiodataPage.tsx', 'utf8') + readFileSync('src/lib/pdf/biodataPdfHtml.ts', 'utf8');
    expect(src).not.toMatch(/\bfetch\(|supabase|localStorage/);
  });
});
