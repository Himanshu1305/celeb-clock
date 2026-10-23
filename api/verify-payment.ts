import { verifyHmacSha256 } from './_crypto.js';
import { serviceClient, getAuthedUser, PERMANENT_EXPIRY } from './_userAuth.js';
import { sendPurchaseEmail } from './_invoice-email.js';
import { issuePurchaseInvoice, sendPurchaseEmailOnce, buyerIdentity, receiptFields, isRazorpayTestMode } from './_purchaseInvoice.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Razorpay signature formats differ by product type:
//   subscription: HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
//   order (one-time): HMAC-SHA256(order_id + "|" + payment_id, key_secret)
async function verifySignature(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
  keySecret: string;
}): Promise<boolean> {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_order_id, razorpay_signature, keySecret } = params;

  let message: string;
  if (razorpay_subscription_id) {
    message = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  } else if (razorpay_order_id) {
    message = `${razorpay_order_id}|${razorpay_payment_id}`;
  } else {
    return false;
  }

  // verifyHmacSha256 accepts ArrayBuffer | Uint8Array; pass encoded message string.
  // sigHex length mismatch and malformed hex both return false (never throw).
  return verifyHmacSha256(keySecret, new TextEncoder().encode(message), razorpay_signature);
}

// Razorpay REST fetch (server-side, Basic auth). Returns parsed JSON or throws.
async function razorpayGet(path: string, keyId: string, keySecret: string): Promise<any> {
  // btoa() is safe here — Razorpay key IDs and secrets are ASCII-only
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`razorpay ${path} ${res.status}`), { data });
  return data;
}

/**
 * Replay guard: has this payment / order / subscription id already been recorded
 * for a DIFFERENT account? (Same account → idempotent re-submit, allowed.)
 */
async function usedByAnotherAccount(db: any, table: string, col: string, val: string, userId: string): Promise<boolean> {
  const { data, error } = await db.from(table).select('user_id').eq(col, val).limit(10);
  if (error) throw error;
  return (data ?? []).some((r: any) => r.user_id !== userId);
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[verify-payment] RAZORPAY_KEY_SECRET not configured');
    return json({ error: 'Payment verification not configured' }, 500);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_order_id,
    razorpay_signature,
    product,           // 'subscription' | 'birthday_report'
    report_slug,
  } = body ?? {};

  // Authoritative values, filled from Razorpay (never from the request body).
  let authoritativeSlug: string | null = null;
  let paymentAmount = 0;
  let paymentCurrency = 'INR';
  // Buyer/tax details set at checkout, forwarded via Razorpay order/payment notes.
  // Read by the non-fatal GST-invoice block near the end.
  let orderNotes: Record<string, any> = {};

  if (!razorpay_payment_id || !razorpay_signature) {
    return json({ error: 'Missing required payment fields' }, 400);
  }
  if (!product || !['subscription', 'birthday_report'].includes(product)) {
    return json({ error: 'Invalid product type' }, 400);
  }

  const db = serviceClient();

  // ── WHO is paying: the signed-in caller, from their access token ─────────────
  // A body user_id is never trusted. If one is sent it must match the caller.
  const caller = await getAuthedUser(request, db);
  if (!caller) return json({ error: 'Please sign in to complete your purchase' }, 401);
  const user_id = caller.id;
  if (body?.user_id && body.user_id !== user_id) {
    return json({ error: 'Payment does not belong to this account' }, 403);
  }

  const valid = await verifySignature({
    razorpay_payment_id,
    razorpay_subscription_id: product === 'subscription' ? razorpay_subscription_id : undefined,
    razorpay_order_id: product === 'birthday_report' ? razorpay_order_id : undefined,
    razorpay_signature,
    keySecret,
  });

  if (!valid) {
    console.error('[verify-payment] INVALID SIGNATURE', {
      payment_id: razorpay_payment_id,
      user_id,
      product,
    });
    return json({ error: 'Invalid payment signature' }, 403);
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) return json({ error: 'Payment configuration error' }, 500);

  // ── Bind the payment to the account that created the order / subscription ──
  // create-order / create-subscription bake the signed-in user's id into the
  // Razorpay notes (notes.userId). The caller must be that user, so one real
  // payment can never unlock a different account.
  if (product === 'subscription') {
    if (!razorpay_subscription_id) {
      return json({ error: 'razorpay_subscription_id required for subscription' }, 400);
    }
    let sub: any;
    try {
      sub = await razorpayGet(`subscriptions/${razorpay_subscription_id}`, keyId, keySecret);
    } catch (e) {
      console.error('[verify-payment] subscription fetch error', e);
      return json({ error: 'Could not reach payment provider' }, 502);
    }
    if (!sub?.notes?.userId || sub.notes.userId !== user_id) {
      console.error('[verify-payment] subscription owner mismatch', { sub: razorpay_subscription_id, user_id });
      return json({ error: 'Payment does not belong to this account' }, 403);
    }
    orderNotes = sub.notes ?? {};
    // Charged amount from the payment itself (non-fatal: only the invoice needs it).
    try {
      const pmt = await razorpayGet(`payments/${razorpay_payment_id}`, keyId, keySecret);
      if (pmt.amount) paymentAmount = pmt.amount;
      if (pmt.currency) paymentCurrency = pmt.currency;
      if (pmt.notes) orderNotes = { ...orderNotes, ...pmt.notes };
    } catch (e) {
      console.warn('[verify-payment] could not fetch subscription payment amount (non-fatal):', e);
    }
  }

  if (product === 'birthday_report') {
    if (!razorpay_order_id) {
      return json({ error: 'razorpay_order_id required for birthday_report' }, 400);
    }
    let orderData: any;
    try {
      orderData = await razorpayGet(`orders/${razorpay_order_id}`, keyId, keySecret);
    } catch (e) {
      console.error('[verify-payment] order fetch error', e);
      return json({ error: 'Could not fetch order' }, 502);
    }

    if (!orderData?.notes?.userId || orderData.notes.userId !== user_id) {
      console.error('[verify-payment] order owner mismatch', { order: razorpay_order_id, user_id });
      return json({ error: 'Payment does not belong to this account' }, 403);
    }

    authoritativeSlug = orderData.notes?.report_slug ?? null;
    paymentAmount = orderData.amount;
    paymentCurrency = orderData.currency;
    orderNotes = orderData.notes ?? {};

    if (!authoritativeSlug) {
      console.error('[verify-payment] order missing report_slug in notes', razorpay_order_id);
      return json({ error: 'Order missing report_slug' }, 400);
    }
    // Cross-check: if client supplied a slug it must match the server-baked one
    if (report_slug && report_slug !== authoritativeSlug) {
      console.error('[verify-payment] slug mismatch body=%s order=%s', report_slug, authoritativeSlug);
      return json({ error: 'Report slug mismatch' }, 403);
    }
  }

  // ── Replay guard: a payment / order / subscription id is good for ONE account ──
  try {
    const replay =
      await usedByAnotherAccount(db, 'payments', 'razorpay_payment_id', razorpay_payment_id, user_id)
      || (product === 'subscription' && (
        await usedByAnotherAccount(db, 'payments', 'razorpay_subscription_id', razorpay_subscription_id, user_id)
        || await usedByAnotherAccount(db, 'profiles', 'subscription_id', razorpay_subscription_id, user_id)))
      || (product === 'birthday_report'
        && await usedByAnotherAccount(db, 'payments', 'razorpay_order_id', razorpay_order_id, user_id));
    if (replay) {
      console.error('[verify-payment] REPLAY rejected — id already used by another account', {
        payment_id: razorpay_payment_id, user_id, product,
      });
      return json({ error: 'This payment has already been used' }, 409);
    }
  } catch (e) {
    console.error('[verify-payment] replay check failed', e);
    return json({ error: 'Could not verify payment. Please try again.' }, 500);
  }

  // Record payment — UNIQUE(razorpay_payment_id) prevents double-processing
  const { error: paymentErr } = await db.from('payments').insert({
    user_id,
    razorpay_payment_id,
    razorpay_order_id: product === 'birthday_report' ? razorpay_order_id : null,
    razorpay_subscription_id: product === 'subscription' ? razorpay_subscription_id : null,
    amount: paymentAmount,
    currency: paymentCurrency,
    status: 'captured',
    product,
    report_slug: authoritativeSlug,
  });

  if (paymentErr) {
    if (paymentErr.code === '23505') {
      // Duplicate for THIS account (the replay guard above rejected other accounts):
      // already processed — idempotent success.
      console.warn('[verify-payment] duplicate payment_id, returning cached success', razorpay_payment_id);
    } else {
      console.error('[verify-payment] payment insert error', paymentErr);
      return json({ error: 'Failed to record payment' }, 500);
    }
  }

  // Grant entitlement based on product
  if (product === 'subscription') {
    const { error: profileErr } = await db
      .from('profiles')
      .update({
        premium_status: true,
        subscription_id: razorpay_subscription_id,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      // INVARIANT: grant premium keyed on `user_id` (the auth link), NEVER `id`.
      // `profiles.id` is a RANDOM synthetic PK (handle_new_user inserts
      // (user_id,…) VALUES (NEW.id,…) and lets id default gen_random_uuid()),
      // so in the live DB id != user_id for every row. See BORNCLOCK_AUDIT_FIXES.md.
      .eq('user_id', user_id);

    if (profileErr) {
      console.error('[verify-payment] profile update error', profileErr);
      return json({ error: 'Failed to grant premium access' }, 500);
    }
  }

  // For birthday_report: mark the report as paid. Paid reports are PERMANENT
  // (founder decision, Oct 2026) — expires_at is set to 'infinity'.
  if (product === 'birthday_report' && authoritativeSlug) {
    const { error: unlockErr } = await db
      .from('birthday_reports')
      .update({ is_paid: true, expires_at: PERMANENT_EXPIRY })
      .eq('slug', authoritativeSlug);

    if (unlockErr) {
      console.error('[verify-payment] birthday_report unlock error', unlockErr);
      return json({
        error: 'Payment recorded but report unlock failed. Contact support at hello@bornclock.com with your payment ID.',
      }, 500);
    }
  }

  // --- GST INVOICE + ONE purchase email (non-fatal) ---------------------------
  // Runs AFTER payment success + entitlement grant are committed; any failure here is
  // logged and swallowed — the customer has paid and keeps access. The invoice and the
  // email go through api/_purchaseInvoice.ts, the SAME code path the order.paid webhook
  // uses, so whichever of the two runs first issues/sends and the other is a no-op
  // (issue_invoice is idempotent by payment_id; the email is claimed via emailed_at).
  //
  // Region: birthday_report carries it in the Razorpay ORDER notes; subscriptions carry
  // it in the request BODY (the subscription checkout does not reliably forward notes).
  const region = {
    buyer_state:      orderNotes.buyer_state      || body.buyer_state      || null,
    buyer_state_code: orderNotes.buyer_state_code || body.buyer_state_code || null,
    buyer_country:    orderNotes.buyer_country    || body.buyer_country    || 'India',
    tax_mode:         orderNotes.tax_mode         || body.tax_mode         || null,
    billing:          orderNotes.billing          || body.billing          || null,
  };

  // Persist the place-of-supply on the profile on the first subscription payment — it is
  // the authoritative region for every future renewal charge (read back by the daily
  // invoice sweep). Keyed on user_id (profiles.id is a random PK). Non-fatal.
  if (product === 'subscription' && paymentAmount > 0 && !isRazorpayTestMode()) {
    try {
      const { error: posErr } = await db.from('profiles').update({
        buyer_state: region.buyer_state,
        buyer_state_code: region.buyer_state_code,
        buyer_country: region.buyer_country,
      }).eq('user_id', user_id);
      if (posErr) console.warn('[invoice] place-of-supply persist skipped (non-fatal):', posErr.message);
    } catch (e) {
      console.warn('[invoice] place-of-supply persist error (non-fatal):', e);
    }
  }

  let invoiceRow: any = null;
  try {
    invoiceRow = await issuePurchaseInvoice(db, {
      product,
      paymentId: razorpay_payment_id,
      orderId: product === 'birthday_report' ? razorpay_order_id : null,
      subscriptionId: product === 'subscription' ? razorpay_subscription_id : null,
      userId: user_id,
      amountPaise: paymentAmount,
      currency: paymentCurrency,
      region,
    });
  } catch (invoiceErr) {
    console.error('[invoice] non-fatal error:', invoiceErr);
  }

  try {
    if (invoiceRow) {
      const r = await sendPurchaseEmailOnce(db, {
        invoiceRow, userId: user_id, product, amountPaise: paymentAmount, currency: paymentCurrency, slug: authoritativeSlug,
      });
      if (r !== 'sent') console.log('[verify-payment] purchase email:', r);
    } else {
      // FAILURE ISOLATION: invoicing skipped/failed → still send a confirmation (no
      // attachment, "invoice will follow"). No invoice row exists to dedupe on here.
      const buyer = await buyerIdentity(db, user_id);
      if (buyer.email) {
        await sendPurchaseEmail({
          to: buyer.email, name: buyer.firstName,
          ...receiptFields(paymentAmount, paymentCurrency, product, authoritativeSlug),
        });
      }
    }
  } catch (e) {
    console.error('[verify-payment] purchase email error (non-fatal)', e);
  }

  return json({ success: true, product });
}

// export const POST triggers @vercel/node's Web API handler path (raw Request/Response).
export const POST = handler;
