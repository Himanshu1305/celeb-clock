import { Page, expect } from '@playwright/test';

// ── Quiz completion ────────────────────────────────────────────────────────────

export async function fillDOB(page: Page, dob: string) {
  const dobInput = page.locator('input[type="date"]').first();
  await dobInput.waitFor({ state: 'visible', timeout: 10000 });
  await dobInput.fill(dob);
  await page.waitForTimeout(500);
}

export async function selectGender(page: Page, gender: 'male' | 'female') {
  const selector = gender === 'male'
    ? page.locator('label[for="male"]').or(page.locator('text=Male').first()).first()
    : page.locator('label[for="female"]').or(page.locator('text=Female').first()).first();
  await selector.click();
  await page.waitForTimeout(300);
}

export async function clickThroughSteps(page: Page, steps: number) {
  for (let i = 0; i < steps; i++) {
    const btn = page.locator('button:has-text("Next Step")').first();
    if (await btn.isVisible({ timeout: 3000 })) {
      await btn.click();
      await page.waitForTimeout(400);
    }
  }
}

export async function completeQuiz(page: Page, options: {
  dob?: string;
  gender?: 'male' | 'female';
} = {}) {
  await page.goto('/life-expectancy');
  await page.waitForLoadState('networkidle');

  await fillDOB(page, options.dob ?? '1985-06-15');

  await selectGender(page, options.gender ?? 'male');

  // Steps 1–7 via Next Step
  await clickThroughSteps(page, 7);

  // Step 8 — final CTA
  const cta = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });
  await cta.click();

  // Wait for results
  await expect(
    page.locator('text=What-If Simulator').or(page.locator('text=YOUR FORECASTED AGE')).first()
  ).toBeVisible({ timeout: 20000 });

  // Dismiss paywall modal if it appears
  await page.waitForTimeout(2000);
  const maybe = page.locator('button:has-text("Maybe later")').first();
  if (await maybe.isVisible({ timeout: 3000 }).catch(() => false)) {
    await maybe.click();
    await page.waitForTimeout(300);
  }
}

export async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}

export async function interactWithSlider(page: Page) {
  const slider = page.locator('[role="slider"]').first();
  await slider.waitFor({ state: 'visible', timeout: 5000 });
  await slider.focus();
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await page.waitForTimeout(600);
}

/**
 * Triggers PDF generation and returns the iframe's HTML content for inspection.
 * Works by intercepting window.print before it fires, giving us access to the
 * iframe contentDocument that would have been printed.
 *
 * IMPORTANT: This bypasses the premium check by directly manipulating the DOM
 * after quiz completion. The test injects a click on the Export PDF button via
 * evaluate() after making it visible, OR directly invokes the iframe mechanism.
 *
 * Returns the full HTML string written to the iframe, or null if generation failed.
 */
export async function interceptPDFGeneration(page: Page, name: string = 'Test User'): Promise<string | null> {
  // Intercept document.createElement('iframe') to capture the HTML written to the print iframe
  // Note: the code calls iframe.contentWindow.print() — NOT window.print() —
  // so we intercept the iframe's own print method after the iframe is appended to DOM.
  await page.evaluate(() => {
    (window as any).__printCallCount = 0;
    (window as any).__pdfIframeHTML = null;

    // Intercept iframe creation to capture HTML written to it
    const origCreate = document.createElement.bind(document);
    (document as any).createElement = (tag: string, ...args: any[]) => {
      const el = origCreate(tag, ...args) as HTMLIFrameElement;
      if (tag.toLowerCase() === 'iframe') {
        // After doc.write() completes, capture the HTML
        setTimeout(() => {
          try {
            const html = el.contentDocument?.documentElement?.outerHTML || '';
            if (html.length > 100) (window as any).__pdfIframeHTML = html;
          } catch {}
        }, 600);
      }
      return el;
    };
  });

  // Trigger the name modal by clicking Export PDF / Download Blueprint button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const exportBtn = buttons.find(b =>
      b.textContent?.includes('Export PDF') ||
      b.textContent?.includes('Download Blueprint') ||
      b.textContent?.includes('Longevity Blueprint')
    );
    if (exportBtn) (exportBtn as HTMLButtonElement).click();
  });

  await page.waitForTimeout(500);

  // Fill name in modal if it appeared
  const nameInput = page.locator('input[placeholder*="name"]').or(
    page.locator('input[placeholder*="Himanshu"]')
  ).first();

  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill(name);
    const generateBtn = page.locator('button:has-text("Generate PDF")').first();
    await generateBtn.click();
  }

  // After Generate PDF is clicked, poll for the hidden iframe and intercept its
  // contentWindow.print() — this is what the code actually calls (not window.print())
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let checks = 0;
      function poll() {
        const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];
        const pdfIframe = iframes.find(f =>
          f.style && (f.style.top === '-9999px' || f.style.left === '-9999px')
        );
        if (pdfIframe && pdfIframe.contentWindow) {
          // Override the iframe's print method to count calls without opening a dialog
          pdfIframe.contentWindow.print = () => {
            (window as any).__printCallCount = ((window as any).__printCallCount || 0) + 1;
          };
          resolve();
          return;
        }
        if (checks++ < 40) setTimeout(poll, 100); // poll for up to 4 seconds
        else resolve(); // give up — iframe may not have appeared
      }
      poll();
    });
  });

  // Wait for iframe load + 800ms delay + print call to complete
  await page.waitForTimeout(2500);

  const html = await page.evaluate(() => (window as any).__pdfIframeHTML || null);
  return html;
}

export async function getPrintCallCount(page: Page): Promise<number> {
  return await page.evaluate(() => (window as any).__printCallCount ?? 0);
}
