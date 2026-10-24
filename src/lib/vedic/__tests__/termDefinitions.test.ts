import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  VEDIC_TERMS, getTermDef, glossInline, termSlug, glossaryHref, searchGlossary, glossaryEntries,
  CATEGORY_LABELS, PORUTHAM_TERM, MATCH_DOSHA_TERM, CHOGHADIYA_TERM, yogaTermId, type TermCategory,
} from '../termDefinitions';

// ── helpers: scan the real UI source for every term key it uses ──────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (f === '__tests__' || f === 'node_modules') continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(f)) out.push(p);
  }
  return out;
}
const SRC = walk('src');
const read = (p: string) => readFileSync(p, 'utf8');

/** Literal ids: <TermTip id="x" …> anywhere in the UI. */
function literalTermIds(): Array<{ id: string; file: string }> {
  const out: Array<{ id: string; file: string }> = [];
  for (const file of SRC) {
    const s = read(file);
    for (const m of s.matchAll(/<TermTip\b[^>]*?\bid="([^"]+)"/g)) {
      if (/^\.+$/.test(m[1])) continue; // doc-comment placeholder `id="..."`
      out.push({ id: m[1], file });
    }
  }
  return out;
}
/** Values of every `*_TERM` lookup map in the UI (the dynamic `id={MAP[x]}` sources). */
function mapTermIds(): Array<{ id: string; file: string }> {
  const out: Array<{ id: string; file: string }> = [];
  for (const file of SRC) {
    const s = read(file);
    for (const m of s.matchAll(/const\s+[A-Z_]+_TERM\b[^=]*=\s*\{([\s\S]*?)\};/g)) {
      for (const v of m[1].matchAll(/:\s*'([^']+)'/g)) out.push({ id: v[1], file });
    }
  }
  return out;
}

describe('Glossary — every term key used in the UI has a definition', () => {
  it('scans a meaningful number of TermTip usages', () => {
    expect(literalTermIds().length).toBeGreaterThan(100);
  });

  it('every <TermTip id="…"> literal resolves to a definition', () => {
    const missing = literalTermIds().filter(u => !getTermDef(u.id)).map(u => `${u.id} (${u.file})`);
    expect(missing, `Undefined term ids:\n${missing.join('\n')}`).toEqual([]);
  });

  it('every *_TERM lookup map value resolves to a definition', () => {
    const ids = mapTermIds();
    expect(ids.length).toBeGreaterThan(20);
    const missing = ids.filter(u => !getTermDef(u.id)).map(u => `${u.id} (${u.file})`);
    expect(missing, `Undefined mapped ids:\n${missing.join('\n')}`).toEqual([]);
  });

  it('dosha remedy cards point at defined terms', () => {
    const s = read('src/lib/vedic/doshaRemedies.ts');
    const ids = [...s.matchAll(/termId:\s*'([^']+)'/g)].map(m => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(getTermDef(id), id).toBeTruthy();
  });

  it('every dynamic TermTip id in the UI comes from a known source', () => {
    // Any id={…} must use a *_TERM map, yogaTermId, d.termId, or the Rahu/Ketu name — so the
    // map/literal checks above cover it. A new dynamic source must be added here deliberately.
    const allowed = /^(?:[A-Z_]+_TERM\[|yogaTermId\(|d\.termId|p\.name\.toLowerCase\(\))/;
    const bad: string[] = [];
    for (const file of SRC) {
      for (const m of read(file).matchAll(/<TermTip\b[^>]*?\bid=\{([^}]+)\}/g)) {
        if (!allowed.test(m[1].trim())) bad.push(`${m[1]} (${file})`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('the exported key maps resolve (poruthams, matching doshas, Choghadiya, yogas, Rahu/Ketu)', () => {
    for (const id of [...Object.values(PORUTHAM_TERM), ...Object.values(MATCH_DOSHA_TERM), ...Object.values(CHOGHADIYA_TERM), 'rahu', 'ketu']) {
      expect(getTermDef(id), id).toBeTruthy();
    }
    for (const name of ['Raj Yoga', 'Dhana Yoga', 'Gaja Kesari Yoga', 'Budha-Aditya Yoga', 'Chandra-Mangal Yoga',
      'Ruchaka Yoga (Pancha Mahapurusha)', 'Neecha Bhanga Raja Yoga (Mars)']) {
      const id = yogaTermId(name);
      expect(id, name).toBeTruthy();
      expect(getTermDef(id!), name).toBeTruthy();
    }
  });

  it('every Hindi-page TermTip (lang="hi") has a Hindi name and Hindi explanation', () => {
    const missing: string[] = [];
    for (const file of SRC) {
      for (const m of read(file).matchAll(/<TermTip\b([^>]*?)>/g)) {
        if (!/lang="hi"/.test(m[1])) continue;
        const lit = m[1].match(/\bid="([^"]+)"/);
        if (lit) { const d = getTermDef(lit[1]); if (!d?.hi || !d?.hiTerm) missing.push(lit[1]); }
      }
    }
    for (const id of Object.values(CHOGHADIYA_TERM)) { const d = getTermDef(id)!; if (!d.hi || !d.hiTerm) missing.push(id); }
    expect(missing).toEqual([]);
  });
});

describe('Glossary — coverage of every result area named in the brief', () => {
  const required: Record<string, string[]> = {
    chart: ['kundali', 'lagna', 'rashi', 'nakshatra', 'pada', 'graha', 'bhava', 'rahu', 'ketu', 'retrograde', 'planetDegree', 'ayanamsa', 'kendra', 'trikona', 'yogakaraka', 'northSouthChart'],
    dasha: ['dasha', 'vimshottari', 'mahadasha', 'antardasha', 'pratyantardasha', 'sookshma', 'prana'],
    kootas: ['ashtakoota', 'koota', 'varna', 'vashya', 'tara', 'yoni', 'grahaMaitri', 'gana', 'bhakoot', 'nadi', 'nadiDosha', 'bhakootDosha', 'ganaDosha', 'doshaCancellation'],
    poruthams: ['porutham', 'dinaPorutham', 'ganaPorutham', 'mahendraPorutham', 'streeDeerghaPorutham', 'yoniPorutham', 'rasiPorutham', 'rasyadhipathiPorutham', 'vasyaPorutham', 'rajjuPorutham', 'vedhaPorutham'],
    panchang: ['panchang', 'tithi', 'paksha', 'panchangNakshatra', 'panchangYoga', 'karana', 'vara', 'rahuKalam', 'gulikaKaal', 'yamaganda', 'choghadiya', 'abhijit', 'hora', 'muhurat'],
    doshas: ['dosha', 'manglik', 'manglikParihara', 'kaalsarp', 'kaalSarpType', 'sadeSati', 'sadeSatiPhase', 'dhaiya', 'pitraDosha', 'moolDosha', 'grahanDosha'],
    strength: ['shadbala', 'virupas', 'rupa', 'strengthCategory'],
    divisional: ['varga', 'd1', 'navamsa', 'dasamsa', 'shashtiamsa'],
    yogas: ['yoga', 'yogaGrade', 'rajYoga', 'gajaKesari'],
    other: ['gochar', 'rashifal', 'lifePath', 'masterNumber', 'tarot', 'majorArcana', 'ratna', 'navratna', 'chineseZodiac', 'chineseElement', 'yinYang', 'biorhythm'],
  };
  for (const [area, ids] of Object.entries(required)) {
    it(`covers ${area}`, () => { for (const id of ids) expect(getTermDef(id), id).toBeTruthy(); });
  }
  it('every category has at least one term and a label', () => {
    const cats = new Set(Object.values(VEDIC_TERMS).map(d => d.category));
    for (const c of Object.keys(CATEGORY_LABELS) as TermCategory[]) expect(cats.has(c), c).toBe(true);
  });
});

describe('Glossary — content quality', () => {
  it('every entry is impact-first, categorised, and has a Hindi name + Hindi explanation', () => {
    for (const [k, d] of Object.entries(VEDIC_TERMS)) {
      expect(d.term && d.term.length > 0, k).toBe(true);
      expect(d.impact && d.impact.length > 0, k).toBe(true);
      expect(d.category, k).toBeTruthy();
      expect(d.hiTerm, `${k} hiTerm`).toBeTruthy();
      expect(d.hi && /[ऀ-ॿ]/.test(d.hi), `${k} hi`).toBe(true);
    }
  });
  it('the plain-language impact line is short (at most two sentences)', () => {
    for (const [k, d] of Object.entries(VEDIC_TERMS)) {
      const sentences = d.impact.split(/[.!?](?:\s|$)/).filter(x => x.trim().length > 0);
      expect(sentences.length, k).toBeLessThanOrEqual(2);
    }
  });
  it('no fear language in any explanation', () => {
    const fear = /\b(death|die|dies|widow|divorce|doom(ed)?|cursed|danger(ous)?|terrible|fatal)\b/i;
    for (const [k, d] of Object.entries(VEDIC_TERMS)) {
      for (const t of [d.impact, d.why, d.guidance, d.learnMore]) if (t) expect(fear.test(t), `${k}: ${t}`).toBe(false);
    }
  });
  it('gemstone entry carries the qualified-astrologer and under-18 caution', () => {
    const r = getTermDef('ratna')!;
    expect(r.guidance).toMatch(/qualified astrologer/i);
    expect(r.guidance).toMatch(/under-18/i);
  });
  it('Manglik text states the AstroSage convention (houses 1,4,7,8,12 from Lagna AND Moon)', () => {
    const m = getTermDef('manglik')!;
    expect(m.why).toMatch(/1st, 4th, 7th, 8th or 12th/);
    expect(m.why).toMatch(/Lagna or from the Moon/);
    expect(m.why).not.toMatch(/2nd/);
  });
  it('koota maximum points match the classical 1-2-3-4-5-6-7-8 table (total 36)', () => {
    const pts = ['varna', 'vashya', 'tara', 'yoni', 'grahaMaitri', 'gana', 'bhakoot', 'nadi']
      .map(id => Number(getTermDef(id)!.term.match(/\((\d) points?\)/)![1]));
    expect(pts).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(pts.reduce((a, b) => a + b, 0)).toBe(36);
  });
});

describe('Glossary — lookup, anchors and search', () => {
  it('the sitewide-missing term (ayanamsa) is defined once, impact-first', () => {
    const d = getTermDef('ayanamsa')!;
    expect(d.impact).toMatch(/why your Vedic sign can differ/i);
    expect(d.why).toMatch(/sidereal|Lahiri/i);
  });
  it('getTermDef is case-insensitive; unknown → null', () => {
    expect(getTermDef('LAGNA')?.term).toMatch(/Lagna/);
    expect(getTermDef('not-a-term')).toBeNull();
  });
  it('glossInline returns a short parenthetical for prose, "" for unknown', () => {
    expect(glossInline('shadbala')).toMatch(/strong/i);
    expect(glossInline('nope')).toBe('');
  });
  it('anchors are SEO-friendly kebab-case and unique', () => {
    expect(termSlug('rahuKalam')).toBe('rahu-kalam');
    expect(termSlug('RAHUKALAM')).toBe('rahu-kalam');
    expect(glossaryHref('grahaMaitri')).toBe('/glossary#graha-maitri');
    const slugs = glossaryEntries().map(e => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
  it('entries are sorted A–Z by display name', () => {
    const names = glossaryEntries().map(e => e.def.term.toLowerCase());
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });
  it('search finds by English name, alias and Hindi name; name matches rank first', () => {
    expect(searchGlossary('rahu kaal')[0].id).toBe('rahuKalam');
    expect(searchGlossary('Gulikai').map(e => e.id)).toContain('gulikaKaal');
    expect(searchGlossary('लग्न').map(e => e.id)).toContain('lagna');
    expect(searchGlossary('').length).toBe(Object.keys(VEDIC_TERMS).length);
    expect(searchGlossary('zzzz-no-such-term')).toEqual([]);
  });
});
