import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { TAROT_CARD_SLUGS } from '../../src/data/tarotCards';

// Batch 7 / W5: /tarot/cards/:slug is a finite set (78 cards). The Worker serves every real
// card normally and answers an impossible slug with a real 404 instead of a soft-200.
const env = {
  ASSETS: { fetch: async () => new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('Worker — tarot card pages', () => {
  it('serves all 78 card pages and the index (200)', async () => {
    expect((await get('/tarot/cards/')).status).toBe(200);
    for (const s of TAROT_CARD_SLUGS) expect((await get(`/tarot/cards/${s}/`)).status, s).toBe(200);
  });
  it.each(['/tarot/cards/the-joker/', '/tarot/cards/eleven-of-cups/', '/tarot/cards/ace-of-hearts', '/tarot/cards/fool/'])(
    '%s → 404', async (p) => {
      expect((await get(p)).status).toBe(404);
    });
});
