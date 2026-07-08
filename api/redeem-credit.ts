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
  if (currentCredits <= 0) {
    return json({ error: 'No credits available' }, 402);
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
    await db.from('profiles').update({ report_credits: currentCredits }).eq('user_id', userId);
    return json({ error: 'Failed to unlock report. Your credit has been restored.' }, 500);
  }

  return json({ success: true, creditsRemaining: currentCredits - 1 });
}

export const POST = handler;
