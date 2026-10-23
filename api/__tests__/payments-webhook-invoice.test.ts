// Batch 4 — webhook-only purchases get their GST invoice + purchase email (once), and
// refund credit notes are emailed (once). In-memory Supabase + stubbed Razorpay/Resend.
// Money values: ₹199 GST-inclusive, intra-state (Telangana, 36) → 199 × 9/118 = 15.177…
// → CGST = SGST = 15.18, taxable 168.64 (same arithmetic as security-payments.test.ts §11).
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createHmac } from 'node:crypto';
import { newState, mockClient, addUser, type MockState } from './_mockSupabase';

const h = vi.hoisted(() => ({ state: null as any }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => mockClient(h.state) }));

const KEY_SECRET = 'rzp_secret_live_test';
const WEBHOOK_SECRET = 'whsec_test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
process.env.VITE_RAZORPAY_KEY_ID = 'rzp_live_key';   // LIVE mode → real invoice path runs
process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.RESEND_API_KEY = 're_test';
delete process.env.SUPPRESS_OUTBOUND_EMAIL;
delete process.env.BROWSER_RENDERING_TOKEN;

const rzp = { orders: {} as Record<string, any> };
const emails: any[] = [];
let resendOk = true;
vi.stubGlobal('fetch', vi.fn(async (url: string, init?: any) => {
  const m = String(url).match(/api\.razorpay\.com\/v1\/orders\/([^/?]+)/);
  if (m) {
    const o = rzp.orders[m[1]];
    return new Response(JSON.stringify(o ?? {}), { status: o ? 200 : 404 });
  }
  if (String(url).includes('api.resend.com')) {
    emails.push(JSON.parse(init.body));
    return new Response(JSON.stringify(resendOk ? { id: 'em' } : { error: 'x' }), { status: resendOk ? 200 : 500 });
  }
  return new Response('{}', { status: 200 });
}));

const hmac = (secret: string, msg: string) => createHmac('sha256', secret).update(msg).digest('hex');

let S: MockState;
let seq = 1000;
/** issue_invoice stand-in with the live function's contract: idempotent on payment_id. */
function installRpcs() {
  S.rpc.issue_invoice = ({ p }: any) => {
    S.tables.invoices ??= [];
    const existing = S.tables.invoices.find(r => r.payment_id === p.payment_id);
    if (existing) return { data: { ...existing }, error: null };
    const row = { id: `inv-${seq}`, invoice_no: `BC/26-27/${seq}`, series: 'BC/26-27', seq: seq++, invoice_date: '2026-10-24', emailed_at: null, ...p };
    S.tables.invoices.push(row);
    return { data: { ...row }, error: null };
  };
  S.rpc.issue_credit_note = ({ p }: any) => {
    S.tables.credit_notes ??= [];
    const existing = S.tables.credit_notes.find(r => r.refund_id === p.refund_id);
    if (existing) return { data: { ...existing }, error: null };
    const inv = (S.tables.invoices ?? []).find(r => r.payment_id === p.payment_id);
    if (!inv) return { data: null, error: { message: `No invoice found for payment_id ${p.payment_id}` } };
    const row = {
      id: `cn-${seq}`, credit_note_no: `BN/26-27/${seq++}`, credit_note_date: '2026-10-25',
      invoice_id: inv.id, original_invoice_no: inv.invoice_no, original_invoice_date: inv.invoice_date,
      refund_id: p.refund_id, reason: 'Customer refund — 7-day guarantee', buyer_name: inv.buyer_name, buyer_email: inv.buyer_email,
      tax_mode: inv.tax_mode, currency: inv.currency, gross_amount: p.gross_amount, taxable_value: inv.taxable_value,
      cgst: inv.cgst, sgst: inv.sgst, igst: inv.igst, emailed_at: null,
    };
    S.tables.credit_notes.push(row);
    return { data: { ...row }, error: null };
  };
}

beforeEach(() => {
  S = newState();
  h.state = S;
  installRpcs();
  rzp.orders = {};
  emails.length = 0;
  resendOk = true;
  addUser(S, 'tok-a', { id: 'u-a', email: 'asha@example.com' });
  S.tables.birthday_reports = [{ slug: 'rep00009', is_paid: false, expires_at: '2026-12-01T00:00:00Z' }];
});

let webhook: typeof import('../razorpay-webhook');
let verify: typeof import('../verify-payment');
beforeAll(async () => {
  webhook = await import('../razorpay-webhook');
  verify = await import('../verify-payment');
});

const NOTES = { report_slug: 'rep00009', userId: 'u-a', product: 'birthday_report', buyer_state: 'Telangana', buyer_state_code: '36', buyer_country: 'India', tax_mode: 'CGST_SGST' };
const ORDER = { id: 'order_9', amount: 19900, currency: 'INR', status: 'paid', notes: NOTES };
const signed = (event: any) => {
  const raw = JSON.stringify(event);
  return new Request('https://x/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': hmac(WEBHOOK_SECRET, raw) }, body: raw });
};
const orderPaid = (id = 'evt_1') => ({
  id, event: 'order.paid',
  payload: { order: { entity: ORDER }, payment: { entity: { id: 'pay_9', order_id: 'order_9', amount: 19900, currency: 'INR', status: 'captured', email: 'asha@example.com' } } },
});
const browserReturn = () => new Request('https://x/api/verify-payment', {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: 'Bearer tok-a' },
  body: JSON.stringify({ razorpay_payment_id: 'pay_9', razorpay_order_id: 'order_9', razorpay_signature: hmac(KEY_SECRET, 'order_9|pay_9'), product: 'birthday_report', report_slug: 'rep00009' }),
});
const invoiceCalls = () => S.rpcCalls.filter(c => c.name === 'issue_invoice');

describe('order.paid webhook (browser never returned) issues the invoice and sends the purchase email', () => {
  it('unlocks, issues ONE GST invoice through issue_invoice, sends ONE email with it attached', async () => {
    const res = await webhook.POST(signed(orderPaid()));
    expect(res.status).toBe(200);
    expect(S.tables.birthday_reports[0].is_paid).toBe(true);
    expect(S.tables.invoices).toHaveLength(1);
    const inv = S.tables.invoices[0];
    expect(inv).toMatchObject({
      payment_id: 'pay_9', order_id: 'order_9', user_id: 'u-a', buyer_email: 'asha@example.com',
      tax_mode: 'CGST_SGST', currency: 'INR', gross_amount: 199, taxable_value: 168.64, cgst: 15.18, sgst: 15.18, igst: 0,
    });
    expect(inv.line_items[0].desc).toBe('BornClock — Birthday Blueprint Report');
    expect(inv.emailed_at).toBeTruthy();
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toEqual(['asha@example.com']);
    expect(emails[0].subject).toBe(`Payment confirmed — your BornClock invoice ${inv.invoice_no}`);
    expect(emails[0].attachments?.[0]?.filename).toBe(`${inv.invoice_no.replace(/\//g, '-')}.html`);
  });

  it('webhook then browser return: same invoice reused, no second email', async () => {
    rzp.orders.order_9 = ORDER;
    await webhook.POST(signed(orderPaid()));
    const res = await verify.POST(browserReturn());
    expect(res.status).toBe(200);
    expect(invoiceCalls()).toHaveLength(2);           // both paths call the idempotent RPC…
    expect(S.tables.invoices).toHaveLength(1);        // …but only one invoice exists
    expect(emails).toHaveLength(1);                   // …and only one email went out
  });

  it('browser return then webhook: no second invoice, no second email', async () => {
    rzp.orders.order_9 = ORDER;
    expect((await verify.POST(browserReturn())).status).toBe(200);
    expect(emails).toHaveLength(1);
    await webhook.POST(signed(orderPaid('evt_late')));
    expect(S.tables.invoices).toHaveLength(1);
    expect(emails).toHaveLength(1);
  });

  it('re-delivery under a NEW event id does not re-send', async () => {
    await webhook.POST(signed(orderPaid('evt_1')));
    await webhook.POST(signed(orderPaid('evt_2')));
    expect(S.tables.invoices).toHaveLength(1);
    expect(emails).toHaveLength(1);
  });

  it('a failed send releases the claim so a later delivery can send it', async () => {
    resendOk = false;
    await webhook.POST(signed(orderPaid('evt_1')));
    expect(S.tables.invoices[0].emailed_at).toBeNull();
    resendOk = true;
    await webhook.POST(signed(orderPaid('evt_2')));
    expect(emails).toHaveLength(2);                   // 1 failed attempt + 1 delivered
    expect(S.tables.invoices[0].emailed_at).toBeTruthy();
  });

  it('invoice RPC failure → 500 and the event is forgotten so Razorpay retries (report stays unlocked)', async () => {
    S.rpc.issue_invoice = () => ({ data: null, error: { message: 'counter missing' } });
    const res = await webhook.POST(signed(orderPaid()));
    expect(res.status).toBe(500);
    expect(S.tables.birthday_reports[0].is_paid).toBe(true);
    expect(S.tables.webhook_events ?? []).toHaveLength(0);
    expect(emails).toHaveLength(0);
  });

  it('Razorpay TEST mode: no real invoice number is drawn from the webhook path either', async () => {
    process.env.VITE_RAZORPAY_KEY_ID = 'rzp_test_key';
    try {
      const res = await webhook.POST(signed(orderPaid()));
      expect(res.status).toBe(200);
      expect(invoiceCalls()).toHaveLength(0);
    } finally {
      process.env.VITE_RAZORPAY_KEY_ID = 'rzp_live_key';
    }
  });
});

describe('refund.processed emails the credit note once', () => {
  const refund = (id = 'evt_r1') => ({ id, event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_9', amount: 19900 } } } });

  it('credit note issued and emailed to the buyer with the note attached', async () => {
    await webhook.POST(signed(orderPaid()));
    emails.length = 0;
    const res = await webhook.POST(signed(refund()));
    expect(res.status).toBe(200);
    expect(S.tables.credit_notes).toHaveLength(1);
    const cn = S.tables.credit_notes[0];
    expect(cn.emailed_at).toBeTruthy();
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toEqual(['asha@example.com']);
    expect(emails[0].subject).toContain(cn.credit_note_no);
    expect(emails[0].subject).toContain(cn.original_invoice_no);
    expect(emails[0].html).toContain('₹199.00');
    expect(emails[0].attachments[0].filename).toBe(`${cn.credit_note_no.replace(/\//g, '-')}.html`);
    const attached = Buffer.from(emails[0].attachments[0].content, 'base64').toString('utf8');
    expect(attached).toContain('CREDIT NOTE');
    expect(attached).toContain(cn.original_invoice_no);
    expect(attached).toContain('36AAJFU0315K1Z5');
    expect(attached).toContain('Rupees One Hundred Ninety Nine Only');
  });

  it('second refund.processed delivery (new event id) does not re-send', async () => {
    await webhook.POST(signed(orderPaid()));
    await webhook.POST(signed(refund('evt_r1')));
    await webhook.POST(signed(refund('evt_r2')));
    expect(emails.filter(e => String(e.subject).includes('credit note'))).toHaveLength(1);
  });

  it('before the migration (no credit_notes.emailed_at) it still sends once per event', async () => {
    await webhook.POST(signed(orderPaid()));
    emails.length = 0;
    S.failOps.credit_notes = { update: { code: 'PGRST204', message: "Could not find the 'emailed_at' column" } };
    await webhook.POST(signed(refund('evt_r1')));
    await webhook.POST(signed(refund('evt_r1')));   // exact re-delivery → webhook_events dedupe
    expect(emails).toHaveLength(1);
  });

  it('no invoice for the payment → no credit note, no email', async () => {
    const res = await webhook.POST(signed(refund()));
    expect(res.status).toBe(200);
    expect(S.tables.credit_notes ?? []).toHaveLength(0);
    expect(emails).toHaveLength(0);
  });
});
