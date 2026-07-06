import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, reportSlug } = req.body ?? {};
  if (!userId || !reportSlug) {
    return res.status(400).json({ error: 'Missing userId or reportSlug' });
  }

  const db = serviceClient();

  // Fetch current credit balance
  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('report_credits')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  const currentCredits: number = (profile as any).report_credits ?? 0;
  if (currentCredits <= 0) {
    return res.status(402).json({ error: 'No credits available' });
  }

  // Decrement credit first
  const { error: decrErr } = await db
    .from('profiles')
    .update({ report_credits: currentCredits - 1 })
    .eq('id', userId);

  if (decrErr) {
    console.error('[redeem-credit] decrement error', decrErr);
    return res.status(500).json({ error: 'Failed to deduct credit' });
  }

  // Unlock the report
  const { error: unlockErr } = await db
    .from('birthday_reports')
    .update({
      is_paid: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('slug', reportSlug);

  if (unlockErr) {
    // Compensating transaction: restore the credit
    console.error('[redeem-credit] unlock error', unlockErr);
    await db.from('profiles').update({ report_credits: currentCredits }).eq('id', userId);
    return res.status(500).json({ error: 'Failed to unlock report. Your credit has been restored.' });
  }

  return res.status(200).json({ success: true, creditsRemaining: currentCredits - 1 });
}
