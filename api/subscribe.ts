// api/subscribe.ts — soft email capture (no account required).
// Web APIs only (Cloudflare Workers compatible). Inserts into email_subscribers
// via the service-role key. Idempotent by email. Tolerates the table not yet
// existing (NOTES-email-subscribers.sql unapplied) — returns ok:false, never 500s
// the user. Consent is explicit: the caller must pass consent=true.
import { createClient } from '@supabase/supabase-js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (body?.consent !== true) return json({ error: 'Consent is required.' }, 400);

  const source = typeof body?.source === 'string' ? body.source.slice(0, 40) : 'unknown';
  const dob = typeof body?.dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dob) ? body.dob : null;
  const countryCode = typeof body?.countryCode === 'string' ? body.countryCode.slice(0, 2).toUpperCase() : null;
  const weeklyDigest = body?.weeklyDigest !== false; // default opt-in when subscribing here

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json({ ok: false, reason: 'not_configured' }, 200);

  const sb = createClient(url, key, { auth: { persistSession: false } });

  // Idempotent by email via explicit check-then-write. NOTE: the table's unique
  // index is on lower(email) — an EXPRESSION index — which PostgREST's onConflict
  // cannot target (it needs a column name / named constraint), so the previous
  // `.upsert({}, {onConflict:'email'})` always failed with "no unique or exclusion
  // constraint matching the ON CONFLICT specification" and NOTHING was ever stored.
  // `email` is already lowercased above, so `ilike` matches an existing row
  // case-insensitively.
  const prefs = { source, consent_marketing: true, weekly_digest: weeklyDigest, dob, country_code: countryCode };
  const existing = await sb.from('email_subscribers').select('id').ilike('email', email).maybeSingle();
  if (existing.error) {
    // Table may not exist yet (NOTES SQL unapplied) — degrade gracefully.
    console.error('[subscribe] lookup error:', existing.error.message);
    return json({ ok: false, reason: 'store_unavailable' }, 200);
  }

  if (existing.data?.id) {
    const { error } = await sb.from('email_subscribers').update(prefs).eq('id', existing.data.id);
    if (error) { console.error('[subscribe] update error:', error.message); return json({ ok: false, reason: 'store_unavailable' }, 200); }
    return json({ ok: true });
  }

  const { error } = await sb.from('email_subscribers').insert({ email, ...prefs });
  if (error) {
    // 23505 = a concurrent insert won the race; the email is captured — treat as success.
    if ((error as { code?: string }).code === '23505') return json({ ok: true });
    console.error('[subscribe] insert error:', error.message);
    return json({ ok: false, reason: 'store_unavailable' }, 200);
  }
  return json({ ok: true });
}

export const POST = handler;
