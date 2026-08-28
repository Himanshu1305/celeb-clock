// api/update-buyer-state.ts — POST /api/update-buyer-state
//
// One-time capture of a premium user's GST place-of-supply (Indian state) so the
// daily renewal sweep (api/invoice-sweep.ts) can issue their tax invoice. Written
// by MissingStateModal. The state is a LEGAL declaration, so the code is validated
// against the authoritative GST list before it can touch the profiles row.
//
// AUTH: the caller is identified from their Supabase access token (Bearer), NOT
// from any body field — a user can only set their OWN place-of-supply. The write
// uses the service-role client (buyer_* are not premium-guarded columns, but we
// keep every profiles write that must not be RLS-spoofable on the service role).
import { createClient } from '@supabase/supabase-js';
import { isValidIndiaStateCode, stateNameForCode } from '../src/data/indiaStates.js';

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
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const db = serviceClient();

  // Authenticate the caller (same pattern as invoice-pdf.ts / save-report.ts).
  const authHeader = request.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const { data: userData } = await db.auth.getUser(authHeader.slice(7));
  const userId = userData?.user?.id;
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const stateCode: string | undefined = body?.state_code;
  // Validate against the authoritative GST state list — never trust a raw code.
  if (!isValidIndiaStateCode(stateCode)) {
    return json({ error: 'Invalid state code' }, 400);
  }
  const stateName = stateNameForCode(stateCode!)!;

  const { error } = await db
    .from('profiles')
    .update({
      buyer_state_code: stateCode,
      buyer_state: stateName,
      buyer_country: 'India',
      updated_at: new Date().toISOString(),
    })
    // key on user_id (the auth link), never the random profiles.id PK.
    .eq('user_id', userId);

  if (error) {
    console.error('[update-buyer-state] update error', error);
    return json({ error: 'Failed to save state' }, 500);
  }

  return json({ success: true, buyer_state: stateName, buyer_state_code: stateCode });
}

export const POST = handler;
