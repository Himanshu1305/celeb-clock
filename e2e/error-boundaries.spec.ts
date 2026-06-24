import { test, expect } from '@playwright/test';

test.describe('Error boundaries and resilience', () => {
  test('malformed birthday route shows graceful page not blank', async ({ page }) => {
    await page.goto('/birthday/99/99');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const body = await page.evaluate(() => document.body.innerText.trim());
    expect(body.length).toBeGreaterThan(20);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('unknown answer page shows graceful fallback', async ({ page }) => {
    await page.goto('/answers/this-question-does-not-exist-xyz');
    await page.waitForTimeout(1000);
    const body = await page.evaluate(() => document.body.innerText.trim());
    expect(body.length).toBeGreaterThan(20);
  });

  test('blog article that does not exist shows 404 not blank', async ({ page }) => {
    await page.goto('/blog/this-post-does-not-exist-abc123');
    await page.waitForTimeout(1000);
    const body = await page.evaluate(() => document.body.innerText.trim());
    expect(body.length).toBeGreaterThan(20);
  });

  test('no JavaScript errors on life-expectancy page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const critical = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('analytics') &&
      !e.includes('gtag') &&
      !e.includes('clarity') &&
      !e.includes('net::ERR')
    );
    expect(critical).toHaveLength(0);
  });

  test('no JavaScript errors after completing quiz', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.waitFor({ state: 'visible', timeout: 10000 });
    await dobInput.fill('1985-06-15');
    await page.waitForTimeout(600);

    await page.locator('label[for="male"]').or(page.locator('text=Male').first()).first().click();

    for (let i = 0; i < 7; i++) {
      const btn = page.locator('button:has-text("Next Step")').first();
      if (await btn.isVisible({ timeout: 3000 })) { await btn.click(); await page.waitForTimeout(400); }
    }

    const cta = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
    if (await cta.isVisible({ timeout: 10000 })) {
      await cta.click();
      await page.waitForTimeout(3000);
    }

    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('analytics'));
    expect(critical).toHaveLength(0);
  });
});
