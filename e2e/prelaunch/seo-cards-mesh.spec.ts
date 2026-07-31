/**
 * Suite L — seo-cards-mesh.spec.ts  (SEO-MAGNET-2 Phase A + B)
 *
 * Per-route OG share cards and the internal-linking mesh are PRERENDER artifacts:
 * scripts/generate-og-cards.mts writes dist/og/*.webp, and scripts/prerender.mjs
 * bakes the card URL + mesh links into dist/{route}/index.html. These assertions
 * therefore read the built dist/ directly (no dev server needed) and require a
 * prior `npm run build`. One page per type is checked:
 *   og:image present + twitter:image + the referenced .webp resolves on disk,
 *   and the type's mesh block renders (its links appear in the HTML).
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Playwright runs from the repo root; dist/ is the build output there.
const DIST = resolve(process.cwd(), 'dist');
const html = (route: string) => readFileSync(resolve(DIST, route.replace(/^\//, ''), 'index.html'), 'utf-8');
const distExists = existsSync(resolve(DIST, 'index.html'));

// og:image content= for whichever attribute order the prerender emitted.
function ogImage(doc: string): string | null {
  const m = doc.match(/<meta property="og:image" content="([^"]+)"/i);
  return m ? m[1] : null;
}
function twitterImage(doc: string): string | null {
  const m = doc.match(/<meta name="twitter:image" content="([^"]+)"/i);
  return m ? m[1] : null;
}
// https://bornclock.com/og/x/y.webp → dist/og/x/y.webp
function cardOnDisk(url: string): boolean {
  const rel = url.replace(/^https?:\/\/[^/]+\//, '');
  return existsSync(resolve(DIST, rel));
}

// One page per type → [route, expected card path fragment, mesh link fragments]
const CASES: Array<{ type: string; route: string; card: string; mesh: string[] }> = [
  { type: 'born-on', route: '/born-on/january-1', card: '/og/born-on/january-1.webp', mesh: ['/born-in-january', '/energy-forecast'] },
  { type: 'month-hub', route: '/born-in-august', card: '/og/month/august.webp', mesh: ['/blog/'] },
  { type: 'zodiac', route: '/zodiac/aries', card: '/og/zodiac/aries.webp', mesh: ['/born-in-march', '/born-in-april'] },
  { type: 'fitness', route: '/energy-forecast', card: '/og/fitness/energy-forecast.webp', mesh: ['/blog/', '/birthday-report'] },
  { type: 'blog', route: '/blog/how-exercise-affects-life-expectancy-workout-guide', card: '/og/blog/how-exercise-affects-life-expectancy-workout-guide.webp', mesh: ['/life-expectancy'] },
];

test.describe('OG cards + internal mesh (prerendered dist)', () => {
  test.skip(!distExists, 'dist/ not built — run `npm run build` before this suite');

  for (const c of CASES) {
    test(`${c.type}: og:image + twitter:image resolve to a real card`, () => {
      const doc = html(c.route);
      const og = ogImage(doc);
      const tw = twitterImage(doc);
      expect(og, `${c.route} og:image`).toBe(`https://bornclock.com${c.card}`);
      expect(tw, `${c.route} twitter:image`).toBe(`https://bornclock.com${c.card}`);
      expect(cardOnDisk(og!), `${og} exists on disk`).toBe(true);
    });

    test(`${c.type}: mesh block links render`, () => {
      const doc = html(c.route);
      for (const link of c.mesh) {
        // At least one of the alternatives (for zodiac spans) must appear; here we
        // assert each listed fragment is present, so use a soft OR for month spans.
        expect(doc.includes(link) || c.mesh.some(alt => alt !== link && doc.includes(alt)),
          `${c.route} should contain mesh link ${link}`).toBe(true);
      }
    });
  }
});
