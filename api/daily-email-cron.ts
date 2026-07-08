import { createClient } from '@supabase/supabase-js';
import { sendEmailDirect } from './_email.js';

const ADMIN_EMAILS = ['hello@bornclock.com', 'himanshu1305@gmail.com'];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function dispatchEmail(payload: object): Promise<boolean> {
  try {
    return await sendEmailDirect(payload as Record<string, unknown>);
  } catch {
    return false;
  }
}

async function handler(request: Request): Promise<Response> {
  // Vercel cron fires GET; admin manual trigger uses POST
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Auth: Vercel cron secret OR admin JWT ──────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') ?? '';

  const isVercelCron = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);

  let isAdminRequest = false;
  if (!isVercelCron && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data?.user?.email && ADMIN_EMAILS.includes(data.user.email)) {
      isAdminRequest = true;
    }
  }

  if (!isVercelCron && !isAdminRequest) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const now = new Date();
  // Week variant 1-4 cycling every 7 days (same value all day, changes weekly)
  const weekVariant = (Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000)) % 4) + 1;

  const results = {
    trialExpiry: { sent: 0, failed: 0, users: 0 },
    freeNudge: { sent: 0, failed: 0, users: 0 },
    premiumNudge: { sent: 0, failed: 0, users: 0 },
  };

  // ── 1. Trial expiry — users on day 6 ──────────────────────────────────
  // Window: created between 7 days ago and 6 days ago (24h band = day 6 of trial)
  const trialWindowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trialWindowEnd   = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const { data: trialUsers } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name')
    .eq('premium_status', false)
    .is('subscription_id', null)
    .gte('created_at', trialWindowStart.toISOString())
    .lte('created_at', trialWindowEnd.toISOString());

  results.trialExpiry.users = (trialUsers ?? []).length;

  for (const user of (trialUsers ?? [])) {
    if (!user.email) continue;
    const ok = await dispatchEmail({
      type: 'trial_expiry',
      to: user.email,
      name: user.name || 'there',
      hoursLeft: 24,
    });
    if (ok) results.trialExpiry.sent++;
    else results.trialExpiry.failed++;
  }

  // ── 2 & 3. Inactive users — send nudge on exactly day 7 ───────────────
  // Window: last_sign_in_at between 8 days ago and 7 days ago
  // This ensures one nudge per user at the 7-day inactivity mark
  const nudgeWindowStart = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const nudgeWindowEnd   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = usersData?.users ?? [];

  const inactiveUsers = authUsers.filter(u => {
    const lastSeen = u.last_sign_in_at
      ? new Date(u.last_sign_in_at)
      : new Date(u.created_at);
    return lastSeen >= nudgeWindowStart && lastSeen < nudgeWindowEnd;
  });

  if (inactiveUsers.length > 0) {
    const inactiveIds = inactiveUsers.map(u => u.id);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, premium_status')
      .in('id', inactiveIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    for (const u of inactiveUsers) {
      const profile = profileMap.get(u.id) as any;
      if (!profile) continue;
      const email = u.email || profile.email;
      if (!email) continue;
      const name = profile.name || (u.user_metadata as any)?.first_name || 'there';

      if (!profile.premium_status) {
        results.freeNudge.users++;
        const ok = await dispatchEmail({ type: 'nudge_free', to: email, name, week: weekVariant });
        if (ok) results.freeNudge.sent++;
        else results.freeNudge.failed++;
      } else {
        results.premiumNudge.users++;
        const ok = await dispatchEmail({ type: 'nudge_premium', to: email, name, week: weekVariant });
        if (ok) results.premiumNudge.sent++;
        else results.premiumNudge.failed++;
      }
    }
  }

  return json({
    ok: true,
    weekVariant,
    results,
    timestamp: now.toISOString(),
  });
}

// Vercel cron fires GET; admin trigger uses POST; both go through this handler.
export const GET = handler;
export const POST = handler;
