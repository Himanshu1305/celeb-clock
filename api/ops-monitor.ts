// api/ops-monitor.ts — MONITOR-ONLY health checks (Phase 7).
//
// BUILT BUT NOT REGISTERED in functions/_worker.ts routing (see
// docs/OPS-ACTIVATION.md for the one-line registration + cron wiring). Nothing
// here mutates product data; it only reads, and writes to pending_reviews via
// the ops helpers. Safe to run repeatedly.
//
// Checks:
//  1. Payment liveness — (a) the /api/create-order route answers an unauthenticated
//     sentinel with 401 {"error":"Please sign in to continue"} (route + validation +
//     auth gate alive; since the Oct 2026 hardening the payer must be signed in, so the
//     old "Report not found" answer is no longer reachable without a session), and
//     (b) Supabase answers a read on birthday_reports. Fail → retry after 10s → urgent.
//  2. PDF generation — no server-side PDF exists (both reports print client-side
//     via an iframe; grep confirms no puppeteer/sparticuz/chromium/playwright in
//     api/ or functions/). Documented no-op; no endpoint invented.
//  3. celebrity_sitelinks integrity — total >= 27000 (baseline 28,148),
//     nationality_code='IN' >= 300 (actual ~2,627), zero rows with birth_date
//     set but birth_month_day null.
//  4. Dependency reachability — PRESENCE (not values) of RESEND_API_KEY,
//     RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET. (ipapi.co is no longer used: country comes
//     from Cloudflare via /api/geo, so there is no third-party geo service to ping.)
//
// Self-requests go through opsSelfFetch(): the Worker calls its own routes in-process.
// Over HTTP a Worker can't reach itself (its *.workers.dev URL returns 522; a fetch to
// its own custom domain bypasses the Worker), which made checks 1 and 6 fail falsely.
//  5. Error rate — SKIPPED: no error-logs table exists in this project (grep of
//     src/, api/, supabase/ finds none). Documented, not faked.

import { opsClient, writeReview, autoResolve, reviewAndAlert } from './_ops.js';
import { isCronAuthorized, unauthorized } from './_cronAuth.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

const SENTINEL_BODY = JSON.stringify({
  product: 'birthday_report', report_slug: 'zzzzzzzz', userId: 'ops-monitor', currency: 'INR',
});

/** Call one of this Worker's own routes. In production the Worker registers
 *  globalThis.__bcSelfFetch (functions/_worker.ts) so the request runs in-process;
 *  elsewhere (tests, local) it falls back to a normal HTTP fetch of `base + path`. */
export async function opsSelfFetch(base: string, path: string, init?: RequestInit): Promise<Response> {
  const self = (globalThis as any).__bcSelfFetch as ((r: Request) => Promise<Response>) | undefined;
  if (typeof self === 'function') {
    return self(new Request(`https://bornclock.com${path}`, init));
  }
  return fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(8000) });
}

async function hitCreateOrder(base: string, sb: ReturnType<typeof opsClient>): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await opsSelfFetch(base, '/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: SENTINEL_BODY,
    });
    const text = await res.text();
    // Healthy: the route validates the body and stops at the sign-in gate.
    const routeOk = res.status === 401 && text.includes('Please sign in');
    let dbOk = false; let dbDetail = 'no client';
    if (sb) {
      const { error } = await sb.from('birthday_reports').select('slug', { head: true, count: 'exact' }).limit(1);
      dbOk = !error; dbDetail = error ? `supabase: ${error.message}` : 'supabase ok';
    }
    return { ok: routeOk && dbOk, detail: `HTTP ${res.status} ${text.slice(0, 80)}; ${dbDetail}` };
  } catch (e: any) {
    return { ok: false, detail: `threw: ${e?.message}` };
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!isCronAuthorized(request)) return unauthorized();
  const sb = opsClient();
  const base = process.env.OPS_BASE_URL || 'https://bornclock.usdvisionai.workers.dev';
  const results: Record<string, unknown> = {};

  // ── 1. Payment liveness ────────────────────────────────────────────────────
  let pay = await hitCreateOrder(base, sb);
  if (!pay.ok) {
    await new Promise(r => setTimeout(r, 10_000)); // one 10s retry to ride out a blip
    pay = await hitCreateOrder(base, sb);
  }
  if (pay.ok) {
    await autoResolve(sb, 'payment_liveness', `create-order sentinel healthy (${pay.detail})`);
    results.payment_liveness = { status: 'ok', detail: pay.detail };
  } else {
    await reviewAndAlert(sb, {
      category: 'payment_liveness',
      severity: 'urgent',
      title: 'Payment API create-order sentinel is FAILING',
      body: `Expected HTTP 401 {"error":"Please sign in to continue"} from /api/create-order and a successful Supabase read, after a 10s retry. Got: ${pay.detail}`,
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
  const present = (k: string) => typeof process.env[k] === 'string' && (process.env[k] as string).length > 0;
  deps.RESEND_API_KEY = present('RESEND_API_KEY');
  deps.RAZORPAY_KEY_ID = present('RAZORPAY_KEY_ID');
  deps.RAZORPAY_KEY_SECRET = present('RAZORPAY_KEY_SECRET');
  results.dependencies = deps;
  const missing = ['RESEND_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].filter(k => !present(k));
  if (missing.length === 0) {
    await autoResolve(sb, 'dependencies', 'deps healthy: secrets present (geo via Cloudflare, no ipapi)');
  } else {
    await reviewAndAlert(sb, {
      category: 'dependencies',
      severity: 'urgent',
      title: 'Dependency check failed',
      body: `Missing secrets: ${missing.join(', ')}`,
      actionSteps: 'Set the missing secret(s) with: ./node_modules/.bin/wrangler secret put <NAME>. Strip quotes when piping (ARCHITECTURE-DECISIONS §2.6).',
      extra: { missing },
    });
  }

  // ── 6. Daily pages freshness (Batch 7) ─────────────────────────────────────
  // Daily pages (rashifal, Western horoscope, …) serve precomputed content for a
  // 400-day window built at deploy time (scripts/gen-daily.mts → /daily/manifest.json).
  // Warn 30 days before the window runs out; urgent once today is outside it (pages
  // then fall back to computing in the browser). See src/lib/daily/index.ts.
  try {
    const r = await opsSelfFetch(base, '/daily/manifest.json');
    const ct = r.headers.get('content-type') || '';
    const m = r.ok && !ct.includes('text/html') ? await r.json() as { firstDate: string; lastDate: string; generatedAt: string } : null;
    const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
    const daysLeft = m ? Math.round((Date.parse(m.lastDate) - Date.parse(today)) / 86400000) : -1;
    results.daily_pages = m ? { firstDate: m.firstDate, lastDate: m.lastDate, daysLeft } : { status: 'missing', http: r.status };
    if (m && today >= m.firstDate && daysLeft >= 30) {
      await autoResolve(sb, 'daily_pages', `daily pages precomputed to ${m.lastDate} (${daysLeft} days left)`);
    } else {
      await reviewAndAlert(sb, {
        category: 'daily_pages',
        severity: !m || daysLeft < 0 || today < m.firstDate ? 'urgent' : 'warning',
        title: !m ? 'Daily pages manifest missing' : `Daily pages window ends ${m.lastDate} (${daysLeft} days left)`,
        body: !m
          ? `GET /daily/manifest.json returned HTTP ${r.status}. Rashifal / horoscope pages are computing in the browser.`
          : `Precomputed ${m.firstDate} → ${m.lastDate} (built ${m.generatedAt}). Today (IST) is ${today}.`,
        actionSteps: 'Any production deploy regenerates the window (npm run build:app runs scripts/gen-daily.mts). Ask the founder to deploy.',
        extra: m ?? { http: r.status },
      });
    }
  } catch (e: any) {
    results.daily_pages = { status: 'error', detail: e?.message };
  }

  // ── 5. Error rate — skipped (no error-logs table) ──────────────────────────
  results.error_rate = { status: 'skipped', note: 'No error-logs table in this project (grep of src/, api/, supabase/ finds none). Not faked.' };

  return json({ ranAt: new Date().toISOString(), base, results });
}

export const POST = handler;
export const GET = handler;
