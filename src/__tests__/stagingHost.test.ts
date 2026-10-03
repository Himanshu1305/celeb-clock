import { describe, it, expect } from 'vitest';
import { isProductionHost, DISALLOW_ALL_ROBOTS, PRODUCTION_HOSTS } from '../../functions/host';

// Part AO Step 4 — prove production stays indexable and only production runs tracking,
// while staging / previews are hidden. This guards against ever shipping a change that
// de-indexes the real site.
describe('staging host classification (Part AO)', () => {
  it('production hosts are indexable (no noindex, normal robots)', () => {
    expect(isProductionHost('bornclock.com')).toBe(true);
    expect(isProductionHost('www.bornclock.com')).toBe(true);
    expect(isProductionHost('WWW.BORNCLOCK.COM')).toBe(true); // case-insensitive
  });

  it('staging and workers.dev hosts are NON-production (noindex, disallow-all)', () => {
    expect(isProductionHost('bornclock-staging.usdvisionai.workers.dev')).toBe(false);
    expect(isProductionHost('staging.bornclock.com')).toBe(false); // moved to staging worker later
    expect(isProductionHost('abc123-bornclock.usdvisionai.workers.dev')).toBe(false);
    expect(isProductionHost('localhost')).toBe(false);
    expect(isProductionHost('')).toBe(false);
  });

  it('exposes exactly the two production hosts', () => {
    expect([...PRODUCTION_HOSTS].sort()).toEqual(['bornclock.com', 'www.bornclock.com']);
  });

  it('disallow-all robots body blocks everything', () => {
    expect(DISALLOW_ALL_ROBOTS).toContain('User-agent: *');
    expect(DISALLOW_ALL_ROBOTS).toContain('Disallow: /');
  });
});
