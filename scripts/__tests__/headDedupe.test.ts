import { describe, it, expect } from 'vitest';
// @ts-expect-error — plain ESM build script, no type declarations
import { finalizeHead, pickCanonical, normalizeSiteUrl, dedupeJsonLd, headStats, hasJsonLdType, selfUrl, keepOneBreadcrumb } from '../lib/headDedupe.mjs';

// Shape of a real prerendered page (scratchpad angel-pr/angel-numbers/1111/index.html):
// base index.html tags + react-helmet (data-rh) tags + the prerender's own BreadcrumbList.
const page = (helmetCanonical: string | null, extraHead = '') => `<!DOCTYPE html><html><head>
<title>X</title>
<link rel="canonical" href="https://bornclock.com/">
<meta property="og:url" content="https://bornclock.com/">
<meta name="twitter:url" content="https://bornclock.com/">
<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "BornClock",
      "url": "https://bornclock.com"
    }
</script>
${helmetCanonical ? `<link rel="canonical" href="${helmetCanonical}" data-rh="true">
<meta property="og:url" content="${helmetCanonical}" data-rh="true">
<meta name="twitter:url" content="${helmetCanonical}" data-rh="true">` : `<meta property="og:url" content="https://bornclock.com" data-rh="true">`}
<script type="application/ld+json" data-rh="true">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://bornclock.com"},{"@type":"ListItem","position":2,"name":"Angel Numbers","item":"https://bornclock.com/angel-numbers"}]}</script>
${extraHead}</head><body><h1>Hi</h1>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>
</body></html>`;

describe('normalizeSiteUrl', () => {
  it('makes same-site URLs absolute https + trailing slash', () => {
    expect(normalizeSiteUrl('/panchang/delhi')).toBe('https://bornclock.com/panchang/delhi/');
    expect(normalizeSiteUrl('http://www.bornclock.com/a/b')).toBe('https://bornclock.com/a/b/');
    expect(normalizeSiteUrl('https://bornclock.com')).toBe('https://bornclock.com/');
    expect(normalizeSiteUrl('https://bornclock.com/x/#frag')).toBe('https://bornclock.com/x/');
  });
  it('leaves files and other sites alone', () => {
    expect(normalizeSiteUrl('https://bornclock.com/og/default.png')).toBe('https://bornclock.com/og/default.png');
    expect(normalizeSiteUrl('https://schema.org')).toBe('https://schema.org');
    expect(normalizeSiteUrl('https://bornclock.community/x')).toBe('https://bornclock.community/x');
  });
  it('selfUrl', () => {
    expect(selfUrl('/')).toBe('https://bornclock.com/');
    expect(selfUrl('/celebrity/virat-kohli')).toBe('https://bornclock.com/celebrity/virat-kohli/');
  });
});

describe('finalizeHead — one canonical', () => {
  it('self canonical: two identical canonicals collapse to one', () => {
    const { html, canonical } = finalizeHead(page('https://bornclock.com/angel-numbers/1111/'), '/angel-numbers/1111');
    const s = headStats(html);
    expect(canonical).toBe('https://bornclock.com/angel-numbers/1111/');
    expect(s.canonicals).toBe(1);
    expect(s.canonicalHrefs).toEqual(['https://bornclock.com/angel-numbers/1111/']);
    expect(s.ogUrls).toBe(1);
    expect(s.twitterUrls).toBe(1);
    expect(html).toContain('<meta property="og:url" content="https://bornclock.com/angel-numbers/1111/" data-rh="true">');
    expect(html).toContain('<meta name="twitter:url" content="https://bornclock.com/angel-numbers/1111/" data-rh="true">');
    // kept with data-rh so the client-side Helmet replaces it rather than adding one
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/bornclock\.com\/angel-numbers\/1111\/" data-rh="true">/);
  });

  it('deliberate different canonical (e.g. a page pointing at its hub) wins over the self URL', () => {
    const { html, canonical } = finalizeHead(page('https://bornclock.com/compatibility'), '/compatibility/some-variant');
    expect(canonical).toBe('https://bornclock.com/compatibility/');
    const s = headStats(html);
    expect(s.canonicals).toBe(1);
    expect(s.canonicalHrefs).toEqual(['https://bornclock.com/compatibility/']);
    expect(html).not.toContain('href="https://bornclock.com/compatibility/some-variant/"');
    expect(html).toContain('content="https://bornclock.com/compatibility/"');
  });

  it('relative Helmet canonical is made absolute', () => {
    expect(pickCanonical(page('/panchang/delhi'), '/panchang/new-delhi')).toBe('https://bornclock.com/panchang/delhi/');
  });

  it('no Helmet canonical → self URL, and no data-rh on the canonical', () => {
    const { html } = finalizeHead(page(null), '/born-on/may-13/india');
    const s = headStats(html);
    expect(s.canonicals).toBe(1);
    expect(s.canonicalHrefs).toEqual(['https://bornclock.com/born-on/may-13/india/']);
    expect(html).toContain('<link rel="canonical" href="https://bornclock.com/born-on/may-13/india/">');
    expect(s.ogUrls).toBe(1);
    expect(s.twitterUrls).toBe(1);
    // the stray Helmet og:url (home) is replaced by the canonical
    expect(html).not.toContain('content="https://bornclock.com" data-rh');
  });

  it('page with no canonical at all gets one injected in <head>', () => {
    const { html } = finalizeHead('<html><head><title>x</title></head><body></body></html>', '/a');
    expect(headStats(html).canonicals).toBe(1);
    expect(html.indexOf('rel="canonical"')).toBeLessThan(html.indexOf('</head>'));
  });

  it('is idempotent', () => {
    const once = finalizeHead(page('https://bornclock.com/x/'), '/x').html;
    expect(finalizeHead(once, '/x').html).toBe(once);
  });

  it('home page', () => {
    const { html } = finalizeHead(page('https://bornclock.com/'), '/');
    expect(headStats(html).canonicalHrefs).toEqual(['https://bornclock.com/']);
  });
});

describe('JSON-LD dedupe', () => {
  const bcHelmet = '<script type="application/ld+json" data-rh="true">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://bornclock.com"},{"@type":"ListItem","position":2,"name":"Angel Numbers","item":"https://bornclock.com/angel-numbers"}]}</script>';
  const bcPrerender = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://bornclock.com/"},{"@type":"ListItem","position":2,"name":"Angel Numbers","item":"https://bornclock.com/angel-numbers/"}]}</script>';

  it('identical BreadcrumbLists (differing only in trailing slash) appear once, with slash URLs', () => {
    const out = dedupeJsonLd(`<head>${bcHelmet}${bcPrerender}</head>`);
    expect(out.match(/BreadcrumbList/g)).toHaveLength(1);
    expect(out).toContain('"item":"https://bornclock.com/angel-numbers/"');
    expect(out).not.toContain('"item":"https://bornclock.com/angel-numbers"}');
  });

  it('key order does not matter', () => {
    const a = '<script type="application/ld+json">{"@type":"FAQPage","name":"q"}</script>';
    const b = '<script type="application/ld+json">{"name":"q","@type":"FAQPage"}</script>';
    expect(dedupeJsonLd(a + b).match(/FAQPage/g)).toHaveLength(1);
  });

  it('different blocks of the same @type are kept', () => {
    const a = '<script type="application/ld+json">{"@type":"FAQPage","name":"q1"}</script>';
    const b = '<script type="application/ld+json">{"@type":"FAQPage","name":"q2"}</script>';
    expect(dedupeJsonLd(a + b).match(/FAQPage/g)).toHaveLength(2);
  });

  it('unparseable blocks are left alone; unchanged pretty blocks keep their formatting', () => {
    const bad = '<script type="application/ld+json">{not json</script>';
    expect(dedupeJsonLd(bad)).toBe(bad);
    const pretty = '<script type="application/ld+json">\n  {"@type": "WebSite", "url": "https://bornclock.com/"}\n</script>';
    expect(dedupeJsonLd(pretty)).toBe(pretty);
  });

  it('full page: every JSON-LD block unique afterwards', () => {
    const html = finalizeHead(page('https://bornclock.com/angel-numbers/1111/', bcPrerender), '/angel-numbers/1111').html;
    const s = headStats(html);
    expect(s.duplicateJsonLd).toBe(0);
    expect(html.match(/BreadcrumbList/g)).toHaveLength(1);
    expect(html).toContain('FAQPage');
    expect(html).toContain('"Organization"');
  });

  it('hasJsonLdType', () => {
    expect(hasJsonLdType(bcHelmet, 'BreadcrumbList')).toBe(true);
    expect(hasJsonLdType(bcHelmet, 'WebPage')).toBe(false);
  });

  it('two DIFFERENT breadcrumb trails (celebrity page: <SEO> + page-own) → one, the longer / later', () => {
    const seo = '<script type="application/ld+json" data-rh="true">{"@type":"BreadcrumbList","itemListElement":[{"name":"Home"},{"name":"Celebrity"},{"name":"Virat Kohli"}]}</script>';
    const own = '<script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"name":"Home"},{"name":"Celebrity Profiles"},{"name":"Virat Kohli"}]}</script>';
    const out = keepOneBreadcrumb(`<head>${seo}</head><body>${own}</body>`);
    expect(out.match(/BreadcrumbList/g)).toHaveLength(1);
    expect(out).toContain('Celebrity Profiles');
    const shortOwn = '<script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"name":"Home"}]}</script>';
    expect(keepOneBreadcrumb(seo + shortOwn)).toContain('"Virat Kohli"');
    expect(headStats(finalizeHead(`<html><head>${seo}</head><body>${own}</body></html>`, '/celebrity/virat-kohli').html).breadcrumbLists).toBe(1);
  });
});
