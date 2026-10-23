import { createClient } from '@supabase/supabase-js';
import { sendEmailDirect } from './_email.js';
import { verifyHmacSha256 } from './_crypto.js';
import { PERMANENT_EXPIRY } from './_userAuth.js';
import { issuePurchaseInvoice, sendPurchaseEmailOnce } from './_purchaseInvoice.js';
import { sendCreditNoteEmail } from './_invoice-email.js';
import { generateCreditNoteHTML } from '../src/lib/invoice-generator.js';

// Web API handler — no Vercel bodyParser config needed; raw Request is passed as-is.

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

async function sendEmail(payload: Record<string, unknown>) {
  try {
    await sendEmailDirect(payload);
  } catch (e) {
    console.error('[webhook] send-email error', e);
  }
}

/**
 * Idempotently unlock the report bought by a paid Razorpay order.
 * Trust model: the event is HMAC-verified; the order was created server-side by
 * create-order, which baked report_slug / userId / product into its notes.
 */
export async function unlockPaidOrder(db: any, order: any, payment: any): Promise<string> {
  if (!order?.id) return 'no-order';
  const notes = order.notes ?? {};
  if (notes.product !== 'birthday_report' || !notes.report_slug) return 'not-a-report-order';
  if (order.status && order.status !== 'paid') return 'order-not-paid';
  if (payment && (payment.order_id && payment.order_id !== order.id)) return 'payment-order-mismatch';
  if (payment && typeof payment.amount === 'number' && typeof order.amount === 'number'
      && payment.amount < order.amount) return 'underpaid';

  const userId: string | null = notes.userId || null;
  if (payment?.id) {
    const { error: payErr } = await db.from('payments').upsert({
      user_id: userId,
      razorpay_payment_id: payment.id,
      razorpay_order_id: order.id,
      amount: payment.amount ?? order.amount ?? 0,
      currency: payment.currency ?? order.currency ?? 'INR',
      status: 'captured',
      product: 'birthday_report',
      report_slug: notes.report_slug,
    }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true });
    if (payErr) console.error('[webhook] order.paid payment record error', payErr);
  }

  const { error: unlockErr } = await db
    .from('birthday_reports')
    .update({ is_paid: true, expires_at: PERMANENT_EXPIRY })
    .eq('slug', notes.report_slug);
  if (unlockErr) {
    console.error('[webhook] order.paid unlock error', unlockErr);
    throw unlockErr; // handler forgets the event and returns 500 → Razorpay retries
  }
  return 'unlocked';
}

/**
 * order.paid, after the unlock: issue the GST invoice and send the ONE purchase email —
 * the same code path as verify-payment (api/_purchaseInvoice.ts). Needed when the buyer's
 * browser never returned (UPI tab closed, network drop), which used to leave the buyer
 * with no invoice and no email. Idempotent: issue_invoice dedupes on payment_id and the
 * email is claimed through invoices.emailed_at, so the browser path and this can never
 * double-issue or double-send. Throws on an invoicing error so Razorpay retries.
 */
export async function invoiceAndEmailPaidOrder(db: any, order: any, payment: any): Promise<string> {
  const notes = order?.notes ?? {};
  const paymentId: string | undefined = payment?.id;
  if (!paymentId) return 'no-payment';
  const amountPaise = typeof payment.amount === 'number' ? payment.amount : (order.amount ?? 0);
  const currency = payment.currency ?? order.currency ?? 'INR';
  const userId: string | null = notes.userId || null;
  const row = await issuePurchaseInvoice(db, {
    product: 'birthday_report',
    paymentId,
    orderId: order.id,
    userId,
    amountPaise,
    currency,
    region: {
      buyer_state: notes.buyer_state, buyer_state_code: notes.buyer_state_code,
      buyer_country: notes.buyer_country, tax_mode: notes.tax_mode,
    },
    fallbackEmail: payment.email || null,
  });
  if (!row) return 'invoice-skipped';   // Razorpay TEST mode (staging): no real GST number
  const mail = await sendPurchaseEmailOnce(db, {
    invoiceRow: row, userId, product: 'birthday_report', amountPaise, currency,
    slug: notes.report_slug, fallbackEmail: payment.email || null,
  });
  return `invoiced:${mail}`;
}

/** Issue a GST credit note for a processed refund (idempotent on refund id), then email it once. */
export async function issueCreditNoteForRefund(db: any, refund: any): Promise<string> {
  if (!refund?.id || !refund?.payment_id) return 'no-refund';
  const { data: cn, error } = await db.rpc('issue_credit_note', {
    p: {
      refund_id: refund.id,
      payment_id: refund.payment_id,
      // Razorpay amounts are in paise/cents; the invoice stores major units.
      gross_amount: typeof refund.amount === 'number' ? refund.amount / 100 : null,
    },
  });
  if (error) {
    // e.g. "No invoice found for payment_id" (test mode skips invoicing). Logged,
    // not retried — a missing invoice will not appear on retry.
    console.error('[webhook] credit note not issued', refund.id, error.message ?? error);
    return 'error';
  }
  const mail = cn ? await emailCreditNoteOnce(db, cn) : 'no-row';
  return `issued:${mail}`;
}

/**
 * Email a credit note to the buyer once. Claimed through credit_notes.emailed_at
 * (20261024120000 migration). Until that column exists the claim fails with an
 * undefined-column error; the send then relies on webhook_events (one processing per
 * Razorpay event id), which is what made it once-only before.
 */
export async function emailCreditNoteOnce(db: any, cn: any): Promise<'sent' | 'already-sent' | 'failed' | 'no-recipient'> {
  const to = String(cn?.buyer_email || '').trim();
  if (!to) return 'no-recipient';
  let claimed = false;
  const { data, error } = await db.from('credit_notes')
    .update({ emailed_at: new Date().toISOString() })
    .eq('refund_id', cn.refund_id)
    .is('emailed_at', null)
    .select('id');
  if (error) {
    const missingColumn = error.code === '42703' || error.code === 'PGRST204';
    if (!missingColumn) { console.error('[webhook] credit note email claim error', error.message ?? error); return 'failed'; }
  } else {
    claimed = Array.isArray(data) && data.length > 0;
    if (!claimed) return 'already-sent';
  }
  const sym = cn.currency === 'USD' ? '$' : '₹';
  const amt = Number(cn.gross_amount) || 0;
  let ok = false;
  try { ok = await sendCreditNoteEmail({
    to,
    creditNoteNo: cn.credit_note_no,
    originalInvoiceNo: cn.original_invoice_no,
    amountFormatted: `${sym}${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    html: generateCreditNoteHTML(cn),
  }); } catch (e) { console.error('[webhook] credit note email threw', e); }
  if (!ok && claimed) {
    try { await db.from('credit_notes').update({ emailed_at: null }).eq('refund_id', cn.refund_id); } catch { /* ignore */ }
  }
  return ok ? 'sent' : 'failed';
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return json({ error: 'Webhook not configured' }, 500);
  }

  // Read raw body ONCE — ArrayBuffer is plain memory; safe to use for both
  // HMAC verification and JSON parsing without consuming a stream twice.
  const rawBody = await request.arrayBuffer();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  const valid = await verifyHmacSha256(webhookSecret, rawBody, signature);
  if (!valid) {
    console.error('[webhook] INVALID SIGNATURE — possible replay or misconfigured secret');
    return json({ error: 'Invalid signature' }, 403);
  }

  let event: any;
  try {
    event = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return json({ error: 'Malformed JSON body' }, 400);
  }

  const eventId: string = event.id;
  const eventType: string = event.event;

  if (!eventId) {
    console.error('[webhook] event missing .id field');
    return json({ error: 'Missing event id' }, 400);
  }

  const db = serviceClient();

  // ── Idempotency: record this event; skip if already processed ───────────────
  const { error: insertErr } = await db.from('webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    payload: event,
  });

  if (insertErr) {
    if (insertErr.code === '23505') {
      // Already processed — return 200 so Razorpay stops retrying
      console.log('[webhook] duplicate event ignored', eventId);
      return json({ received: true, duplicate: true });
    }
    // Any OTHER insert failure (transient DB error, etc.) means we could NOT
    // record this event, so the idempotency guard is not in place. Processing
    // anyway is unsafe: the payments upsert is idempotent but the profiles
    // premium/premium_until update is not, so a later re-delivery of the SAME
    // event would apply it twice. Return 5xx instead — Razorpay retries, and
    // once the insert succeeds the guard covers the (now single) processing.
    console.error('[webhook] failed to record event — returning 500 so Razorpay retries', insertErr);
    return json({ error: 'Failed to record event; Razorpay should retry' }, 500);
  }

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload?.subscription?.entity;
        const payment = event.payload?.payment?.entity;
        if (!subscription) break;

        // Prefer userId from notes (set at checkout); fall back to email scan
        const notesUserId: string | undefined = subscription.notes?.userId || payment?.notes?.userId;
        let userId: string | undefined;

        if (notesUserId) {
          userId = notesUserId;
        } else {
          const email = payment?.email || subscription?.notes?.email;
          if (email) {
            const { data: usersData } = await db.auth.admin.listUsers();
            userId = usersData?.users?.find((u: any) => u.email === email)?.id;
          }
        }

        if (!userId) {
          console.error('[webhook] could not resolve user for', eventType, subscription.id);
          break;
        }

        const endDate = subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null;

        await db.from('profiles').update({
          premium_status: true,
          subscription_id: subscription.id,
          subscription_plan: subscription.plan_id,
          subscription_status: 'active',
          premium_until: endDate?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        })
        // INVARIANT: key on `user_id`, not `id`. profiles.id is a random synthetic
        // PK (id != user_id for every live row), so keying the grant on the `id`
        // column matched zero rows and renewals never refreshed premium status. The
        // cancelled/expired/halted handlers below correctly re-select by
        // subscription_id and update by that row's real `id` PK — only this
        // activated/charged grant, which resolves userId from notes/email, was wrong.
        .eq('user_id', userId);

        // Record payment row (amount in paise → store as-is)
        if (payment?.id) {
          await db.from('payments').upsert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription.id,
            amount: payment.amount ?? 0,
            currency: payment.currency ?? 'INR',
            status: payment.status ?? 'captured',
            product: 'subscription',
          }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true });
        }

        // Send premium-activated email on first activation
        if (eventType === 'subscription.activated') {
          const { data: userData } = await db.auth.admin.getUserById(userId);
          const email = userData?.user?.email;
          const name = userData?.user?.user_metadata?.full_name || 'there';
          if (email) {
            await sendEmail({ type: 'premium_activated', to: email, name });
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        // User cancelled voluntarily — they have paid through current_end.
        // Keep premium_status=true so access continues; premium_until marks the expiry.
        // The client derives isPremium=false once premium_until passes (useAuth.ts).
        const subscription = event.payload?.subscription?.entity;
        if (!subscription) break;

        const { data: profile } = await db
          .from('profiles')
          .select('id, user_id')
          .eq('subscription_id', subscription.id)
          .single();

        if (!profile) {
          console.warn('[webhook] no profile for subscription_id', subscription.id);
          break;
        }

        const endDate = subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null;

        await db.from('profiles').update({
          premium_status: true,
          subscription_status: 'cancelled',
          premium_until: endDate?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        // The auth user id is profiles.user_id — profiles.id is a random PK, so
        // looking the user up by profile.id found nobody and the cancellation
        // email never sent (audit item 10).
        const { data: userData } = await db.auth.admin.getUserById(profile.user_id);
        const email = userData?.user?.email;
        if (email) {
          const accessUntil = endDate
            ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'end of billing period';
          const name = userData?.user?.user_metadata?.first_name || 'there';
          await sendEmail({ type: 'cancellation', to: email, name, accessUntil });
        }
        break;
      }

      // subscription.halted: payment failed — revoke immediately, no grace period.
      // No cancellation email: the template is for voluntary cancellation (shows an
      // access-until date); halted users get Razorpay's own payment failure notification.
      case 'subscription.completed':
      case 'subscription.expired':
      case 'subscription.halted':
      case 'subscription.paused': {
        const subscription = event.payload?.subscription?.entity;
        if (!subscription) break;

        const newStatus = eventType.split('.')[1]; // 'completed'|'expired'|'halted'|'paused'

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single();

        if (!profile) {
          console.warn('[webhook] no profile for subscription_id', subscription.id);
          break;
        }

        await db.from('profiles').update({
          premium_status: false,
          subscription_status: newStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        break;
      }

      // One-time Birthday Blueprint purchase. Razorpay sends order.paid once the
      // order is fully paid — even if the buyer's browser never returns to the
      // site (UPI tab closed, network drop). Unlock here too, idempotently, so a
      // paying customer is never left with a locked report. verify-payment does
      // the same unlock when the browser does return; whichever runs first wins
      // and the other is a no-op.
      case 'order.paid': {
        const order = event.payload?.order?.entity;
        const payment = event.payload?.payment?.entity;
        const result = await unlockPaidOrder(db, order, payment);
        // Invoice + purchase email for this payment (no-op if verify-payment already did it).
        const invoiced = result === 'unlocked' ? await invoiceAndEmailPaidOrder(db, order, payment) : 'n/a';
        console.log('[webhook] order.paid', { order: order?.id, result, invoiced });
        break;
      }

      // Refund processed → issue the GST credit note (Section 34) against the
      // original invoice. issue_credit_note() is idempotent on refund_id.
      case 'refund.processed': {
        const refund = event.payload?.refund?.entity;
        const result = await issueCreditNoteForRefund(db, refund);
        console.log('[webhook] refund.processed', { refund: refund?.id, result });
        break;
      }

      case 'payment.failed': {
        const payment = event.payload?.payment?.entity;
        console.log('[webhook] payment.failed', {
          email: payment?.email,
          amount: payment?.amount,
          error: payment?.error_description,
        });
        break;
      }

      default:
        console.log('[webhook] unhandled event type', eventType);
    }

    return json({ received: true });
  } catch (err) {
    console.error('[webhook] processing error', err);
    // order.paid unlock, invoice (issue_invoice dedupes on payment_id) and email (claimed
    // via invoices.emailed_at) are all idempotent, so a failure is safe to retry: forget
    // the event and return 500 so Razorpay re-delivers it. A paying customer must
    // not be left locked out because of one transient DB error.
    if (eventType === 'order.paid') {
      try { await db.from('webhook_events').delete().eq('event_id', eventId); } catch { /* ignore */ }
      return json({ error: 'Unlock failed; please retry' }, 500);
    }
    // Other events: always 200 — their handlers are not all idempotent.
    return json({ received: true });
  }
}

// export const POST triggers @vercel/node's Web API handler path (raw Request/Response).
export const POST = handler;
