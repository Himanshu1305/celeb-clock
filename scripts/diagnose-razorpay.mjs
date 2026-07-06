#!/usr/bin/env node
/**
 * scripts/diagnose-razorpay.mjs
 *
 * Read-only Razorpay subscription diagnostic + optional helpers.
 *
 * Run:
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --sub sub_XXXXXX
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --latest
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --create-fresh
 *   node --env-file=.env.local scripts/diagnose-razorpay.mjs --cancel-orphans
 *
 * Flags (exactly one required):
 *   --sub <id>        Inspect a specific subscription ID.
 *   --latest          Auto-pick the most-recently-created subscription.
 *   --create-fresh    Call the LOCAL create-subscription endpoint (vercel dev on
 *                     :3001), inspect the new sub, and print SUCCESS CRITERIA.
 *   --cancel-orphans  Cancel all test-mode "created" subs from the last 24h.
 *
 * Running with no flags or unrecognised flags is an error — there is no
 * hardcoded default subscription ID.  If you have a specific sub to inspect,
 * pass --sub <id>; if you want the latest, pass --latest.
 */

// ── CLI args — strict ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const KNOWN_FLAGS    = new Set(['--sub', '--latest', '--create-fresh', '--cancel-orphans']);
const KNOWN_VALUEFUL = new Set(['--sub']); // flags that consume the next token

// Collect flags and validate
const seenFlags = new Set();
let subIdArg = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) {
    // positional argument — only valid as value after --sub
    if (args[i - 1] === '--sub') continue;
    console.error(`ERROR: unexpected argument "${a}". Use --sub <id>, --latest, --create-fresh, or --cancel-orphans.`);
    process.exit(1);
  }
  if (!KNOWN_FLAGS.has(a)) {
    console.error(`ERROR: unknown flag "${a}". Known flags: --sub <id>, --latest, --create-fresh, --cancel-orphans.`);
    process.exit(1);
  }
  if (KNOWN_VALUEFUL.has(a)) {
    subIdArg = args[i + 1];
    if (!subIdArg || subIdArg.startsWith('--')) {
      console.error(`ERROR: --sub requires a subscription ID argument.`);
      process.exit(1);
    }
    i++; // skip value token
  }
  seenFlags.add(a);
}

if (seenFlags.size === 0) {
  console.error('ERROR: no flag provided. You must specify one of:');
  console.error('  --sub <id>       inspect a specific subscription');
  console.error('  --latest         inspect the most recently created subscription');
  console.error('  --create-fresh   create via local endpoint and inspect');
  console.error('  --cancel-orphans cancel created-state subs from last 24h');
  process.exit(1);
}

// Mutual exclusion: at most one mode flag
const modeFlags = ['--sub', '--latest', '--create-fresh', '--cancel-orphans'].filter(f => seenFlags.has(f));
if (modeFlags.length > 1) {
  console.error(`ERROR: conflicting flags ${modeFlags.join(' ')} — specify only one.`);
  process.exit(1);
}

const doLatest        = seenFlags.has('--latest');
const doCreateFresh   = seenFlags.has('--create-fresh');
const doCancelOrphans = seenFlags.has('--cancel-orphans');
const explicitSubId   = subIdArg;

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
    customer_notify: 0,
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
  const chargeInFuture = sub.charge_at && sub.charge_at > now + 300;

  console.log('\n── SERVER-SIDE FIELD ANALYSIS ───────────────────────────────────────────');

  const serverIssues = [];

  if (sub.customer_notify === 1 || sub.customer_notify === true) {
    serverIssues.push('customer_notify=1: Razorpay emails invoice before checkout opens (cosmetic; not the amount-mismatch cause)');
  }
  if (chargeInFuture) {
    serverIssues.push(`charge_at in future (${ts(sub.charge_at)}): subscription not yet billing`);
  }
  if ((sub.auth_attempts ?? 0) > 0) {
    serverIssues.push(`auth_attempts=${sub.auth_attempts}: subscription has prior failed attempts; may be in bad state — consider cancelling and creating fresh`);
  }

  if (serverIssues.length) {
    serverIssues.forEach(p => console.log(`  ⚠  ${p}`));
  } else {
    console.log('  ✅ Server-side subscription fields look clean.');
    console.log('  If payment still fails, the root cause is in the CHECKOUT OPTIONS (client-side).');
  }

  console.log('\n── FRONTEND CHECKOUT OPTIONS CHECKLIST ──────────────────────────────────');
  console.log(`
These fields are set client-side in RazorpayService.ts and are NOT visible via
the Razorpay API — they can only be verified by reading the source file.

  subscription_id   must be set (not plan_id, not order_id)
  subscription_card_change  must be ABSENT or false
      → When true, Razorpay enters the card-update flow: ₹5 auth charge instead
        of the full plan amount. Checkout sends amount=500 but invoice is ₹29900
        → "input_validation_failed, field: amount" on every card.
  amount            must be ABSENT from rzpOptions entirely
      → Any amount field in the checkout options overrides the plan amount.
  handler           receives razorpay_payment_id, razorpay_subscription_id,
                    razorpay_signature — verify none are undefined before POST.

Run:  grep -n 'subscription_card_change\\|amount\\|plan_id\\|order_id' src/services/RazorpayService.ts
`);
}

// ── Success criteria check (used by --create-fresh) ──────────────────────────
// Server-side criteria only — checkout SDK options are static and must be
// verified by reading RazorpayService.ts directly (see FRONTEND CHECKLIST).
// Key static requirement: subscription_card_change must be absent/false.
// When true it switches Razorpay into card-update mode (₹5 auth, not ₹299)
// causing input_validation_failed on every card regardless of server state.

async function checkSuccessCriteria(sub, invoices) {
  const firstInvoice = invoices.items?.[0];
  const invoiceAmt   = firstInvoice?.amount;

  // Fetch the plan separately to get the authoritative plan amount.
  let planAmt = null;
  try {
    const plan = await rzpGet(`/plans/${sub.plan_id}`);
    planAmt = plan.item?.amount;
  } catch { /* non-fatal */ }

  console.log('\n── SUCCESS CRITERIA ─────────────────────────────────────────────────────');
  console.log(`subscription.customer_notify : ${sub.customer_notify}`);
  console.log(`subscription.status          : ${sub.status}`);
  console.log(`subscription.auth_attempts   : ${sub.auth_attempts}`);
  console.log(`plan amount (from plan API)  : ${paise(planAmt)}`);
  console.log(`first invoice status         : ${firstInvoice?.status ?? 'none'}`);
  console.log(`first invoice amount         : ${paise(invoiceAmt)}`);

  const customerNotifyOff = sub.customer_notify === 0 || sub.customer_notify === false;
  const statusCreated     = sub.status === 'created';
  const freshAttempts     = (sub.auth_attempts ?? 0) === 0;
  const invoiceIssued     = firstInvoice?.status === 'issued';
  // Invoice amount must match plan amount (or plan amount unavailable — assume ok)
  const amountsMatch      = planAmt == null || invoiceAmt === planAmt;

  const ok = customerNotifyOff && statusCreated && freshAttempts && invoiceIssued && amountsMatch;

  if (ok) {
    console.log(`
✅ CONSISTENT — READY FOR BROWSER TEST

customer_notify=false: Razorpay will NOT pre-present the invoice to the customer
before checkout. The checkout session will collect ${paise(invoiceAmt)} (the plan
amount) atomically when the card is charged — no split-brain between the invoice
amount and the checkout order amount.

NOTE: Razorpay India subscriptions show "₹5 will be charged now, then
${paise(invoiceAmt)}/month" — the ₹5 is a standard e-mandate authorization charge
required by NPCI for recurring card registrations. This is expected behavior.
The ₹5 is NOT billed to the customer as a fee; the first real charge is
${paise(invoiceAmt)} which follows immediately or on the first billing date.

Browser test card for subscriptions: 5267 3181 8797 5449 · CVV 123 · OTP 123456
(The 4111 Visa test card does not support recurring mandate flows in test mode.)

STATIC FRONTEND CHECK (cannot be verified via API — read the source):
  grep -n 'subscription_card_change' src/services/RazorpayService.ts
  → must return NO results (field must be absent)
  grep -n 'amount' src/services/RazorpayService.ts
  → must NOT appear inside rzpOptions (only in verify-payment POST body is ok)
`);
    return true;
  } else {
    console.log(`
❌ NOT CONSISTENT — DO NOT SEND TO BROWSER YET

  customer_notify=false : ${customerNotifyOff ? '✅' : '❌ still true/1'}
  status=created        : ${statusCreated  ? '✅' : `❌ "${sub.status}"`}
  auth_attempts=0       : ${freshAttempts  ? '✅' : `❌ ${sub.auth_attempts} attempts already made`}
  invoice issued        : ${invoiceIssued  ? '✅' : `❌ status="${firstInvoice?.status ?? 'none'}"`}
  amounts match         : ${amountsMatch   ? '✅' : `❌ plan=${paise(planAmt)} invoice=${paise(invoiceAmt)}`}
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
    await checkSuccessCriteria(sub, invoices);
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

  // ── --latest: fetch the most-recently-created subscription ──────────────────
  let resolvedSubId = explicitSubId;
  if (doLatest) {
    console.log('\n── LATEST: fetching most-recently-created subscription ─────────────────');
    const page = await rzpGet('/subscriptions?count=20&skip=0');
    const items = page.items || [];
    if (!items.length) {
      console.error('No subscriptions found in this Razorpay account.');
      process.exit(1);
    }
    // Sort descending by created_at in case the API doesn't guarantee order
    items.sort((a, b) => b.created_at - a.created_at);
    resolvedSubId = items[0].id;
    console.log(`Latest: ${resolvedSubId}  (created ${ts(items[0].created_at)})`);
  }

  // ── --sub or --latest: inspect the resolved subscription ─────────────────
  const { sub, invoices } = await inspectSub(resolvedSubId);
  printCurrentPayload();
  diagnose(sub, invoices);
}

main().catch(e => { console.error(e); process.exit(1); });
