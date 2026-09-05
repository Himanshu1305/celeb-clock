import { describe, it, expect } from 'vitest';
import bios from '../celebrity-bios.json';
const entries = Object.entries(bios as Record<string,string>);

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
