// @vitest-environment jsdom
/**
 * Batch 9b carry-over review guards:
 *  - item 3: no strong epigenetic "reversal" claims. What the evidence supports (PubMed,
 *    opened 29 Oct 2026): Fitzgerald KN et al., Aging 2021;13(7):9419-32,
 *    doi:10.18632/aging.202913 — a pilot RCT of 43 healthy men aged 50–72, 8 weeks,
 *    3.23-year lower Horvath DNAmAge vs controls, "larger-scale and longer duration
 *    clinical trials are needed"; Chen BH et al., Aging 2016;8(9):1844-65,
 *    doi:10.18632/aging.101020 — 13 cohorts / 13,089 people, epigenetic age acceleration
 *    predicts mortality independent of chronological age.
 *  - item 4: neutral tropical vs sidereal wording; an exact age-calculator accuracy FAQ;
 *    /how-it-works rows only from src/lib/accuracy/evidence.ts (no undated ProKerala claim).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Methodology from '../Methodology';
import { EVIDENCE } from '@/lib/accuracy/evidence';
import { blogPosts } from '@/data/blogPosts';

afterEach(() => cleanup());

const SRC = resolve(__dirname, '../..');
const files: string[] = [];
const walk = (d: string) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) { if (e !== '__tests__') walk(p); } else if (/\.(tsx?|json)$/.test(e)) files.push(p);
  }
};
walk(SRC);
const all = files.map((f) => [f, readFileSync(f, 'utf8')] as const);
const hits = (re: RegExp) => all.filter(([, t]) => re.test(t)).map(([f]) => f.slice(SRC.length));

describe('item 3 — epigenetics honesty', () => {
  it.each([
    /directly reverses epigenetic/i,
    /reverse measurable epigenetic/i,
    /most reversible longevity factors/i,
    /completely override genetic/i,
    /Epigenetics proves/i,
    /measurable epigenetic improvements within 8/i,
    /Multiple intervention studies have found 2–5 year/i,
    /more accurately than 14 other established biomarkers/i,
    /Proven interventions/i,
    /Horvath S\., (Nature Genetics|NIH) \(2013\)/,
  ])('no page says %s', (re) => {
    expect(hits(re)).toEqual([]);
  });
  it('the pilot trial is described as small, with its real numbers', () => {
    const t = readFileSync(join(SRC, 'pages/answers/WhatIsEpigeneticAge.tsx'), 'utf8');
    expect(t).toContain('43 healthy men aged 50–72');
    expect(t).toContain('3.23-year');
    expect(t).toMatch(/larger and longer trials are needed/);
  });
});

describe('item 4 — accuracy wording', () => {
  it('sidereal is not called "more astronomically precise"', () => {
    expect(hits(/more astronomically precise/i)).toEqual([]);
    const t = readFileSync(join(SRC, 'pages/VedicZodiac.tsx'), 'utf8');
    expect(t).toContain('different reference points');
  });
  it('the age-calculator blog FAQ no longer claims "accurate to the second" or time-zone handling', () => {
    const post = blogPosts.find((p) => p.slug === 'calculate-exact-age-seconds-minutes-hours')!;
    expect(post.content).not.toMatch(/accurate to the second/i);
    expect(post.content).toContain('counted from midnight');
  });
  it('/how-it-works: no undated ProKerala claim; the check table is exactly the evidence.ts rows', () => {
    render(<HelmetProvider><MemoryRouter><Methodology /></MemoryRouter></HelmetProvider>);
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/ProKerala/);
    expect(text).not.toMatch(/Before going live/);
    for (const id of ['kundali', 'nakshatra-dasha', 'matching', 'manglik', 'sade-sati', 'kaal-sarp']) {
      const r = EVIDENCE.find((x) => x.id === id)!;
      expect(text).toContain(r.what);
      expect(text).toContain(r.result);
      expect(text).toContain(r.date);
    }
  });
});

describe('item 1 — one Article per page (component side)', () => {
  it('every page with its own Article JSON-LD tells <SEO> not to add a second one', () => {
    const own = all.filter(([f, t]) => f.includes('/pages/') && /@type['"]?:\s*['"](Article|BlogPosting|NewsArticle)['"]/.test(t));
    expect(own.length).toBeGreaterThan(40);
    const missing = own.filter(([, t]) => /ogType="article"/.test(t) && !/articleSchema=\{false\}/.test(t)).map(([f]) => f.slice(SRC.length));
    expect(missing).toEqual([]);
  });
  it('<SEO articleSchema={false}> renders no Article/WebPage block; default still does', async () => {
    const { SEO } = await import('@/components/SEO');
    const count = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
      .filter((s) => /"@type":"(Article|WebPage)"/.test(s.textContent || '')).length;
    const crumbs = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
      .filter((s) => /BreadcrumbList/.test(s.textContent || '')).length;
    const { unmount } = render(<HelmetProvider><SEO title="T | BornClock" canonicalUrl="/x" ogType="article" articleSchema={false} /></HelmetProvider>);
    await waitFor(() => expect(crumbs()).toBe(1)); // Helmet has flushed
    expect(count()).toBe(0);
    unmount();
    render(<HelmetProvider><SEO title="T | BornClock" canonicalUrl="/x" ogType="article" /></HelmetProvider>);
    await waitFor(() => expect(count()).toBe(1));
  });
});

describe('item 1 — /age-calculator and /life-expectancy have one FAQPage', () => {
  it('the hidden second FAQSchema blocks are gone (the visible <PageFAQ> is the only FAQPage)', () => {
    for (const f of ['pages/AgeCalculatorPage.tsx', 'pages/LifeExpectancy.tsx']) {
      const t = readFileSync(join(SRC, f), 'utf8');
      expect(t, f).not.toMatch(/<FAQSchema/);
      expect(t, f).toMatch(/<PageFAQ slug=/);
    }
  });
});

describe('item 6 — S. P. Balasubrahmanyam is one linked record', () => {
  it('one page, Wikipedia dates (born 4 June 1946, died 25 Sep 2020), DB row linked, twin slug 301s', async () => {
    const data = (await import('@/data/celebrities.json')).default as { celebrities: Array<Record<string, unknown>> };
    const redirects = (await import('@/data/celebritySlugRedirects.json')).default as Record<string, string>;
    const { CELEBRITY_ALIASES } = await import('@/lib/celebrityDedupe');
    const spb = data.celebrities.filter((c) => /balasubrahmanyam/.test(String(c.slug)));
    expect(spb).toHaveLength(1);
    expect(spb[0]).toMatchObject({ slug: 'sp-balasubrahmanyam', birth_date: '1946-06-04', death_date: '2020-09-25', id: 21353 });
    expect(redirects['s-p-balasubrahmanyam']).toBe('sp-balasubrahmanyam');
    expect(CELEBRITY_ALIASES['s-p-balasubrahmanyam']).toBe('sp-balasubrahmanyam');
  });
});
