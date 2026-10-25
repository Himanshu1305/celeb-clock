/**
 * Batch 5 (goal d) — Remedies catalogue regression tests.
 *
 * Reference sources for the expected values below (all fetched 24 Oct 2026):
 *  - Beej mantras: vedicmarga.com/navagraha-beej-mantras (Shani also drikpanchang.com shani-mantras).
 *  - Temple locations: the Wikipedia / state-tourism pages listed in each temple's
 *    `verifiedFrom` (e.g. Trimbakeshwar → en.wikipedia.org/wiki/Trimbakeshwar_Shiva_Temple:
 *    "Trimbak, Nashik District, Maharashtra"; Gaya → tourism.bihar.gov.in Pitripaksha page).
 *  - "How common" fractions are arithmetic from each rule (e.g. 6 of 27 nakshatras), not data.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import {
  REMEDIES, TEMPLES, SRC, GEM_CAUTION, remedyByKey, entrySources,
  findingsFromKundali, findingsFromMatch, type RemedyEntry,
} from '@/lib/vedic/remedies';

/** Every finding the site actually detects → its remedy key. */
const DETECTED = [
  'manglik', 'kaalSarp', 'pitra', 'grahan', 'mool', 'sadeSati', 'dhaiya', 'nadi', 'bhakoot', 'gana',
  ...['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map(p => `planet:${p}`),
];

const SOURCES = new Set<string>(Object.values(SRC));
const DEVANAGARI = /[ऀ-ॿ]/;
const both = (v: { en: string; hi: string }) => v.en.trim().length > 0 && DEVANAGARI.test(v.hi);

function allText(e: RemedyEntry): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(e);
  return out;
}

describe('Remedies catalogue — coverage', () => {
  it('every detectable finding has a remedy entry', () => {
    for (const k of DETECTED) expect(remedyByKey(k), k).toBeTruthy();
  });
  it('slugs are unique and URL-safe', () => {
    const slugs = REMEDIES.map(r => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach(s => expect(s).toMatch(/^[a-z-]+$/));
  });
});

describe.each(REMEDIES.map(r => [r.key, r] as const))('entry %s — all sections, bilingual, sourced', (_k, e) => {
  it('has the meaning block (plain, how common, cancellations) in English and Hindi', () => {
    expect(both(e.name)).toBe(true);
    expect(both(e.meaning.plain)).toBe(true);
    expect(both(e.meaning.howCommon)).toBe(true);
    expect(both(e.meaning.cancellations)).toBe(true);
  });
  it('1) free remedies: mantra (Devanagari + transliteration + count), prayer, fasting, lifestyle, seva', () => {
    expect(e.free.mantras.length).toBeGreaterThan(0);
    for (const m of e.free.mantras) {
      expect(DEVANAGARI.test(m.devanagari)).toBe(true);
      expect(m.transliteration).toMatch(/^[A-Za-z ,'-]+$/);
      expect(both(m.count)).toBe(true);
      expect(both(m.when)).toBe(true);
      expect(SOURCES.has(m.source), m.source).toBe(true);
    }
    expect(e.free.prayers.length).toBeGreaterThan(0);
    expect(e.free.lifestyle.length).toBeGreaterThan(0);
    expect(e.free.seva.length).toBeGreaterThan(0);
    for (const p of [...e.free.prayers, e.free.fasting, ...e.free.lifestyle, ...e.free.seva]) {
      expect(both(p.text)).toBe(true);
      expect(SOURCES.has(p.source), p.source).toBe(true);
    }
  });
  it('2) daan says what, to whom and which day', () => {
    expect(e.daan.length).toBeGreaterThan(0);
    for (const d of e.daan) {
      expect(both(d.what) && both(d.toWhom) && both(d.day)).toBe(true);
      expect(SOURCES.has(d.source)).toBe(true);
    }
  });
  it('3) puja names when and whether it is home or priest', () => {
    expect(e.puja.length).toBeGreaterThan(0);
    for (const p of e.puja) {
      expect(both(p.name) && both(p.when) && both(p.note)).toBe(true);
      expect(['home', 'priest', 'home-or-priest']).toContain(p.where);
      expect(SOURCES.has(p.source)).toBe(true);
    }
  });
  it('4) temples are from the verified list, or an honest note says none is prescribed', () => {
    if (e.temples.length === 0) expect(e.templesNote && both(e.templesNote)).toBe(true);
    for (const id of e.temples) expect(TEMPLES[id], id).toBeTruthy();
  });
  it('5) gemstone section is present; 6) consult section is present', () => {
    expect(both(e.gemstone.note)).toBe(true);
    expect(both(e.consult)).toBe(true);
  });
  it('cites at least one traditional source', () => {
    expect(entrySources(e).length).toBeGreaterThan(1);
  });
  it('never promises a result and makes no medical claim', () => {
    for (const s of allText(e)) {
      // "guarantee" may only appear negated ("never guaranteed", "no … guarantee").
      for (const m of s.matchAll(/guarantee/gi)) {
        const before = s.slice(Math.max(0, (m.index ?? 0) - 40), m.index);
        expect(/\b(not|never|no|none)\b/i.test(before), s).toBe(true);
      }
      expect(/\b(cures?|heals?|healing)\b/i.test(s), s).toBe(false);
      expect(/गारंटी(?![^।]*नहीं)/.test(s), s).toBe(false);
    }
  });
});

describe('Gemstone caution (consistent with /gemstones)', () => {
  it('the standard caution covers astrologer, full chart, under-18, substitutes and trial', () => {
    expect(GEM_CAUTION.en).toMatch(/qualified astrologer/);
    expect(GEM_CAUTION.en).toMatch(/full-chart check/);
    expect(GEM_CAUTION.en).toMatch(/under 18/);
    expect(GEM_CAUTION.en).toMatch(/substitute/);
    expect(GEM_CAUTION.en).toMatch(/trial/);
    expect(GEM_CAUTION.hi).toMatch(/18 वर्ष/);
  });
  it('no gemstone is suggested for a baby (Mool) or for a matching dosha', () => {
    for (const k of ['mool', 'nadi', 'bhakoot', 'gana']) expect(remedyByKey(k)!.gemstone.planet).toBeNull();
    expect(remedyByKey('mool')!.gemstone.note.en).toMatch(/under 18/);
  });
  it('Blue Sapphire is never a general Sade Sati / Dhaiya remedy (D8)', () => {
    expect(remedyByKey('sadeSati')!.gemstone.note.en).toMatch(/NOT a general/);
    expect(remedyByKey('dhaiya')!.gemstone.note.en).toMatch(/NOT a general/);
  });
  it('Gomed / Cat’s Eye are not general Kaal Sarp remedies', () => {
    expect(remedyByKey('kaalSarp')!.gemstone.planet).toBeNull();
    expect(remedyByKey('kaalSarp')!.gemstone.note.en).toMatch(/NOT general/);
  });
});

describe('Mantra texts match the reference', () => {
  // Reference: vedicmarga.com/navagraha-beej-mantras (fetched 24 Oct 2026).
  const BEEJ: Record<string, [string, string]> = {
    Sun: ['ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', '7,000'],
    Moon: ['ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः', '11,000'],
    Mars: ['ॐ क्रां क्रीं क्रौं सः भौमाय नमः', '10,000'],
    Mercury: ['ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', '9,000'],
    Jupiter: ['ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', '19,000'],
    Venus: ['ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', '16,000'],
    Saturn: ['ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', '23,000'],
    Rahu: ['ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः', '18,000'],
    Ketu: ['ॐ स्रां स्रीं स्रौं सः केतवे नमः', '17,000'],
  };
  it.each(Object.entries(BEEJ))('%s beej mantra and traditional japa count', (planet, [text, n]) => {
    const beej = remedyByKey(`planet:${planet}`)!.free.mantras[0];
    expect(beej.devanagari).toBe(text);
    expect(beej.count.en).toContain(n);
  });
  it('Maha Mrityunjaya is cited as Rigveda 7.59.12', () => {
    const m = remedyByKey('kaalSarp')!.free.mantras[0];
    expect(m.devanagari).toContain('त्र्यम्बकं यजामहे');
    expect(m.source).toContain('Rigveda 7.59.12');
  });
});

describe('Temples — verified locations only', () => {
  // Expected values are exactly what the verifiedFrom pages state (WebFetch, 24 Oct 2026).
  const EXPECTED: Record<string, [string, string]> = {
    trimbakeshwar: ['Nashik', 'Maharashtra'],
    srikalahasti: ['Tirupati', 'Andhra Pradesh'],
    mangalnath: ['Ujjain', 'Madhya Pradesh'],
    shaniShingnapur: ['Ahilyanagar (Ahmednagar)', 'Maharashtra'],
    thirunallar: ['Karaikal', 'Puducherry (UT)'],
    thirunageswaram: ['Thanjavur', 'Tamil Nadu'],
    keezhaperumpallam: ['Mayiladuthurai', 'Tamil Nadu'],
    gayaVishnupad: ['Gaya', 'Bihar'],
    somnath: ['Gir Somnath', 'Gujarat'],
    suryanarKovil: ['Thanjavur', 'Tamil Nadu'],
    thingalur: ['Thanjavur', 'Tamil Nadu'],
    vaitheeswaran: ['Mayiladuthurai', 'Tamil Nadu'],
    thiruvenkadu: ['Mayiladuthurai', 'Tamil Nadu'],
    alangudi: ['Thiruvarur', 'Tamil Nadu'],
    kanjanur: ['Thanjavur', 'Tamil Nadu'],
  };
  const ALLOWED_HOSTS = ['en.wikipedia.org', 'www.mptourism.com', 'ujjain.nic.in', 'tourism.bihar.gov.in'];
  it('the temple list is exactly the verified set (nothing unverified slipped in)', () => {
    expect(Object.keys(TEMPLES).sort()).toEqual(Object.keys(EXPECTED).sort());
  });
  it.each(Object.entries(EXPECTED))('%s has its verified district/state and verification links', (id, [district, state]) => {
    const t = TEMPLES[id];
    expect(t.district).toBe(district);
    expect(t.state).toBe(state);
    expect(t.town.length).toBeGreaterThan(0);
    expect(both(t.name) && both(t.association)).toBe(true);
    expect(t.verifiedFrom.length).toBeGreaterThan(0);
    for (const u of t.verifiedFrom) expect(ALLOWED_HOSTS).toContain(new URL(u).hostname);
  });
  it('traditional associations requested in the brief are wired to the right findings', () => {
    expect(remedyByKey('kaalSarp')!.temples).toEqual(expect.arrayContaining(['trimbakeshwar', 'srikalahasti']));
    expect(remedyByKey('manglik')!.temples).toContain('mangalnath');
    expect(remedyByKey('sadeSati')!.temples).toEqual(expect.arrayContaining(['shaniShingnapur', 'thirunallar']));
    expect(remedyByKey('planet:Rahu')!.temples).toEqual(expect.arrayContaining(['srikalahasti', 'thirunageswaram']));
    expect(remedyByKey('planet:Ketu')!.temples).toContain('keezhaperumpallam');
    expect(remedyByKey('pitra')!.temples).toEqual(expect.arrayContaining(['gayaVishnupad', 'trimbakeshwar']));
  });
});

describe('findingsFromKundali — maps detector output to remedy entries', () => {
  // Synthetic chart (sign indices 1-based, as /api/kundali returns them).
  const base = {
    planets: [
      { name: 'Sun', signIndex: 7, house: 1, longitude: 190 },     // Libra = Sun debilitated
      { name: 'Moon', signIndex: 2, house: 8, longitude: 40 },
      { name: 'Rahu', signIndex: 7, house: 1, longitude: 200 },    // with the Sun → Pitra + Grahan
      { name: 'Ketu', signIndex: 1, house: 7, longitude: 20 },
      { name: 'Saturn', signIndex: 1, house: 7, longitude: 10 },   // Aries = Saturn debilitated
    ],
    nakshatra: { nakshatra: 'Rohini', pada: 1 },
    dasha: { mahadasha: 'Saturn', antardasha: 'Mercury' },
  };
  it('reports Manglik, full Kaal Sarp, Sade Sati, Pitra, Grahan, Mahadasha and debilitation', () => {
    const f = findingsFromKundali({ ...base, doshas: { mangalDosha: { hasDosha: true, severityLabel: 'Low' }, kaalSarp: { present: true, isPartial: false }, sadeSati: { active: true, houseOfSaturnFromMoon: 12 } } });
    const keys = f.map(x => x.key);
    expect(keys).toEqual(expect.arrayContaining(['manglik', 'kaalSarp', 'sadeSati', 'pitra', 'grahan', 'planet:Saturn', 'planet:Sun']));
    expect(keys.filter(k => k === 'planet:Saturn')).toHaveLength(1); // dasha + debilitation de-duplicated
    expect(keys).not.toContain('mool');
  });
  it('never reports a partial Kaal Sarp, and shows Dhaiya when Saturn is 8th from the Moon', () => {
    const f = findingsFromKundali({ ...base, doshas: { mangalDosha: { hasDosha: false }, kaalSarp: { present: false, isPartial: true }, sadeSati: { active: false, houseOfSaturnFromMoon: 8 } } });
    const keys = f.map(x => x.key);
    expect(keys).not.toContain('kaalSarp');
    expect(keys).not.toContain('manglik');
    expect(keys).toContain('dhaiya');
  });
  it('reports a gandamool birth star', () => {
    const f = findingsFromKundali({ ...base, nakshatra: { nakshatra: 'Mula', pada: 2 } });
    expect(f.map(x => x.key)).toContain('mool');
  });
});

describe('findingsFromMatch', () => {
  it('only uncancelled doshas and a one-sided Manglik produce remedies', () => {
    const f = findingsFromMatch([
      { name: 'Nadi Dosha', present: true, cancelled: true },
      { name: 'Bhakoot Dosha', present: true, cancelled: false },
      { name: 'Gana Dosha', present: false, cancelled: false },
    ], 'one-sided');
    expect(f.map(x => x.key)).toEqual(['bhakoot', 'manglik']);
    expect(findingsFromMatch([{ name: 'Nadi Dosha', present: true, cancelled: false }], 'mutual').map(x => x.key)).toEqual(['nadi']);
  });
});

describe('Routes — hub + one page per finding, English and Hindi', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const routes = readFileSync('scripts/prerender-routes.mjs', 'utf8');
  const titles = readFileSync('scripts/prerender-titles.mjs', 'utf8');
  it('App.tsx registers /remedies and /hi/upay', () => {
    for (const p of ['/remedies', '/remedies/:slug', '/hi/upay', '/hi/upay/:slug']) expect(app).toContain(`path="${p}"`);
  });
  it('every slug is prerendered (and so in the sitemap) and has a title', () => {
    for (const r of REMEDIES) {
      expect(routes, r.slug).toContain(`'${r.slug}'`);
      expect(titles, r.slug).toContain(`'${r.slug}':`);
    }
  });
});
