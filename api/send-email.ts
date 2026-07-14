import { sendEmailDirect } from './_email.js';

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

  if (!process.env.RESEND_API_KEY) {
    return json({ error: 'Email service not configured' }, 500);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { type, to, name } = body ?? {};
  if (!type || !to || !name) {
    return json({ error: 'Missing required fields: type, to, name' }, 400);
  }

  const VALID_TYPES = new Set([
    'welcome', 'trial_expiry', 'payment_confirmation', 'cancellation',
    'nudge_free', 'nudge_premium', 'premium_activated', 'payment_receipt',
    'report_locked', 'report_created', 'data_deletion_request',
  ]);
  if (!VALID_TYPES.has(type)) {
    return json({ error: `Unknown email type: ${type}` }, 400);
  }

  const ok = await sendEmailDirect(body);
  return ok
    ? json({ success: true })
    : json({ error: 'Failed to send email' }, 500);
}

export const POST = handler;
