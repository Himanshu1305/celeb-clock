import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';

// B18: /lal-kitab and /hi/lal-kitab are single pages; anything below them is a real 404.
const SHELL = '<!doctype html><html lang="en"><head><title>x</title></head><body></body></html>';
const env = {
  ASSETS: { fetch: async () => new Response(SHELL, { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('Worker — Lal Kitab routes', () => {
  it('serves both pages with 200 and the right <html lang>', async () => {
    const en = await get('/lal-kitab/');
    expect(en.status).toBe(200);
    expect(await en.text()).toContain('<html lang="en">');
    const hi = await get('/hi/lal-kitab/');
    expect(hi.status).toBe(200);
    expect(await hi.text()).toContain('<html lang="hi">');
  });
  it('returns a real 404 below them', async () => {
    for (const p of ['/lal-kitab/anything/', '/hi/lal-kitab/x', '/lal-kitab/sun/1/']) {
      expect((await get(p)).status, p).toBe(404);
    }
  });
});
