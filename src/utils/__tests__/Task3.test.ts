import { describe, it, expect } from 'vitest';

describe('TC-PANCHANG', () => {
  it('TC-PANCHANG-P-01: imports', async () => {
    await expect(import('@fusionstrings/panchangam')).resolves.toBeDefined();
  });
  it('TC-PANCHANG-P-02: has callable exports', async () => {
    const mod = await import('@fusionstrings/panchangam');
    expect(Object.values(mod).filter(v => typeof v === 'function').length).toBeGreaterThan(0);
  });
  it('TC-PANCHANG-P-03: MIT license', () => {
    expect(require('@fusionstrings/panchangam/package.json').license).toBe('MIT');
  });
  it('TC-PANCHANG-P-04: version >= 0.2', () => {
    expect(parseInt(require('@fusionstrings/panchangam/package.json').version.split('.')[1])).toBeGreaterThanOrEqual(2);
  });
  it('TC-PANCHANG-N-01: no .se1 data files (Moshier/WASM mode)', () => {
    const fs = require('fs');
    expect(fs.readdirSync('node_modules/@fusionstrings/panchangam').some((f: string) => f.endsWith('.se1'))).toBe(false);
  });
  it('TC-PANCHANG-EDGE-01: resolves not rejects', async () => {
    await expect(import('@fusionstrings/panchangam')).resolves.toBeDefined();
  });
  it('TC-PANCHANG-P-05: calculate_nakshatra + p_julday are callable', async () => {
    const p: any = await import('@fusionstrings/panchangam');
    const jd = p.p_julday(1988, 11, 5, 7.0, 1);
    const nak = p.calculate_nakshatra(jd, p.AyanamshaMode.Lahiri);
    expect(nak.name).toBeTruthy();
    expect(nak.index).toBeGreaterThanOrEqual(1);
    expect(nak.index).toBeLessThanOrEqual(27);
  });
});
