import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { SS_EN_SLUGS, SS_HI_SLUGS } from '../../src/lib/vedic/sadeSatiRashiText';

// Batch 9b review: /sade-sati/:rashi and /hi/sade-sati/:rashi exist only for the 12 slugs
// of each language; anything else was a soft-404 (200 SPA shell).
const env = {
  ASSETS: { fetch: async () => new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('Worker — per-rashi Sade Sati pages', () => {
  it('serves all 24 pages (200)', async () => {
    for (const s of SS_EN_SLUGS) expect((await get(`/sade-sati/${s}/`)).status, s).toBe(200);
    for (const s of SS_HI_SLUGS) expect((await get(`/hi/sade-sati/${s}/`)).status, s).toBe(200);
  });
  it.each(['/sade-sati/foo/', '/sade-sati/mesha/', '/hi/sade-sati/mesh/', '/hi/sade-sati/xyz'])('%s → 404', async (p) => {
    expect((await get(p)).status).toBe(404);
  });
  it('the calculator itself is untouched', async () => {
    expect((await get('/sade-sati/')).status).toBe(200);
  });
});
