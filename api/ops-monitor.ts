// api/ops-monitor.ts — MONITOR-ONLY health checks (Phase 7).
//
// BUILT BUT NOT REGISTERED in functions/_worker.ts routing (see
// docs/OPS-ACTIVATION.md for the one-line registration + cron wiring). Nothing
// here mutates product data; it only reads, and writes to pending_reviews via
// the ops helpers. Safe to run repeatedly.
//
// Checks:
//  1. Payment liveness — the /api/create-order sentinel must return
//     {"error":"Report not found"}. Fail → retry after 10s → urgent + alert.
//  2. PDF generation — no server-side PDF exists (both reports print client-side
//     via an iframe; grep confirms no puppeteer/sparticuz/chromium/playwright in
//     api/ or functions/). Documented no-op; no endpoint invented.
//  3. celebrity_sitelinks integrity — total >= 27000 (baseline 28,148),
//     nationality_code='IN' >= 300 (actual ~2,627), zero rows with birth_date
//     set but birth_month_day null.
//  4. Dependency reachability — ipapi.co ping + PRESENCE (not values) of
//     RESEND_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.
//  5. Error rate — SKIPPED: no error-logs table exists in this project (grep of
//     src/, api/, supabase/ finds none). Documented, not faked.

import { opsClient, writeReview, autoResolve, reviewAndAlert } from './_ops.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

const SENTINEL_BODY = JSON.stringify({
  product: 'birthday_report', report_slug: 'zzzzzzzz', userId: 'ops-monitor', currency: 'INR',
});

async function hitCreateOrder(base: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(`${base}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: SENTINEL_BODY,
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    // Healthy sentinel: Supabase reachable + input validated → "Report not found".
    const ok = text.includes('Report not found');
    return { ok, detail: `HTTP ${res.status} ${text.slice(0, 120)}` };
  } catch (e: any) {
    return { ok: false, detail: `fetch threw: ${e?.message}` };
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  const sb = opsClient();
  const base = process.env.OPS_BASE_URL || 'https://bornclock.usdvisionai.workers.dev';
  const results: Record<string, unknown> = {};

  // ── 1. Payment liveness ────────────────────────────────────────────────────
  let pay = await hitCreateOrder(base);
  if (!pay.ok) {
    await new Promise(r => setTimeout(r, 10_000)); // one 10s retry to ride out a blip
    pay = await hitCreateOrder(base);
  }
  if (pay.ok) {
    await autoResolve(sb, 'payment_liveness', `create-order sentinel healthy (${pay.detail})`);
    results.payment_liveness = { status: 'ok', detail: pay.detail };
  } else {
    await reviewAndAlert(sb, {
      category: 'payment_liveness',
      severity: 'urgent',
      title: 'Payment API create-order sentinel is FAILING',
      body: `Expected {"error":"Report not found"} from ${base}/api/create-order after a 10s retry. Got: ${pay.detail}`,
      actionSteps: [
        '1. curl -s -X POST ' + base + '/api/create-order -H "Content-Type: application/json" -d \'' + SENTINEL_BODY + '\'',
        '2. Check Cloudflare Worker logs (wrangler tail) for stack traces.',
        '3. Verify SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RAZORPAY_* secrets are set (wrangler secret list).',
        '4. If Supabase is down, check status.supabase.com.',
      ].join('\n'),
      extra: { base, detail: pay.detail },
    });
    results.payment_liveness = { status: 'urgent', detail: pay.detail };
  }

  // ── 2. PDF generation (documented no-op) ───────────────────────────────────
  results.pdf_generation = {
    status: 'skipped',
    note: 'No server-side PDF. Both reports print client-side via an iframe; nothing is Worker-callable to probe. No endpoint invented.',
  };

  // ── 3. celebrity_sitelinks integrity ───────────────────────────────────────
  try {
    const total = await sb.from('celebrity_sitelinks').select('*', { count: 'exact', head: true });
    const inRows = await sb.from('celebrity_sitelinks').select('*', { count: 'exact', head: true }).eq('nationality_code', 'IN');
    const badDate = await sb.from('celebrity_sitelinks').select('*', { count: 'exact', head: true })
      .not('birth_date', 'is', null).is('birth_month_day', null);
    const totalN = total.count ?? 0, inN = inRows.count ?? 0, badN = badDate.count ?? 0;
    const problems: string[] = [];
    if (totalN < 27000) problems.push(`total ${totalN} < 27000 (baseline 28,148)`);
    if (inN < 300) problems.push(`nationality_code='IN' ${inN} < 300`);
    if (badN > 0) problems.push(`${badN} rows have birth_date set but birth_month_day null`);
    results.celebrity_integrity = { total: totalN, in: inN, badDate: badN, problems };
    if (problems.length === 0) {
      await autoResolve(sb, 'celebrity_integrity', `counts healthy: total=${totalN}, IN=${inN}, badDate=${badN}`);
    } else {
      await reviewAndAlert(sb, {
        category: 'celebrity_integrity',
        severity: 'warning',
        title: 'celebrity_sitelinks integrity check failed',
        body: problems.join('\n'),
        actionSteps: 'Investigate a bad bulk import/dedupe run. See ARCHITECTURE-DECISIONS §5. Do NOT paste bulk SQL into Studio; use a Node script (scripts/migrate-indian-celebs.mjs pattern).',
        extra: { total: totalN, in: inN, badDate: badN },
      });
    }
  } catch (e: any) {
    results.celebrity_integrity = { status: 'error', detail: e?.message };
    await reviewAndAlert(sb, {
      category: 'celebrity_integrity', severity: 'warning',
      title: 'celebrity_sitelinks integrity query threw', body: e?.message,
    });
  }

  // ── 4. Dependency reachability ─────────────────────────────────────────────
  const deps: Record<string, unknown> = {};
  try {
    const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    deps.ipapi = r.ok ? 'reachable' : `HTTP ${r.status}`;
  } catch (e: any) { deps.ipapi = `unreachable: ${e?.message}`; }
  const present = (k: string) => typeof process.env[k] === 'string' && (process.env[k] as string).length > 0;
  deps.RESEND_API_KEY = present('RESEND_API_KEY');
  deps.RAZORPAY_KEY_ID = present('RAZORPAY_KEY_ID');
  deps.RAZORPAY_KEY_SECRET = present('RAZORPAY_KEY_SECRET');
  results.dependencies = deps;
  const missing = ['RESEND_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].filter(k => !present(k));
  const ipapiDown = typeof deps.ipapi === 'string' && deps.ipapi !== 'reachable';
  if (missing.length === 0 && !ipapiDown) {
    await autoResolve(sb, 'dependencies', `deps healthy: ipapi=${deps.ipapi}, secrets present`);
  } else {
    await reviewAndAlert(sb, {
      category: 'dependencies',
      severity: missing.length ? 'urgent' : 'warning',
      title: 'Dependency check failed',
      body: [
        missing.length ? `Missing secrets: ${missing.join(', ')}` : null,
        ipapiDown ? `ipapi.co: ${deps.ipapi}` : null,
      ].filter(Boolean).join('\n'),
      actionSteps: missing.length
        ? 'Set the missing secret(s) with: ./node_modules/.bin/wrangler secret put <NAME>. Strip quotes when piping (ARCHITECTURE-DECISIONS §2.6).'
        : 'ipapi.co blip — geo/pricing falls back to IN/INR. Re-check next run; escalate only if persistent.',
      extra: { missing, ipapi: deps.ipapi },
    });
  }

  // ── 5. Error rate — skipped (no error-logs table) ──────────────────────────
  results.error_rate = { status: 'skipped', note: 'No error-logs table in this project (grep of src/, api/, supabase/ finds none). Not faked.' };

  return json({ ranAt: new Date().toISOString(), base, results });
}

export const POST = handler;
export const GET = handler;
