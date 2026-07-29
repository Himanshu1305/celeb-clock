import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { userId, reportSlug } = body ?? {};
  if (!userId || !reportSlug) {
    return json({ error: 'Missing userId or reportSlug' }, 400);
  }

  const db = serviceClient();

  // ── PREFERRED: atomic, idempotent RPC ────────────────────────────────
  // public.redeem_report_credit locks the report + profile, and if the report
  // is ALREADY paid it returns success WITHOUT decrementing — so a double-fire
  // of the client auto-redeem (or a reload) can never burn a second credit.
  // (DDL: supabase/migrations/NOTES-redeem-credit-atomic.sql.) If the function
  // is not yet applied, rpcErr is set and we fall through to the legacy path.
  try {
    const { data: rpc, error: rpcErr } = await db.rpc('redeem_report_credit', {
      p_user_id: userId,
      p_slug: reportSlug,
    });

    if (!rpcErr) {
      const r = (rpc ?? {}) as any;
      if (r.ok) {
        return json({
          success: true,
          creditsRemaining: r.credits_remaining ?? 0,
          alreadyPaid: !!r.already_paid,
        });
      }
      if (r.error === 'no_credits') {
        return json({ error: 'No credits available', creditsRemaining: r.credits_remaining ?? 0 }, 402);
      }
      // Shared/public report opened by a non-owner: not an error, just not
      // credit-redeemable. Clean 403; the client falls back to the paywall.
      if (r.error === 'not_owner') return json({ error: 'Not your report', notOwner: true }, 403);
      if (r.error === 'report_not_found') return json({ error: 'Report not found' }, 404);
      if (r.error === 'user_not_found') return json({ error: 'User not found' }, 404);
      // Unknown logical result — fall through to the legacy path.
    } else {
      console.warn('[redeem-credit] atomic rpc unavailable, using legacy path:', rpcErr.message);
    }
  } catch (e) {
    console.warn('[redeem-credit] atomic rpc threw, using legacy path:', e);
  }

  // ── LEGACY FALLBACK (non-atomic) ─────────────────────────────────────
  // Still guards against double-redeem by re-reading is_paid before spending.
  const { data: report, error: reportErr } = await db
    .from('birthday_reports')
    .select('is_paid, user_id')
    .eq('slug', reportSlug)
    .single();

  if (reportErr || !report) {
    return json({ error: 'Report not found' }, 404);
  }

  // Ownership: only the owner may spend a credit (report links are shareable).
  const ownerId = (report as any).user_id;
  if (!ownerId || ownerId !== userId) {
    return json({ error: 'Not your report', notOwner: true }, 403);
  }

  // Fetch current credit balance
  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('report_credits')
    .eq('user_id', userId)
    .single();

  if (profileErr || !profile) {
    return json({ error: 'User not found' }, 404);
  }

  const currentCredits: number = (profile as any).report_credits ?? 0;

  // IDEMPOTENT: already unlocked → succeed, decrement nothing.
  if ((report as any).is_paid) {
    return json({ success: true, creditsRemaining: currentCredits, alreadyPaid: true });
  }

  if (currentCredits <= 0) {
    return json({ error: 'No credits available', creditsRemaining: 0 }, 402);
  }

  // Decrement credit first
  const { error: decrErr } = await db
    .from('profiles')
    .update({ report_credits: currentCredits - 1 })
    .eq('user_id', userId);

  if (decrErr) {
    console.error('[redeem-credit] decrement error', decrErr);
    return json({ error: 'Failed to deduct credit' }, 500);
  }

  // Unlock the report — only flip rows that are still locked, so a racing
  // second call cannot re-unlock (and the compensating restore stays correct).
  const { data: unlocked, error: unlockErr } = await db
    .from('birthday_reports')
    .update({
      is_paid: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('slug', reportSlug)
    .eq('is_paid', false)
    .select('slug');

  if (unlockErr) {
    // Compensating transaction: restore the credit
    console.error('[redeem-credit] unlock error', unlockErr);
    await db.from('profiles').update({ report_credits: currentCredits }).eq('user_id', userId);
    return json({ error: 'Failed to unlock report. Your credit has been restored.' }, 500);
  }

  // A racing call already unlocked it between our read and write: restore the
  // credit we just spent and report success (the report is paid either way).
  if (!unlocked || unlocked.length === 0) {
    await db.from('profiles').update({ report_credits: currentCredits }).eq('user_id', userId);
    return json({ success: true, creditsRemaining: currentCredits, alreadyPaid: true });
  }

  // Best-effort: stamp how it was unlocked. Separate call so a missing
  // unlock_source column (NOTES-unlock-source.sql not yet applied) cannot fail
  // the redemption — the is_paid unlock above is already committed. Error ignored.
  await db.from('birthday_reports').update({ unlock_source: 'credit' } as any).eq('slug', reportSlug);

  return json({ success: true, creditsRemaining: currentCredits - 1, alreadyPaid: false });
}

export const POST = handler;
