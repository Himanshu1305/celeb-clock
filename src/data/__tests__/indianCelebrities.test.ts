import { describe, it, expect } from 'vitest';
import { INDIAN_CELEBRITIES } from '@/data/indianCelebrities';

describe('indianCelebrities — TC-HERO', () => {
  it('TC-HERO-P-01: Prabhupada in array', () => {
    const found = INDIAN_CELEBRITIES.find(c => c.name.includes('Prabhupada'));
    expect(found).toBeTruthy();
  });
  it('TC-HERO-P-02: Prabhupada has all required fields', () => {
    const c = INDIAN_CELEBRITIES.find(c => c.name.includes('Prabhupada'))!;
    expect(c.birth_date).toBe('1896-09-01');
    expect(c.known_for).toBeTruthy();
    expect(c.category).toBeTruthy();
    expect(c.nationality).toBe('Indian');
  });
  it('TC-HERO-EDGE-01: Prabhupada name is URL-safe as a slug', () => {
    const c = INDIAN_CELEBRITIES.find(c => c.name.includes('Prabhupada'))!;
    const slug = c.name.toLowerCase().replace(/[.']/g, '').replace(/\s+/g, '-');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});
