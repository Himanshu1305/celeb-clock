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

// Returns the number of complete calendar months between two "YYYY-MM" strings.
function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const { searchParams } = new URL(request.url, 'http://localhost');
  const userId = searchParams.get('userId');
  if (!userId) {
    return json({ error: 'Missing userId' }, 400);
  }

  const db = serviceClient();
  const { data: profile, error } = await db
    .from('profiles')
    .select('report_credits, credits_granted_month, subscription_status')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    // Tolerate: missing profile or columns not yet added via DDL
    return json({ credits: 0, subscriptionActive: false });
  }

  const isSubscriberActive = (profile as any).subscription_status === 'active';
  const currentCredits: number = (profile as any).report_credits ?? 0;
  const lastGranted: string | null = (profile as any).credits_granted_month ?? null;

  // "YYYY-MM" string for today's month
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Lazy accrual: only runs when month advances, only for active subscribers.
  // Math: add 1 credit per elapsed month since last grant, capped at 3 total.
  //   elapsed = months since credits_granted_month (min 1 when null = first grant)
  //   toAdd   = min(elapsed, 3 - currentCredits)
  //   Always stamp credits_granted_month = currentMonth to prevent re-running this month.
  if (isSubscriberActive && lastGranted !== currentMonth) {
    const elapsed = lastGranted ? Math.max(1, monthsBetween(lastGranted, currentMonth)) : 1;
    const toAdd = Math.min(elapsed, Math.max(0, 3 - currentCredits));
    const newCredits = currentCredits + toAdd;

    await db.from('profiles').update({
      report_credits: newCredits,
      credits_granted_month: currentMonth,
    }).eq('user_id', userId);

    return json({ credits: newCredits, subscriptionActive: true });
  }

  return json({ credits: currentCredits, subscriptionActive: isSubscriberActive });
}

export const GET = handler;
