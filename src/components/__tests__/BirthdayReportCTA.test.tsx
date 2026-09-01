// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BirthdayReportCTA } from '../BirthdayReportCTA';

// vitest runs with globals:false, so @testing-library's auto-cleanup (which hooks a
// global afterEach) never registers. Unmount between tests explicitly, otherwise
// renders accumulate in document.body and querySelector returns a stale first match.
afterEach(() => cleanup());

// ── Helpers ──────────────────────────────────────────────────
const renderCTA = (props: {
  celebrities?: { name: string }[];
  month: string;
  day: number | string;
}) =>
  render(
    <MemoryRouter>
      <BirthdayReportCTA {...props} />
    </MemoryRouter>
  );

// ── Test data ────────────────────────────────────────────────
const MANY  = [{ name: 'Chanakya' }, { name: 'Bose' }, { name: 'Vidya' }, { name: 'Amitabh' }];
const THREE = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }];
const TWO   = [{ name: 'Virat Kohli' }, { name: 'Kader Khan' }];
const ONE   = [{ name: 'Mel Gibson' }];
const LONG  = [{ name: 'Krishnamachari Srikkanth Venkataraman' }, { name: 'B' }];
const APOS  = [{ name: "Conan O'Brien" }, { name: 'B' }];
const EMPTY: { name: string }[] = [];

// ════════════════════════════════════════════════════════════
// RENDER & STRUCTURE
// ════════════════════════════════════════════════════════════
describe('BirthdayReportCTA — Render & Structure', () => {

  it('TC-S-01: renders without crashing — many celebrities', () => {
    expect(() => renderCTA({ celebrities: MANY, month: 'January', day: 1 })).not.toThrow();
  });

  it('TC-S-02: renders without crashing — no celebrities', () => {
    expect(() => renderCTA({ celebrities: EMPTY, month: 'August', day: 6 })).not.toThrow();
  });

  it('TC-S-03: renders without crashing — undefined celebrities', () => {
    expect(() => renderCTA({ celebrities: undefined, month: 'August', day: 6 })).not.toThrow();
  });

  it('TC-S-04: outer section has data-testid="birthday-report-cta"', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(document.querySelector('[data-testid="birthday-report-cta"]')).toBeTruthy();
  });

  it('TC-S-05: outer section is a <section> element (semantic HTML)', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const el = document.querySelector('[data-testid="birthday-report-cta"]');
    expect(el?.tagName.toLowerCase()).toBe('section');
  });

  it('TC-S-06: section has aria-label for screen readers', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const el = document.querySelector('[data-testid="birthday-report-cta"]');
    expect(el?.getAttribute('aria-label')).toBeTruthy();
  });

  it('TC-S-07: heading is an h2 element', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const h2 = document.querySelector('[data-testid="cta-heading"]');
    expect(h2?.tagName.toLowerCase()).toBe('h2');
  });

  it('TC-S-08: feature list is a <ul> element', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const ul = document.querySelector('[data-testid="cta-features"]');
    expect(ul?.tagName.toLowerCase()).toBe('ul');
  });

  it('TC-S-09: exactly 6 feature list items', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const items = document.querySelectorAll('[data-testid="cta-features"] li');
    expect(items.length).toBe(6);
  });

});

// ════════════════════════════════════════════════════════════
// HEADING COPY — POSITIVE
// ════════════════════════════════════════════════════════════
describe('BirthdayReportCTA — Heading Copy', () => {

  it('TC-H-01: many celebrities → "[First] and N others" in heading', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).toContain('Chanakya');
    expect(h?.textContent).toContain('others');
  });

  it('TC-H-02: exactly 3 celebrities → "[First] and 2 others"', () => {
    renderCTA({ celebrities: THREE, month: 'August', day: 6 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).toContain('Alpha');
    expect(h?.textContent).toContain('2 others');
  });

  it('TC-H-03: exactly 2 celebrities → "[First] and [Second]", no "others"', () => {
    renderCTA({ celebrities: TWO, month: 'November', day: 5 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).toContain('Virat Kohli');
    expect(h?.textContent).toContain('Kader Khan');
    expect(h?.textContent).not.toContain('others');
  });

  it('TC-H-04: exactly 1 celebrity → "[Name]" only, no "and", no "others"', () => {
    renderCTA({ celebrities: ONE, month: 'March', day: 3 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).toContain('Mel Gibson');
    expect(h?.textContent).not.toContain('others');
  });

  it('TC-H-05: heading never contains "undefined" or "null"', () => {
    [MANY, TWO, ONE, EMPTY].forEach(celeb => {
      const { unmount } = renderCTA({ celebrities: celeb, month: 'August', day: 6 });
      const h = document.querySelector('[data-testid="cta-heading"]');
      expect(h?.textContent).not.toContain('undefined');
      expect(h?.textContent).not.toContain('null');
      unmount();
    });
  });

  it('TC-H-06: long celebrity name — heading renders without overflow crash', () => {
    expect(() => renderCTA({ celebrities: LONG, month: 'January', day: 1 })).not.toThrow();
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).toContain('Krishnamachari');
  });

  it('TC-H-07: apostrophe in name — no HTML entities in rendered text', () => {
    renderCTA({ celebrities: APOS, month: 'April', day: 18 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent).not.toContain('&apos;');
    expect(h?.textContent).not.toContain('&#39;');
    expect(h?.innerHTML).not.toContain('&amp;');
  });

  it('TC-H-08: no celebrities — fallback heading is meaningful', () => {
    renderCTA({ celebrities: EMPTY, month: 'August', day: 6 });
    const h = document.querySelector('[data-testid="cta-heading"]');
    expect(h?.textContent?.length).toBeGreaterThan(10);
    expect(h?.textContent).not.toContain('undefined');
  });

});

// ════════════════════════════════════════════════════════════
// FEATURES LIST
// ════════════════════════════════════════════════════════════
describe('BirthdayReportCTA — Features List', () => {

  it('TC-F-01: contains "celebrity" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    // /celebrit/i so it matches the mockup copy "All celebrities who share your
    // birthday" (plural) — /celebrity/ is not a substring of "celebrities".
    expect(screen.getByText(/celebrit/i)).toBeTruthy();
  });

  it('TC-F-02: contains "zodiac" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(screen.getByText(/zodiac/i)).toBeTruthy();
  });

  it('TC-F-03: contains "numerology" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(screen.getByText(/numerology/i)).toBeTruthy();
  });

  it('TC-F-04: contains "life expectancy" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(screen.getByText(/life expectancy/i)).toBeTruthy();
  });

  it('TC-F-05: contains "tarot" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(screen.getByText(/tarot/i)).toBeTruthy();
  });

  it('TC-F-06: contains "biorhythm" feature', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    expect(screen.getByText(/biorhythm/i)).toBeTruthy();
  });

});

// ════════════════════════════════════════════════════════════
// CTA BUTTON — POSITIVE
// ════════════════════════════════════════════════════════════
describe('BirthdayReportCTA — CTA Button', () => {

  it('TC-B-01: button renders and is visible', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn).toBeTruthy();
  });

  it('TC-B-02: button is an anchor/link element', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.tagName.toLowerCase()).toMatch(/^a$/);
  });

  it('TC-B-03: button href contains /birthday-report', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.getAttribute('href')).toContain('/birthday-report');
  });

  it('TC-B-04: button href contains dob= query param', () => {
    renderCTA({ celebrities: MANY, month: 'August', day: 6 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    const href = btn?.getAttribute('href') || '';
    expect(href).toContain('dob=');
  });

  it('TC-B-05: button href contains month info in DOB param', () => {
    renderCTA({ celebrities: MANY, month: 'August', day: 6 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    const href = btn?.getAttribute('href') || '';
    // August = 08 in the DOB param
    expect(href).toContain('08');
  });

  it('TC-B-06: button does NOT have target="_blank" (keeps user on site)', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.getAttribute('target')).not.toBe('_blank');
  });

  it('TC-B-07: button does NOT have rel="nofollow" (passes PageRank)', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    const rel = btn?.getAttribute('rel') || '';
    expect(rel).not.toContain('nofollow');
  });

  it('TC-B-08: button has aria-label for accessibility', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
  });

  it('TC-B-09: button has focus ring classes for keyboard navigation', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    const cls = btn?.getAttribute('class') || '';
    expect(cls).toContain('focus:');
  });

  it('TC-B-10: button text contains "Free"', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.textContent).toContain('Free');
  });

  it('TC-B-11: button text contains "Birthday Report"', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn?.textContent).toMatch(/Birthday Report/i);
  });

  it('TC-B-12: button also renders when no celebrities (always show CTA)', () => {
    renderCTA({ celebrities: EMPTY, month: 'August', day: 6 });
    const btn = document.querySelector('[data-testid="cta-button"]');
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute('href')).toContain('/birthday-report');
  });

});

// ════════════════════════════════════════════════════════════
// REASSURANCE TEXT
// ════════════════════════════════════════════════════════════
describe('BirthdayReportCTA — Reassurance', () => {

  it('TC-R-01: "Free" text is present', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const txt = document.querySelector('[data-testid="cta-reassurance"]');
    expect(txt?.textContent).toContain('Free');
  });

  it('TC-R-02: "Instant" text is present', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const txt = document.querySelector('[data-testid="cta-reassurance"]');
    expect(txt?.textContent).toContain('Instant');
  });

  it('TC-R-03: "No credit card" text is present', () => {
    renderCTA({ celebrities: MANY, month: 'January', day: 1 });
    const txt = document.querySelector('[data-testid="cta-reassurance"]');
    expect(txt?.textContent?.toLowerCase()).toContain('no credit card');
  });

});
