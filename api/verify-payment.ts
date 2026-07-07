import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmailDirect } from './_email';

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
  // timingSafeEqual throws if buffers differ in length (e.g. truncated/garbage sig).
  // Treat any such input as an invalid signature rather than a 500.
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  } catch {
    return false;
  }
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

  // For birthday_report orders: after HMAC passes we fetch the Razorpay order to
  // get the server-baked report_slug and authoritative amount. This prevents a
  // client from supplying a tampered slug to unlock a report they didn't pay for.
  // These are populated below (before the payment insert) and used throughout.
  let authoritativeSlug: string | null = report_slug ?? null;
  let paymentAmount: number = amount ?? 0;
  let paymentCurrency: string = currency ?? 'INR';

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

  // For birthday_report: fetch the Razorpay order to get authoritative values
  if (product === 'birthday_report') {
    if (!razorpay_order_id) {
      return res.status(400).json({ error: 'razorpay_order_id required for birthday_report' });
    }
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) return res.status(500).json({ error: 'Payment configuration error' });

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    let orderData: any;
    try {
      const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      orderData = await orderRes.json();
      if (!orderRes.ok) {
        console.error('[verify-payment] order fetch error', orderData);
        return res.status(502).json({ error: 'Could not fetch order' });
      }
    } catch (e) {
      console.error('[verify-payment] order fetch network error', e);
      return res.status(502).json({ error: 'Could not reach payment provider' });
    }

    authoritativeSlug = orderData.notes?.report_slug ?? null;
    paymentAmount = orderData.amount;
    paymentCurrency = orderData.currency;

    if (!authoritativeSlug) {
      console.error('[verify-payment] order missing report_slug in notes', razorpay_order_id);
      return res.status(400).json({ error: 'Order missing report_slug' });
    }
    // Cross-check: if client supplied a slug it must match the server-baked one
    if (report_slug && report_slug !== authoritativeSlug) {
      console.error('[verify-payment] slug mismatch body=%s order=%s', report_slug, authoritativeSlug);
      return res.status(403).json({ error: 'Report slug mismatch' });
    }
  }

  // Record payment — UNIQUE(razorpay_payment_id) prevents double-processing
  const { error: paymentErr } = await db.from('payments').insert({
    user_id,
    razorpay_payment_id,
    razorpay_order_id: razorpay_order_id ?? null,
    razorpay_subscription_id: razorpay_subscription_id ?? null,
    amount: paymentAmount,
    currency: paymentCurrency,
    status: 'captured',
    product,
    report_slug: authoritativeSlug,
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

  // For birthday_report: mark the report as paid (enables 30-day expiry extension
  // and prevents double-purchase via create-order's is_paid check)
  if (product === 'birthday_report' && authoritativeSlug) {
    const { error: unlockErr } = await db
      .from('birthday_reports')
      .update({
        is_paid: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('slug', authoritativeSlug);

    if (unlockErr) {
      console.error('[verify-payment] birthday_report unlock error', unlockErr);
      return res.status(500).json({
        error: 'Payment recorded but report unlock failed. Contact support at hello@bornclock.com with your payment ID.',
      });
    }
  }

  // Send payment receipt email (fire-and-forget; must not block the response)
  try {
    const { data: userData } = await serviceClient().auth.admin.getUserById(user_id);
    const userEmail = userData?.user?.email;
    const userName = userData?.user?.user_metadata?.full_name || userData?.user?.user_metadata?.first_name || 'there';
    if (userEmail) {
      const currencySymbol = paymentCurrency === 'INR' ? '₹' : '$';
      const amountFormatted = `${currencySymbol}${(paymentAmount / 100).toLocaleString('en-IN')}`;
      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : `https://${process.env.VERCEL_URL || 'bornclock.com'}`;
      await sendEmailDirect({
        type: 'payment_receipt',
        to: userEmail,
        name: userName,
        product,
        amountFormatted,
        date,
        reportLink: authoritativeSlug ? `${base}/report/${authoritativeSlug}` : undefined,
      });
    }
  } catch (e) {
    console.error('[verify-payment] receipt email error (non-fatal)', e);
  }

  return res.status(200).json({ success: true, product });
}
