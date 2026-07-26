// api/_ops.ts — shared ops-monitoring helpers (MONITOR-ONLY, Phase 7).
//
// Web APIs only (fetch/Response) so it runs on Cloudflare Workers. Underscore
// prefix keeps the Worker from treating it as a route while still bundling it.
// Writes use the Supabase service-role client (bypasses RLS); the client-role
// write REVOKE in NOTES-ops-inbox.sql means only these helpers can write.
//
// Depends on env (via nodejs_compat process.env): SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ADMIN_EMAIL (fallback below).

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const ADMIN_EMAIL_FALLBACK = 'himanshu1305@gmail.com';

export type Severity = 'urgent' | 'warning' | 'info';

export interface ReviewInput {
  category: string;
  severity: Severity;
  title: string;
  body?: string;
  actionSteps?: string;
  extra?: Record<string, unknown>;
}

export function opsClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Write a review row, DEDUPED BY CATEGORY: if an unreviewed, non-auto-resolved
 * row already exists for this category, update it in place (refresh severity /
 * title / body / timestamp) instead of piling up duplicates. Otherwise insert.
 */
export async function writeReview(sb: SupabaseClient, r: ReviewInput): Promise<void> {
  const { data: existing, error: selErr } = await sb
    .from('pending_reviews')
    .select('id')
    .eq('category', r.category)
    .is('reviewed_at', null)
    .eq('auto_resolved', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selErr) { console.error('[ops] writeReview select failed:', selErr.message); return; }

  const payload = {
    category: r.category,
    severity: r.severity,
    title: r.title,
    body: r.body ?? null,
    action_steps: r.actionSteps ?? null,
    extra: r.extra ?? {},
  };

  if (existing?.id) {
    const { error } = await sb.from('pending_reviews')
      .update({ ...payload, created_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) console.error('[ops] writeReview update failed:', error.message);
  } else {
    const { error } = await sb.from('pending_reviews').insert(payload);
    if (error) console.error('[ops] writeReview insert failed:', error.message);
  }
}

/**
 * Auto-resolve any open (unreviewed, not-yet-auto-resolved) rows for a category
 * when its check passes again — closes the loop so a recovered check doesn't
 * leave a stale alert in the admin inbox.
 */
export async function autoResolve(sb: SupabaseClient, category: string, note: string): Promise<void> {
  const { error } = await sb.from('pending_reviews')
    .update({ auto_resolved: true, auto_resolution_note: note, reviewed_at: new Date().toISOString(), reviewed_by: 'auto' })
    .eq('category', category)
    .is('reviewed_at', null)
    .eq('auto_resolved', false);
  if (error) console.error('[ops] autoResolve failed:', error.message);
}

/**
 * Send an ops alert email. Fires ONLY for urgent/warning (info is inbox-only).
 * Reuses the exact Resend pattern from api/_email.ts sendEmailDirect().
 */
export async function sendOpsAlert(r: { severity: Severity; title: string; body?: string }): Promise<boolean> {
  if (r.severity === 'info') return false;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('[ops] sendOpsAlert: RESEND_API_KEY not configured'); return false; }
  const to = process.env.ADMIN_EMAIL || ADMIN_EMAIL_FALLBACK;
  const tag = r.severity === 'urgent' ? '🔴 URGENT' : '🟠 WARNING';
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#0C1A2B;">${tag} — BornClock Ops</h2>
      <p style="font-size:16px;font-weight:600;color:#103A5C;">${r.title}</p>
      ${r.body ? `<p style="font-size:14px;color:#3A4A5A;white-space:pre-wrap;">${r.body}</p>` : ''}
      <p style="font-size:13px;color:#6B7A89;">Review in the admin Ops tab: https://bornclock.com/admin</p>
    </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject: `${tag}: ${r.title}`, html }),
    });
    if (!res.ok) { console.error('[ops] sendOpsAlert Resend error:', await res.text()); return false; }
    return true;
  } catch (e: any) {
    console.error('[ops] sendOpsAlert threw:', e?.message);
    return false;
  }
}

/** Convenience: write a review AND alert (for urgent/warning) in one call. */
export async function reviewAndAlert(sb: SupabaseClient, r: ReviewInput): Promise<void> {
  await writeReview(sb, r);
  if (r.severity !== 'info') await sendOpsAlert({ severity: r.severity, title: r.title, body: r.body });
}
