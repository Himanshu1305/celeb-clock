import { describe, it, expect } from 'vitest';
import data from '../celebrities.json';

describe('Celebrity Export Validation — TC-EXPORT', () => {
  it('TC-EXPORT-P-01: total > 2000 celebrities', () => {
    expect(data.total).toBeGreaterThan(2000);
  });
  it('TC-EXPORT-P-02: indian_count ≥ 2000', () => {
    expect(data.indian_count).toBeGreaterThanOrEqual(2000);
  });
  it('TC-EXPORT-P-03: all entries have a slug', () => {
    const noSlug = data.celebrities.filter((c: any) => !c.slug);
    expect(noSlug.length).toBe(0);
  });
  it('TC-EXPORT-P-04: all entries have a name', () => {
    const noName = data.celebrities.filter((c: any) => !c.name);
    expect(noName.length).toBe(0);
  });
  it('TC-EXPORT-P-05: no duplicate slugs', () => {
    const slugs = data.celebrities.map((c: any) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('TC-EXPORT-P-06: all slugs URL-safe', () => {
    const bad = data.celebrities.filter((c: any) => !/^[a-z0-9-]+$/.test(c.slug));
    expect(bad.length, `Bad slugs: ${bad.slice(0, 5).map((c: any) => c.slug).join(', ')}`).toBe(0);
  });
  it('TC-EXPORT-N-01: blocked IDs absent (Hitler=3503, Stalin=3522, 3567, 3690)', () => {
    const ids = data.celebrities.map((c: any) => c.id);
    [3503, 3522, 3567, 3690].forEach(id => expect(ids).not.toContain(id));
  });
  it('TC-EXPORT-N-02: valid JSON structure', () => {
    expect(data.generated_at).toBeTruthy();
    expect(Array.isArray(data.celebrities)).toBe(true);
  });
  it('TC-EXPORT-EDGE-01: Prabhupada in export with a slug', () => {
    const p = data.celebrities.find((c: any) => c.name.includes('Prabhupada'));
    expect(p).toBeTruthy();
    expect(p?.slug).toBeTruthy();
  });
  it('TC-EXPORT-EDGE-02: Virat Kohli slug preserved exactly', () => {
    const v = data.celebrities.find((c: any) => c.name === 'Virat Kohli');
    expect(v?.slug).toBe('virat-kohli');
  });
});
