// Batch 11 (GSC): www.bornclock.com 301s to the apex (332 "Alternate page with proper
// canonical" URLs in Search Console came from www serving the whole site with 200).
import { describe, it, expect } from 'vitest';
import { wwwRedirectTarget } from '../../functions/host';

const SHELL = '<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>';
const env = {
  ASSETS: {
    fetch: async (req: Request) => {
      const u = new URL(req.url);
      // The static-asset layer's own slash normalisation (307) for a directory page.
      if (u.pathname === '/privacy') return new Response(null, { status: 307, headers: { Location: '/privacy/' } });
      if (u.pathname.endsWith('.xml')) return new Response('<urlset/>', { headers: { 'content-type': 'application/xml' } });
      return new Response(SHELL, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
  },
};
const get = async (url: string) => {
  const worker = (await import('../../functions/_worker')).default;
  return worker.fetch(new Request(url, { redirect: 'manual' }), env as never, {});
};

describe('wwwRedirectTarget', () => {
  it.each([
    ['https://www.bornclock.com/', 'https://bornclock.com/'],
    ['https://www.bornclock.com/planetary-age', 'https://bornclock.com/planetary-age/'],
    ['https://www.bornclock.com/born-on/july-23/india/', 'https://bornclock.com/born-on/july-23/india/'],
    ['https://www.bornclock.com/kundali/?name=a&b=1', 'https://bornclock.com/kundali/?name=a&b=1'],
    ['https://www.bornclock.com/blog?tag=x', 'https://bornclock.com/blog/?tag=x'],
    ['https://www.bornclock.com/sitemap.xml', 'https://bornclock.com/sitemap.xml'],
    ['https://www.bornclock.com/api/geo', 'https://bornclock.com/api/geo'],
    ['http://WWW.BornClock.com/terms', 'https://bornclock.com/terms/'],
  ])('%s → %s', (from, to) => expect(wwwRedirectTarget(new URL(from))).toBe(to));

  it.each(['https://bornclock.com/x', 'https://staging.bornclock.com/x', 'https://bornclock.usdvisionai.workers.dev/x', 'http://localhost:8787/x'])(
    'leaves %s alone', u => expect(wwwRedirectTarget(new URL(u))).toBeNull());
});

describe('functions/_worker.ts host canonicalisation', () => {
  it('www → one 301 to the apex (path + query kept, slash added), before anything else', async () => {
    for (const [from, to] of [
      ['https://www.bornclock.com/', 'https://bornclock.com/'],
      ['https://www.bornclock.com/planetary-age', 'https://bornclock.com/planetary-age/'],
      ['https://www.bornclock.com/born-on/july-23/india?ref=x', 'https://bornclock.com/born-on/july-23/india/?ref=x'],
      ['https://www.bornclock.com/robots.txt', 'https://bornclock.com/robots.txt'],
      ['https://www.bornclock.com/api/geo', 'https://bornclock.com/api/geo'],
      // a retired duplicate also leaves www first (then its own 301 on the apex)
      ['https://www.bornclock.com/biological-age-calculator/', 'https://bornclock.com/biological-age-calculator/'],
    ]) {
      const res = await get(from);
      expect(res.status, from).toBe(301);
      expect(res.headers.get('Location'), from).toBe(to);
    }
  });

  it('apex pages are served as before (200, no redirect)', async () => {
    const res = await get('https://bornclock.com/kundali/');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Robots-Tag')).toBeNull();
  });

  it('staging / workers.dev keep their behaviour (served, noindex) — no host redirect', async () => {
    // Workers-runtime global used only on non-production hosts; a pass-through stub here.
    (globalThis as Record<string, unknown>).HTMLRewriter = class { on() { return this; } transform(r: Response) { return r; } };
    for (const u of ['https://staging.bornclock.com/kundali/', 'https://bornclock.usdvisionai.workers.dev/kundali/']) {
      const res = await get(u);
      expect(res.status, u).toBe(200);
      expect(res.headers.get('X-Robots-Tag'), u).toContain('noindex');
    }
  });

  it('apex non-slash page → one 301 to the slash URL (asset 307 upgraded)', async () => {
    const res = await get('https://bornclock.com/privacy');
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('/privacy/');
  });

  it('renamed-route redirects land on the slash URL in one hop', async () => {
    for (const [from, to] of [['/methodology', '/how-it-works/'], ['/rising-sign-calculator/', '/moon-sign/']]) {
      const res = await get(`https://bornclock.com${from}`);
      expect(res.status).toBe(301);
      expect(new URL(res.headers.get('Location')!).pathname).toBe(to);
    }
  });

});
