import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('[create-subscription] Razorpay credentials not configured');
    return res.status(500).json({ error: 'Payment not configured' });
  }

  // Whitelist: plan ID → total_count.
  // Monthly plans: 120 cycles (~10 years); annual plans: 10 cycles (~10 years).
  // Built at runtime so if env vars are absent those slots are simply omitted.
  const whitelist: Record<string, number> = {};
  const planIndiaMonthly  = process.env.VITE_RAZORPAY_PLAN_INDIA_MONTHLY;
  const planIndiaAnnual   = process.env.VITE_RAZORPAY_PLAN_INDIA_ANNUAL;
  const planGlobalMonthly = process.env.VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY;
  const planGlobalAnnual  = process.env.VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL;
  if (planIndiaMonthly)  whitelist[planIndiaMonthly]  = 120;
  if (planIndiaAnnual)   whitelist[planIndiaAnnual]   = 10;
  if (planGlobalMonthly) whitelist[planGlobalMonthly] = 120;
  if (planGlobalAnnual)  whitelist[planGlobalAnnual]  = 10;

  const { planId, userId } = req.body ?? {};

  if (!planId || !userId) {
    return res.status(400).json({ error: 'Missing planId or userId' });
  }

  const totalCount = whitelist[planId];
  if (totalCount === undefined) {
    console.warn('[create-subscription] rejected unknown planId', planId);
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // customer_notify: 0 — do NOT pre-issue the invoice at creation time.
  // With 1 (the previous value), Razorpay immediately issues a ₹299 invoice AND
  // opens checkout in e-mandate auth mode (₹5 upfront authorization). The bank
  // sees two different amounts and rejects with "payment amount ≠ order amount".
  // With 0, no invoice is issued until checkout collects the first payment; the
  // checkout order and the invoice are created atomically for the same amount.
  // Razorpay still sends its own payment receipt to the customer post-charge.
  //
  // ORPHAN NOTE: subscriptions in "created" state that are never authenticated
  // (user dismissed checkout, tab closed, etc.) are completely inert — Razorpay
  // never charges them. They accumulate in the dashboard but cause no harm.
  // Clean them up with:  node --env-file=.env.local scripts/diagnose-razorpay.mjs --cancel-orphans
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  let rzpData: any;
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        quantity: 1,
        total_count: totalCount,
        customer_notify: 0,
        notes: { userId },
      }),
    });

    rzpData = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('[create-subscription] Razorpay API error', rzpData);
      return res.status(502).json({ error: 'Failed to create subscription' });
    }
  } catch (e) {
    console.error('[create-subscription] network error', e);
    return res.status(502).json({ error: 'Failed to reach payment provider' });
  }

  return res.status(200).json({ subscription_id: rzpData.id });
}
