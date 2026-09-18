import { test, expect } from '@playwright/test';

// Parts Y/Z/AA — Science & Longevity, Birthday Fun, Mystic Corner landing pages.
// All render via the shared <CategoryLandingPage>, so they share the `landing-*` testids
// and must read as one coherent family with Part W's /vedic-astrology.

const PAGES = [
  {
    slug: '/science-longevity', h1: /Not a horoscope/i, cta: '/life-expectancy',
    answer: /statistical model/i,
    stats: [['15', 'Health factors'], ['54', 'Countries'], ['3', 'data sources']],
    tools: ['/life-expectancy', '/biological-age', '/coach', '/country-comparison'],
    forbidden: [] as RegExp[],
  },
  {
    slug: '/birthday-fun', h1: /real depth most sites skip/i, cta: '/celebrity-birthday',
    answer: /Nakshatra/i,
    stats: [['3000', 'Celebrities'], ['7', 'age tools'], ['366', 'birthdays covered']],
    tools: ['/age-calculator', '/celebrity-birthday', '/todays-birthdays', '/birthday-countdown', '/age-in-days', '/age-in-seconds', '/planetary-age'],
    forbidden: [/wast(e|ing)\s+(your\s+)?time/i],  // rejected framing must NOT appear
  },
  {
    slug: '/mystic-corner', h1: /Your name carries a code/i, cta: '/numerology',
    answer: /thousands of years/i,
    stats: [['3', 'Traditions'], ['9', 'Life Path']],
    tools: ['/numerology', '/name-numerology', '/tarot-card-by-birthday'],
    forbidden: [/precisely computed/i, /rigorously (verified|computed)/i],  // rigor language reserved for Vedic
  },
];

for (const p of PAGES) {
  test(`${p.slug}: hero + direct-answer + CTA`, async ({ page }) => {
    await page.goto(p.slug);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('landing-hero')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
    await expect(page.getByTestId('landing-answer')).toContainText(p.answer);
    await expect(page.getByTestId('landing-hero-cta')).toHaveAttribute('href', p.cta);
  });

  test(`${p.slug}: stats show real verified numbers after count-up`, async ({ page }) => {
    await page.goto(p.slug);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    const stats = page.getByTestId('landing-stat');
    await expect(stats).toHaveCount(p.stats.length);
    for (let i = 0; i < p.stats.length; i++) {
      await expect(stats.nth(i)).toContainText(p.stats[i][0]);
      await expect(stats.nth(i)).toContainText(p.stats[i][1]);
    }
  });

  test(`${p.slug}: all tool links resolve (no 404)`, async ({ page }) => {
    // /celebrity-birthday is an INTENTIONAL redirect to /celebrity/ (Celebrity Match) —
    // accept the known redirect target rather than requiring an exact pathname match.
    const REDIRECTS: Record<string, string> = { '/celebrity-birthday': '/celebrity' };
    for (const href of p.tools) {
      await page.goto(p.slug);
      await page.waitForLoadState('networkidle');
      await page.locator(`[data-testid^="landing-tool-"][href="${href}"]`).first().click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator("text=/404|doesn't exist/i")).toHaveCount(0);
      const landed = new URL(page.url()).pathname.replace(/\/$/, '');
      expect(landed).toBe((REDIRECTS[href] || href).replace(/\/$/, ''));
    }
  });

  test(`${p.slug}: language selector Hindi coming-soon, no silent fail`, async ({ page }) => {
    await page.goto(p.slug);
    await page.waitForLoadState('networkidle');
    await page.getByTestId('landing-lang-hi').click();
    await expect(page.getByTestId('landing-hindi-notice')).toBeVisible();
  });

  if (p.forbidden.length) {
    test(`${p.slug}: rejected/forbidden copy is ABSENT`, async ({ page }) => {
      await page.goto(p.slug);
      await page.waitForLoadState('networkidle');
      const body = await page.locator('body').innerText();
      for (const re of p.forbidden) expect(body).not.toMatch(re);
    });
  }
}

test('all four landing pages share the same template family (same testids present)', async ({ page }) => {
  for (const slug of ['/vedic-astrology', '/science-longevity', '/birthday-fun', '/mystic-corner']) {
    await page.goto(slug);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('landing-hero')).toBeVisible();
    await expect(page.getByTestId('landing-answer')).toBeVisible();
    await expect(page.getByTestId('landing-hero-cta')).toBeVisible();
    await expect(page.getByTestId('landing-stat').first()).toBeVisible();
    await expect(page.getByTestId('landing-closing')).toBeVisible();
  }
});
