import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Auto Bio Script — TC-AUTOBIO', () => {
  it('TC-AUTOBIO-P-01: module imports without executing / throwing', async () => {
    const mod = await import('../auto-bio-fill');
    expect(typeof mod.run).toBe('function');
    expect(typeof mod.nameToSlug).toBe('function');
    expect(mod.nameToSlug('Virat Kohli')).toBe('virat-kohli');
  });

  it('TC-AUTOBIO-N-01: run() exits gracefully with no GEMINI_API_KEY (no throw)', async () => {
    const mod = await import('../auto-bio-fill');
    const originalV = process.env.VITE_GEMINI_API_KEY;
    const originalG = process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    let result: any;
    await expect(async () => { result = await mod.run(50); }).not.toThrow();
    // With missing key: either nothing to do (generated 0) or skipped>0, never a crash.
    expect(result.generated).toBe(0);
    if (originalV !== undefined) process.env.VITE_GEMINI_API_KEY = originalV;
    if (originalG !== undefined) process.env.GEMINI_API_KEY = originalG;
  });

  it('TC-AUTOBIO-EDGE-01: GitHub Actions YAML has valid structure, no hardcoded secrets', () => {
    const yaml = readFileSync('.github/workflows/deploy.yml', 'utf8');
    expect(yaml).toContain('name:');
    expect(yaml).toContain('on:');
    expect(yaml).toContain('jobs:');
    expect(yaml).not.toContain('YOUR_SECRET');
    expect(yaml).not.toMatch(/eyJ[A-Za-z0-9+/=]{20,}/); // no base64 JWT keys
  });
});
