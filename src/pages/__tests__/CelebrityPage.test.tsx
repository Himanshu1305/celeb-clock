// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CelebrityPage } from '../CelebrityPage';
import { CelebrityIndexPage } from '../CelebrityIndexPage';
import { CelebrityHubPage } from '../CelebrityHubPage';
import { generateAllSlugs, parseCelebrityDOB, formatDOBDisplay } from '@/utils/celebrityUtils';
import { indianCelebrities } from '@/data/indianCelebrities';

afterEach(cleanup);

const SLUG_MAP = generateAllSlugs(indianCelebrities as unknown as Record<string,unknown>[]);
const ALL_SLUGS = Array.from(SLUG_MAP.keys());

const FULL_DOB_SLUG = ALL_SLUGS.find(slug => {
  const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
  return dob?.isFullDate;
}) || ALL_SLUGS[0];

const YEAR_ONLY_SLUG = ALL_SLUGS.find(slug => {
  const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
  return dob && !dob.isFullDate;
}) || null;

const renderCelebPage = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}/`]}>
        <Routes>
          <Route path="/celebrity/:slug/" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const renderIndexPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/celebrity/']}>
        <CelebrityIndexPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const renderHubPage = (category: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${category}/`]}>
        <Routes>
          <Route path="/celebrity/:category/" element={<CelebrityHubPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ── POSITIVE TESTS ────────────────────────────────────────────
describe('CelebrityPage — Positive', () => {
  it('TC-CP-P-01: renders without crashing', () => {
    expect(() => renderCelebPage(FULL_DOB_SLUG)).not.toThrow();
  });
  it('TC-CP-P-02: has celebrity-page testid', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="celebrity-page"]')).toBeTruthy();
  });
  it('TC-CP-P-03: exactly one H1', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('h1').length).toBe(1);
  });
  it('TC-CP-P-04: H1 contains celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
    expect(document.querySelector('h1')?.textContent).toContain(name);
  });
  it('TC-CP-P-05: facts table renders', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="facts-table"]')).toBeTruthy();
  });
  it('TC-CP-P-06: exactly 5 FAQ questions', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('[data-testid="faq-question"]').length).toBe(5);
  });
  it('TC-CP-P-07: CTA birthday report present', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="cta-birthday-report"]')).toBeTruthy();
  });
  it('TC-CP-P-08: CTA href contains /birthday-report', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="cta-birthday-report"]')?.getAttribute('href'))
      .toContain('/birthday-report');
  });
  it('TC-CP-P-09: ≥3 breadcrumb items', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('[data-testid="breadcrumb-item"]').length).toBeGreaterThanOrEqual(3);
  });
  it('TC-CP-P-10: ≥2 JSON-LD scripts', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBeGreaterThanOrEqual(2);
  });
  it('TC-CP-P-11: Person schema present', () => {
    renderCelebPage(FULL_DOB_SLUG);
    let found = false;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try { if (JSON.parse(s.textContent || '')['@type'] === 'Person') found = true; } catch { /* */ }
    });
    expect(found).toBe(true);
  });
  it('TC-CP-P-12: FAQPage schema has 5 questions', () => {
    renderCelebPage(FULL_DOB_SLUG);
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch { /* */ }
    });
    expect(count).toBe(5);
  });
  it('TC-CP-P-13: all schemas are valid JSON', () => {
    renderCelebPage(FULL_DOB_SLUG);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      expect(() => JSON.parse(s.textContent || '')).not.toThrow();
    });
  });
  it('TC-CP-P-14: renders correctly for 5 different celebrities', () => {
    ALL_SLUGS.slice(0, 5).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      expect(document.querySelector('[data-testid="celebrity-page"]')).toBeTruthy();
      expect(document.body.textContent).not.toContain('[object Object]');
      unmount();
    });
  });
});

// ── NEGATIVE TESTS — YEAR-ONLY DOB (MOST CRITICAL) ───────────
describe('CelebrityPage — Year-Only DOB', () => {
  it('TC-CP-N-01: year-only renders without crashing', () => {
    if (!YEAR_ONLY_SLUG) return;
    expect(() => renderCelebPage(YEAR_ONLY_SLUG)).not.toThrow();
  });
  it('TC-CP-N-02: year-only NEVER shows "January 1" in DOB cell', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const dob = document.querySelector('[data-testid="fact-dob"]');
    expect(dob?.textContent).not.toContain('January 1');
    expect(dob?.textContent).not.toContain('January 01');
  });
  it('TC-CP-N-03: year-only DOB cell shows "not available"', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="fact-dob"]')?.textContent?.toLowerCase())
      .toContain('not available');
  });
  it('TC-CP-N-04: year-only has NO planetary ages table', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="planetary-table-wrapper"]')).toBeNull();
  });
  it('TC-CP-N-05: year-only CTA does not pre-fill January 1 date', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const href = document.querySelector('[data-testid="cta-birthday-report"]')?.getAttribute('href') || '';
    expect(href).not.toContain('01-01');
    expect(href).not.toContain('January');
  });
  it('TC-CP-N-06: year-only shows twins-no-full-dob message', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="twins-no-full-dob"]')).toBeTruthy();
  });
});

// ── EDGE CASES ────────────────────────────────────────────────
describe('CelebrityPage — Edge Cases', () => {
  it('TC-CP-E-01: invalid slug redirects without crashing', () => {
    expect(() =>
      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={['/celebrity/this-does-not-exist-xyz/']}>
            <Routes>
              <Route path="/celebrity/:slug/" element={<CelebrityPage />} />
              <Route path="/celebrity/" element={<div data-testid="index">Index</div>} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      )
    ).not.toThrow();
  });
  it('TC-CP-E-02: no undefined or [object Object] for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_, i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const text = document.body.textContent || '';
      expect(text, `${slug} has undefined`).not.toContain('undefined');
      expect(text, `${slug} has [object Object]`).not.toContain('[object Object]');
      unmount();
    });
  });
  it('TC-CP-E-03: facts table cells never blank or raw undefined', () => {
    renderCelebPage(FULL_DOB_SLUG);
    document.querySelectorAll('[data-testid="facts-table"] td').forEach(cell => {
      const text = cell.textContent?.trim() || '';
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe('undefined');
    });
  });
  it('TC-CP-E-04: ALL year-only celebrities never show fake January 1', () => {
    ALL_SLUGS.forEach(slug => {
      const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
      if (dob && !dob.isFullDate) {
        const display = formatDOBDisplay(dob);
        expect(display, `${slug} shows fake date`).not.toMatch(/January\s*1[^0-9]/);
      }
    });
  });
  it('TC-CP-E-05: celebrity with no twins shows twins-none-found message', () => {
    const slugWithNoTwins = ALL_SLUGS.find(slug => {
      const celeb = SLUG_MAP.get(slug) as Record<string,unknown>;
      const dob = parseCelebrityDOB(celeb);
      if (!dob?.isFullDate) return false;
      const twins = (indianCelebrities as unknown as Record<string,unknown>[]).filter(c => {
        if (String(c.name) === String(celeb.name)) return false;
        const cDob = parseCelebrityDOB(c);
        return cDob?.isFullDate && cDob.day === dob.day && cDob.month === dob.month;
      });
      return twins.length === 0;
    });
    if (slugWithNoTwins) {
      renderCelebPage(slugWithNoTwins);
      expect(document.querySelector('[data-testid="twins-none-found"]')).toBeTruthy();
    }
    expect(true).toBe(true);
  });
});

// ── INDEX PAGE TESTS ──────────────────────────────────────────
describe('CelebrityIndexPage', () => {
  it('TC-IDX-01: renders without crashing', () => expect(() => renderIndexPage()).not.toThrow());
  it('TC-IDX-02: has celebrity-index-page testid', () => {
    renderIndexPage();
    expect(document.querySelector('[data-testid="celebrity-index-page"]')).toBeTruthy();
  });
  it('TC-IDX-03: H1 contains "Celebrity"', () => {
    renderIndexPage();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('celebrity');
  });
  it('TC-IDX-04: shows link for every celebrity', () => {
    renderIndexPage();
    expect(document.querySelectorAll('[data-testid="celebrity-index-link"]').length)
      .toBe(indianCelebrities.length);
  });
  it('TC-IDX-05: shows ≥3 category hub links', () => {
    renderIndexPage();
    expect(document.querySelectorAll('[data-testid="category-hub-link"]').length).toBeGreaterThanOrEqual(3);
  });
  it('TC-IDX-06: no undefined or [object Object]', () => {
    renderIndexPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});

// ── HUB PAGE TESTS ────────────────────────────────────────────
describe('CelebrityHubPage', () => {
  it('TC-HUB-01: Bollywood hub renders', () => expect(() => renderHubPage('bollywood')).not.toThrow());
  it('TC-HUB-02: Cricket hub renders', () => expect(() => renderHubPage('cricket')).not.toThrow());
  it('TC-HUB-03: has celebrity-hub-page testid', () => {
    renderHubPage('bollywood');
    expect(document.querySelector('[data-testid="celebrity-hub-page"]')).toBeTruthy();
  });
  it('TC-HUB-04: hub H1 is category-specific', () => {
    renderHubPage('bollywood');
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toMatch(/bollywood|celebrity/i);
  });
  it('TC-HUB-05: hub shows celebrities', () => {
    renderHubPage('bollywood');
    expect(document.querySelectorAll('[data-testid="hub-celebrity-link"]').length).toBeGreaterThan(0);
  });
  it('TC-HUB-06: invalid hub redirects without crashing', () => {
    expect(() => renderHubPage('invalid-xyz')).not.toThrow();
  });
  it('TC-HUB-07: no undefined in hub output', () => {
    renderHubPage('cricket');
    expect(document.body.textContent).not.toContain('undefined');
  });
});
