// Batch 8: the sourced "local guide" data for the 50 Panchang city pages.
// Every line was taken from the page in its `source` field (opened with WebFetch on
// 26 Oct 2026); these tests guard the shape, the source domains, the Hindi text for the
// 10 Hindi cities, and that satellite cities carry their own facts, not the parent's.
import { describe, it, expect } from 'vitest';
import local from '../panchangCityLocal.json';
import { PANCHANG_CITY_SLUGS, HINDI_PANCHANG_SLUGS } from '@/lib/seo/panchangSlugs';

type Fact = { name: string; line: string; source: string; nameHi?: string; lineHi?: string };
type City = { temples?: Fact[]; festivals?: Fact[] };
const CITIES = (local as { cities: Record<string, City> }).cities;
const facts = (c: City) => [...(c.temples ?? []), ...(c.festivals ?? [])];

// Wikipedia, official temple / district (nic.in, gov.in) / state-tourism sites, Incredible India.
const ALLOWED = [
  /^https:\/\/en\.wikipedia\.org\/wiki\//,
  /^https:\/\/(www\.|prod\.)?incredibleindia\.gov\.in\//,
  /^https:\/\/[a-z]+\.nic\.in\//,
  /^https:\/\/[a-z]+\.gov\.in\//,
  /^https:\/\/visakhapatnam\.ap\.gov\.in\//,
  /^https:\/\/tamilnadutourism\.tn\.gov\.in\//,
  /^https:\/\/www\.mptourism\.com\//,
  /^https:\/\/karnatakatourism\.org\//,
  /^https:\/\/mtdc\.co\//,
  /^https:\/\/prayagraj\.rkmm\.org\//,
];

describe('panchangCityLocal.json', () => {
  it('only covers the 50 Panchang cities, and has facts for every one of them', () => {
    for (const slug of Object.keys(CITIES)) expect(PANCHANG_CITY_SLUGS.has(slug), slug).toBe(true);
    expect(Object.keys(CITIES).length).toBe(50);
    for (const [slug, c] of Object.entries(CITIES)) expect(facts(c).length, slug).toBeGreaterThan(0);
  });

  it('at most 4 temples and 4 festivals per city; no empty lists or blank lines', () => {
    for (const [slug, c] of Object.entries(CITIES)) {
      for (const k of ['temples', 'festivals'] as const) {
        const l = c[k];
        if (l === undefined) continue;
        expect(l.length, `${slug} ${k}`).toBeGreaterThan(0);
        expect(l.length, `${slug} ${k}`).toBeLessThanOrEqual(4);
      }
      for (const f of facts(c)) {
        expect(f.name.trim().length, slug).toBeGreaterThan(2);
        expect(f.line.trim().length, `${slug} ${f.name}`).toBeGreaterThan(5);
        expect(f.line.length, `${slug} ${f.name}: one plain line`).toBeLessThan(200);
        expect(f.line, `${slug} ${f.name}`).toMatch(/[.]$/);
      }
    }
  });

  it('every fact carries a source URL from an allowed kind of site', () => {
    for (const [slug, c] of Object.entries(CITIES)) {
      for (const f of facts(c)) {
        expect(ALLOWED.some(r => r.test(f.source)), `${slug} ${f.name}: ${f.source}`).toBe(true);
      }
    }
  });

  it('the 10 Hindi-page cities have natural Hindi for every fact', () => {
    for (const slug of HINDI_PANCHANG_SLUGS) {
      const c = CITIES[slug];
      expect(c, slug).toBeTruthy();
      for (const f of facts(c)) {
        expect(f.nameHi, `${slug} ${f.name}`).toMatch(/[ऀ-ॿ]/);
        expect(f.lineHi, `${slug} ${f.name}`).toMatch(/[ऀ-ॿ]/);
      }
    }
  });

  it('satellite cities have their own facts, not the parent city’s', () => {
    const pairs: Array<[string, string]> = [
      ['thane', 'mumbai'], ['navi-mumbai', 'mumbai'], ['kalyan-dombivli', 'mumbai'], ['vasai-virar', 'mumbai'],
      ['howrah', 'kolkata'], ['pimpri-chinchwad', 'pune'], ['ghaziabad', 'delhi'], ['faridabad', 'delhi'],
    ];
    for (const [sat, parent] of pairs) {
      const a = facts(CITIES[sat]);
      const b = facts(CITIES[parent]);
      expect(a.length, sat).toBeGreaterThan(0);
      const lines = new Set(b.map(f => f.line));
      for (const f of a) expect(lines.has(f.line), `${sat} repeats ${parent}: ${f.line}`).toBe(false);
      const temples = new Set((CITIES[parent].temples ?? []).map(f => f.name));
      for (const f of CITIES[sat].temples ?? []) expect(temples.has(f.name), `${sat} temple ${f.name}`).toBe(false);
    }
  });
});

// Batch 9b: the Gwalior "world's very first written zero" claim is disputed. The line now
// says what the cited page says, with attribution — Wikipedia "Chaturbhuj Temple, Gwalior"
// (opened 29 Oct 2026): "this temple has the earliest known epigraphical evidence inscribed
// in stone"; "the earlier Bakhshali manuscript is regarded as the earliest existent use of zero".
describe('Gwalior zero line (Batch 9b)', () => {
  it('is attributed, sourced to the temple page, and does not claim the first zero', () => {
    const json = JSON.stringify(local);
    expect(json).not.toMatch(/very first occurrence of zero/);
    expect(json).toContain('Wikipedia notes its inscription has one of the earliest known zeros carved in stone');
    expect(json).toContain('https://en.wikipedia.org/wiki/Chaturbhuj_Temple,_Gwalior');
  });
});
