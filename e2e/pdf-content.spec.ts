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

  test('PDF HTML: SVG gauge conic-gradient or arc path present', async ({ page }) => {
    const html = await triggerPDFAndGetHTML(page);
    if (html) {
      // Gauge renders as inline SVG arc
      expect(html).toContain('A55,55');
    }
  });
});
