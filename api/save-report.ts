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

  // NOTE: `isPremium` from the body is a client flag — it is NOT trusted for the
  // free-unlock decision below. It is only used for the (cosmetic) link-expiry.
  const { reportData, isPremium, gender } = body ?? {};
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

  let userId: string | null = null;
  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await db.auth.getUser(token);
    userId = data?.user?.id ?? null;
  }

  // ── Server-enforced trial free report ────────────────────────────────────
  // Trial users (first 7 days from profiles.created_at) get exactly ONE free
  // unlocked report, decided SERVER-SIDE. Guarded by the unlock_source column:
  // until NOTES-unlock-source.sql is applied, the usage check errors and the
  // feature stays dormant (report inserts as today, is_paid=false).
  let trialUnlock = false;
  if (userId) {
    try {
      const { data: prof } = await db
        .from('profiles')
        .select('created_at')
        .eq('user_id', userId)
        .single();
      const createdAt = (prof as any)?.created_at ? new Date((prof as any).created_at) : null;
      const inTrial = !!createdAt && (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
      if (inTrial) {
        // Count reports already unlocked via the trial for this user. If the
        // column doesn't exist yet this throws → caught → feature dormant.
        const { count, error: usageErr } = await db
          .from('birthday_reports')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('unlock_source', 'trial');
        if (usageErr) throw usageErr;
        trialUnlock = (count ?? 0) === 0;
      }
    } catch (e) {
      console.warn('[trial-unlock] column missing / check failed, feature dormant:', (e as Error).message);
      trialUnlock = false;
    }
  }

  const expiryDays = (trialUnlock || isPremium) ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

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
      is_premium_report: isPremium ?? false,
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

  return json({ error: 'Failed to save report' }, 500);
}

export const POST = handler;
