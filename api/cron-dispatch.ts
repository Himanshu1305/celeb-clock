// Single protected entry point for an EXTERNAL scheduler (GitHub Actions).
//
// Why this exists: Cloudflare's scheduled() cron deploy is broken in this
// project — every deploy's `PUT .../schedules` returns 400 Bad Request, so the
// crons in wrangler.toml are rejected and never fire (see docs/part-p-flags.md).
// The reliable, environment-independent fix is an external scheduler that hits
// a protected HTTP endpoint on a fixed cadence. This is that endpoint.
//
// Auth: Bearer CRON_SECRET only (no Cloudflare token is ever needed by the
// scheduler, and none is added to GitHub). The GitHub Actions workflow in
// .github/workflows/scheduled-tasks.yml calls this with `?job=daily` and
// `?job=weekly` on their respective schedules.
//
// Jobs route to the existing handlers so there is one source of truth for each
// job's logic:
//   job=daily   → daily retention emails + opt-in daily notifications
//                 + ops monitor + renewal invoice sweep (previously Cloudflare cron 06:10 UTC)
//   job=weekly  → weekly digest batch (gated by DIGEST_LIVE) + Monday integrity ops-monitor
//   job=digest  → Sunday ops digest email (previously Cloudflare cron Sun 09:00 UTC)
//   job=all     → everything (handy for manual workflow_dispatch)

import { GET as dailyEmailCron } from './daily-email-cron.js';
import { runDailyNotifications, runWeeklyDigestBatch } from './_notify.js';
import { POST as opsMonitor } from './ops-monitor.js';
import { POST as invoiceSweep } from './invoice-sweep.js';
import { POST as opsDigest } from './ops-digest.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { status: res.status };
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Auth: the external scheduler's shared secret ──────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') ?? '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const job = (url.searchParams.get('job') || 'daily').toLowerCase();
  const started = new Date().toISOString();
  const results: Record<string, unknown> = {};

  const doDaily = job === 'daily' || job === 'all';
  const doWeekly = job === 'weekly' || job === 'all';
  const doDigest = job === 'digest' || job === 'all';

  if (!doDaily && !doWeekly && !doDigest) {
    return json({ error: `Unknown job '${job}'. Use daily | weekly | digest | all.` }, 400);
  }

  // In-process call to an ops endpoint with the same bearer secret (they now
  // require it — see api/_cronAuth.ts). No network hop, no public exposure.
  const callOps = async (name: string, fn: (r: Request) => Promise<Response>) => {
    try {
      const res = await fn(new Request(`https://internal/api/${name}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cronSecret}` },
      }));
      results[name] = await readJson(res);
    } catch (err) {
      results[name] = { ok: false, error: String(err) };
    }
  };

  if (doDaily) {
    // Retention lifecycle emails (trial expiry + inactivity nudges) — reuse the
    // existing handler with the same bearer auth so its logic stays single-source.
    try {
      const authed = new Request('https://internal/api/daily-email-cron', {
        method: 'GET',
        headers: { Authorization: `Bearer ${cronSecret}` },
      });
      const res = await dailyEmailCron(authed);
      results.retentionEmail = await readJson(res);
    } catch (err) {
      results.retentionEmail = { ok: false, error: String(err) };
    }
    // Opt-in daily notifications (daily horoscope / transit alerts / family
    // birthday reminders). Honest default: sends only when NOTIFY_LIVE=true.
    try {
      results.notifications = await runDailyNotifications();
    } catch (err) {
      results.notifications = { ok: false, error: String(err) };
    }
    // Daily ops: health checks + GST renewal invoice sweep.
    await callOps('ops-monitor', opsMonitor);
    await callOps('invoice-sweep', invoiceSweep);
  }

  if (doWeekly) {
    try {
      results.weeklyDigest = await runWeeklyDigestBatch();
    } catch (err) {
      results.weeklyDigest = { ok: false, error: String(err) };
    }
    // Monday integrity emphasis (ops-monitor already runs daily; this mirrors the old
    // Mon 07:00 cron so the weekly integrity pass is not lost).
    if (!doDaily) await callOps('ops-monitor', opsMonitor);
  }

  if (doDigest) {
    await callOps('ops-digest', opsDigest);
  }

  return json({ ok: true, job, started, finished: new Date().toISOString(), results });
}

// GET for the scheduler; POST for manual admin/workflow_dispatch triggers.
export const GET = handler;
export const POST = handler;
