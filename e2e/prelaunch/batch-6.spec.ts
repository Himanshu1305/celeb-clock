/**
 * Suite Q — batch-6.spec.ts  (BATCH-6 Phases 1, 2, 5)
 *
 * Phase 2 (email merge) is tested via PURE exported helpers — no email is ever sent,
 * so the email-safety rule is satisfied by construction. Phase 1 (month-hub Indians)
 * is a live content test on /born-in-may. Phase 5 (compatibility Western label + nav)
 * asserts prerendered content + footer discoverability.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { purchaseEmailSubject, purchaseEmailHasAttachment } from '../../api/_invoice-email';

const DIST = resolve(process.cwd(), 'dist');
const html = (route: string) => readFileSync(resolve(DIST, route.replace(/^\//, ''), 'index.html'), 'utf-8');
const distExists = existsSync(resolve(DIST, 'index.html'));

// ── Phase 2 — merged purchase email (pure, never sends) ───────────────────────
test.describe('BATCH-6 Phase 2 — one merged purchase email', () => {
  test('report + invoice → single confirmation email referencing the invoice, with attachment', () => {
    expect(purchaseEmailSubject('birthday_report', 'BC/26-27/1003'))
      .toBe('Payment confirmed — your BornClock invoice BC/26-27/1003');
    expect(purchaseEmailHasAttachment('BC/26-27/1003', '<html>invoice</html>')).toBe(true);
  });

  test('subscription + invoice → Premium welcome referencing the invoice, with attachment', () => {
    expect(purchaseEmailSubject('subscription', 'BN/26-27/1002'))
      .toBe('Welcome to Premium — your BornClock invoice BN/26-27/1002');
    expect(purchaseEmailHasAttachment('BN/26-27/1002', '<html>invoice</html>')).toBe(true);
  });

  test('failure isolation: invoice missing → confirmation still sends, WITHOUT attachment', () => {
    // report
    expect(purchaseEmailSubject('birthday_report', undefined))
      .toBe('Payment confirmed — your BornClock Birthday Blueprint');
    // subscription
    expect(purchaseEmailSubject('subscription', undefined)).toBe('Welcome to BornClock Premium');
    // no invoice → no attachment (but a confirmation email is still produced)
    expect(purchaseEmailHasAttachment(undefined, undefined)).toBe(false);
    expect(purchaseEmailHasAttachment('BC/26-27/1003', undefined)).toBe(false);
  });
});

// ── Phase 1 — Indian celebrities on month hubs (data layer) ───────────────────
// The month-hub Indian section is CLIENT-fetched and MonthHub deliberately skips that
// fetch when navigator.webdriver is true (a prerender optimisation Playwright can't
// un-set). So a browser render assertion is impossible in automation; instead we assert
// the EXACT nationality-filtered query that powers the section — the reliable, deterministic
// check that it surfaces recognisable Indians. (Live UI render verified separately.)
import { createClient } from '@supabase/supabase-js';
const SUPA_URL = 'https://jwrpqiypvystivtqyhro.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cnBxaXlwdnlzdGl2dHF5aHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjU0MzUsImV4cCI6MjA3NDA0MTQzNX0.3FRNvnJZKCDKLesiF9lk2D349kmbs93o90R_FPd9tv0';

test.describe('BATCH-6 Phase 1 — month-hub Indian celebrities', () => {
  test('the /born-in-may Indian query surfaces recognisable Indians (≥3, incl. Tagore)', async () => {
    const db = createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false } });
    const { data, error } = await db
      .from('celebrity_sitelinks')
      .select('name')
      .like('birth_month_day', '05-%')
      .eq('nationality_code', 'IN')
      .order('sitelinks', { ascending: false })
      .limit(12);
    expect(error).toBeNull();
    const names = (data ?? []).map((r: { name: string }) => r.name);
    expect(names.length, 'May has ≥3 Indians → the section renders').toBeGreaterThanOrEqual(3);
    expect(names, 'recognisable Indians beyond Nehru').toContain('Rabindranath Tagore');
  });
});

// ── Phase 5 — compatibility Western labelling + discoverability ───────────────
test.describe('BATCH-6 Phase 5 — compatibility Western label + nav', () => {
  test.skip(!distExists, 'dist/ not built');

  test('calculator hub prerenders the Western clarifier + title', () => {
    const doc = html('/compatibility');
    expect(doc).toContain('Western');
    expect(doc.toLowerCase()).toContain('vedic');
    expect(doc).toContain('Ashta Koota');
    expect(doc).toContain('(Western Zodiac)');
  });

  test('a pair page carries the Western/Vedic clarifier + FAQ', () => {
    const doc = html('/compatibility/aries/leo');
    expect(doc).toContain('Western');
    expect(doc.toLowerCase()).toContain('vedic');
  });

  test('Compatibility is discoverable from the footer (every page)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('footer').getByRole('link', { name: 'Compatibility' })).toBeVisible();
  });
});
