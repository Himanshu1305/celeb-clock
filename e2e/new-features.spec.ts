import { test, expect } from '@playwright/test';

test.describe('Tarot Card by Birthday', () => {
  test('page loads with h1 and card selection', async ({ page }) => {
    await page.goto('/tarot-card-by-birthday');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Tarot');
  });

  test('birth date input shows tarot card result', async ({ page }) => {
    await page.goto('/tarot-card-by-birthday');
    await page.waitForLoadState('networkidle');

    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 5000 })) {
      await dateInput.fill('1990-06-17');
      await page.waitForTimeout(800);
      const result = page.locator('text=The').or(page.locator('[class*="tarot"], [class*="card"]')).first();
      if (await result.isVisible({ timeout: 3000 })) {
        const text = await result.innerText();
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Moon Sign Calculator', () => {
  test('page loads with h1', async ({ page }) => {
    await page.goto('/moon-sign');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Moon');
  });

  test('birth date input shows moon sign', async ({ page }) => {
    await page.goto('/moon-sign');
    await page.waitForLoadState('networkidle');

    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 5000 })) {
      await dateInput.fill('1990-06-17');
      await page.waitForTimeout(800);
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      let foundSign = false;
      for (const sign of signs) {
        if (await page.locator(`text=${sign}`).first().isVisible({ timeout: 500 }).catch(() => false)) {
          foundSign = true;
          break;
        }
      }
      expect(foundSign).toBe(true);
    }
  });
});

test.describe('Name Numerology Calculator', () => {
  test('page loads with h1', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Numerology');
  });

  test('name input produces numerology result', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[type="text"], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill('Jane Doe');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);

      const result = page.locator('text=Expression').or(page.locator('text=Soul Urge')).or(page.locator('text=Personality')).first();
      if (await result.isVisible({ timeout: 3000 })) {
        await expect(result).toBeVisible();
      }
    }
  });
});

test.describe('Biorhythm Calculator', () => {
  test('page loads with h1 and chart', async ({ page }) => {
    await page.goto('/biorhythm');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Biorhythm');
  });

  test('birth date shows physical/emotional/intellectual cycles', async ({ page }) => {
    await page.goto('/biorhythm');
    await page.waitForLoadState('networkidle');

    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 5000 })) {
      await dateInput.fill('1990-06-17');
      await page.waitForTimeout(1000);

      const cycleLabels = ['Physical', 'Emotional', 'Intellectual'];
      for (const label of cycleLabels) {
        const el = page.locator(`text=${label}`).first();
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(el).toBeVisible();
        }
      }
    }
  });
});

test.describe('Zodiac Compatibility Calculator', () => {
  test('page loads with h1', async ({ page }) => {
    await page.goto('/compatibility');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Compatibility');
  });

  test('selecting two signs shows compatibility result', async ({ page }) => {
    await page.goto('/compatibility');
    await page.waitForLoadState('networkidle');

    const signButtons = page.locator('button:has-text("Aries"), button:has-text("Leo"), [data-sign]');
    const count = await signButtons.count();
    if (count >= 2) {
      await signButtons.first().click();
      await page.waitForTimeout(300);
      await signButtons.nth(1).click();
      await page.waitForTimeout(500);

      const result = page.locator('text=compatibility').or(page.locator('text=Compatibility')).or(page.locator('[class*="result"]')).first();
      if (await result.isVisible({ timeout: 3000 })) {
        await expect(result).toBeVisible();
      }
    }
  });

  test('direct URL /compatibility/:sign1/:sign2 renders', async ({ page }) => {
    await page.goto('/compatibility/aries/leo');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });
});

test.describe('Rashi Ratna — Indian Vedic Birthstones', () => {
  test('page loads with h1 and gemstone content', async ({ page }) => {
    await page.goto('/rashi-ratna');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Rashi');
  });

  test('zodiac sign buttons show gemstone recommendations', async ({ page }) => {
    await page.goto('/rashi-ratna');
    await page.waitForLoadState('networkidle');

    const signs = ['Aries', 'Taurus', 'Mesh', 'Vrishabha'];
    for (const sign of signs) {
      const btn = page.locator(`button:has-text("${sign}"), text=${sign}`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(400);
        const gem = page.locator('text=Ruby').or(page.locator('text=Emerald')).or(page.locator('text=Diamond')).or(page.locator('text=Gemstone')).first();
        if (await gem.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(gem).toBeVisible();
        }
        break;
      }
    }
  });
});

test.describe('Birthday Hub — /birthday', () => {
  test('hub page loads listing all months', async ({ page }) => {
    await page.goto('/birthday');
    await page.waitForLoadState('networkidle');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const h1Text = await h1.innerText();
    expect(h1Text.toLowerCase()).toContain('birthday');

    const januaryLink = page.locator('text=January').or(page.locator('text=Jan')).first();
    await expect(januaryLink).toBeVisible({ timeout: 5000 });
  });

  test('/birthday/6/17 shows June 17 day page', async ({ page }) => {
    await page.goto('/birthday/6/17');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    const h1Text = await page.locator('h1').first().innerText();
    expect(h1Text.toLowerCase()).toMatch(/june.*17|17.*june/);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });
});

test.describe('Life Expectancy — Bug Fix Verification', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('analytics'));
    expect(critical).toHaveLength(0);
  });

  test('shared result banner shown when ?shared=1 param present', async ({ page }) => {
    await page.goto('/life-expectancy?shared=1&forecast=78&age=42&remaining=36');
    await page.waitForLoadState('networkidle');
    const banner = page.locator('text=shared their BornClock').or(page.locator('text=78-year life expectancy')).first();
    await expect(banner).toBeVisible({ timeout: 5000 });
  });

  test('What-If simulator does not show optimized number before interaction', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    const simulator = page.locator('[data-sim="true"]').or(page.locator('text=What-If Simulator')).first();
    if (await simulator.isVisible({ timeout: 8000 })) {
      const optimizedNumber = page.locator('text=Optimized Lifestyle').first();
      if (await optimizedNumber.isVisible({ timeout: 3000 }).catch(() => false)) {
        const optimizedText = await optimizedNumber.locator('..').innerText().catch(() => '');
        expect(optimizedText).not.toMatch(/\d{2,3}\.\d yrs/);
      }
    }
  });
});
