/**
 * Shared DB + test-user helpers for the pre-launch suite.
 *
 * Extracted from the proven service-role pattern in
 * scripts/test-subscription-lifecycle.mjs. Uses the Supabase service-role key
 * (from .env.local, loaded via `set -a; source .env.local; set +a` before the run)
 * so specs can create genuinely in-trial users (no confirmation email) and assert
 * exact DB state.
 *
 * SWEEPABLE EMAIL PATTERN: e2e+<suite>+<timestamp>@bornclock-test.invalid
 * Every created user MUST be removed in afterAll (try/finally). sweepTestUsers()
 * cleans anything left by a crashed run.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Any e2e address routes to the .invalid TLD (RFC 6761 — never delivers).
export const TEST_EMAIL_DOMAIN = 'bornclock-test.invalid';
export const TEST_PASSWORD = 'Test-Prelaunch-123!';

let _client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — run with `set -a; source .env.local; set +a`');
  }
  if (!_client) _client = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  return _client;
}

export function testEmail(suite: string): string {
  return `e2e+${suite}+${Date.now()}${Math.floor(Math.random() * 1000)}@${TEST_EMAIL_DOMAIN}`;
}

export interface TestUser {
  userId: string;
  email: string;
  password: string;
}

/**
 * Create a throwaway user via the service-role admin API.
 * confirmed=true (default) → genuinely in-trial, no confirmation email fires.
 * confirmed=false → unconfirmed, for the "email not confirmed" login test.
 */
export async function createTestUser(
  suite: string,
  opts: { confirmed?: boolean; firstName?: string } = {},
): Promise<TestUser> {
  const email = testEmail(suite);
  const { data, error } = await db().auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: opts.confirmed ?? true,
    user_metadata: { first_name: opts.firstName ?? 'Prelaunch', name: `${opts.firstName ?? 'Prelaunch'} Test` },
  });
  if (error) throw new Error(`createTestUser failed: ${error.message}`);
  return { userId: data.user.id, email, password: TEST_PASSWORD };
}

/** Delete a single test user and all its rows (idempotent, never throws). */
export async function deleteTestUser(userId: string, email?: string): Promise<void> {
  const c = db();
  try {
    // FK-blocking + user-owned children first (mirror the delete-account fn order).
    for (const t of ['longevity_scores', 'celebrity_boosts', 'promo_code_redemptions',
      'birthday_reports', 'analytics_events', 'user_reviews', 'user_roles',
      'family_members', 'leaderboard_entries', 'pdf_reports_log']) {
      await c.from(t).delete().eq('user_id', userId);
    }
    await c.from('payments').update({ user_id: null }).eq('user_id', userId);
    await c.from('profiles').delete().eq('user_id', userId);
    if (email) await c.from('email_subscribers').delete().ilike('email', email);
    await c.auth.admin.deleteUser(userId);
  } catch {
    /* best-effort cleanup */
  }
}

/**
 * Sweep ALL leftover test users (crashed runs). Matches the e2e+*@…invalid
 * pattern. Returns the count deleted. Also usable as a standalone cleanup.
 */
export async function sweepTestUsers(): Promise<number> {
  const c = db();
  let deleted = 0;
  // listUsers is paged; walk pages until fewer than perPage returned.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await c.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.email && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
        await deleteTestUser(u.id, u.email);
        deleted++;
      }
    }
    if (data.users.length < 200) break;
  }
  return deleted;
}

/** Count remaining test users (for the final-gate sweep evidence). */
export async function countTestUsers(): Promise<number> {
  const c = db();
  let count = 0;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await c.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    count += data.users.filter(u => u.email?.endsWith(`@${TEST_EMAIL_DOMAIN}`)).length;
    if (data.users.length < 200) break;
  }
  return count;
}

// ── DB assertion reads ────────────────────────────────────────────────────────
export async function fetchProfile(userId: string) {
  const { data } = await db().from('profiles')
    .select('id, user_id, premium_status, subscription_status, report_credits, created_at')
    .eq('user_id', userId).maybeSingle();
  return data;
}

export async function fetchReports(userId: string) {
  const { data } = await db().from('birthday_reports')
    .select('slug, is_paid, unlock_source, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

/** invoice_counters snapshot for the "all series at 1001" gate. */
export async function invoiceCounters() {
  const { data } = await db().from('invoice_counters').select('series, next_value').order('series');
  return data ?? [];
}

// ── Browser login via the real /auth form ──────────────────────────────────────
/** Sign a created user in through the UI and wait for the session to land. */
export async function loginViaForm(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('button[type="submit"]:has-text("Sign In")').click();
  // Auth.tsx redirects away from /auth once useAuth picks up the session.
  await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 20000 });
}
