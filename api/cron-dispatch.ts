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
//   job=weekly  → weekly digest batch (gated by DIGEST_LIVE)
//   job=all     → both (handy for manual workflow_dispatch)

import { GET as dailyEmailCron } from './daily-email-cron.js';
import { runDailyNotifications, runWeeklyDigestBatch } from './_notify.js';

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

  if (!doDaily && !doWeekly) {
    return json({ error: `Unknown job '${job}'. Use daily | weekly | all.` }, 400);
  }

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
  }

  if (doWeekly) {
    try {
      results.weeklyDigest = await runWeeklyDigestBatch();
    } catch (err) {
      results.weeklyDigest = { ok: false, error: String(err) };
    }
  }

  return json({ ok: true, job, started, finished: new Date().toISOString(), results });
}

// GET for the scheduler; POST for manual admin/workflow_dispatch triggers.
export const GET = handler;
export const POST = handler;
