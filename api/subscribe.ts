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

  // Upsert by email (unique on lower(email)). onConflict updates consent/prefs.
  const { error } = await sb
    .from('email_subscribers')
    .upsert(
      { email, source, consent_marketing: true, weekly_digest: weeklyDigest, dob, country_code: countryCode },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  if (error) {
    // Table may not exist yet (NOTES SQL unapplied) — degrade gracefully.
    console.error('[subscribe] insert error:', error.message);
    return json({ ok: false, reason: 'store_unavailable' }, 200);
  }
  return json({ ok: true });
}

export const POST = handler;
