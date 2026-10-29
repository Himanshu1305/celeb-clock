import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { muhuratYearRoutes } from '../../src/lib/muhuratYearMeta.js';

// Batch 9b: /muhurat/:type/:year exists only for the precomputed occasions and years.
const env = {
  ASSETS: { fetch: async () => new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('Worker — year muhurat pages', () => {
  it('serves all 10 pages (200)', async () => {
    for (const r of muhuratYearRoutes()) expect((await get(`${r}/`)).status, r).toBe(200);
  });
  it.each(['/muhurat/business/2027/', '/muhurat/marriage/2031/', '/muhurat/vehicle/2027', '/muhurat/constructor/2027'])('%s → 404', async (p) => {
    expect((await get(p)).status).toBe(404);
  });
});
