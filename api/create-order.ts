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

// Server-decided amounts in smallest currency unit (paise / cents).
// Never trust an amount from the request body.
const PRODUCT_AMOUNTS: Record<string, Partial<Record<'INR' | 'USD', number>>> = {
  birthday_report: { INR: 19900, USD: 299 },
};

// Discounted amounts for active subscribers (member pricing).
const MEMBER_AMOUNTS: Record<string, Partial<Record<'INR' | 'USD', number>>> = {
  birthday_report: { INR: 14900, USD: 249 },
};

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Parse and validate inputs BEFORE checking payment credentials
  // so validation errors return proper 400/404 codes even in local dev
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { product, report_slug, userId, currency = 'INR' } = body ?? {};

  if (!product || !PRODUCT_AMOUNTS[product]) {
    return json({ error: 'Invalid product' }, 400);
  }
  if (currency !== 'INR' && currency !== 'USD') {
    return json({ error: 'Invalid currency' }, 400);
  }
  if (!report_slug || !userId) {
    return json({ error: 'Missing report_slug or userId' }, 400);
  }

  // Double-purchase guard: reject if this slug was already paid for
  const db = serviceClient();
  const { data: report, error: reportErr } = await db
    .from('birthday_reports')
    .select('is_paid')
    .eq('slug', report_slug)
    .single();

  if (reportErr || !report) {
    return json({ error: 'Report not found' }, 404);
  }
  if (report.is_paid) {
    return json({ error: 'Report already purchased' }, 409);
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('[create-order] Razorpay credentials not configured');
    return json({ error: 'Payment not configured' }, 500);
  }

  // Member pricing: active subscribers pay less (server-side decision only)
  let amount = PRODUCT_AMOUNTS[product][currency as 'INR' | 'USD']!;
  const { data: profileData } = await db
    .from('profiles')
    .select('subscription_status')
    .eq('user_id', userId)
    .single();
  if ((profileData as any)?.subscription_status === 'active') {
    amount = MEMBER_AMOUNTS[product]?.[currency as 'INR' | 'USD'] ?? amount;
  }

  const auth = btoa(`${keyId}:${keySecret}`);
  let order: any;
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount,
        currency,
        // report_slug baked server-side so verify-payment can use it as authoritative
        notes: { report_slug, userId, product },
      }),
    });
    order = await rzpRes.json();
    if (!rzpRes.ok) {
      console.error('[create-order] Razorpay error', order);
      return json({ error: 'Failed to create order' }, 502);
    }
  } catch (e) {
    console.error('[create-order] network error', e);
    return json({ error: 'Failed to reach payment provider' }, 502);
  }

  return json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    report_slug,
  });
}

export const POST = handler;
