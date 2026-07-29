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

const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_MS = 7 * DAY_MS;

// One call powering the /birthday-report pricing-card state machine. Everything
// that gates money is computed SERVER-SIDE from the DB — never trusted from the
// client. Returns { trialReportUsed, credits, isTrial, trialDaysRemaining,
// subscriptionActive }.
async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const { searchParams } = new URL(request.url, 'http://localhost');
  const userId = searchParams.get('userId');
  if (!userId) return json({ error: 'Missing userId' }, 400);

  const db = serviceClient();
  const { data: profile } = await db
    .from('profiles')
    .select('created_at, report_credits, subscription_status')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // Tolerate a missing profile / columns not yet added via DDL.
    return json({ trialReportUsed: false, credits: 0, isTrial: false, trialDaysRemaining: 0, subscriptionActive: false });
  }

  const createdAt = (profile as any).created_at ? new Date((profile as any).created_at) : null;
  const elapsed = createdAt ? Date.now() - createdAt.getTime() : Infinity;
  const isTrial = elapsed < TRIAL_MS;
  const trialDaysRemaining = isTrial ? Math.ceil((TRIAL_MS - elapsed) / DAY_MS) : 0;
  const credits: number = (profile as any).report_credits ?? 0;
  const subscriptionActive = (profile as any).subscription_status === 'active';

  // Has this user already spent their one free trial report? Counts reports
  // stamped unlock_source='trial'. If the column isn't applied yet the query
  // throws → treat as unused (feature dormant, mirrors save-report.ts).
  let trialReportUsed = false;
  try {
    const { count, error } = await db
      .from('birthday_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('unlock_source', 'trial');
    if (error) throw error;
    trialReportUsed = (count ?? 0) > 0;
  } catch {
    trialReportUsed = false;
  }

  return json({ trialReportUsed, credits, isTrial, trialDaysRemaining, subscriptionActive });
}

export const GET = handler;
