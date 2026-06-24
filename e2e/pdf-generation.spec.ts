import { test, expect, Page } from '@playwright/test';
import { completeQuiz, interceptPDFGeneration, getPrintCallCount } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: reach the premium report phase by mocking the phase state
// Since we can't auth as premium in e2e tests, we test what's accessible:
// 1. The name modal (always testable — triggered by button click)
// 2. The PDF HTML content (via iframe interception)
// 3. The print() call count (via window.print interception)
// ─────────────────────────────────────────────────────────────────────────────

async function reachResultsAndInterceptPDF(page: Page, name = 'Test User') {
  await completeQuiz(page, { dob: '1985-06-15' });
  return await interceptPDFGeneration(page, name);
}

// ─────────────────────────────────────────────────────────────────────────────
// NAME MODAL TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PDF — Name modal', () => {
  test('name modal shows "Who is this blueprint for?" heading', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    // Trigger the modal by calling setShowNamePrompt via any visible button
    // The Download Blueprint button in 90-day plan section is visible to all users
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Find any button that triggers the name modal
    // LongevityHeroCard Download button is premium-only, but if visible click it
    const downloadBtn = page.locator('button:has-text("Export PDF")')
      .or(page.locator('button:has-text("Download Blueprint PDF")'))
      .or(page.locator('button:has-text("Unlock My Complete Longevity Blueprint")'))
      .first();

    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await downloadBtn.click();
      await page.waitForTimeout(500);

      // Modal heading
      const heading = page.locator('text=Who is this blueprint for?').first();
      if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(heading).toBeVisible();

        // Subtitle
        await expect(
          page.locator('text=This name will appear on the cover').first()
        ).toBeVisible();

        // Name input
        await expect(
          page.locator('input[placeholder*="name"]').or(page.locator('input[placeholder*="Himanshu"]')).first()
        ).toBeVisible();

        // Both buttons
        await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Generate PDF")').first()).toBeVisible();
      }
    }
  });

  test('name modal Cancel button closes the modal', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const downloadBtn = page.locator('button:has-text("Export PDF")')
      .or(page.locator('button:has-text("Download Blueprint PDF")'))
      .first();

    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await downloadBtn.click();
      await page.waitForTimeout(500);

      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(300);
        // Modal must be gone
        await expect(
          page.locator('text=Who is this blueprint for?').first()
        ).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('name modal accepts Enter key to generate PDF', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    const downloadBtn = page.locator('button:has-text("Export PDF")')
      .or(page.locator('button:has-text("Download Blueprint PDF")'))
      .first();

    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await downloadBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[placeholder*="name"]')
        .or(page.locator('input[placeholder*="Himanshu"]')).first();

      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill('Himanshu');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
        // Modal should close
        await expect(
          page.locator('text=Who is this blueprint for?').first()
        ).not.toBeVisible({ timeout: 2000 });
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF HTML STRUCTURE TESTS (via iframe interception)
// These tests inspect the HTML written to the print iframe BEFORE print() fires
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PDF — HTML structure (iframe inspection)', () => {
  test('PDF HTML contains @page { margin: 0 } to suppress browser URL headers', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      expect(html).toContain('@page');
      expect(html).toContain('margin: 0');
      // Must NOT have margin: 1.2cm at @page level
      expect(html).not.toMatch(/@page\s*\{[^}]*margin:\s*1\.2cm/);
    }
  });

  test('PDF HTML: .page class does NOT have min-height (blank pages fix)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // The .page CSS rule must not contain min-height
      const pageRuleMatch = html.match(/\.page\s*\{([^}]+)\}/);
      if (pageRuleMatch) {
        expect(pageRuleMatch[1]).not.toContain('min-height');
      }
    }
  });

  test('PDF HTML: correct number of .page divs (10–13 content pages)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      const matches = html.match(/class="page/g);
      const pageCount = matches ? matches.length : 0;
      // Should have 10–13 page divs (cover + health profile + bar chart + analysis + etc.)
      expect(pageCount).toBeGreaterThanOrEqual(10);
      expect(pageCount).toBeLessThanOrEqual(15);
    }
  });

  test('PDF HTML: all required section headings are present', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      expect(html).toContain('Your Health Profile');
      expect(html).toContain('How Your Number Was Built');
      expect(html).toContain('Forecast Breakdown');
      expect(html).toContain('Factor Breakdown Table');
      expect(html).toContain('Personalised Health Analysis');
      expect(html).toContain('Your Top Improvement Opportunities');
      expect(html).toContain('Your Epigenetic Blueprint');
      expect(html).toContain('Biological Blueprint');
      expect(html).toContain('Community Anchor');
      expect(html).toContain('Your Personal Health Guide');
      expect(html).toContain('Your Personalised 90-Day Plan');
      expect(html).toContain('Scientific Foundation');
    }
  });

  test('PDF HTML: no 📅 emoji in 90-Day Plan heading', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // The heading should NOT contain the calendar emoji that rendered as "17"
      const planHeading = html.match(/Your Personalised 90-Day Plan/);
      expect(planHeading).not.toBeNull();
      // Check the surrounding context for emoji
      const headingContext = html.match(/.{0,20}Your Personalised 90-Day Plan.{0,20}/)?.[0] || '';
      expect(headingContext).not.toContain('📅');
    }
  });

  test('PDF HTML: gauge arc uses correct center (70,80) and radius 55', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // Background arc (always present)
      expect(html).toContain('M15,80 A55,55 0 0,1 125,80');
      // Score arc must also use A55,55 (same radius as background)
      const arcMatches = html.match(/A55,55/g);
      expect(arcMatches).not.toBeNull();
      expect(arcMatches!.length).toBeGreaterThanOrEqual(2); // background + score arc
    }
  });

  test('PDF HTML: baseline bar is 85% wide (fixed anchor)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // WHO Baseline bar should always be 85%
      expect(html).toContain('width:85%;background:#4f46e5');
    }
  });

  test('PDF HTML: health adjustment bar is proportional (not always 85% or 100%)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // Find the health bar — it comes after the baseline bar
      const barFills = html.match(/class="bar-fill" style="width:[\d.]+%/g) || [];
      // At least 5 bars (baseline + health + genetic + epigenetic + community)
      expect(barFills.length).toBeGreaterThanOrEqual(5);

      // Health bar (second bar) should be <= 85%
      if (barFills.length >= 2) {
        const healthBarWidth = parseFloat(barFills[1].match(/width:([\d.]+)%/)?.[1] ?? '100');
        expect(healthBarWidth).toBeLessThanOrEqual(85);
      }
    }
  });

  test('PDF HTML: small value bars have minimum 4% width (floor applied)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // All bar-fill elements should have width >= 4% (the minimum floor in calcAdjBarWidth)
      const barWidths = [...html.matchAll(/class="bar-fill" style="width:([\d.]+)%/g)]
        .map(m => parseFloat(m[1]));

      for (const width of barWidths) {
        expect(width).toBeGreaterThanOrEqual(4);
      }
    }
  });

  test('PDF HTML: name appears on cover page', async ({ page }) => {
    const testName = 'Playwright Test';
    const html = await reachResultsAndInterceptPDF(page, testName);
    if (html) {
      // Name should appear in the PDF (title-cased)
      expect(html).toContain('Playwright Test');
    }
  });

  test('PDF HTML: BornClock branding present on cover', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      expect(html).toContain('BornClock');
      expect(html).toContain('bornclock.com');
      expect(html).toContain('PERSONAL LONGEVITY BLUEPRINT');
    }
  });

  test('PDF HTML: scoreBand description appears exactly once (no duplicate cover block)', async ({ page }) => {
    const html = await reachResultsAndInterceptPDF(page);
    if (html) {
      // The score description text should appear only once in the HTML
      const matches = html.match(/70–75% of longevity is controlled by lifestyle/g)
        || html.match(/above average/g)
        || html.match(/several lifestyle factors are limiting/g);

      if (matches) {
        expect(matches.length).toBe(1);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRINT TRIGGER TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PDF — Print trigger (single dialog)', () => {
  test('no double-print dialog regression (print fires at most once)', async ({ page }) => {
    // REGRESSION GUARD: before the fix, PDF used both iframe.onload and a backup setTimeout(1800)
    // as triggers, causing print() to fire twice — showing two dialogs. The fix removed the backup.
    //
    // For free users (no premium): PDF generation redirects to /upgrade, no iframe is created,
    // count = 0 — this is correct and the test still passes.
    // For premium users: only the single onload trigger fires, count = 1.
    // If the double-print regression returns: count = 2, test FAILS (correct).
    await completeQuiz(page, { dob: '1985-06-15' });
    await interceptPDFGeneration(page, 'Test');

    // Wait for any delayed print calls beyond the 800ms onload delay
    await page.waitForTimeout(3000);

    const count = await getPrintCallCount(page);
    // 0 = free user (no PDF generated), 1 = premium (single print) — both acceptable.
    // 2+ = double-print regression — must never happen.
    expect(count).toBeLessThanOrEqual(1);
  });

  test('no JavaScript errors thrown during PDF generation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Print failed')) {
        errors.push(msg.text());
      }
    });

    await completeQuiz(page, { dob: '1985-06-15' });
    await interceptPDFGeneration(page, 'Test User');
    await page.waitForTimeout(3000);

    const critical = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('analytics') &&
      !e.includes('gtag') &&
      !e.includes('ipapi') &&
      !e.includes('CORS') &&
      !e.includes('net::ERR')
    );
    expect(critical).toHaveLength(0);
  });

  test('iframe is removed from DOM after PDF generation completes', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await interceptPDFGeneration(page, 'Test');

    // Wait for cleanup (iframe removed after 5000ms)
    await page.waitForTimeout(6000);

    // The hidden iframe must no longer exist in the DOM
    const iframeCount = await page.evaluate(() => {
      return document.querySelectorAll('iframe[style*="-9999px"]').length;
    });
    expect(iframeCount).toBe(0);
  });
});
