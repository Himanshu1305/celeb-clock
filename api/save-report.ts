import { serviceClient, getAuthedUser, userIsPremium, normalizeEmail, PERMANENT_EXPIRY, type AuthedUser } from './_userAuth.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export { PERMANENT_EXPIRY };

const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * S17: the one free trial report is limited to (a) accounts with a CONFIRMED
 * email, inside their first 7 days, that have not used it, and (b) one per
 * person — claimed by normalised email in public.trial_claims (unique), so a
 * throwaway re-signup with the same address (or a Gmail dot/+tag variant)
 * cannot claim again. Returns the normalised email that was claimed, or null.
 */
export async function claimTrialReport(db: any, user: AuthedUser): Promise<{ granted: boolean; claimKey: string | null }> {
  if (!user.emailConfirmed || !user.email) return { granted: false, claimKey: null };

  const { data: prof } = await db
    .from('profiles')
    .select('created_at')
    .eq('user_id', user.id)
    .single();
  const createdAt = (prof as any)?.created_at ? new Date((prof as any).created_at) : null;
  const inTrial = !!createdAt && (Date.now() - createdAt.getTime()) < TRIAL_MS;
  if (!inTrial) return { granted: false, claimKey: null };

  // Already used on this account? If unlock_source is missing this throws → no trial.
  const { count, error: usageErr } = await db
    .from('birthday_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('unlock_source', 'trial');
  if (usageErr) throw usageErr;
  if ((count ?? 0) > 0) return { granted: false, claimKey: null };

  // One per person (by normalised email).
  const claimKey = normalizeEmail(user.email);
  const { error: claimErr } = await db
    .from('trial_claims')
    .insert({ normalized_email: claimKey, user_id: user.id });
  if (claimErr) {
    if (claimErr.code === '23505') return { granted: false, claimKey: null }; // already claimed by this person
    // Table not created yet (migration pending): keep the verified-email limit only.
    if (claimErr.code === '42P01' || claimErr.code === 'PGRST205') {
      console.warn('[trial-unlock] trial_claims table missing — verified-email limit only');
      return { granted: true, claimKey: null };
    }
    throw claimErr;
  }
  return { granted: true, claimKey };
}

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // `isPremium` in the body is a client flag and is ignored — premium (for the
  // 30-day preview window) is decided from the caller's profile on the server.
  const { reportData, gender } = body ?? {};
  if (!reportData) {
    return json({ error: 'Missing reportData' }, 400);
  }

  if (reportData.recipientDob) {
    const dob = new Date(reportData.recipientDob + 'T12:00:00');
    if (dob > new Date()) {
      return json({ error: 'recipientDob cannot be in the future' }, 400);
    }
  }

  const db = serviceClient();
  const user = await getAuthedUser(request, db);
  const userId: string | null = user?.id ?? null;

  // ── Server-enforced trial free report (S17) ──────────────────────────────
  let trialUnlock = false;
  let claimKey: string | null = null;
  if (user) {
    try {
      const r = await claimTrialReport(db, user);
      trialUnlock = r.granted;
      claimKey = r.claimKey;
    } catch (e) {
      console.warn('[trial-unlock] check failed, no free unlock:', (e as Error).message);
      trialUnlock = false;
    }
  }

  const isPremium = userId ? await userIsPremium(db, userId) : false;
  const expiryDays = isPremium ? 30 : 7;
  const expiresAt = trialUnlock
    ? PERMANENT_EXPIRY
    : new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = generateSlug();
    const insertRow: Record<string, unknown> = {
      user_id: userId,
      slug,
      recipient_name: reportData.recipientName,
      recipient_dob: reportData.recipientDob,
      gifter_name: reportData.gifterName || null,
      personal_message: reportData.personalMessage || null,
      country: reportData.country,
      gender: gender ?? '',
      report_data: reportData,
      is_premium_report: isPremium,
      expires_at: expiresAt,
    };
    // Only set is_paid/unlock_source when granting the trial free report. The
    // column is only referenced here when trialUnlock is true, which itself is
    // only reachable if the earlier unlock_source query succeeded (column exists).
    if (trialUnlock) {
      insertRow.is_paid = true;
      insertRow.unlock_source = 'trial';
    }
    const { error } = await db.from('birthday_reports').insert(insertRow);

    if (!error) return json({ slug, unlocked: trialUnlock });
    if (!String(error.message).includes('unique')) break;
  }

  // Report could not be saved: release the trial claim so the person keeps it.
  if (claimKey) {
    try { await db.from('trial_claims').delete().eq('normalized_email', claimKey); } catch { /* ignore */ }
  }

  return json({ error: 'Failed to save report' }, 500);
}

export const POST = handler;
