import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import bios from '../celebrity-bios.json';
const entries = Object.entries(bios as Record<string,string>);

const nameToSlug = (n: string) =>
  n.toLowerCase().replace(/['’]/g, '').replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
const celebSrc = readFileSync('src/data/indianCelebrities.ts', 'utf8');
const celebNames = [...celebSrc.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

describe('Celebrity Bios Quality — TC-BIOS', () => {
  it('TC-BIOS-P-01: ≥ 575 bios generated (near-complete; data ceiling ~578 unique slugs)', () => {
    expect(Object.keys(bios).length).toBeGreaterThanOrEqual(575);
  });
  it('TC-BIOS-P-01b: ≤ 2 celebrities without a bio (all batches drained)', () => {
    const remaining = celebNames.filter(n => !(bios as Record<string, string>)[nameToSlug(n)]);
    expect(remaining.length, `Remaining: ${remaining.join(', ')}`).toBeLessThanOrEqual(2);
  });
  it('TC-BIOS-P-02: all bios ≥ 100 chars', () => {
    const short = entries.filter(([, b]) => b.length < 100);
    expect(short.length, `Short: ${short.map(([s]) => s).join(', ')}`).toBe(0);
  });
  it('TC-BIOS-P-03: all bios ≤ 300 words', () => {
    const long = entries.filter(([, b]) => b.split(/\s+/).length > 300);
    expect(long.length).toBe(0);
  });
  it('TC-BIOS-N-02: no [object Object] or undefined markers', () => {
    entries.forEach(([s, b]) => {
      expect(b, s).not.toContain('[object Object]');
      expect(b, s).not.toContain('undefined');
    });
  });
  it('TC-BIOS-EDGE-01: bios.json is serialisable', () => {
    expect(() => JSON.stringify(bios)).not.toThrow();
  });
});

describe('Celebrity Bios', () => {
  it('TC-BIO-P-01: ≥200 bios generated', () => expect(Object.keys(bios).length).toBeGreaterThanOrEqual(200));
  it('TC-BIO-P-02: all bios 50–350 words', () => {
    entries.forEach(([s, b]) => { const w = b.split(/\s+/).length; expect(w, s).toBeGreaterThanOrEqual(50); expect(w, s).toBeLessThanOrEqual(350); });
  });
  it('TC-BIO-P-03: all slugs URL-safe', () => Object.keys(bios).forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/)));
  it('TC-BIO-N-01: no undefined or AI refusal', () => {
    entries.forEach(([s, b]) => {
      expect(b, s).not.toContain('undefined');
      expect(b.toLowerCase(), s).not.toContain('i cannot');
      expect(b.toLowerCase(), s).not.toContain('as an ai');
    });
  });
  it('TC-BIO-N-02: no empty bios', () => entries.forEach(([s, b]) => expect(b.trim().length, s).toBeGreaterThan(50)));
});
