// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LC_SEO, LC_SCHEMA, LC_FACTORS, LC_COPY } from '@/content/longevityCalculatorContent';
import { LongevityCalculatorPage } from '../LongevityCalculatorPage';

afterEach(cleanup);

// ── CONTENT FILE UNIT TESTS ───────────────────────────────────
// These test the content data independently — no DOM needed

describe('Content File — LC_SEO validation', () => {

  it('TC-CF-01: title is under 70 characters', () => {
    expect(LC_SEO.title.length).toBeLessThanOrEqual(70);
  });

  it('TC-CF-02: title contains "longevity calculator"', () => {
    expect(LC_SEO.title.toLowerCase()).toContain('longevity calculator');
  });

  it('TC-CF-03: title contains "BornClock"', () => {
    expect(LC_SEO.title).toContain('BornClock');
  });

  it('TC-CF-04: meta description is under 160 characters', () => {
    expect(LC_SEO.description.length).toBeLessThanOrEqual(160);
  });

  it('TC-CF-05: meta description contains "longevity"', () => {
    expect(LC_SEO.description.toLowerCase()).toContain('longevity');
  });

  it('TC-CF-06: canonical URL is exactly correct', () => {
    expect(LC_SEO.canonicalUrl).toBe('https://bornclock.com/longevity-calculator');
  });

  it('TC-CF-07: og:title is under 95 characters', () => {
    expect(LC_SEO.ogTitle.length).toBeLessThanOrEqual(95);
  });

  it('TC-CF-08: og:description is under 200 characters', () => {
    expect(LC_SEO.ogDescription.length).toBeLessThanOrEqual(200);
  });

});

describe('Content File — LC_SCHEMA validation', () => {

  it('TC-CF-09: SoftwareApp schema has required @context', () => {
    expect(LC_SCHEMA.softwareApp['@context']).toBe('https://schema.org');
  });

  it('TC-CF-10: SoftwareApp schema has correct @type', () => {
    expect(LC_SCHEMA.softwareApp['@type']).toBe('SoftwareApplication');
  });

  it('TC-CF-11: SoftwareApp schema has free offer', () => {
    expect(LC_SCHEMA.softwareApp.offers.price).toBe('0');
  });

  it('TC-CF-12: FAQPage schema has at least 6 questions', () => {
    expect(LC_SCHEMA.faq.mainEntity.length).toBeGreaterThanOrEqual(6);
  });

  it('TC-CF-13: every FAQ question has non-empty name', () => {
    LC_SCHEMA.faq.mainEntity.forEach(q => {
      expect(q.name.length).toBeGreaterThan(10);
    });
  });

  it('TC-CF-14: every FAQ answer has non-empty text', () => {
    LC_SCHEMA.faq.mainEntity.forEach(q => {
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(50);
    });
  });

  it('TC-CF-15: FAQ schema serializes to valid JSON', () => {
    expect(() => JSON.stringify(LC_SCHEMA.faq)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(LC_SCHEMA.faq));
    expect(parsed['@type']).toBe('FAQPage');
  });

  it('TC-CF-16: SoftwareApp schema serializes to valid JSON', () => {
    expect(() => JSON.stringify(LC_SCHEMA.softwareApp)).not.toThrow();
  });

  it('TC-CF-17: BreadcrumbList schema has 2 items', () => {
    expect(LC_SCHEMA.breadcrumb.itemListElement.length).toBe(2);
  });

  it('TC-CF-18: BreadcrumbList item 2 points to /longevity-calculator', () => {
    expect(LC_SCHEMA.breadcrumb.itemListElement[1].item)
      .toBe('https://bornclock.com/longevity-calculator');
  });

});

describe('Content File — LC_FACTORS validation', () => {

  it('TC-CF-19: exactly 8 factors defined', () => {
    expect(LC_FACTORS.length).toBe(8);
  });

  it('TC-CF-20: all factors have id 1-8', () => {
    const ids = LC_FACTORS.map(f => f.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('TC-CF-21: all factors have non-empty name, summary, detail, source', () => {
    LC_FACTORS.forEach(f => {
      expect(f.name.length).toBeGreaterThan(3);
      expect(f.summary.length).toBeGreaterThan(20);
      expect(f.detail.length).toBeGreaterThan(50);
      expect(f.source.length).toBeGreaterThan(10);
    });
  });

  it('TC-CF-22: no factor contains "undefined" or "[object Object]"', () => {
    LC_FACTORS.forEach(f => {
      const combined = `${f.name}${f.summary}${f.detail}${f.source}`;
      expect(combined).not.toContain('undefined');
      expect(combined).not.toContain('[object Object]');
    });
  });

  it('TC-CF-23: WHO cited in at least 3 factors', () => {
    const whoCount = LC_FACTORS.filter(f =>
      f.source.includes('WHO') || f.detail.includes('WHO')
    ).length;
    expect(whoCount).toBeGreaterThanOrEqual(3);
  });

});

describe('Content File — LC_COPY validation', () => {

  it('TC-CF-24: hero H1 contains "Longevity Calculator"', () => {
    const fullH1 = `${LC_COPY.hero.h1Line1} ${LC_COPY.hero.h1Line2}`;
    expect(fullH1.toLowerCase()).toContain('longevity calculator');
  });

  it('TC-CF-25: exactly 4 trust signals', () => {
    expect(LC_COPY.hero.trust.length).toBe(4);
  });

  it('TC-CF-26: longevity score has exactly 4 bands', () => {
    expect(LC_COPY.longevityScore.bands.length).toBe(4);
  });

  it('TC-CF-27: exactly 4 related tools defined', () => {
    expect(LC_COPY.relatedTools.length).toBe(4);
  });

  it('TC-CF-28: all related tool hrefs start with /', () => {
    LC_COPY.relatedTools.forEach(t => {
      expect(t.href.startsWith('/')).toBe(true);
    });
  });

  it('TC-CF-29: intro has at least 3 paragraphs', () => {
    expect(LC_COPY.introParas.length).toBeGreaterThanOrEqual(3);
  });

  it('TC-CF-30: science section has at least 5 citations', () => {
    expect(LC_COPY.science.citations.length).toBeGreaterThanOrEqual(5);
  });

});

// ── PAGE COMPONENT TESTS ─────────────────────────────────────
// NOTE: These test component structure and rendering.
// SEO meta tags (title, meta description) are tested via E2E
// because react-helmet does not update document.title in jsdom.

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/longevity-calculator']}>
        <LongevityCalculatorPage />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('LongevityCalculatorPage — Component Structure', () => {

  it('TC-PAGE-01: renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });

  it('TC-PAGE-02: has main landmark', () => {
    renderPage();
    expect(document.querySelector('main')).toBeTruthy();
  });

  it('TC-PAGE-03: has exactly one H1', () => {
    renderPage();
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('TC-PAGE-04: H1 contains "Longevity Calculator"', () => {
    renderPage();
    const h1 = document.querySelector('h1');
    expect(h1?.textContent?.toLowerCase()).toContain('longevity calculator');
  });

  it('TC-PAGE-05: has data-testid="longevity-calc-page"', () => {
    renderPage();
    expect(document.querySelector('[data-testid="longevity-calc-page"]')).toBeTruthy();
  });

  it('TC-PAGE-06: exactly 8 factor sections rendered', () => {
    renderPage();
    const factors = document.querySelectorAll('[data-testid^="factor-"]');
    expect(factors.length).toBe(8);
  });

  it('TC-PAGE-07: FAQ section has 6+ questions', () => {
    renderPage();
    const qs = document.querySelectorAll('[data-testid="faq-question"]');
    expect(qs.length).toBeGreaterThanOrEqual(6);
  });

  it('TC-PAGE-08: at least 3 CTAs link to calculator', () => {
    renderPage();
    const ctas = document.querySelectorAll('[data-testid="cta-to-calculator"]');
    expect(ctas.length).toBeGreaterThanOrEqual(3);
  });

  it('TC-PAGE-09: schema script tags render', () => {
    renderPage();
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-PAGE-10: schema script tags contain valid JSON', () => {
    renderPage();
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(s => {
      expect(() => JSON.parse(s.textContent || '')).not.toThrow();
    });
  });

  it('TC-PAGE-11: no "undefined" or "[object Object]" in rendered output', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  it('TC-PAGE-12: article word count exceeds 2000', () => {
    renderPage();
    const article = document.querySelector('[data-testid="article-content"]');
    const words = article?.textContent?.trim().split(/\s+/).length || 0;
    expect(words).toBeGreaterThan(2000);
  });

  it('TC-PAGE-13: WHO appears in article content', () => {
    renderPage();
    const article = document.querySelector('[data-testid="article-content"]');
    expect(article?.textContent).toContain('WHO');
  });

  it('TC-PAGE-14: Harvard appears in article content', () => {
    renderPage();
    const article = document.querySelector('[data-testid="article-content"]');
    expect(article?.textContent).toContain('Harvard');
  });

  it('TC-PAGE-15: CTA links navigate to /life-expectancy', () => {
    renderPage();
    const ctas = document.querySelectorAll('[data-testid="cta-to-calculator"]');
    ctas.forEach(cta => {
      const href = cta.getAttribute('href') || '';
      expect(href).toMatch(/life-expectancy|longevity-calculator/);
    });
  });

  it('TC-PAGE-16: related tools section has 4 links', () => {
    renderPage();
    const tools = document.querySelectorAll('[data-testid="related-tool"]');
    expect(tools.length).toBe(4);
  });

  it('TC-PAGE-17: score bands section has 4 bands', () => {
    renderPage();
    const bands = document.querySelectorAll('[data-testid="score-band"]');
    expect(bands.length).toBe(4);
  });

});
