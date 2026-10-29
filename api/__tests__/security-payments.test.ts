// Round-2 audit — "Fix immediately: security and payments" (items 1–11) + S17.
// Handler-level tests with an in-memory Supabase and a stubbed Razorpay/Resend
// fetch. Expected money values are plain GST arithmetic on a GST-inclusive
// price (18% = 9% CGST + 9% SGST): 299 × 9/118 = 22.805… → 22.81 per head.
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { newState, mockClient, addUser, type MockState } from './_mockSupabase';

const h = vi.hoisted(() => ({ state: null as any }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => mockClient(h.state) }));

const KEY_SECRET = 'rzp_secret_test';
const WEBHOOK_SECRET = 'whsec_test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
process.env.VITE_RAZORPAY_KEY_ID = 'rzp_test_key';   // test mode → no real GST numbering
process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.GEMINI_API_KEY = 'gemini-test';
process.env.CRON_SECRET = 'cron-secret';
process.env.RESEND_API_KEY = 're_test';

// ── Razorpay / Resend / Gemini stub ────────────────────────────────────────────
const rzp = { orders: {} as Record<string, any>, subscriptions: {} as Record<string, any>, payments: {} as Record<string, any> };
const fetchCalls: string[] = [];
const fetchStub = vi.fn(async (url: string, _init?: any) => {
  fetchCalls.push(String(url));
  const m = String(url).match(/api\.razorpay\.com\/v1\/(orders|subscriptions|payments)\/([^/?]+)/);
  if (m) {
    const obj = (rzp as any)[m[1]][m[2]];
    return new Response(JSON.stringify(obj ?? { error: 'not found' }), { status: obj ? 200 : 404 });
  }
  if (String(url).includes('generativelanguage.googleapis.com')) {
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Walk 20 minutes today.' }] }, finishReason: 'STOP' }] }), { status: 200 });
  }
  return new Response(JSON.stringify({ id: 'ok' }), { status: 200 });
});
vi.stubGlobal('fetch', fetchStub);

const hmac = (secret: string, msg: string) => createHmac('sha256', secret).update(msg).digest('hex');

let S: MockState;
beforeEach(() => {
  S = newState();
  h.state = S;
  rzp.orders = {}; rzp.subscriptions = {}; rzp.payments = {};
  fetchCalls.length = 0;
});

const post = (url: string, body: unknown, token?: string, extra: Record<string, string> = {}) =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...extra },
    body: JSON.stringify(body),
  });
const get = (url: string, token?: string) =>
  new Request(url, { headers: token ? { authorization: `Bearer ${token}` } : {} });

let report: typeof import('../report');
let verify: typeof import('../verify-payment');
let webhook: typeof import('../razorpay-webhook');
let saveReport: typeof import('../save-report');
let redeemCredit: typeof import('../redeem-credit');
let redeemPromo: typeof import('../redeem-promo');
let coach: typeof import('../longevity-coach');
let digest: typeof import('../weekly-digest');
let sweep: typeof import('../invoice-sweep');
let createOrder: typeof import('../create-order');
let createSub: typeof import('../create-subscription');
let invoiceGen: typeof import('../../src/lib/invoice-generator');
let userAuth: typeof import('../_userAuth');

beforeAll(async () => {
  report = await import('../report');
  verify = await import('../verify-payment');
  webhook = await import('../razorpay-webhook');
  saveReport = await import('../save-report');
  redeemCredit = await import('../redeem-credit');
  redeemPromo = await import('../redeem-promo');
  coach = await import('../longevity-coach');
  digest = await import('../weekly-digest');
  sweep = await import('../invoice-sweep');
  createOrder = await import('../create-order');
  createSub = await import('../create-subscription');
  invoiceGen = await import('../../src/lib/invoice-generator');
  userAuth = await import('../_userAuth');
});

const MIGRATION = readFileSync(resolve(__dirname, '../../supabase/migrations/20261023120000_security_payments_hardening.sql'), 'utf8');
const src = (p: string) => readFileSync(resolve(__dirname, '../..', p), 'utf8');
const future = () => new Date(Date.now() + 86400_000).toISOString();
const past = () => new Date(Date.now() - 86400_000).toISOString();

// ═════════════════════════════════════════════════════════════════════════════
describe('1 · reports are served one-by-slug through /api/report (no public listing)', () => {
  beforeEach(() => {
    addUser(S, 'tok-owner', { id: 'u-owner', email: 'owner@example.com' });
    addUser(S, 'tok-other', { id: 'u-other', email: 'other@example.com' });
    S.tables.birthday_reports = [
      { id: 'r1', slug: 'abc12345', user_id: 'u-owner', recipient_name: 'Asha', personal_message: 'secret', report_data: { recipientName: 'Asha' }, is_paid: false, expires_at: future(), created_at: '2026-10-01' },
      { id: 'r2', slug: 'old00000', user_id: 'u-owner', report_data: { recipientName: 'Old' }, is_paid: false, expires_at: past() },
      { id: 'r3', slug: 'paid0000', user_id: 'u-owner', report_data: { recipientName: 'Paid' }, is_paid: true, expires_at: past() },
    ];
  });

  it('returns exactly the requested report with only page fields — never user_id', async () => {
    const res = await report.GET(get('https://x/api/report?slug=abc12345'));
    expect(res.status).toBe(200);
    const j = await res.json() as any;
    expect(j.slug).toBe('abc12345');
    expect(j.report_data.recipientName).toBe('Asha');
    expect(j).not.toHaveProperty('user_id');
    expect(j).not.toHaveProperty('id');
    expect(j.is_owner).toBe(false);
  });

  it('is_owner is computed from the verified token', async () => {
    expect((await (await report.GET(get('https://x/api/report?slug=abc12345', 'tok-owner'))).json() as any).is_owner).toBe(true);
    expect((await (await report.GET(get('https://x/api/report?slug=abc12345', 'tok-other'))).json() as any).is_owner).toBe(false);
  });

  it('no slug / malformed slug cannot list anything (404)', async () => {
    expect((await report.GET(get('https://x/api/report'))).status).toBe(404);
    expect((await report.GET(get('https://x/api/report?slug=%25'))).status).toBe(404);
  });

  it('expired unpaid preview → 404; paid report with an old expires_at is still served (permanent)', async () => {
    expect((await report.GET(get('https://x/api/report?slug=old00000'))).status).toBe(404);
    expect((await report.GET(get('https://x/api/report?slug=paid0000'))).status).toBe(200);
  });

  it('records the view server-side', async () => {
    await report.GET(get('https://x/api/report?slug=abc12345'));
    expect(S.rpcCalls.some(c => c.name === 'increment_report_view_count' && c.args.report_id === 'r1')).toBe(true);
    expect(S.tables.birthday_reports[0].last_viewed_at).toBeTruthy();
  });

  it('migration drops the public "read by slug" policy and keeps owner/admin reads', () => {
    expect(MIGRATION).toMatch(/drop policy if exists "Anyone can read reports by slug" on public\.birthday_reports/);
    expect(MIGRATION).toMatch(/create policy "Admins can read all reports"/);
    expect(MIGRATION).not.toMatch(/create policy "Anyone can read reports by slug"/);
  });

  it('the browser reads reports only via /api/report (no direct table read)', () => {
    const svc = src('src/services/BirthdayReportService.ts');
    expect(svc).toContain('/api/report?slug=');
    expect(svc).not.toMatch(/from\('birthday_reports'\)/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('2 · subscription verification binds payment → user and rejects replays', () => {
  const SUB = 'sub_A';
  const PAY = 'pay_A1';
  const sigSub = (pay: string, sub: string) => hmac(KEY_SECRET, `${pay}|${sub}`);
  beforeEach(() => {
    addUser(S, 'tok-a', { id: 'u-a', email: 'a@example.com' });
    addUser(S, 'tok-b', { id: 'u-b', email: 'b@example.com' });
    S.tables.profiles = [
      { id: 'p-a', user_id: 'u-a', premium_status: false },
      { id: 'p-b', user_id: 'u-b', premium_status: false },
    ];
    rzp.subscriptions[SUB] = { id: SUB, notes: { userId: 'u-a' } };
    rzp.payments[PAY] = { id: PAY, amount: 29900, currency: 'INR', notes: {} };
  });
  const body = (over: any = {}) => ({
    razorpay_payment_id: PAY, razorpay_subscription_id: SUB, razorpay_signature: sigSub(PAY, SUB),
    product: 'subscription', ...over,
  });
  const profile = (uid: string) => S.tables.profiles.find(p => p.user_id === uid);

  it('requires a signed-in caller (401)', async () => {
    expect((await verify.POST(post('https://x/api/verify-payment', body()))).status).toBe(401);
  });

  it('grants premium to the subscriber who created the subscription', async () => {
    const res = await verify.POST(post('https://x/api/verify-payment', body(), 'tok-a'));
    expect(res.status).toBe(200);
    expect(profile('u-a').premium_status).toBe(true);
    expect(profile('u-a').subscription_id).toBe(SUB);
    expect(S.tables.payments[0].user_id).toBe('u-a');
  });

  it("another account submitting A's payment is rejected (notes.userId mismatch) — B stays free", async () => {
    const res = await verify.POST(post('https://x/api/verify-payment', body(), 'tok-b'));
    expect(res.status).toBe(403);
    expect(profile('u-b').premium_status).toBe(false);
  });

  it('a body user_id different from the caller is rejected', async () => {
    const res = await verify.POST(post('https://x/api/verify-payment', body({ user_id: 'u-b' }), 'tok-a'));
    expect(res.status).toBe(403);
  });

  it('replay: a payment id already recorded for another account → 409, no grant', async () => {
    // B legitimately owns sub_B, but re-submits payment pay_A1 (already A's).
    rzp.subscriptions.sub_B = { id: 'sub_B', notes: { userId: 'u-b' } };
    S.tables.payments = [{ razorpay_payment_id: PAY, user_id: 'u-a', product: 'subscription' }];
    const res = await verify.POST(post('https://x/api/verify-payment',
      body({ razorpay_subscription_id: 'sub_B', razorpay_signature: sigSub(PAY, 'sub_B') }), 'tok-b'));
    expect(res.status).toBe(409);
    expect(profile('u-b').premium_status).toBe(false);
  });

  it('replay: a subscription id already linked to another profile → 409', async () => {
    rzp.subscriptions[SUB] = { id: SUB, notes: { userId: 'u-b' } };
    profile('u-a').subscription_id = SUB;
    rzp.payments.pay_B = { id: 'pay_B', amount: 29900, currency: 'INR' };
    const res = await verify.POST(post('https://x/api/verify-payment',
      body({ razorpay_payment_id: 'pay_B', razorpay_signature: sigSub('pay_B', SUB) }), 'tok-b'));
    expect(res.status).toBe(409);
  });

  it('same account re-submitting the same payment is idempotent (200)', async () => {
    await verify.POST(post('https://x/api/verify-payment', body(), 'tok-a'));
    const res = await verify.POST(post('https://x/api/verify-payment', body(), 'tok-a'));
    expect(res.status).toBe(200);
  });

  it('bad signature → 403', async () => {
    const res = await verify.POST(post('https://x/api/verify-payment', body({ razorpay_signature: 'ab'.repeat(32) }), 'tok-a'));
    expect(res.status).toBe(403);
  });

  it('create-subscription / create-order take the user from the token, not the body', async () => {
    process.env.VITE_RAZORPAY_PLAN_INDIA_MONTHLY = 'plan_m';
    expect((await createSub.POST(post('https://x/api/create-subscription', { planId: 'plan_m', userId: 'u-b' }))).status).toBe(401);
    const bodies: any[] = [];
    fetchStub.mockImplementationOnce(async (_u: string, init: any) => { bodies.push(JSON.parse(init.body)); return new Response(JSON.stringify({ id: 'sub_new' }), { status: 200 }); });
    const res = await createSub.POST(post('https://x/api/create-subscription', { planId: 'plan_m', userId: 'u-b' }, 'tok-a'));
    expect(res.status).toBe(200);
    expect(bodies[0].notes.userId).toBe('u-a');

    S.tables.birthday_reports = [{ slug: 'rep00001', is_paid: false }];
    expect((await createOrder.POST(post('https://x/api/create-order', { product: 'birthday_report', report_slug: 'rep00001', userId: 'u-b' }))).status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('3 · paid / entitlement columns are server-only', () => {
  it('migration extends the profiles guard to credits, promo, trial clock and adds an INSERT guard', () => {
    for (const col of ['report_credits', 'credits_granted_month', 'promo_premium_until', 'created_at', 'premium_status', 'subscription_status']) {
      expect(MIGRATION).toMatch(new RegExp(`new\\.${col}\\s+is distinct from old\\.${col}`));
    }
    expect(MIGRATION).toMatch(/before insert on public\.profiles/);
    expect(MIGRATION).toMatch(/new\.report_credits\s+:= 0/);
    expect(MIGRATION).toMatch(/revoke insert, update, delete, truncate on public\.birthday_reports from anon, authenticated/);
    expect(MIGRATION).toMatch(/revoke execute on function public\.issue_invoice\(jsonb\)\s+from public, anon, authenticated/);
  });

  it('the browser no longer writes promo / premium fields (promo goes through /api/redeem-promo)', () => {
    const promo = src('src/services/PromoCodeService.ts');
    expect(promo).toContain('/api/redeem-promo');
    expect(promo).not.toMatch(/from\('profiles'\)/);
    expect(promo).not.toMatch(/from\('promo_codes'\)/);
  });

  it('redeem-credit uses the caller from the token and ignores/blocks a body userId', async () => {
    addUser(S, 'tok-a', { id: 'u-a', email: 'a@example.com' });
    S.rpc.redeem_report_credit = (args: any) => ({ data: { ok: true, credits_remaining: 2, already_paid: false, who: args.p_user_id }, error: null });
    expect((await redeemCredit.POST(post('https://x/api/redeem-credit', { userId: 'u-a', reportSlug: 's1' }))).status).toBe(401);
    expect((await redeemCredit.POST(post('https://x/api/redeem-credit', { userId: 'u-victim', reportSlug: 's1' }, 'tok-a'))).status).toBe(403);
    const ok = await redeemCredit.POST(post('https://x/api/redeem-credit', { reportSlug: 's1' }, 'tok-a'));
    expect(ok.status).toBe(200);
    expect(S.rpcCalls.find(c => c.name === 'redeem_report_credit')!.args.p_user_id).toBe('u-a');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('4 · paid reports never expire; one wording', () => {
  it('order verification unlocks the report permanently (expires_at = infinity)', async () => {
    addUser(S, 'tok-a', { id: 'u-a', email: 'a@example.com' });
    S.tables.birthday_reports = [{ slug: 'rep00001', is_paid: false, expires_at: future() }];
    rzp.orders.order_1 = { id: 'order_1', amount: 19900, currency: 'INR', notes: { report_slug: 'rep00001', userId: 'u-a', product: 'birthday_report' } };
    const res = await verify.POST(post('https://x/api/verify-payment', {
      razorpay_payment_id: 'pay_o1', razorpay_order_id: 'order_1',
      razorpay_signature: hmac(KEY_SECRET, 'order_1|pay_o1'), product: 'birthday_report',
    }, 'tok-a'));
    expect(res.status).toBe(200);
    expect(S.tables.birthday_reports[0]).toMatchObject({ is_paid: true, expires_at: 'infinity' });
  });

  it("order verification by a different account than the order's buyer is rejected", async () => {
    addUser(S, 'tok-b', { id: 'u-b', email: 'b@example.com' });
    S.tables.birthday_reports = [{ slug: 'rep00001', is_paid: false }];
    rzp.orders.order_1 = { id: 'order_1', amount: 19900, currency: 'INR', notes: { report_slug: 'rep00001', userId: 'u-a', product: 'birthday_report' } };
    const res = await verify.POST(post('https://x/api/verify-payment', {
      razorpay_payment_id: 'pay_o1', razorpay_order_id: 'order_1',
      razorpay_signature: hmac(KEY_SECRET, 'order_1|pay_o1'), product: 'birthday_report',
    }, 'tok-b'));
    expect(res.status).toBe(403);
    expect(S.tables.birthday_reports[0].is_paid).toBe(false);
  });

  it('isReportVisible: paid always; unpaid only before expiry', () => {
    expect(report.isReportVisible({ is_paid: true, expires_at: past() })).toBe(true);
    expect(report.isReportVisible({ is_paid: true, expires_at: 'infinity' })).toBe(true);
    expect(report.isReportVisible({ is_paid: false, expires_at: future() })).toBe(true);
    expect(report.isReportVisible({ is_paid: false, expires_at: past() })).toBe(false);
  });

  it('no "12 months" / 30-day promise for paid reports remains in the copy; migration restores paid rows', () => {
    for (const f of ['api/_email.ts', 'api/_invoice-email.ts', 'src/pages/Privacy.tsx', 'src/pages/ReportView.tsx']) {
      const t = src(f);
      expect(t, f).not.toMatch(/12 months without|unviewed for 12 months|stays live for 12 months/);
    }
    expect(src('src/pages/ReportView.tsx')).toMatch(/Permanent access/);
    expect(src('api/_email.ts')).toMatch(/Permanent access/);
    expect(src('api/_invoice-email.ts')).toMatch(/Permanent access/);
    expect(src('src/pages/Privacy.tsx')).toMatch(/permanent access/);
    expect(MIGRATION).toMatch(/set expires_at = 'infinity'\s+where is_paid = true/);
    expect(MIGRATION).toMatch(/expires_at\s+= 'infinity'\s+-- was now\(\) \+ 30 days/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('5 · webhook order.paid unlocks the report even if the browser never returns', () => {
  const signed = (event: any) => {
    const raw = JSON.stringify(event);
    return new Request('https://x/api/razorpay-webhook', {
      method: 'POST', headers: { 'x-razorpay-signature': hmac(WEBHOOK_SECRET, raw) }, body: raw,
    });
  };
  const orderPaid = (id = 'evt_1') => ({
    id, event: 'order.paid',
    payload: {
      order: { entity: { id: 'order_9', amount: 19900, currency: 'INR', status: 'paid', notes: { report_slug: 'rep00009', userId: 'u-a', product: 'birthday_report' } } },
      payment: { entity: { id: 'pay_9', order_id: 'order_9', amount: 19900, currency: 'INR', status: 'captured' } },
    },
  });
  beforeEach(() => { S.tables.birthday_reports = [{ slug: 'rep00009', is_paid: false, expires_at: future() }]; });

  it('valid signature → report unlocked permanently and payment recorded', async () => {
    const res = await webhook.POST(signed(orderPaid()));
    expect(res.status).toBe(200);
    expect(S.tables.birthday_reports[0]).toMatchObject({ is_paid: true, expires_at: 'infinity' });
    expect(S.tables.payments).toHaveLength(1);
    expect(S.tables.payments[0]).toMatchObject({ razorpay_payment_id: 'pay_9', user_id: 'u-a', report_slug: 'rep00009' });
  });

  it('idempotent: re-delivery and a later verify-payment do not double-record', async () => {
    await webhook.POST(signed(orderPaid()));
    const again = await webhook.POST(signed(orderPaid()));
    expect((await again.json() as any).duplicate).toBe(true);
    await webhook.POST(signed(orderPaid('evt_2')));       // a second event id for the same payment
    expect(S.tables.payments).toHaveLength(1);
  });

  it('bad signature → 403, nothing unlocked', async () => {
    const raw = JSON.stringify(orderPaid());
    const res = await webhook.POST(new Request('https://x/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': 'ab'.repeat(32) }, body: raw }));
    expect(res.status).toBe(403);
    expect(S.tables.birthday_reports[0].is_paid).toBe(false);
  });

  it('unlock failure → 500 and the event is forgotten so Razorpay retries', async () => {
    S.failOps.birthday_reports = { update: { code: 'XX000', message: 'db down' } };
    const res = await webhook.POST(signed(orderPaid()));
    expect(res.status).toBe(500);
    expect(S.tables.webhook_events ?? []).toHaveLength(0);
  });

  it('non-report / unpaid / underpaid orders are ignored', async () => {
    expect(await webhook.unlockPaidOrder(mockClient(S), { id: 'o', notes: { product: 'x' } }, null)).toBe('not-a-report-order');
    expect(await webhook.unlockPaidOrder(mockClient(S), { id: 'o', status: 'attempted', notes: { product: 'birthday_report', report_slug: 'rep00009' } }, null)).toBe('order-not-paid');
    expect(await webhook.unlockPaidOrder(mockClient(S), { id: 'o', status: 'paid', amount: 19900, notes: { product: 'birthday_report', report_slug: 'rep00009' } }, { id: 'p', order_id: 'o', amount: 100 })).toBe('underpaid');
    expect(S.tables.birthday_reports[0].is_paid).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('6 · only products that exist are listed; /kundali copy is truthful', () => {
  it('/kundali no longer sells "doshas, remedies and detailed predictions" or a "Kundali" gift', () => {
    const k = src('src/pages/KundaliPage.tsx');
    expect(k).not.toMatch(/remedies and detailed predictions/);
    expect(k).not.toMatch(/Gift a Kundali/);
    expect(k).toMatch(/Birthday Blueprint/);
  });
  it('no Combo ₹299 / Kundali ₹199 listing remains in gift / Diwali copy or prerendered titles', () => {
    for (const f of ['src/pages/BirthdayReportGiftPage.tsx', 'src/pages/DiwaliGiftPage.tsx', 'scripts/prerender-titles.mjs']) {
      const t = src(f);
      expect(t, f).not.toMatch(/Kundali \(₹199|combo \(₹299|price: '₹299'/i);
    }
  });
  it('gift hand-off seeds recipient, giver, message and the real birth year', async () => {
    const { parseGiftSeed } = await import('../../src/lib/giftSeed');
    expect(parseGiftSeed(new URLSearchParams('gift=1&dob=1990-05-14&to=Asha&from=Ravi&note=Hi'))).toEqual({ to: 'Asha', from: 'Ravi', note: 'Hi', year: '1990' });
    expect(parseGiftSeed(new URLSearchParams('dob=1990-05-14&to=Asha'))).toEqual({ to: '', from: '', note: '', year: '' });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('7 · longevity coach: login + premium + daily limit + crisis rule', () => {
  const ctx = { currentAge: 40, country: 'India', gender: 'male', totalForecast: 78 };
  beforeEach(() => {
    coach._resetCoachUsage();
    addUser(S, 'tok-prem', { id: 'u-prem', email: 'p@example.com' });
    addUser(S, 'tok-free', { id: 'u-free', email: 'f@example.com' });
    S.tables.profiles = [
      { user_id: 'u-prem', premium_status: true, subscription_status: 'active', created_at: '2026-01-01T00:00:00Z' },
      { user_id: 'u-free', premium_status: false, subscription_status: 'none', created_at: '2026-01-01T00:00:00Z' },
    ];
  });

  it('self-harm signal → fixed crisis reply with Indian helplines, even when signed out, no model call', async () => {
    const res = await coach.POST(post('https://x/api/longevity-coach', { message: "honestly I don't want to live anymore", userContext: ctx }));
    // "don't want to live" is in the shared crisis detector (chatGuardrails CRISIS_PATTERNS)
    expect(res.status).toBe(200);
    const j = await res.json() as any;
    expect(j.crisis).toBe(true);
    expect(j.reply).toContain('Tele-MANAS');
    expect(j.reply).toContain('14416');
    expect(j.reply).toContain('112');
    expect(fetchCalls.some(u => u.includes('generativelanguage'))).toBe(false);
  });

  it('no login → 401; non-premium → 402', async () => {
    expect((await coach.POST(post('https://x/api/longevity-coach', { message: 'hi', userContext: ctx }))).status).toBe(401);
    expect((await coach.POST(post('https://x/api/longevity-coach', { message: 'hi', userContext: ctx }, 'tok-free'))).status).toBe(402);
  });

  it(`premium user is answered, then capped at ${30} replies a day (429)`, async () => {
    const ok = await coach.POST(post('https://x/api/longevity-coach', { message: 'What helps most?', userContext: ctx }, 'tok-prem'));
    expect(ok.status).toBe(200);
    for (let i = 1; i < coach.COACH_DAILY_LIMIT; i++) coach.recordCoachUse('u-prem');
    const capped = await coach.POST(post('https://x/api/longevity-coach', { message: 'again', userContext: ctx }, 'tok-prem'));
    expect(capped.status).toBe(429);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('8 · weekly-digest endpoint is not public; names are HTML-escaped', () => {
  it('no secret → 401 (and no email sent)', async () => {
    const res = await digest.POST(post('https://x/api/weekly-digest', { to: 'victim@example.com', name: '<a href=x>phish</a>' }));
    expect(res.status).toBe(401);
    expect(fetchCalls.some(u => u.includes('resend.com'))).toBe(false);
  });
  it('the scheduler secret is accepted', async () => {
    const res = await digest.POST(post('https://x/api/weekly-digest', { to: 'x@example.com' }, 'cron-secret'));
    expect(res.status).toBe(200);
  });
  it('digestHtml escapes the name', () => {
    const { html } = digest.digestHtml({ name: '<img src=x onerror=alert(1)>', dob: null, today: new Date(), global: [], india: [], unsubUrl: 'u' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('9 · chat tier and promo codes are decided on the server', () => {
  it('vedic-chat ignores a body tier:"paid" from a signed-out visitor (free cap applies)', async () => {
    const { POST: chat } = await import('../vedic-chat');
    const { hashClientId, recordQuestionServer, __resetServerLimitStore } = await import('../../src/lib/vedic/serverRateLimit');
    const { FREE_DAILY_LIMIT } = await import('../../src/lib/vedic/rateLimit');
    __resetServerLimitStore();
    const key = await hashClientId('unknown', process.env.RATE_LIMIT_SALT || 'bornclock');
    for (let i = 0; i < FREE_DAILY_LIMIT; i++) recordQuestionServer(key, 'free');
    const res = await chat(post('https://x/api/vedic-chat', { birth: { y: 1988, m: 11, d: 5 }, message: 'career?', tier: 'paid' }));
    expect(res.status).toBe(429);
    __resetServerLimitStore();
  });

  it('server premium check mirrors the app (subscription, promo, 7-day trial; cancelled+lapsed = no)', () => {
    const now = new Date('2026-10-23T00:00:00Z');
    expect(userAuth.profileIsPremium({ premium_status: true, created_at: '2026-01-01' }, now)).toBe(true);
    expect(userAuth.profileIsPremium({ premium_status: false, promo_premium_until: '2026-11-01', created_at: '2026-01-01' }, now)).toBe(true);
    expect(userAuth.profileIsPremium({ premium_status: false, created_at: '2026-10-20' }, now)).toBe(true);
    expect(userAuth.profileIsPremium({ premium_status: true, subscription_status: 'cancelled', premium_until: '2026-10-01', created_at: '2026-01-01' }, now)).toBe(false);
    expect(userAuth.profileIsPremium({ premium_status: false, created_at: '2026-01-01' }, now)).toBe(false);
  });

  describe('/api/redeem-promo', () => {
    beforeEach(() => {
      addUser(S, 'tok-a', { id: 'u-a', email: 'a@example.com' });
      addUser(S, 'tok-b', { id: 'u-b', email: 'b@example.com' });
      S.tables.profiles = [{ user_id: 'u-a' }, { user_id: 'u-b' }];
      S.tables.promo_codes = [
        { code: 'DIWALI', grants_premium: true, max_uses: 1, current_uses: 0, expires_at: null },
        { code: 'OLD', grants_premium: true, max_uses: 10, current_uses: 0, expires_at: past() },
      ];
    });
    it('requires sign-in', async () => {
      expect((await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'DIWALI' }))).status).toBe(401);
    });
    it('unknown / expired codes are refused and grant nothing', async () => {
      expect((await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'NOPE' }, 'tok-a'))).status).toBe(404);
      expect((await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'OLD' }, 'tok-a'))).status).toBe(410);
      expect(S.tables.profiles[0].promo_premium_until).toBeUndefined();
    });
    it('valid code → server sets promo_premium_until and counts the use; a 2nd use / over-limit is refused', async () => {
      const res = await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'diwali' }, 'tok-a'));
      expect(res.status).toBe(200);
      const j = await res.json() as any;
      expect(j.isPremium).toBe(true);
      expect(new Date(S.tables.profiles[0].promo_premium_until).getTime()).toBeGreaterThan(Date.now() + 29 * 86400_000);
      expect(S.tables.promo_codes[0].current_uses).toBe(1);
      expect((await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'DIWALI' }, 'tok-a'))).status).toBe(409);
      expect((await redeemPromo.POST(post('https://x/api/redeem-promo', { code: 'DIWALI' }, 'tok-b'))).status).toBe(409);
      expect(S.tables.profiles[1].promo_premium_until).toBeUndefined();
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('10 · cancellation email looks the user up by profiles.user_id', () => {
  it('subscription.cancelled → getUserById(user_id), not the random profiles.id', async () => {
    S.tables.profiles = [{ id: 'random-pk', user_id: 'u-a', subscription_id: 'sub_C' }];
    addUser(S, 'tok-a', { id: 'u-a', email: 'a@example.com' });
    const event = { id: 'evt_c', event: 'subscription.cancelled', payload: { subscription: { entity: { id: 'sub_C', current_end: 1798761600 } } } };
    const raw = JSON.stringify(event);
    const res = await webhook.POST(new Request('https://x/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': hmac(WEBHOOK_SECRET, raw) }, body: raw }));
    expect(res.status).toBe(200);
    expect(S.getUserByIdCalls).toContain('u-a');
    expect(S.getUserByIdCalls).not.toContain('random-pk');
    expect(S.tables.profiles[0].subscription_status).toBe('cancelled');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('11 · invoices: sweep pages past 1,000; CGST/SGST foot at ₹299; refunds get credit notes', () => {
  it('₹299 intra-state: CGST = SGST = 22.81, taxable 253.38, sums to exactly 299.00', () => {
    const s = invoiceGen.splitGstInclusive(299, 'CGST_SGST');
    expect(s).toEqual({ taxable: 253.38, cgst: 22.81, sgst: 22.81, igst: 0 });
    expect(Math.round((s.taxable + s.cgst + s.sgst) * 100)).toBe(29900);
  });
  it('₹299 inter-state: IGST 45.61, taxable 253.39; ₹199: heads 15.18 each', () => {
    expect(invoiceGen.splitGstInclusive(299, 'IGST')).toEqual({ taxable: 253.39, cgst: 0, sgst: 0, igst: 45.61 });
    const r = invoiceGen.splitGstInclusive(199, 'CGST_SGST');   // 199 × 9/118 = 15.177… → 15.18
    expect(r).toEqual({ taxable: 168.64, cgst: 15.18, sgst: 15.18, igst: 0 });
  });
  it('split foots for every whole-rupee price 1..5000 (both modes)', () => {
    for (let g = 1; g <= 5000; g++) {
      for (const m of ['CGST_SGST', 'IGST'] as const) {
        const s = invoiceGen.splitGstInclusive(g, m);
        expect(Math.round((s.taxable + s.cgst + s.sgst + s.igst) * 100)).toBe(g * 100);
        if (m === 'CGST_SGST') expect(s.cgst).toBe(s.sgst);
      }
    }
  });
  it('rendered ₹299 invoice: the line row shows the same CGST/SGST as the totals', () => {
    const s = invoiceGen.splitGstInclusive(299, 'CGST_SGST');
    const html = invoiceGen.generateInvoiceHTML({
      invoice_no: 'BC/26-27/1001', invoice_date: '2026-10-23', series: 'BC/26-27', order_id: 'o', payment_id: 'p',
      buyer_name: 'A', buyer_email: 'a@example.com', buyer_gstin: null, buyer_country: 'India', buyer_state: 'Telangana', buyer_state_code: '36',
      place_of_supply: 'Telangana (36)', tax_mode: 'CGST_SGST', currency: 'INR', fx_rate: null,
      gross_amount: 299, taxable_value: s.taxable, cgst: s.cgst, sgst: s.sgst, igst: 0,
      line_items: [{ desc: 'Monthly', qty: 1, gross: 299 }],
    } as any);
    expect(html).not.toContain('253.39');
    expect((html.match(/22\.81/g) ?? []).length).toBeGreaterThanOrEqual(4); // 2 line cells + 2 total rows
    expect(html).not.toContain('22.80');
  });

  it('findUninvoicedPayments pages beyond the first 1,000 payments', async () => {
    S.tables.payments = Array.from({ length: 2500 }, (_, i) => ({
      razorpay_payment_id: `pay_${String(i).padStart(5, '0')}`, product: 'subscription', status: 'captured', user_id: 'u', amount: 29900, created_at: i,
    }));
    S.tables.invoices = S.tables.payments.slice(0, 2300).map(p => ({ payment_id: p.razorpay_payment_id }));
    const pending = await sweep.findUninvoicedPayments(mockClient(S), 200);
    expect(pending).toHaveLength(200);
    expect(pending[0].razorpay_payment_id).toBe('pay_02300');
    expect(pending[199].razorpay_payment_id).toBe('pay_02499');
  });

  it('refund.processed → issue_credit_note(refund_id, payment_id, amount in rupees)', async () => {
    const event = { id: 'evt_r', event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_1', amount: 29900 } } } };
    const raw = JSON.stringify(event);
    const res = await webhook.POST(new Request('https://x/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': hmac(WEBHOOK_SECRET, raw) }, body: raw }));
    expect(res.status).toBe(200);
    const call = S.rpcCalls.find(c => c.name === 'issue_credit_note');
    expect(call?.args.p).toEqual({ refund_id: 'rfnd_1', payment_id: 'pay_1', gross_amount: 299 });
  });

  it('migration: credit notes mirror the invoice on full refund and use the equal-head split otherwise', () => {
    expect(MIGRATION).toMatch(/if v_gross = v_inv\.gross_amount then/);
    expect(MIGRATION).toMatch(/v_cgst\s+:= round\(v_gross \* 9 \/ 118, 2\);\s+v_sgst\s+:= v_cgst;/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('S17 · free trial report needs a verified email and is one per person', () => {
  const reportData = { recipientName: 'Me', recipientDob: '1990-01-01', country: 'India' };
  const recent = () => new Date(Date.now() - 86400_000).toISOString();
  beforeEach(() => {
    S.tables.birthday_reports = [];
    S.tables.trial_claims = [];
  });
  const save = (token?: string) => saveReport.POST(post('https://x/api/save-report', { reportData, isPremium: true }, token));

  it('unverified email → report saved locked, no claim', async () => {
    addUser(S, 'tok-u', { id: 'u-u', email: 'new@example.com', confirmed: false });
    S.tables.profiles = [{ user_id: 'u-u', created_at: recent() }];
    const j = await (await save('tok-u')).json() as any;
    expect(j.unlocked).toBe(false);
    expect(S.tables.birthday_reports[0].is_paid).toBeUndefined();
    expect(S.tables.trial_claims).toHaveLength(0);
  });

  it('verified new account → one permanent free report; the second report is locked', async () => {
    addUser(S, 'tok-v', { id: 'u-v', email: 'Real.Person+x@gmail.com' });
    S.tables.profiles = [{ user_id: 'u-v', created_at: recent() }];
    const first = await (await save('tok-v')).json() as any;
    expect(first.unlocked).toBe(true);
    expect(S.tables.birthday_reports[0]).toMatchObject({ is_paid: true, unlock_source: 'trial', expires_at: 'infinity' });
    expect(S.tables.trial_claims[0].normalized_email).toBe('realperson@gmail.com');
    const second = await (await save('tok-v')).json() as any;
    expect(second.unlocked).toBe(false);
  });

  it('a second account for the same person (Gmail dot / +tag variant) gets no free report', async () => {
    S.tables.trial_claims = [{ normalized_email: 'realperson@gmail.com', user_id: 'u-old' }];
    addUser(S, 'tok-w', { id: 'u-w', email: 'r.e.a.l.person+again@googlemail.com' });
    S.tables.profiles = [{ user_id: 'u-w', created_at: recent() }];
    const j = await (await save('tok-w')).json() as any;
    expect(j.unlocked).toBe(false);
  });

  it('the body isPremium flag is ignored (a free user gets the 7-day preview window)', async () => {
    const res = await save();
    expect(res.status).toBe(200);
    const exp = new Date(S.tables.birthday_reports[0].expires_at).getTime();
    expect(exp).toBeLessThan(Date.now() + 8 * 86400_000);
    expect(S.tables.birthday_reports[0].is_premium_report).toBe(false);
  });

  it('normalizeEmail', () => {
    expect(userAuth.normalizeEmail('A.B+c@GMail.com')).toBe('ab@gmail.com');
    expect(userAuth.normalizeEmail('a.b+c@example.com')).toBe('a.b@example.com');
  });
});
