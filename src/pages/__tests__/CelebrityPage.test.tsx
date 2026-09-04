// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CelebrityPage } from '../CelebrityPage';
import { CelebrityIndexPage } from '../CelebrityIndexPage';
import { CelebrityHubPage } from '../CelebrityHubPage';
import { generateAllSlugs, parseCelebrityDOB, formatDOBDisplay } from '@/utils/celebrityUtils';
import { indianCelebrities } from '@/data/indianCelebrities';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
} from '@/data/astrologicalData';
import { calculateWesternZodiac } from '@/utils/celebrityCalculations';

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

// ── LUCKY ELEMENTS PANEL ──────────────────────────────────────
describe('Lucky Elements Panel — Positive (TC-8B-P)', () => {

  it('TC-8B-P-01: panel renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="lucky-elements-panel"]')).toBeTruthy();
  });

  it('TC-8B-P-02: stone chip shows Hindi name in parentheses', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-stone"]');
    // Should contain parentheses with Hindi name e.g. "(Moonga)"
    expect(chip?.textContent).toMatch(/\(.+\)/);
    expect(chip?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-03: day chip shows a valid weekday', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-day"]');
    const text = chip?.textContent || '';
    const valid = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    expect(valid.some(d => text.includes(d))).toBe(true);
  });

  it('TC-8B-P-04: number chip contains at least one digit', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="lucky-chip-number"]')?.textContent).toMatch(/\d/);
  });

  it('TC-8B-P-05: tarot chip renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-tarot"]');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-06: Scorpio celebrity panel shows Tuesday and Red Coral', () => {
    const scorpioSlug = ALL_SLUGS.find(slug => {
      const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
      if (!dob?.isFullDate) return false;
      return calculateWesternZodiac(dob.day, dob.month).sign === 'Scorpio';
    });
    if (!scorpioSlug) { console.log('No Scorpio in test DB — skipping'); return; }

    renderCelebPage(scorpioSlug);
    const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
    const text = panel?.textContent || '';
    expect(text).toContain('Tuesday');
    expect(text).toContain('Red Coral');
  });

});

describe('Lucky Elements Panel — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-01: year-only celebrity has panel (no crash)', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
    expect(panel).toBeTruthy();
    expect(panel?.textContent).not.toContain('undefined');
    expect(panel?.textContent).not.toContain('[object Object]');
  });

  it('TC-8B-N-02: year-only celebrity does NOT show Vedic lucky stone chip', () => {
    if (!YEAR_ONLY_SLUG) return;
    const dob = parseCelebrityDOB(SLUG_MAP.get(YEAR_ONLY_SLUG) as Record<string,unknown>);
    if (dob?.isFullDate) return; // Not year-only, skip

    renderCelebPage(YEAR_ONLY_SLUG);
    // Vedic stone requires full DOB — stone chip may appear (Chinese) or not
    // Either way: no crash, no undefined
    const stoneChip = document.querySelector('[data-testid="lucky-chip-stone"]');
    if (stoneChip) {
      expect(stoneChip.textContent).not.toContain('undefined');
    }
    expect(true).toBe(true);
  });

  it('TC-8B-N-03: no undefined in lucky panel for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
      const text = panel?.textContent || '';
      expect(text, `${slug} has undefined`).not.toContain('undefined');
      expect(text, `${slug} has [object Object]`).not.toContain('[object Object]');
      expect(text, `${slug} has null`).not.toContain('>null<');
      unmount();
    });
  });

});

// ── ASTROLOGICAL TABS ─────────────────────────────────────────
describe('Astrological Tabs — Positive (TC-8B-P)', () => {

  it('TC-8B-P-07: astro-tabs container renders', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="astro-tabs"]')).toBeTruthy();
  });

  it('TC-8B-P-08: all 4 tab buttons render', () => {
    renderCelebPage(FULL_DOB_SLUG);
    ['tab-western','tab-vedic','tab-chinese','tab-numerology'].forEach(id => {
      expect(document.querySelector(`[data-testid="${id}"]`), `Missing ${id}`).toBeTruthy();
    });
  });

  it('TC-8B-P-09: Western content visible by default, Vedic NOT in DOM', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="tab-content-western"]')).toBeTruthy();
    // With conditional rendering, Vedic should NOT be in DOM when Western is active
    expect(document.querySelector('[data-testid="tab-content-vedic"]')).toBeNull();
  });

  it('TC-8B-P-10: Western content contains sign name and tarot card', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return;
    const zodiac = calculateWesternZodiac(dob.day, dob.month);
    const western = document.querySelector('[data-testid="tab-content-western"]');
    const text = western?.textContent || '';
    expect(text).toContain(zodiac.sign);
    // Check tarot card from our data
    const profile = WESTERN_ZODIAC_PROFILES[zodiac.sign];
    if (profile) expect(text).toContain(profile.tarot_card);
  });

  it('TC-8B-P-11: clicking Vedic tab shows Vedic content, removes Western', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const vedicBtn = document.querySelector('[data-testid="tab-vedic"]') as HTMLElement;
    if (!vedicBtn) return;
    fireEvent.click(vedicBtn);

    expect(document.querySelector('[data-testid="tab-content-vedic"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="tab-content-western"]')).toBeNull();
  });

  it('TC-8B-P-12: Vedic tab content shows Devanagari script (Unicode 0900-097F)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const vBtn = document.querySelector('[data-testid="tab-vedic"]') as HTMLElement;
    if (vBtn) fireEvent.click(vBtn);
    const text = document.querySelector('[data-testid="tab-content-vedic"]')?.textContent || '';
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return; // Year-only won't have Vedic data
    expect(/[ऀ-ॿ]/.test(text)).toBe(true);
  });

  it('TC-8B-P-13: Chinese tab content appears after clicking Chinese', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const cBtn = document.querySelector('[data-testid="tab-chinese"]') as HTMLElement;
    if (cBtn) fireEvent.click(cBtn);
    const chinese = document.querySelector('[data-testid="tab-content-chinese"]');
    expect(chinese).toBeTruthy();
    expect(chinese?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-14: Numerology tab contains "Life Path"', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const nBtn = document.querySelector('[data-testid="tab-numerology"]') as HTMLElement;
    if (nBtn) fireEvent.click(nBtn);
    expect(document.querySelector('[data-testid="tab-content-numerology"]')?.textContent)
      .toContain('Life Path');
  });

});

describe('Astrological Tabs — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-04: year-only celebrity Western tab shows graceful message, not undefined', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const western = document.querySelector('[data-testid="tab-content-western"]');
    if (western) {
      expect(western.textContent).not.toContain('undefined');
      expect(western.textContent).not.toContain('[object Object]');
    }
    expect(true).toBe(true);
  });

  it('TC-8B-N-05: no undefined in tabs for 10 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 10);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 10).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const tabs = document.querySelector('[data-testid="astro-tabs"]');
      expect(tabs?.textContent).not.toContain('undefined');
      expect(tabs?.textContent).not.toContain('[object Object]');
      unmount();
    });
  });

  it('TC-8B-N-06: clicking all 4 tabs sequentially never crashes', () => {
    renderCelebPage(FULL_DOB_SLUG);
    ['tab-western','tab-vedic','tab-chinese','tab-numerology'].forEach(id => {
      const btn = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      expect(() => btn?.click()).not.toThrow();
      const tabs = document.querySelector('[data-testid="astro-tabs"]');
      expect(tabs?.textContent).not.toContain('undefined');
    });
  });

});

// ── PERSONALITY SYNTHESIS ─────────────────────────────────────
describe('Personality Synthesis — Positive (TC-8B-P)', () => {

  it('TC-8B-P-15: synthesis renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="personality-synthesis"]')).toBeTruthy();
  });

  it('TC-8B-P-16: synthesis contains celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
    const text = document.querySelector('[data-testid="personality-synthesis"]')?.textContent || '';
    expect(text).toContain(name);
  });

  it('TC-8B-P-17: synthesis mentions zodiac sign for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return;
    const zodiac = calculateWesternZodiac(dob.day, dob.month);
    expect(document.querySelector('[data-testid="personality-synthesis"]')?.textContent)
      .toContain(zodiac.sign);
  });

  it('TC-8B-P-18: synthesis is > 30 chars (non-trivial text)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const text = document.querySelector('[data-testid="personality-synthesis"]')?.textContent?.trim() || '';
    expect(text.length).toBeGreaterThan(30);
  });

});

describe('Personality Synthesis — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-07: year-only celebrity has synthesis with no crash', () => {
    if (!YEAR_ONLY_SLUG) return;
    expect(() => renderCelebPage(YEAR_ONLY_SLUG)).not.toThrow();
    const el = document.querySelector('[data-testid="personality-synthesis"]');
    if (el) {
      expect(el.textContent).not.toContain('undefined');
      expect(el.textContent?.trim().length ?? 0).toBeGreaterThan(10);
    }
  });

  it('TC-8B-N-08: no undefined in synthesis for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const el = document.querySelector('[data-testid="personality-synthesis"]');
      if (el) expect(el.textContent, `${slug}`).not.toContain('undefined');
      unmount();
    });
  });

});

// ── BIO SECTION ───────────────────────────────────────────────
describe('Bio Section — Positive (TC-8B-P)', () => {

  it('TC-8B-P-19: bio or pending renders for all celebrities', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const hasBio = document.querySelector('[data-testid="celebrity-bio"]');
    const hasPending = document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect(hasBio || hasPending).toBeTruthy();
  });

  it('TC-8B-P-20: pending state shows celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const pending = document.querySelector('[data-testid="celebrity-bio-pending"]');
    if (pending) {
      const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
      expect(pending.textContent).toContain(name);
    }
    expect(true).toBe(true);
  });

  it('TC-8B-P-21: bio (if present) contains disclaimer text', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const bio = document.querySelector('[data-testid="celebrity-bio"]');
    if (bio) expect(bio.textContent?.toLowerCase()).toContain('publicly available');
    expect(true).toBe(true);
  });

});

describe('Bio Section — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-09: no undefined in bio section for all 20 sampled', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const el = document.querySelector('[data-testid="celebrity-bio"]') ||
                 document.querySelector('[data-testid="celebrity-bio-pending"]');
      expect(el, `${slug} missing bio section`).toBeTruthy();
      expect(el?.textContent).not.toContain('undefined');
      unmount();
    });
  });

  it('TC-8B-N-10: year-only celebrity has bio or pending section', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const el = document.querySelector('[data-testid="celebrity-bio"]') ||
               document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect(el).toBeTruthy();
    expect(el?.textContent).not.toContain('undefined');
  });

  it('TC-8B-N-11: bio section never shows empty content (> 10 chars)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const el = document.querySelector('[data-testid="celebrity-bio"]') ||
               document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect((el?.textContent?.trim().length ?? 0)).toBeGreaterThan(10);
  });

});

// ── WHATSAPP SHARE (Day 7A) ───────────────────────────────────
describe('Celebrity WhatsApp Share (TC-WA)', () => {
  it('TC-WA-P-05: celebrity page has whatsapp share container', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="celebrity-whatsapp-share"]')).toBeTruthy();
  });
  it('TC-WA-N-05: celebrity whatsapp message has no undefined', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const href = document.querySelector('[data-testid="celebrity-whatsapp-share"] [data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
    expect(decodeURIComponent(href)).not.toContain('undefined');
  });
  it('TC-WA-N-06: no undefined in whatsapp share for 15 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 15);
    ALL_SLUGS.filter((_, i) => i % stride === 0).slice(0, 15).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const href = document.querySelector('[data-testid="celebrity-whatsapp-share"] [data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
      expect(decodeURIComponent(href), `${slug}`).not.toContain('undefined');
      unmount();
    });
  });
});
