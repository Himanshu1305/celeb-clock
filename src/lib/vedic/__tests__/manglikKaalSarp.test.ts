import { describe, it, expect } from 'vitest';
import { GET } from '../../../../api/kundali-match';
import { calculateBirthChart } from '../calculateBirthChart';
import { assessManglik } from '../manglik';
import { KAAL_SARP_TYPES, classifyKaalSarp } from '../engine/kaalSarp';
import { calculateGunaMilan } from '../matchmaking';
import { buildMatchSynthesis } from '../matchSynthesis';

const REF = new Date(Date.UTC(2026, 9, 17));
// [y, m, d, h, min, lat, lon, UTC offset at birth]
const PANEL: Record<string, [number, number, number, number, number, number, number, number]> = {
  P1: [1996, 8, 31, 13, 4, 26.8467, 80.9462, 5.5],
  P2: [1999, 12, 3, 11, 3, 42.6389, -83.2910, -5],
  P3: [1990, 1, 15, 6, 30, 28.6139, 77.2090, 5.5],
  P4: [1985, 7, 20, 23, 45, 19.0760, 72.8777, 5.5],
  P6: [2001, 12, 25, 8, 0, -33.8688, 151.2093, 11],
  P7: [2002, 5, 14, 16, 45, 40.5187, -74.4121, -4],
  P8: [1995, 2, 10, 21, 40, -37.8136, 144.9631, 11],
  P9: [1978, 5, 13, 19, 30, 32.7266, 74.8570, 5.5],
  Y1: [1994, 11, 8, 6, 0, 28.6139, 77.2090, 5.5],
  Y3: [1994, 11, 5, 12, 0, 28.6139, 77.2090, 5.5],
};
const chart = (id: string) => {
  const [year, month, day, hour, minute, latitude, longitude, timezoneOffset] = PANEL[id];
  return calculateBirthChart({ year, month, day, hour, minute, latitude, longitude, timezoneOffset }, { refDate: REF });
};

/**
 * REFERENCE: AstroSage Manglik column for the 10-person panel, recorded 17 Oct 2026
 * (round2.txt, "Manglik: BornClock vs AstroSage"). "No" = None.
 */
const ASTROSAGE_MANGLIK: Record<string, 'None' | 'Low' | 'High'> = {
  P1: 'None', P2: 'High', P3: 'High', P4: 'Low', P6: 'None', P7: 'Low', P8: 'Low', P9: 'Low', Y1: 'Low', Y3: 'Low',
};

describe('Manglik = AstroSage convention (Lagna + Moon, houses 1/4/7/8/12, no 2nd)', () => {
  for (const [id, level] of Object.entries(ASTROSAGE_MANGLIK)) {
    it(`${id}: ${level}`, async () => {
      const md = (await chart(id)).doshas.mangalDosha;
      expect(md.severityLabel).toBe(level);
      expect(md.hasDosha).toBe(level !== 'None');
    });
  }
  it('P6: Mars in the 2nd from the Lagna does not count (AstroSage: No)', async () => {
    const md = (await chart('P6')).doshas.mangalDosha;
    expect(md.marsHouseFromLagna).toBe(2);
    expect(md.fromLagna).toBe(false);
  });
  it('P9: Mars with the Moon is reported from the Moon check (D1: page used to say "no dosha")', async () => {
    const md = (await chart('P9')).doshas.mangalDosha;
    expect(md.marsHouseFromMoon).toBe(1);
    expect(md.fromMoon).toBe(true);
    expect(md.hasDosha).toBe(true);
  });
  it('cancellations: exalted Mars (Sukriti) is listed, level unchanged', () => {
    const a = assessManglik({ lagnaSignIndex: 9, moonSignIndex: 6, marsSignIndex: 9 });
    expect(a.level).toBe('High');
    expect(a.cancelled).toBe(true);
    expect(a.cancellations.join()).toMatch(/exalted/);
  });
});

describe('Match page Manglik warning uses the same assessment + cancellations (M3)', () => {
  it('Sukriti (exalted Mars) one-sided with Suchit → cancelled, not an amber warning', async () => {
    const q = new URLSearchParams({
      yA: '1996', mA: '8', dA: '31', hA: '13', minA: '4', latA: '26.8467', lonA: '80.9462', tzidA: 'Asia/Kolkata',
      yB: '1999', mB: '12', dB: '3', hB: '11', minB: '3', latB: '42.6389', lonB: '-83.2910', tzidB: 'America/Detroit',
    });
    const j = await (await GET(new Request('http://localhost/api/kundali-match?' + q))).json();
    expect(j.manglik.bHasDosha).toBe(true);
    expect(j.manglik.bSeverity).toBe('High');
    expect(j.manglik.status).toBe('cancelled');
    expect(j.manglik.checks).toHaveLength(2);
    expect(j.manglik.checks[1]).toMatch(/from the Lagna.*from the Moon/);
  });
});

describe('Kaal Sarp: full by degrees only (D4)', () => {
  it('P3 Delhi 1990 → not present (Drik Panchang shows none); near-pattern is only a note', async () => {
    const ks = (await chart('P3')).doshas.kaalSarp;
    expect(ks.present).toBe(false);
    expect(ks.isPartial).toBe(true);
  });
  it('P9 → full: all 7 planets in the Ketu→Rahu arc by degree (Swiss Ephemeris, Lahiri, mean node)', async () => {
    const ks = (await chart('P9')).doshas.kaalSarp;
    expect(ks.present).toBe(true);
    expect(ks.isPartial).toBe(false);
  });
  it('a planet a few degrees outside the arc in the same sign as Rahu breaks the full pattern', () => {
    // Rahu 15° Aries; Sun at 10° Aries (behind Rahu), others inside Rahu→Ketu.
    const lons = { Sun: 10, Moon: 40, Mars: 70, Mercury: 100, Jupiter: 130, Venus: 160, Saturn: 190 };
    const r = classifyKaalSarp(lons, 15, 0);
    expect(r.present).toBe(false);
    expect(r.isPartial).toBe(true);
  });
  it('standard 12 names keyed by Rahu’s house (9 Shankhachud, 10 Ghatak)', () => {
    expect(Object.values(KAAL_SARP_TYPES)).toEqual(['Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma', 'Takshak', 'Karkotak', 'Shankhachud', 'Ghatak', 'Vishdhar', 'Sheshnag']);
  });
});

describe('Matchmaking wording (M6, M9, M11)', () => {
  it('M11: same Nakshatra and same pada → Nadi Dosha "not cancelled"', () => {
    const r = calculateGunaMilan({ nakshatra: 'Rohini', pada: 2, rashiIndex: 1 }, { nakshatra: 'Rohini', pada: 2, rashiIndex: 1 });
    const d = r.doshas.find(x => x.name === 'Nadi Dosha')!;
    expect(d.present).toBe(true);
    expect(d.cancelled).toBe(false);
    expect(d.reason).toMatch(/not cancelled/);
  });
  it('M6: Bhakoot Dosha is named', () => {
    const r = calculateGunaMilan({ nakshatra: 'Ashwini', pada: 1, rashiIndex: 0 }, { nakshatra: 'Krittika', pada: 4, rashiIndex: 1 });
    expect(r.doshas.find(x => x.name === 'Bhakoot Dosha')!.present).toBe(true);
  });
  it('M9: never calls a full-score koota "the softer spot"', () => {
    // Start from a real result, then force every lighter koota to full marks.
    const r = calculateGunaMilan({ nakshatra: 'Rohini', pada: 1, rashiIndex: 1 }, { nakshatra: 'Rohini', pada: 3, rashiIndex: 1 });
    for (const x of r.kootas) if (!x.heavy) x.score = x.max;
    const s = buildMatchSynthesis({ gunaMilan: r });
    expect(s.paragraphs.join(' ')).not.toMatch(/\)\s+is the softer spot/);
    expect(s.paragraphs[1]).toMatch(/score in full/);
  });
});
