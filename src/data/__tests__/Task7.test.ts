import { describe, it, expect } from 'vitest';
import bios from '../celebrity-bios.json';

const ENTRIES = Object.entries(bios as Record<string, string>);

describe('TC-BIOS', () => {
  it('TC-BIOS-P-01: > 1000 bios', () => expect(ENTRIES.length).toBeGreaterThan(1000));
  it('TC-BIOS-P-02: all >= 100 chars', () => expect(ENTRIES.filter(([, b]) => b.length < 100).length).toBe(0));
  it('TC-BIOS-P-03: Virat bio exists', () => expect((bios as any)['virat-kohli']?.length).toBeGreaterThan(100));
  it('TC-BIOS-P-04: SRK bio mentions film/Bollywood/actor', () => expect(((bios as any)['shah-rukh-khan'] || '').toLowerCase()).toMatch(/film|bollywood|actor/));
  it('TC-BIOS-P-05: Prabhupada (if present) mentions ISKCON/Krishna', () => { const b = (bios as any)['srila-prabhupada'] || (bios as any)['ac-bhaktivedanta-swami-prabhupada'] || ''; if (b) expect(b.toLowerCase()).toMatch(/iskcon|krishna|vaishnav/); });
  it('TC-BIOS-N-01: no empty bios', () => expect(ENTRIES.filter(([, b]) => !b.trim()).length).toBe(0));
  it('TC-BIOS-N-02: no AI refusal language', () => { const BAD = ['i cannot', 'as an ai']; ENTRIES.forEach(([s, b]) => BAD.forEach(p => expect(b.toLowerCase(), s).not.toContain(p))); });
  it('TC-BIOS-N-03: no undefined/TODO', () => { ENTRIES.forEach(([s, b]) => { expect(b, s).not.toContain('undefined'); expect(b, s).not.toContain('TODO'); }); });
  it('TC-BIOS-N-04: >90% unique', () => { const u = new Set(ENTRIES.map(([, b]) => b.slice(0, 100))); expect(u.size).toBeGreaterThan(ENTRIES.length * 0.9); });
  it('TC-BIOS-EDGE-01: all slugs URL-safe', () => { Object.keys(bios).forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/)); });
});
