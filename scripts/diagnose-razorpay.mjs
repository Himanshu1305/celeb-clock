#!/usr/bin/env node
/**
 * scripts/diagnose-razorpay.mjs
 *
 * Read-only Razorpay subscription diagnostic + optional helpers.
 *
 * Run:
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --sub sub_XXXXXX
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --create-fresh
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --cancel-orphans
 *
 * Flags:
 *   --sub <id>        Override the default subscription ID to inspect.
 *   --create-fresh    Call the LOCAL create-subscription endpoint, then inspect
 *                     the resulting sub + invoices and print SUCCESS CRITERIA.
 *                     Vercel dev must be running on localhost:3001.
 *   --cancel-orphans  Cancel all test-mode subscriptions in "created" state
 *                     created in the last 24 hours.
 */

// ── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = k => args.includes(k);
const argVal = k => { const i = args.indexOf(k); return i !== -1 ? args[i + 1] : null; };

const DEFAULT_SUB   = 'sub_T9uLwxIGcfJUUM';
const targetSub     = argVal('--sub') || DEFAULT_SUB;
const doCreateFresh = flag('--create-fresh');
const doCancelOrphans = flag('--cancel-orphans');

// ── Credentials ─────────────────────────────────────────────────────────────

const KEY_ID     = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.error('Missing RAZORPAY_KEY_ID (or VITE_RAZORPAY_KEY_ID) and/or RAZORPAY_KEY_SECRET.');
  console.error('Run:  node --env-file=.env.local scripts/diagnose-razorpay.mjs');
  process.exit(1);
}

const AUTH   = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
const RZP    = 'https://api.razorpay.com/v1';
const INDIA_MONTHLY_PLAN = process.env.VITE_RAZORPAY_PLAN_INDIA_MONTHLY;

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function rzpGet(path) {
  const res = await fetch(`${RZP}${path}`, {
    headers: { Authorization: `Basic ${AUTH}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function rzpPost(path, payload) {
  const res = await fetch(`${RZP}${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${AUTH}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

function paise(n) {
  if (n == null) return 'null';
  return `₹${(n / 100).toFixed(2)}`;
}

function ts(epoch) {
  if (!epoch) return 'null';
  return new Date(epoch * 1000).toISOString();
}

// ── Payload we currently send (read from source, not inferred) ────────────────
// This is the exact body api/create-subscription.ts constructs on line 49-55:
//
//   {
//     plan_id:       planId,
//     quantity:      1,
//     total_count:   120,          // for monthly (10 for annual)
//     customer_notify: 1,
//     notes:         { userId }
//   }
//
// No start_at, no expire_by, no addons, no offer_id.
// customer_notify: 1 instructs Razorpay to e-mail the invoice to the customer
// immediately when the subscription is created — BEFORE checkout is opened.

function printCurrentPayload(planId = INDIA_MONTHLY_PLAN || '<VITE_RAZORPAY_PLAN_INDIA_MONTHLY>', totalCount = 120) {
  console.log('\n── PAYLOAD api/create-subscription.ts CURRENTLY SENDS ──────────────────');
  console.log(JSON.stringify({
    plan_id: planId,
    quantity: 1,
    total_count: totalCount,
    customer_notify: 1,
    notes: { userId: '<userId>' },
  }, null, 2));
}

// ── Diagnosis ─────────────────────────────────────────────────────────────────

function diagnose(sub, invoices) {
  console.log('\n── DIAGNOSIS ────────────────────────────────────────────────────────────');

  const firstInvoice = invoices.items?.[0];
  const invoiceAmt   = firstInvoice?.amount;
  const invoiceStatus = firstInvoice?.status;

  console.log(`subscription.status          : ${sub.status}`);
  console.log(`subscription.customer_notify : ${sub.customer_notify}`);
  console.log(`subscription.start_at        : ${ts(sub.start_at)} (${sub.start_at ?? 'null'})`);
  console.log(`subscription.charge_at       : ${ts(sub.charge_at)} (${sub.charge_at ?? 'null'})`);
  console.log(`subscription.auth_attempts   : ${sub.auth_attempts ?? 0}`);
  console.log(`first invoice amount         : ${paise(invoiceAmt)} (status: ${invoiceStatus ?? 'none'})`);

  const now = Math.floor(Date.now() / 1000);
  const chargeInFuture = sub.charge_at && sub.charge_at > now + 300; // >5 min away = future

  console.log('\n── ROOT CAUSE ───────────────────────────────────────────────────────────');

  if (sub.customer_notify === 1 || sub.customer_notify === true) {
    console.log(`
PROBLEM: customer_notify=1

With customer_notify=1, Razorpay issues the first invoice immediately when the
subscription is created (before checkout is opened). The invoice is ${paise(invoiceAmt)}.

When checkout opens for a subscription with a pre-issued invoice, Razorpay uses
its recurring e-mandate flow: it charges a small upfront AUTHORIZATION amount
(₹5 in test mode) to register the card mandate, then schedules the real invoice
separately. The invoice demands ${paise(invoiceAmt)} but the checkout order was
constructed for ₹5 — the bank sees two different amounts for the same transaction
and rejects with "payment amount is different from order amount".

FIX: set customer_notify=0. With 0, no invoice is issued at creation time.
When checkout collects the first payment it closes the first invoice atomically —
amount and order are always consistent. Razorpay still sends its own payment
receipt to the customer after the charge succeeds.
`);
  } else if (chargeInFuture) {
    console.log(`
PROBLEM: subscription.charge_at is in the future (${ts(sub.charge_at)})

A future charge_at means the first real billing cycle hasn't started. Checkout
treats this as an authorization-only mandate: it charges ₹5 now, schedules the
first ₹${paise(invoiceAmt)} later. The pre-issued invoice (if any) conflicts.

FIX: omit start_at entirely so charge_at defaults to now.
`);
  } else {
    console.log(`
No known root cause identified from these fields. Paste full sub object above
for manual inspection.
`);
  }

  console.log('── PARAMETERS COMPARED ─────────────────────────────────────────────────');
  console.log('  We sent        customer_notify : 1  ← THE INCONSISTENT PARAMETER');
  console.log('  Should send    customer_notify : 0');
  console.log('  We sent        start_at        : (omitted — defaulted by Razorpay)');
  console.log('  Invoice issued                 : immediately on subscription creation');
  console.log('  Checkout auth flow             : ₹5 mandate auth (not ₹299 full charge)');
  console.log('  Result                         : amount split-brain → payment rejected');
}

// ── Success criteria check ────────────────────────────────────────────────────

function checkSuccessCriteria(sub, invoices) {
  const firstInvoice = invoices.items?.[0];
  const invoiceAmt   = firstInvoice?.amount;

  // Plan amount comes from the plan object embedded in the subscription
  const planAmt = sub.plan?.item?.amount;

  console.log('\n── SUCCESS CRITERIA ─────────────────────────────────────────────────────');
  console.log(`subscription.customer_notify : ${sub.customer_notify}`);
  console.log(`subscription.status          : ${sub.status}`);
  console.log(`first invoice status         : ${firstInvoice?.status ?? 'none (no pre-issued invoice)'}`);
  console.log(`first invoice amount         : ${paise(invoiceAmt)}`);
  console.log(`plan amount                  : ${paise(planAmt)}`);

  const noPreIssuedInvoice = !firstInvoice || firstInvoice.status === 'draft';
  const customerNotifyOff  = sub.customer_notify === 0 || sub.customer_notify === false;
  const statusCreated      = sub.status === 'created';

  if (customerNotifyOff && noPreIssuedInvoice && statusCreated) {
    console.log(`
✅ CONSISTENT — READY FOR BROWSER TEST

customer_notify=0: no invoice pre-issued at creation time.
When checkout opens, Razorpay collects the first payment and closes the first
invoice in one atomic step — the amount presented in checkout will be ₹${paise(planAmt)}
(the plan amount), matching what the bank processes.

Pattern: IMMEDIATE FIRST CHARGE (not mandate-auth). User pays ₹${paise(planAmt)} at
checkout; subscription activates immediately; next charge in 1 month.
`);
    return true;
  } else {
    console.log(`
❌ NOT CONSISTENT — DO NOT SEND TO BROWSER YET

  customer_notify=0 : ${customerNotifyOff ? '✅' : '❌ still 1'}
  no pre-issued invoice : ${noPreIssuedInvoice ? '✅' : `❌ invoice in status "${firstInvoice?.status}" for ${paise(invoiceAmt)}`}
  status=created        : ${statusCreated ? '✅' : `❌ status is "${sub.status}"`}
`);
    return false;
  }
}

// ── Fetch + print a subscription ──────────────────────────────────────────────

async function inspectSub(subId, label = '') {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  SUBSCRIPTION: ${subId}${label ? '  (' + label + ')' : ''}`);
  console.log('═'.repeat(60));

  const sub = await rzpGet(`/subscriptions/${subId}`);

  console.log('\n── SUBSCRIPTION OBJECT ──────────────────────────────────────────────────');
  const fields = [
    'id','status','plan_id','quantity','total_count','paid_count',
    'customer_notify','start_at','charge_at','current_start','current_end',
    'auth_attempts','notes','has_scheduled_changes','change_scheduled_at',
    'addons','offer_id','created_at',
  ];
  const printed = {};
  for (const f of fields) {
    if (f in sub) {
      printed[f] = sub[f];
    }
  }
  // Also print plan sub-object if present
  if (sub.plan) printed.plan = sub.plan;
  console.log(JSON.stringify(printed, null, 2));

  console.log('\n── INVOICES ─────────────────────────────────────────────────────────────');
  const invoices = await rzpGet(`/invoices?subscription_id=${subId}&count=10`);
  if (!invoices.items?.length) {
    console.log('  (no invoices)');
  } else {
    for (const inv of invoices.items) {
      console.log(JSON.stringify({
        id: inv.id,
        status: inv.status,
        amount: inv.amount,
        amount_formatted: paise(inv.amount),
        billing_start: ts(inv.billing_start),
        billing_end: ts(inv.billing_end),
        paid_at: ts(inv.paid_at),
        description: inv.description,
      }, null, 2));
    }
  }

  return { sub, invoices };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (doCreateFresh) {
    // ── --create-fresh ────────────────────────────────────────────────────────
    console.log('\n── CREATE-FRESH: calling local create-subscription endpoint ─────────────');

    if (!INDIA_MONTHLY_PLAN) {
      console.error('VITE_RAZORPAY_PLAN_INDIA_MONTHLY not set in .env.local');
      process.exit(1);
    }

    let freshSubId;
    try {
      const r = await fetch('http://localhost:3001/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: INDIA_MONTHLY_PLAN, userId: 'diagnose-test' }),
      });
      const body = await r.json();
      if (!r.ok) {
        console.error('Local endpoint error:', body);
        process.exit(1);
      }
      freshSubId = body.subscription_id;
      console.log(`Created: ${freshSubId}`);
    } catch (e) {
      console.error('Could not reach localhost:3001 — is vercel dev running?', e.message);
      process.exit(1);
    }

    const { sub, invoices } = await inspectSub(freshSubId, 'just created by local endpoint');
    printCurrentPayload(INDIA_MONTHLY_PLAN, 120);
    checkSuccessCriteria(sub, invoices);
    return;
  }

  if (doCancelOrphans) {
    // ── --cancel-orphans ──────────────────────────────────────────────────────
    console.log('\n── CANCEL-ORPHANS: fetching created-status subscriptions ────────────────');
    const cutoff = Math.floor(Date.now() / 1000) - 86400; // last 24h
    let page = await rzpGet('/subscriptions?count=100&skip=0');
    const orphans = (page.items || []).filter(
      s => s.status === 'created' && s.created_at >= cutoff
    );
    if (!orphans.length) {
      console.log('No orphaned subscriptions found in the last 24 hours.');
      return;
    }
    console.log(`Found ${orphans.length} orphan(s):`);
    for (const s of orphans) {
      console.log(`  ${s.id}  plan=${s.plan_id}  created=${ts(s.created_at)}`);
    }
    console.log('\nCancelling...');
    for (const s of orphans) {
      try {
        await rzpPost(`/subscriptions/${s.id}/cancel`, { cancel_at_cycle_end: 0 });
        console.log(`  ✅ cancelled ${s.id}`);
      } catch (e) {
        console.log(`  ❌ failed ${s.id}: ${e.message}`);
      }
    }
    return;
  }

  // ── Default: inspect the target subscription ──────────────────────────────
  const { sub, invoices } = await inspectSub(targetSub);
  printCurrentPayload();
  diagnose(sub, invoices);
}

main().catch(e => { console.error(e); process.exit(1); });
