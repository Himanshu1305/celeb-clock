// api/_purchaseInvoice.ts — ONE code path for the GST invoice + purchase email of a
// first payment, shared by the browser return (verify-payment) and the Razorpay
// order.paid webhook (for buyers whose browser never came back).
//
// Exactly-once guarantees:
//   • invoice: issue_invoice() is idempotent on payment_id (returns the existing row),
//     so the browser path and the webhook can both call it safely;
//   • email: whoever first flips invoices.emailed_at from NULL (an atomic conditional
//     UPDATE … RETURNING) sends it; the other path sees no row back and does nothing.
//     A failed send puts emailed_at back to NULL so a retry can send.
import { generateInvoiceHTML, splitGstInclusive } from '../src/lib/invoice-generator.js';
import { sendPurchaseEmail } from './_invoice-email.js';

export type Product = 'birthday_report' | 'subscription';

export interface PurchaseInvoiceInput {
  product: Product;
  paymentId: string;
  orderId?: string | null;
  subscriptionId?: string | null;
  userId: string | null;
  amountPaise: number;
  currency: string;
  /** Razorpay order/payment notes first, then (subscription flow) the request body. */
  region: { buyer_state?: string | null; buyer_state_code?: string | null; buyer_country?: string | null; tax_mode?: string | null; billing?: string | null };
  /** Used only when the auth user has no email (should not happen; webhook fallback). */
  fallbackEmail?: string | null;
}

export const isRazorpayTestMode = () =>
  (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_');

export async function buyerIdentity(db: any, userId: string | null, fallbackEmail?: string | null): Promise<{ email: string; name: string; firstName: string }> {
  let u: any = null;
  if (userId) {
    try { u = (await db.auth.admin.getUserById(userId))?.data?.user ?? null; } catch { u = null; }
  }
  const md = u?.user_metadata ?? {};
  return {
    email: u?.email || fallbackEmail || '',
    name: md.full_name || md.first_name || 'BornClock Customer',
    firstName: md.full_name || md.first_name || 'there',
  };
}

/**
 * Issue (or fetch the already-issued) GST invoice for a payment. Returns the invoice row,
 * or null when invoicing is deliberately skipped (Razorpay TEST mode — protects the live
 * number series — or a subscription with no resolvable amount). Throws on a real error.
 */
export async function issuePurchaseInvoice(db: any, i: PurchaseInvoiceInput): Promise<any | null> {
  if (i.product === 'subscription' && (!i.amountPaise || i.amountPaise <= 0)) return null;
  // Part AO: in Razorpay TEST mode (staging), NEVER allocate a real GST invoice number —
  // issue_invoice() draws from the single live sequence shared with production.
  if (isRazorpayTestMode()) {
    console.log('[invoice] TEST mode — skipping real GST invoice numbering (protects the live series)');
    return null;
  }

  // Razorpay note values arrive as strings ('' when absent) — use || not ??.
  const buyerState = i.region.buyer_state || null;
  const buyerStateCode = i.region.buyer_state_code || null;
  const buyerCountry = i.region.buyer_country || 'India';
  // Never mislabel an INR domestic charge as EXPORT — only USD-with-no-state defaults to EXPORT.
  const taxMode = (i.region.tax_mode
    || (buyerStateCode === '36' ? 'CGST_SGST'
      : buyerStateCode ? 'IGST'
      : (i.currency === 'USD' ? 'EXPORT' : 'IGST'))) as 'CGST_SGST' | 'IGST' | 'EXPORT';

  const invCurrency = i.currency === 'USD' ? 'USD' : 'INR';
  const grossAmount = i.amountPaise / 100;   // Razorpay stores paise/cents
  const { taxable, cgst, sgst, igst } = splitGstInclusive(grossAmount, taxMode);
  const fxRate = taxMode === 'EXPORT' ? 87.20 : null;   // fixed fallback; live rate = future
  const fxRateDate = fxRate ? new Date().toISOString().slice(0, 10) : null;
  const fxRateSource = fxRate ? 'Fixed fallback rate (₹87.20; no live FX feed yet)' : null;

  const buyer = await buyerIdentity(db, i.userId, i.fallbackEmail);

  const billing = (i.region.billing || '').toString().toLowerCase();
  const subCadence = billing === 'annual' ? 'Annual' : 'Monthly';
  const lineDesc = i.product === 'birthday_report'
    ? 'BornClock — Birthday Blueprint Report'
    : `BornClock Premium — ${subCadence} subscription`;
  const lineNote = i.product === 'birthday_report'
    ? 'Digital report, one-time purchase. Delivered electronically.'
    : `Premium ${subCadence.toLowerCase()} subscription. Delivered electronically.`;

  const { data, error } = await db.rpc('issue_invoice', {
    p: {
      order_id:         i.orderId ?? i.subscriptionId ?? i.paymentId,
      payment_id:       i.paymentId,
      user_id:          i.userId ?? null,
      buyer_name:       buyer.name,
      buyer_email:      buyer.email,
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
  if (error) throw error;
  return data ?? null;
}

/** Atomically claim the right to send this invoice's purchase email. true = you send it. */
export async function claimInvoiceEmail(db: any, paymentId: string): Promise<boolean> {
  const { data, error } = await db
    .from('invoices')
    .update({ emailed_at: new Date().toISOString() })
    .eq('payment_id', paymentId)
    .is('emailed_at', null)
    .select('id');
  if (error) { console.error('[invoice] email claim error', error.message ?? error); return false; }
  return Array.isArray(data) && data.length > 0;
}

export async function releaseInvoiceEmail(db: any, paymentId: string): Promise<void> {
  try { await db.from('invoices').update({ emailed_at: null }).eq('payment_id', paymentId); } catch { /* ignore */ }
}

export function receiptFields(amountPaise: number, currency: string, product: Product, slug?: string | null) {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const base = process.env.PRODUCTION_URL ?? 'https://bornclock.com';
  return {
    product,
    amountFormatted: `${currencySymbol}${(amountPaise / 100).toLocaleString('en-IN')}`,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    reportLink: slug ? `${base}/report/${slug}` : undefined,
  };
}

/**
 * Send the ONE purchase email (confirmation + invoice attached) for an issued invoice,
 * at most once across the browser path and the webhook. Returns 'sent' | 'already-sent'
 * | 'failed' | 'no-recipient'.
 */
export async function sendPurchaseEmailOnce(db: any, opts: {
  invoiceRow: any; userId: string | null; product: Product; amountPaise: number; currency: string; slug?: string | null; fallbackEmail?: string | null;
}): Promise<'sent' | 'already-sent' | 'failed' | 'no-recipient'> {
  const row = opts.invoiceRow;
  const buyer = await buyerIdentity(db, opts.userId, opts.fallbackEmail || row?.buyer_email);
  if (!buyer.email) return 'no-recipient';
  if (!(await claimInvoiceEmail(db, row.payment_id))) return 'already-sent';
  let ok = false;
  try {
    ok = await sendPurchaseEmail({
      to: buyer.email,
      name: buyer.firstName,
      ...receiptFields(opts.amountPaise, opts.currency, opts.product, opts.slug),
      invoiceNo: row.invoice_no,
      invoiceHtml: generateInvoiceHTML(row),
    });
  } catch (e) {
    console.error('[purchase-email] send threw', e);
  }
  if (!ok) { await releaseInvoiceEmail(db, row.payment_id); return 'failed'; }
  return 'sent';
}
