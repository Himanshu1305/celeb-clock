import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Returns the number of complete calendar months between two "YYYY-MM" strings.
function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const db = serviceClient();
  const { data: profile, error } = await db
    .from('profiles')
    .select('report_credits, credits_granted_month, subscription_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Tolerate: missing profile or columns not yet added via DDL
    return res.status(200).json({ credits: 0, subscriptionActive: false });
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
    }).eq('id', userId);

    return res.status(200).json({ credits: newCredits, subscriptionActive: true });
  }

  return res.status(200).json({ credits: currentCredits, subscriptionActive: isSubscriberActive });
}
