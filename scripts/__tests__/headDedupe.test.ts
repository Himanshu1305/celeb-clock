import { describe, it, expect } from 'vitest';
// @ts-expect-error — plain ESM build script, no type declarations
import { finalizeHead, pickCanonical, normalizeSiteUrl, dedupeJsonLd, headStats, hasJsonLdType, selfUrl, keepOneBreadcrumb, keepOneMeta, mergeSameEntityJsonLd, SINGLE_META } from '../lib/headDedupe.mjs';
import { injectDailyHtml } from '../../src/lib/daily/inject';
import type { DailyEntry } from '../../src/lib/daily/types';

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

// Batch 8 — one description / og / twitter title+description per page, Helmet preferred.
// Shape taken from a real local prerender (dist/hi/rashifal/index.html, 26 Oct 2026):
// the static index.html tags first (generic English homepage text), then Helmet's.
const metaPage = `<!DOCTYPE html><html><head><title>राशिफल — आज का राशिफल | BornClock</title>
<meta name="description" content="Know your time. Live it well. BornClock combines science-based life expectancy forecasting with birthday personality insights.">
<meta property="og:title" content="BornClock — Know Your Time. Live It Well.">
<meta property="og:description" content="Celebrity birthday twins, biological age, life expectancy, zodiac &amp; numerology — all from your birth date. Free.">
<meta name="twitter:title" content="BornClock — Know Your Time. Live It Well.">
<meta name="twitter:description" content="Celebrity birthday twins, biological age, life expectancy, zodiac &amp; numerology — all from your birth date. Free.">
<meta name="title" content="राशिफल — आज का राशिफल | BornClock" data-rh="true">
<meta name="description" content="अपनी राशि चुनें और आज का राशिफल पढ़ें।" data-rh="true">
<meta property="og:title" content="राशिफल — आज का राशिफल | BornClock" data-rh="true">
<meta property="og:description" content="अपनी राशि चुनें और आज का राशिफल पढ़ें।" data-rh="true">
<meta name="twitter:title" content="राशिफल — आज का राशिफल | BornClock" data-rh="true">
<meta name="twitter:description" content="अपनी राशि चुनें और आज का राशिफल पढ़ें।" data-rh="true">
<meta property="og:image:width" content="1200"><meta name="twitter:card" content="summary_large_image">
</head><body></body></html>`;

describe('finalizeHead — one of each social/description meta', () => {
  it('keeps exactly one of each, the Helmet (page-own) value, never the generic home text', () => {
    const { html } = finalizeHead(metaPage, '/hi/rashifal');
    const s = headStats(html);
    expect(s.meta).toEqual({ description: 1, title: 1, ogTitle: 1, ogDescription: 1, twitterTitle: 1, twitterDescription: 1 });
    expect(html).not.toContain('Know your time. Live it well.');
    expect(html).not.toContain('Celebrity birthday twins');
    expect(html).toContain('<meta name="description" content="अपनी राशि चुनें और आज का राशिफल पढ़ें।" data-rh="true">');
    expect(html).toContain('<meta property="og:title" content="राशिफल — आज का राशिफल | BornClock" data-rh="true">');
    // other og/twitter tags are untouched
    expect(html).toContain('og:image:width');
    expect(html).toContain('twitter:card');
    expect(finalizeHead(html, '/hi/rashifal').html).toBe(html);
  });

  it('no Helmet copy → the first non-empty one stays; empty Helmet content does not win', () => {
    const a = '<meta name="description" content="Static one"><meta name="description" content="Second">';
    expect(keepOneMeta(a, SINGLE_META.description)).toBe('<meta name="description" content="Static one">');
    const b = '<meta name="description" content="Static one"><meta name="description" content="" data-rh="true">';
    expect(keepOneMeta(b, SINGLE_META.description)).toBe('<meta name="description" content="Static one">');
    const c = '<meta content="Own" name="description" data-rh="true"><meta name="description" content="Static">';
    expect(keepOneMeta(c, SINGLE_META.description)).toBe('<meta content="Own" name="description" data-rh="true">');
  });

  it('does not confuse description with og:/twitter:description', () => {
    const h = '<meta name="description" content="d"><meta property="og:description" content="o"><meta name="twitter:description" content="t">';
    expect(keepOneMeta(h, SINGLE_META.description)).toBe(h);
  });

  it('daily injection still finds and updates the single tags afterwards', () => {
    const shell = finalizeHead(metaPage.replace('<body></body>', '<body><h1><span data-daily="h1">old</span></h1></body>'), '/hi/rashifal/mesha').html;
    const entry: DailyEntry = { date: '2026-10-26', lang: 'hi', title: 'मेष राशिफल 26 अक्टूबर 2026', description: 'आज का मेष राशिफल', h1: 'मेष राशिफल', dateLabel: 'सोमवार, 26 अक्टूबर 2026', answer: 'a', why: [], sections: [], faq: [] };
    const { html, replaced } = injectDailyHtml(shell, { kind: 'rashifal-hi', slug: 'mesha', path: '/hi/rashifal/mesha', entry });
    expect(replaced.description).toBe(true);
    const s = headStats(html);
    expect(s.meta).toEqual({ description: 1, title: 1, ogTitle: 1, ogDescription: 1, twitterTitle: 1, twitterDescription: 1 });
    for (const re of [SINGLE_META.description, SINGLE_META.ogDescription, SINGLE_META.twitterDescription]) expect(html.match(re)![0]).toContain('content="आज का मेष राशिफल"');
    for (const re of [SINGLE_META.ogTitle, SINGLE_META.twitterTitle]) expect(html.match(re)![0]).toContain('content="मेष राशिफल 26 अक्टूबर 2026"');
  });
});

describe('JSON-LD — one Organization / WebSite / WebPage', () => {
  // The real homepage pair (dist/index.html, local prerender 26 Oct 2026): index.html's
  // static blocks + src/pages/Index.tsx's body-rendered JsonLd + <SEO>'s WebPage.
  const home = `<html><head>
<script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Organization","name":"BornClock","url":"https://bornclock.com","logo":{"@type":"ImageObject","url":"https://bornclock.com/bornclock-logo.png"},"description":"Free age calculator.","contactPoint":{"@type":"ContactPoint","email":"hello@bornclock.com","contactType":"customer support"},"sameAs":["https://twitter.com/bornclock"]}
</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"BornClock","url":"https://bornclock.com","description":"Free tools.","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://bornclock.com/celebrity-birthday?q={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
<script type="application/ld+json" data-rh="true">{"@context":"https://schema.org","@type":"WebPage","headline":"Free Birthday Calculator | BornClock","description":"Everything your birth date reveals.","url":"https://bornclock.com/","image":"https://bornclock.com/og/default.png"}</script>
</head><body>
<script type="application/ld+json" data-testid="jsonld-org">{"@context":"https://schema.org","@type":"Organization","name":"BornClock","url":"https://bornclock.com/","logo":"https://bornclock.com/og/default.png"}</script>
<script type="application/ld+json" data-testid="jsonld-website">{"@context":"https://schema.org","@type":"WebSite","name":"BornClock","url":"https://bornclock.com/","potentialAction":{"@type":"SearchAction","target":"https://bornclock.com/celebrity?q={search_term_string}","query-input":"required name=search_term_string"}}</script>
<script type="application/ld+json" data-testid="jsonld-webpage">{"@context":"https://schema.org","@type":"WebPage","name":"BornClock — Birthday, Zodiac & Longevity Calculator","description":"Everything your birth date reveals.","url":"https://bornclock.com/"}</script>
</body></html>`;
  const blocks = (h: string) => [...h.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

  it('homepage: one complete block of each type, richer version kept, missing fields added', () => {
    const out = finalizeHead(home, '/').html;
    const s = headStats(out);
    expect(s.entityBlocks).toEqual({ Organization: 1, WebSite: 1, WebPage: 1 });
    const all = blocks(out);
    const org = all.find(b => b['@type'] === 'Organization');
    expect(org.contactPoint.email).toBe('hello@bornclock.com');
    expect(org.logo).toEqual({ '@type': 'ImageObject', url: 'https://bornclock.com/bornclock-logo.png' });
    expect(org.url).toBe('https://bornclock.com/');
    const site = all.find(b => b['@type'] === 'WebSite');
    expect(site.description).toBe('Free tools.');
    expect(site.potentialAction.target.urlTemplate).toContain('/celebrity-birthday');
    const wp = all.find(b => b['@type'] === 'WebPage');
    expect(wp.headline).toBe('Free Birthday Calculator | BornClock');
    expect(wp.name).toBe('BornClock — Birthday, Zodiac & Longevity Calculator'); // only the Index.tsx copy had it
    expect(wp.image).toBe('https://bornclock.com/og/default.png');
    // the merged blocks sit where the first copy was (in <head>)
    expect(out.indexOf('"@type":"WebSite"')).toBeLessThan(out.indexOf('</head>'));
    expect(finalizeHead(out, '/').html).toBe(out);
  });

  it('blocks for different URLs and @graph blocks are left alone', () => {
    const a = '<script type="application/ld+json">{"@type":"WebPage","url":"https://bornclock.com/a/"}</script>';
    const b = '<script type="application/ld+json">{"@type":"WebPage","url":"https://bornclock.com/b/"}</script>';
    expect(mergeSameEntityJsonLd(a + b)).toBe(a + b);
    const g = '<script type="application/ld+json" data-daily="jsonld">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","url":"https://bornclock.com/a/"}]}</script>';
    expect(mergeSameEntityJsonLd(a + g)).toBe(a + g);
  });
});

describe('Batch 9b — one Article and one FAQPage per page', () => {
  // Shape of the real /answers/what-is-bmi/ prerender (local prerender 29 Oct 2026):
  // <SEO ogType="article"> block (data-rh) + the page's own richer Article block.
  const seoArticle = '<script type="application/ld+json" data-rh="true">{"@context":"https://schema.org","@type":"Article","headline":"What Is BMI and What Does Your Number Actually Mean? | BornClock","description":"BMI explained.","url":"https://bornclock.com/answers/what-is-bmi/","image":"https://bornclock.com/og/default.png","publisher":{"@type":"Organization","name":"BornClock - Age & Birthday Calculator"},"mainEntityOfPage":{"@type":"WebPage","@id":"https://bornclock.com/answers/what-is-bmi/"},"author":{"@type":"Person","name":"BornClock Team"}}</script>';
  const ownArticle = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"What Is BMI and What Does Your Number Actually Mean?","description":"BMI (Body Mass Index) explained: how to calculate it, what the ranges mean, and why waist-to-height ratio is actually a better predictor of health.","author":{"@type":"Organization","name":"BornClock"},"publisher":{"@type":"Organization","name":"BornClock","logo":{"@type":"ImageObject","url":"https://bornclock.com/bornclock-logo.png"}},"datePublished":"2026-06-17","dateModified":"2026-06-17","mainEntityOfPage":"https://bornclock.com/answers/what-is-bmi/"}</script>';
  const blocks = (h: string) => [...h.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

  it('two Article blocks (generic + page-own) merge into one, keeping the richer one and adding missing fields', () => {
    const html = `<html><head>${seoArticle}</head><body>${ownArticle}</body></html>`;
    expect(headStats(html).entityBlocks.Article).toBe(2);
    const out = finalizeHead(html, '/answers/what-is-bmi').html;
    expect(headStats(out).entityBlocks.Article).toBe(1);
    const a = blocks(out).find(b => b['@type'] === 'Article');
    expect(a.datePublished).toBe('2026-06-17');                       // page-own (richer) wins
    expect(a.headline).toBe('What Is BMI and What Does Your Number Actually Mean?');
    expect(a.image).toBe('https://bornclock.com/og/default.png');     // only the generic copy had it
    expect(a.url).toBe('https://bornclock.com/answers/what-is-bmi/');
    expect(finalizeHead(out, '/answers/what-is-bmi').html).toBe(out);
  });

  it('Article and BlogPosting count as one family; the richer @type is kept', () => {
    const bp = ownArticle.replace('"@type":"Article"', '"@type":"BlogPosting"');
    const out = mergeSameEntityJsonLd(`${seoArticle}${bp}`);
    const all = blocks(out);
    expect(all).toHaveLength(1);
    expect(all[0]['@type']).toBe('BlogPosting');
  });

  it('headStats counts FAQPage blocks so validate-dist can fail on two', () => {
    const faq = (q: string) => `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"${q}","acceptedAnswer":{"@type":"Answer","text":"A."}}]}</script>`;
    expect(headStats(faq('One?')).entityBlocks.FAQPage).toBe(1);
    expect(headStats(faq('One?') + faq('Two?')).entityBlocks.FAQPage).toBe(2);
    // FAQPage blocks are NOT merged by finalizeHead (visibility is a page decision).
    expect(headStats(finalizeHead(`<html><head></head><body>${faq('One?')}${faq('Two?')}</body></html>`, '/x').html).entityBlocks.FAQPage).toBe(2);
  });
});

// Batch 11 (GSC): the prerender safety net for internal links without the trailing slash.
describe('canonicalizeInternalLinks / nonCanonicalInternalLinks', async () => {
  // @ts-expect-error — plain ESM build script, no type declarations
  const { canonicalizeInternalLinks, nonCanonicalInternalLinks } = await import('../lib/headDedupe.mjs');
  const body = `<a href="/privacy">p</a><a class="x" href="/kundali?x=1&amp;y=2#faq">k</a><a href='/terms'>t</a>
<a href="/zodiac/">ok</a><a href="/">home</a><a href="#top">top</a><a href="/sitemap.xml">sm</a><a href="/api/geo">api</a>
<a href="https://www.bornclock.com/planetary-age">www</a><a href="https://bornclock.com/faq">abs</a><a href="https://en.wikipedia.org/wiki/X">wiki</a>
<a data-href="/raw" href="/about/">about</a><link rel="alternate" hreflang="hi" href="https://bornclock.com/hi/rashifal"><link rel="stylesheet" href="/assets/app">
<script type="application/json">{"html":"<a href=\\"/nope\\">"}</script>`;

  it('rewrites only internal page hrefs, keeps query/hash, exempts files, /api/, anchors, other sites', () => {
    const { html, rewritten } = canonicalizeInternalLinks(body);
    expect(rewritten).toBe(6);
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain('href="/kundali/?x=1&amp;y=2#faq"');
    expect(html).toContain("href='/terms/'");
    expect(html).toContain('href="https://bornclock.com/planetary-age/"');
    expect(html).toContain('href="https://bornclock.com/faq/"');
    expect(html).toContain('hreflang="hi" href="https://bornclock.com/hi/rashifal/"');
    for (const keep of ['href="/zodiac/"', 'href="/"', 'href="#top"', 'href="/sitemap.xml"', 'href="/api/geo"', 'href="https://en.wikipedia.org/wiki/X"', 'data-href="/raw"', 'href="/assets/app"', '\\"/nope\\"']) {
      expect(html, keep).toContain(keep);
    }
    expect(nonCanonicalInternalLinks(html)).toEqual([]);
  });

  it('nonCanonicalInternalLinks lists what validate-dist fails on', () => {
    expect(nonCanonicalInternalLinks(body)).toEqual(['/privacy', '/kundali?x=1&y=2#faq', '/terms', 'https://www.bornclock.com/planetary-age', 'https://bornclock.com/faq']);
  });

  it('finalizeHead applies it and reports the count', () => {
    const r = finalizeHead(`<html><head><title>x</title></head><body><a href="/privacy">p</a></body></html>`, '/x');
    expect(r.html).toContain('href="/privacy/"');
    expect(r.linksRewritten).toBe(1);
  });
});

describe('dropStaleWebPages (Batch 11)', async () => {
  // @ts-expect-error — plain ESM build script, no type declarations
  const { dropStaleWebPages } = await import('../lib/headDedupe.mjs');
  const wp = (url: string, name: string) => `<script type="application/ld+json" data-rh="true">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name, url })}</script>`;
  it('keeps only the WebPage of the canonical URL when a stale one from an earlier render is left', () => {
    const html = `<head>${wp('https://bornclock.com/compatibility/', 'Hub')}${wp('https://bornclock.com/compatibility/libra/virgo', 'Pair')}</head>`;
    const out = dropStaleWebPages(html, 'https://bornclock.com/compatibility/libra/virgo/');
    expect(out).not.toContain('"Hub"');
    expect(out).toContain('"Pair"');
    expect(headStats(out).entityBlocks.WebPage).toBe(1);
  });
  it('leaves the page alone when no WebPage matches the canonical (nothing to prefer)', () => {
    const html = `<head>${wp('https://bornclock.com/a/', 'A')}${wp('https://bornclock.com/b/', 'B')}</head>`;
    expect(dropStaleWebPages(html, 'https://bornclock.com/c/')).toBe(html);
  });
});
