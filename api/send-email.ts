import { createClient } from '@supabase/supabase-js';
import { sendEmailDirect } from './_email.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Server-side send-once claim for per-user-once emails (currently: welcome).
// The confirmation link opens a NEW TAB, so two browser contexts race and the
// client-side in-memory Set + localStorage guards (per-context) both fire. This
// is the authoritative guard, same discipline as credit idempotency:
//   update profiles set welcomed_at = now()
//   where user_id = X and welcomed_at is null returning user_id
// Exactly one caller gets a row back and owns the send; the other sees no row.
// Returns 'send' (claimed), 'skip' (already sent), or 'noguard' (no userId, or
// the welcomed_at column does not exist yet — fall back to client-guard trust).
async function claimWelcome(userId: string | undefined): Promise<'send' | 'skip' | 'noguard'> {
  if (!userId) return 'noguard';
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 'noguard';
  try {
    const db = createClient(url, key);
    const { data, error } = await db
      .from('profiles')
      .update({ welcomed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('welcomed_at', null)
      .select('user_id');
    if (error) {
      // 42703 = column welcomed_at missing (DDL not applied yet) → tolerate.
      if ((error as any).code === '42703' || /welcomed_at/.test(error.message)) {
        console.warn('[welcome] column missing — falling back to client guard');
      } else {
        console.error('[welcome] claim error (falling back):', error.message);
      }
      return 'noguard';
    }
    return data && data.length > 0 ? 'send' : 'skip';
  } catch (e) {
    console.error('[welcome] claim threw (falling back):', e);
    return 'noguard';
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!process.env.RESEND_API_KEY) {
    return json({ error: 'Email service not configured' }, 500);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { type, to, name, userId } = body ?? {};
  if (!type || !to || !name) {
    return json({ error: 'Missing required fields: type, to, name' }, 400);
  }

  // Welcome is per-user-once. Atomically claim the send before doing anything;
  // a second tab (confirmation link opens a new context) gets 'skip' and a
  // silent 200. 'noguard' (no userId / column absent) falls through to send,
  // trusting the client-side guard as before.
  if (type === 'welcome') {
    const claim = await claimWelcome(userId);
    if (claim === 'skip') return json({ success: true, deduped: true });
  }

  const VALID_TYPES = new Set([
    'welcome', 'trial_expiry', 'payment_confirmation', 'cancellation',
    'nudge_free', 'nudge_premium', 'premium_activated', 'payment_receipt',
    'report_locked', 'report_created', 'data_deletion_request', 'account_deleted',
  ]);
  if (!VALID_TYPES.has(type)) {
    return json({ error: `Unknown email type: ${type}` }, 400);
  }

  const ok = await sendEmailDirect(body);
  return ok
    ? json({ success: true })
    : json({ error: 'Failed to send email' }, 500);
}

export const POST = handler;
