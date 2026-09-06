import { describe, it, expect } from 'vitest';
import data from '../celebrities.json';

const d = data as any;

describe('TC-EXPORT', () => {
  it('TC-EXPORT-P-01: total > 2000', () => expect(d.total).toBeGreaterThan(2000));
  it('TC-EXPORT-P-02: Indian > 2500', () => expect(d.indian_count).toBeGreaterThan(2500));
  it('TC-EXPORT-P-03: all have slugs', () => expect(d.celebrities.filter((c: any) => !c.slug).length).toBe(0));
  it('TC-EXPORT-P-04: no duplicate slugs', () => { const s = d.celebrities.map((c: any) => c.slug); expect(new Set(s).size).toBe(s.length); });
  it('TC-EXPORT-P-05: Virat slug = "virat-kohli"', () => expect(d.celebrities.find((c: any) => c.name === 'Virat Kohli')?.slug).toBe('virat-kohli'));
  it('TC-EXPORT-P-06: Prabhupada included', () => expect(d.celebrities.find((c: any) => c.name.includes('Prabhupada'))?.slug).toBeTruthy());
  it('TC-EXPORT-P-07: Obama included', () => expect(d.celebrities.find((c: any) => c.name === 'Barack Obama')).toBeTruthy());
  it('TC-EXPORT-N-01: Hitler ID 3503 absent', () => expect(d.celebrities.map((c: any) => c.id)).not.toContain(3503));
  it('TC-EXPORT-N-02: no uppercase in slugs', () => { d.celebrities.forEach((c: any) => { if (c.slug) expect(c.slug, c.name).toMatch(/^[a-z0-9-]+$/); }); });
  it('TC-EXPORT-EDGE-01: generated_at is valid date', () => expect(new Date(d.generated_at).getTime()).not.toBeNaN());
});
