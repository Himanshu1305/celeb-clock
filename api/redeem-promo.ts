// api/redeem-promo.ts — POST /api/redeem-promo  { code }
//
// Promo codes used to be checked and applied entirely in the browser: the page
// read the (publicly listable) promo_codes table, wrote the redemption, bumped
// the usage counter and then tried to set premium itself — and showed
// "You now have premium access" even though that last write is blocked by the
// premium-column guard, so the message was false. Everything now happens here
// with the service role, for the SIGNED-IN caller only.
import { serviceClient, getAuthedUser } from './_userAuth.js';

// A promo that grants premium grants it for this many days (stored in
// profiles.promo_premium_until, which useAuth already reads). Matches the admin
// "grant promo" default of 30 days.
export const PROMO_PREMIUM_DAYS = 30;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

  let body: any;
  try { body = await request.json(); } catch { return json({ success: false, message: 'Invalid request.' }, 400); }

  const code = String(body?.code ?? '').trim().toUpperCase().slice(0, 64);
  if (!code) return json({ success: false, message: 'Please enter a promo code.' }, 400);

  const db = serviceClient();
  const caller = await getAuthedUser(request, db);
  if (!caller) return json({ success: false, message: 'Please sign in to use a promo code.' }, 401);

  const { data: promo } = await db
    .from('promo_codes')
    .select('code, grants_premium, max_uses, current_uses, expires_at')
    .eq('code', code)
    .maybeSingle();
  if (!promo) return json({ success: false, message: 'Invalid promo code. Please check and try again.' }, 404);

  const p = promo as any;
  if (p.expires_at && new Date(p.expires_at) < new Date()) {
    return json({ success: false, message: 'This promo code has expired.' }, 410);
  }
  const used = Number(p.current_uses ?? 0);
  if (p.max_uses != null && used >= Number(p.max_uses)) {
    return json({ success: false, message: 'This promo code has reached its usage limit.' }, 409);
  }

  // One redemption per user per code — UNIQUE(code, user_id) makes this atomic.
  const { error: redErr } = await db
    .from('promo_code_redemptions')
    .insert({ code, user_id: caller.id });
  if (redErr) {
    if (redErr.code === '23505') return json({ success: false, message: 'You have already used this promo code.' }, 409);
    console.error('[redeem-promo] redemption insert error', redErr);
    return json({ success: false, message: 'Failed to redeem code. Please try again.' }, 500);
  }

  // Optimistic counter bump: only succeeds if nobody else redeemed in between.
  const { data: bumped, error: bumpErr } = await db
    .from('promo_codes')
    .update({ current_uses: used + 1 })
    .eq('code', code)
    .eq('current_uses', used)
    .select('code');
  if (bumpErr || !bumped || (bumped as any[]).length === 0) {
    await db.from('promo_code_redemptions').delete().eq('code', code).eq('user_id', caller.id);
    return json({ success: false, message: 'This code is busy right now — please try again.' }, 409);
  }

  if (p.grants_premium) {
    const until = new Date(Date.now() + PROMO_PREMIUM_DAYS * 24 * 60 * 60 * 1000);
    const { error: grantErr } = await db
      .from('profiles')
      .update({ promo_premium_until: until.toISOString() })
      .eq('user_id', caller.id);
    if (grantErr) {
      console.error('[redeem-promo] grant error', grantErr);
      // Roll back so the user can retry and the counter stays honest.
      await db.from('promo_code_redemptions').delete().eq('code', code).eq('user_id', caller.id);
      await db.from('promo_codes').update({ current_uses: used }).eq('code', code).eq('current_uses', used + 1);
      return json({ success: false, message: 'Could not apply the code. Please try again.' }, 500);
    }
    return json({
      success: true,
      isPremium: true,
      premiumUntil: until.toISOString(),
      message: `Promo code applied! You have premium access for ${PROMO_PREMIUM_DAYS} days.`,
    });
  }

  return json({ success: true, message: 'Promo code applied successfully!' });
}

export const POST = handler;
