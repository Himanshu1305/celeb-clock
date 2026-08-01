/**
 * Suite — batch-7b.spec.ts  (BATCH-7B: P3 compatibility depth, P10 weight page, T1/T2)
 *
 * Mix of pure-logic (compatibility prose composition) and browser tests (client-rendered
 * content + discoverability). Browser tests run against the vite dev server.
 */
import { test, expect, type Page } from '@playwright/test';
import {
  loveProse, friendshipProse, workProse, aspectName, signDistance, type Sign,
} from '../../src/lib/compatibilityProse';

// ── P3 pure-logic — composition is pair-specific and section-distinct ─────────
test.describe('BATCH-7B P3 — composed compatibility prose', () => {
  test('the three sections differ for the same pair (Love ≠ Friendship ≠ Work)', () => {
    const love = loveProse('Aries', 'Leo');
    const friend = friendshipProse('Aries', 'Leo');
    const work = workProse('Aries', 'Leo');
    expect(love).not.toBe(friend);
    expect(friend).not.toBe(work);
    expect(love).not.toBe(work);
    // each is substantial, not a stub
    for (const s of [love, friend, work]) expect(s.length).toBeGreaterThan(120);
    // section engines: love names planets, work names modality roles
    expect(love).toMatch(/Mars|Sun/);
    expect(work.toLowerCase()).toMatch(/cardinal|fixed|initiator|sustainer/);
  });

  test('T2 thin-content guard: two same-element pairs differ meaningfully', () => {
    // Both Fire–Fire, but different signs/planets/modalities → must not be templated-identical.
    const ariesLeo = loveProse('Aries', 'Leo');
    const leoSag = loveProse('Leo', 'Sagittarius');
    expect(ariesLeo).not.toBe(leoSag);
    // Work sections diverge on modality (Cardinal+Fixed vs Fixed+Mutable)
    expect(workProse('Aries', 'Leo')).not.toBe(workProse('Leo', 'Sagittarius'));
  });

  test('T2 same-sign pairs compose sensibly (conjunction)', () => {
    expect(signDistance('Aries', 'Aries')).toBe(0);
    expect(aspectName('Aries', 'Aries')).toBe('conjunction');
    expect(friendshipProse('Aries', 'Aries').toLowerCase()).toMatch(/same sign|mirror/);
  });

  test('aspect names map to sign distance correctly', () => {
    expect(aspectName('Aries', 'Leo')).toBe('trine');       // 4 apart, same element
    expect(aspectName('Aries', 'Libra')).toBe('opposition'); // 6 apart
    expect(aspectName('Aries', 'Cancer')).toBe('square');    // 3 apart
  });
});

// ── P3 browser — same-sign renders, invalid slug is a real not-found ──────────
test.describe('BATCH-7B P3 — pair page rendering', () => {
  test('same-sign /compatibility/aries/aries renders pair content', async ({ page }) => {
    await page.goto('/compatibility/aries/aries');
    // The answer H2 (level 2) — the FAQ accordion renders the same text as an h3, so pin the level.
    await expect(page.getByRole('heading', { name: 'Are Aries and Aries compatible?', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /the full reading/i })).toBeVisible();
  });

  test('T2 invalid slug /compatibility/aries/dragon → not-found, NOT the calculator', async ({ page }) => {
    await page.goto('/compatibility/aries/dragon');
    await expect(page.getByText(/zodiac pairing doesn’t exist/i)).toBeVisible();
    // The calculator "Check Compatibility" button must NOT be on this page.
    await expect(page.getByRole('button', { name: /Check Compatibility/i })).toHaveCount(0);
  });
});

// ── P10 browser — the weight page works ───────────────────────────────────────
test.describe('BATCH-7B P10 — weight on planets', () => {
  test('/weight-on-planets renders and computes a result for the default weight', async ({ page }) => {
    await page.goto('/weight-on-planets');
    await expect(page.getByRole('heading', { name: /weigh on other planets/i })).toBeVisible();
    // Default 70 kg → results grid computes each body. "177 kg" is Jupiter's unique result
    // (70 × 2.53 = 177.1) and "63.5 kg" is Venus (70 × 0.907) — proving the grid renders + computes.
    await expect(page.getByText('177 kg')).toBeVisible();
    await expect(page.getByText('63.5 kg')).toBeVisible();
  });
});

// ── T1 discoverability sweep — every new/redone surface reachable ─────────────
async function menuHrefs(page: Page, triggerText: string): Promise<string[]> {
  await page.locator('nav.hidden.md\\:flex button', { hasText: triggerText }).first().click();
  const menu = page.locator('[role="menu"]').last();
  await menu.waitFor({ state: 'visible' });
  const hrefs = await menu.locator('a[href^="/"]').evaluateAll(els =>
    els.map(e => (e as HTMLAnchorElement).getAttribute('href')!).filter(Boolean));
  await page.keyboard.press('Escape');
  return hrefs;
}

test.describe('BATCH-7B T1 — discoverability of new surfaces', () => {
  test('desktop nav: /gift + /coach under More, /weight-on-planets under Explore', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const more = await menuHrefs(page, 'More');
    expect(more).toContain('/gift');
    expect(more).toContain('/coach');
    const explore = await menuHrefs(page, 'Explore');
    expect(explore).toContain('/weight-on-planets');
  });

  test('footer links to /gift, /coach, /weight-on-planets, /compatibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const footer = page.locator('footer');
    for (const href of ['/gift', '/coach', '/weight-on-planets', '/compatibility']) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('/compatibility links to at least one real pair page', async ({ page }) => {
    await page.goto('/compatibility');
    await page.waitForLoadState('networkidle');
    // Best-matches grid renders /compatibility/{a}/{b} links.
    await expect(page.locator('a[href^="/compatibility/"]').first()).toBeVisible();
  });

  test('390px mobile: /gift, /coach, /weight-on-planets all reachable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Toggle navigation menu/i }).click();
    for (const href of ['/gift', '/coach', '/weight-on-planets']) {
      await expect(page.locator(`a[href="${href}"]:visible`).first()).toBeVisible();
    }
  });
});
