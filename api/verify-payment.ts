import { verifyHmacSha256 } from './_crypto.js';
import { serviceClient, getAuthedUser, PERMANENT_EXPIRY } from './_userAuth.js';
import { generateInvoiceHTML, splitGstInclusive } from '../src/lib/invoice-generator.js';
import { sendPurchaseEmail } from './_invoice-email.js';

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

  // BATCH-6 Phase 2: purchases now send ONE merged email (confirmation + invoice
  // attached), dispatched AFTER the invoice block below so it can include the PDF.
  // Here we only CAPTURE the confirmation/receipt data (no send). Non-fatal.
  let receipt: { to: string; name: string; product: string; amountFormatted: string; date: string; reportLink?: string } | null = null;
  let invoiceForEmail: { invoiceNo: string; html: string } | null = null;
  try {
    const { data: userData } = await db.auth.admin.getUserById(user_id);
    const userEmail = userData?.user?.email;
    const userName = userData?.user?.user_metadata?.full_name || userData?.user?.user_metadata?.first_name || 'there';
    if (userEmail) {
      const currencySymbol = paymentCurrency === 'INR' ? '₹' : '$';
      const amountFormatted = `${currencySymbol}${(paymentAmount / 100).toLocaleString('en-IN')}`;
      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const base = process.env.PRODUCTION_URL ?? 'https://bornclock.com';
      receipt = {
        to: userEmail,
        name: userName,
        product,
        amountFormatted,
        date,
        reportLink: authoritativeSlug ? `${base}/report/${authoritativeSlug}` : undefined,
      };
    }
  } catch (e) {
    console.error('[verify-payment] receipt data error (non-fatal)', e);
  }

  // --- GST INVOICE (non-fatal) ---------------------------------------------
  // Appended AFTER payment success + entitlement grant are already committed.
  // Any failure here is logged and swallowed — the customer has paid and must
  // keep access. The HMAC check and premium-grant paths above are never touched.
  try {
    // Both product types are now invoiced (every taxable supply requires an
    // invoice). birthday_report carries its region in the Razorpay ORDER notes;
    // subscriptions carry it in the verify-payment request BODY — the
    // subscription checkout object does not reliably forward its notes onto the
    // payment, so CheckoutRegionModal's confirmed region is posted in the body
    // (buyer_state / buyer_state_code / buyer_country / tax_mode) and read here.
    // A subscription with no resolvable amount (the Razorpay payment fetch above
    // failed) cannot be invoiced accurately — skip rather than issue a
    // zero-value invoice. Throw the 'skip' sentinel to exit via the shared catch.
    if (product === 'subscription' && (!paymentAmount || paymentAmount <= 0)) {
      throw new Error('skip');
    }

    // Part AO: in Razorpay TEST mode (staging), NEVER allocate a real GST invoice number —
    // issue_invoice() draws from the single live sequence shared with production, so a test
    // purchase would burn a real number and leave a gap in the statutory series. Detect test
    // mode by the key prefix and skip invoicing entirely (entitlement was already granted
    // above, so the paywall still unlocks for the test). Production uses rzp_live_ → unchanged.
    const isTestMode = (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_');
    if (isTestMode) {
      console.log('[verify-payment] TEST mode — skipping real GST invoice numbering (protects the live series)');
      throw new Error('skip');
    }

    // Razorpay note values arrive as strings ('' when absent) — use || not ??.
    // Notes first (order flow), then the request body (subscription flow).
    const buyerState     = orderNotes.buyer_state      || body.buyer_state      || null;
    const buyerStateCode = orderNotes.buyer_state_code || body.buyer_state_code  || null;
    const buyerCountry   = orderNotes.buyer_country    || body.buyer_country     || 'India';
    // tax_mode from checkout declaration; fall back safely. Never mislabel an INR
    // domestic charge as EXPORT — only USD-with-no-state defaults to EXPORT.
    const taxMode: 'CGST_SGST' | 'IGST' | 'EXPORT' = orderNotes.tax_mode || body.tax_mode
      || (buyerStateCode === '36' ? 'CGST_SGST'
        : buyerStateCode ? 'IGST'
        : (paymentCurrency === 'USD' ? 'EXPORT' : 'IGST'));

    // Persist the place-of-supply on the profile on the first subscription
    // payment — it is the authoritative region for every future renewal charge,
    // which arrives via the frozen webhook carrying no declaration of its own
    // (read back by the daily invoice sweep). Keyed on user_id (the auth link;
    // profiles.id is a random PK). Tolerate the column not existing yet — the
    // founder applies NOTES-subscription-invoicing.sql; until then this is a
    // non-fatal no-op and the sweep simply finds no region to invoice with.
    if (product === 'subscription') {
      const { error: posErr } = await db.from('profiles').update({
        buyer_state: buyerState,
        buyer_state_code: buyerStateCode,
        buyer_country: buyerCountry,
      }).eq('user_id', user_id);
      if (posErr) console.warn('[invoice] place-of-supply persist skipped (non-fatal):', posErr.message);
    }

    const invCurrency = paymentCurrency === 'USD' ? 'USD' : 'INR';
    const grossAmount = paymentAmount / 100;   // Razorpay stores paise/cents
    // GST-inclusive split — shared rule (equal CGST/SGST heads that foot to the total).
    const { taxable, cgst, sgst, igst } = splitGstInclusive(grossAmount, taxMode);
    const fxRate = taxMode === 'EXPORT' ? 87.20 : null;   // fixed fallback; live rate = future
    // Record the rate's provenance so an export invoice never presents this
    // fixed value as a live market rate. OPEN ITEM: wire a live FX feed (RBI
    // reference rate / provider) and set fx_rate + source from it. See
    // BORNCLOCK_AUDIT_FIXES.md → "Open items".
    const fxRateDate = fxRate ? new Date().toISOString().slice(0, 10) : null;
    const fxRateSource = fxRate ? 'Fixed fallback rate (₹87.20; no live FX feed yet)' : null;

    // buyer identity (same service client already in scope)
    const { data: buyerData } = await db.auth.admin.getUserById(user_id);
    const buyerEmail = buyerData?.user?.email ?? '';
    const buyerName = buyerData?.user?.user_metadata?.full_name
      || buyerData?.user?.user_metadata?.first_name
      || 'BornClock Customer';

    // Cadence read from the checkout notes / body ('monthly' | 'annual').
    const billing = (orderNotes.billing || body.billing || '').toString().toLowerCase();
    const subCadence = billing === 'annual' ? 'Annual' : 'Monthly';
    const lineDesc = product === 'birthday_report'
      ? 'BornClock — Birthday Blueprint Report'
      : `BornClock Premium — ${subCadence} subscription`;
    const lineNote = product === 'birthday_report'
      ? 'Digital report, one-time purchase. Delivered electronically.'
      : `Premium ${subCadence.toLowerCase()} subscription. Delivered electronically.`;

    // issue_invoice() allocates the number + inserts atomically, idempotent by payment_id
    const { data: invoiceRow, error: invoiceErr } = await db.rpc('issue_invoice', {
      p: {
        order_id:         razorpay_order_id ?? razorpay_subscription_id ?? razorpay_payment_id,
        payment_id:       razorpay_payment_id,
        user_id:          user_id ?? null,
        buyer_name:       buyerName,
        buyer_email:      buyerEmail,
        buyer_gstin:      null,
        buyer_country:    buyerCountry,
        buyer_state:      buyerState,
        buyer_state_code: buyerStateCode,
        place_of_supply:  buyerState ? `${buyerState} (${buyerStateCode})` : buyerCountry,
        tax_mode:         taxMode,
        currency:         invCurrency,
        fx_rate:          fxRate,
        fx_rate_date:     fxRateDate,
        fx_rate_source:   fxRateSource,
        gross_amount:     grossAmount,
        taxable_value:    taxMode === 'EXPORT' ? grossAmount : taxable,
        cgst, sgst, igst,
        line_items: [{ desc: lineDesc, note: lineNote, qty: 1, gross: grossAmount }],
      },
    });
    if (invoiceErr) throw invoiceErr;

    if (invoiceRow) {
      const row = invoiceRow as any;
      // Capture for the single merged email (sent below); the receipt recipient is the
      // same auth user as row.buyer_email. No separate invoice email is sent here now.
      invoiceForEmail = { invoiceNo: row.invoice_no, html: generateInvoiceHTML(row) };
    }
  } catch (invoiceErr) {
    if ((invoiceErr as Error).message !== 'skip') {
      console.error('[invoice] non-fatal error:', invoiceErr);
    }
  }
  // --- end GST INVOICE -----------------------------------------------------

  // ONE merged purchase email: confirmation + the invoice attached when it was issued.
  // FAILURE ISOLATION: if invoicing above failed (invoiceForEmail is null), the customer
  // STILL receives a confirmation — sendPurchaseEmail simply omits the attachment.
  try {
    if (receipt) {
      await sendPurchaseEmail({
        ...receipt,
        invoiceNo: invoiceForEmail?.invoiceNo,
        invoiceHtml: invoiceForEmail?.html,
      });
    }
  } catch (e) {
    console.error('[verify-payment] purchase email error (non-fatal)', e);
  }

  return json({ success: true, product });
}

// export const POST triggers @vercel/node's Web API handler path (raw Request/Response).
export const POST = handler;
