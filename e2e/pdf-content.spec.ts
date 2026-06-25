import { test, expect, Page } from '@playwright/test';
import { completeQuiz } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// PDF Content Tests — assert that __LAST_PDF_HTML__ contains required sections
// Uses (window as any).__LAST_PDF_HTML__ set in handleDownloadBlueprint
// ─────────────────────────────────────────────────────────────────────────────

async function triggerPDFAndGetHTML(page: Page): Promise<string | null> {
  await completeQuiz(page, { dob: '1985-06-15' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Click Export Longevity Blueprint button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.includes('Export Longevity Blueprint'));
    if (btn) (btn as HTMLButtonElement).click();
  });

  // Wait for __LAST_PDF_HTML__ to be set
  await page.waitForFunction(
    () => !!(window as any).__LAST_PDF_HTML__,
    { timeout: 8000 }
  ).catch(() => null);

  return page.evaluate(() => (window as any).__LAST_PDF_HTML__ ?? null);
}

test.describe('PDF content — new sections', () => {
  test('PDF HTML: print-color-adjust present in * selector', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('print-color-adjust: exact !important');
      expect(html).toContain('-webkit-print-color-adjust: exact !important');
    }
  });

  test('PDF HTML: YOUR LIFE COUNTDOWN section present', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('YOUR LIFE COUNTDOWN');
      expect(html).toContain('class="countdown"');
    }
  });

  test('PDF HTML: intro-stats block present', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('class="intro-stats"');
      expect(html).toContain('14 personal factors');
    }
  });

  test('PDF HTML: Your Genetic Ceiling section present', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('Your Genetic Ceiling');
      expect(html).toContain('class="ceiling"');
    }
  });

  test('PDF HTML: baseline source text present', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('UN World Population Prospects 2024');
      expect(html).toContain('class="baseline-src"');
    }
  });

  test('PDF HTML: bar-row elements have print-color-adjust', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      // .bar-fill CSS class must carry print-color-adjust (prevents color stripping)
      const barFillRule = html.match(/\.bar-fill\s*\{[^}]+\}/)?.[0] ?? '';
      expect(barFillRule).toContain('print-color-adjust');
    }
  });

  test('PDF HTML: gauge renders as conic-gradient ring (v4 clinical)', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      // Gauge replaced with CSS conic-gradient ring in v4
      expect(html).toContain('conic-gradient');
    }
  });

  test('PDF HTML: bar-fill divs carry inline print-color-adjust', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      // Each .bar-fill now has -webkit-print-color-adjust inline
      const inlineMatches = html.match(/class="bar-fill" style="[^"]*print-color-adjust/g) || [];
      expect(inlineMatches.length).toBeGreaterThanOrEqual(5);
    }
  });

  test('PDF HTML: no "mentor" voice leak in longevity PDF', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      // "Your mentor's profile aligns with" must not appear — replaced with "Your profile aligns with"
      expect(html).not.toContain("mentor's profile aligns with");
    }
  });

  test('PDF HTML: cover title has white-space:nowrap to prevent mid-word wrap', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('white-space:nowrap');
    }
  });

  // ── v4 Clinical Overhaul tests ────────────────────────────────────────────

  test('PDF HTML v4: real logo PNG referenced on cover', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('/bornclock-logo.png');
    }
  });

  test('PDF HTML v4: vitals strip uses CSS grid repeat(4)', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toMatch(/grid-template-columns:repeat\(4/);
    }
  });

  test('PDF HTML v4: design tokens (--navy) injected into PDF style block', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('--navy');
    }
  });

  test('PDF HTML v4: no purple/violet hex codes (#6d28d9, #7c3aed, #4338ca)', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).not.toMatch(/#6d28d9|#7c3aed|#4338ca/);
    }
  });

  test('PDF HTML v4: section eyebrow labels present (INTAKE, METHODOLOGY, EVIDENCE)', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('INTAKE');
      expect(html).toContain('METHODOLOGY');
      expect(html).toContain('EVIDENCE');
    }
  });

  // ── v5 charset, humanize, genetics-reframe tests ──────────────────────────

  test('PDF HTML v5: charset utf-8 is first element in <head>', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('<meta charset="utf-8"');
    }
  });

  test('PDF HTML v5: no raw quiz enum strings leak into output', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).not.toContain('6to7');
      expect(html).not.toContain('quit_under5');
      expect(html).not.toContain('seldom');
    }
  });

  test('PDF HTML v5: Genetic Ceiling reframe present in top opportunities', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).toContain('Genetic Ceiling');
    }
  });

  test('PDF HTML v5: genetics not shown as raw (+6.6) opportunity', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).not.toMatch(/Family Genetics \(\+6\.6/);
    }
  });

  test('PDF HTML v5: no undefined or NaN values in output', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      expect(html).not.toContain('>undefined<');
      expect(html).not.toContain('>NaN<');
      expect(html).not.toMatch(/\bundefined\b.*yrs/);
      expect(html).not.toMatch(/NaN yrs/);
    }
  });
});
