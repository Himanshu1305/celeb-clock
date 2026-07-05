import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Service-role client — NEVER use the anon key here
function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Razorpay signature formats differ by product type:
//   subscription: HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
//   order (one-time): HMAC-SHA256(order_id + "|" + payment_id, key_secret)
function verifySignature(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
  keySecret: string;
}): boolean {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_order_id, razorpay_signature, keySecret } = params;

  let message: string;
  if (razorpay_subscription_id) {
    message = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  } else if (razorpay_order_id) {
    message = `${razorpay_order_id}|${razorpay_payment_id}`;
  } else {
    return false;
  }

  const expected = crypto.createHmac('sha256', keySecret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[verify-payment] RAZORPAY_KEY_SECRET not configured');
    return res.status(500).json({ error: 'Payment verification not configured' });
  }

  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_order_id,
    razorpay_signature,
    user_id,
    product,           // 'subscription' | 'birthday_report'
    amount,
    currency,
    report_slug,
  } = req.body ?? {};

  if (!razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required payment fields' });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  if (!product || !['subscription', 'birthday_report'].includes(product)) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  const valid = verifySignature({
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_order_id,
    razorpay_signature,
    keySecret,
  });

  if (!valid) {
    console.error('[verify-payment] INVALID SIGNATURE', {
      payment_id: razorpay_payment_id,
      user_id,
      product,
    });
    return res.status(403).json({ error: 'Invalid payment signature' });
  }

  const db = serviceClient();

  // Record payment — UNIQUE(razorpay_payment_id) prevents double-processing
  const { error: paymentErr } = await db.from('payments').insert({
    user_id,
    razorpay_payment_id,
    razorpay_order_id: razorpay_order_id ?? null,
    razorpay_subscription_id: razorpay_subscription_id ?? null,
    amount: amount ?? 0,
    currency: currency ?? 'INR',
    status: 'captured',
    product,
    report_slug: report_slug ?? null,
  });

  if (paymentErr) {
    if (paymentErr.code === '23505') {
      // Duplicate — already processed; idempotent success
      console.warn('[verify-payment] duplicate payment_id, returning cached success', razorpay_payment_id);
    } else {
      console.error('[verify-payment] payment insert error', paymentErr);
      return res.status(500).json({ error: 'Failed to record payment' });
    }
  }

  // Grant entitlement based on product
  if (product === 'subscription') {
    const { error: profileErr } = await db
      .from('profiles')
      .update({
        premium_status: true,
        subscription_id: razorpay_subscription_id ?? null,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (profileErr) {
      console.error('[verify-payment] profile update error', profileErr);
      return res.status(500).json({ error: 'Failed to grant premium access' });
    }
  }

  // For birthday_report: entitlement is the report slug itself (already saved
  // during report generation); no additional grant needed.

  return res.status(200).json({ success: true, product });
}
