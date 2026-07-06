import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('[create-order] Razorpay credentials not configured');
    return res.status(500).json({ error: 'Payment not configured' });
  }

  const { product, report_slug, userId, currency = 'INR' } = req.body ?? {};

  if (!product || !PRODUCT_AMOUNTS[product]) {
    return res.status(400).json({ error: 'Invalid product' });
  }
  if (currency !== 'INR' && currency !== 'USD') {
    return res.status(400).json({ error: 'Invalid currency' });
  }
  if (!report_slug || !userId) {
    return res.status(400).json({ error: 'Missing report_slug or userId' });
  }

  // Double-purchase guard: reject if this slug was already paid for
  const db = serviceClient();
  const { data: report, error: reportErr } = await db
    .from('birthday_reports')
    .select('is_paid')
    .eq('slug', report_slug)
    .single();

  if (reportErr || !report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (report.is_paid) {
    return res.status(409).json({ error: 'Report already purchased' });
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

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
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
      return res.status(502).json({ error: 'Failed to create order' });
    }
  } catch (e) {
    console.error('[create-order] network error', e);
    return res.status(502).json({ error: 'Failed to reach payment provider' });
  }

  return res.status(200).json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    report_slug,
  });
}
