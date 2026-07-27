# OPS-ACTIVATION.md — how to turn on the monitor-only ops system

> **NOTHING IN THIS FILE HAS BEEN APPLIED.** The ops code is built but inert:
> `api/ops-monitor.ts` and `api/ops-digest.ts` are NOT registered in the Worker
> router, no crons for them exist, and `pending_reviews` does not exist in the DB.
> Apply these steps deliberately, in order, when ready. Each is reversible.

Artifacts already in the repo:
- `supabase/migrations/NOTES-ops-inbox.sql` — the table + RPC (not applied)
- `api/_ops.ts` — shared helpers (writeReview / autoResolve / sendOpsAlert)
- `api/ops-monitor.ts` — health checks (not routed)
- `api/ops-digest.ts` — daily digest email (not routed)
- Admin **Ops** tab — already shipped; shows all-clear until the table exists.

---

## Step 1 — Create the DB table + RPC (Supabase Studio)

Open Studio → SQL editor. **Confirm the project breadcrumb is the BornClock
project (`jwrpqiypvystivtqyhro`)** — DDL has been run against the wrong project
before. Run the statements in `supabase/migrations/NOTES-ops-inbox.sql`
**ONE AT A TIME** (Studio silently rolls back large multi-statement pastes — see
ARCHITECTURE-DECISIONS §2). Verify at the end:

```sql
SELECT count(*) FROM public.pending_reviews;                 -- 0
SELECT proname, prosecdef FROM pg_proc WHERE proname='mark_review_reviewed'; -- prosecdef = t
```

## Step 2 — Set the ADMIN_EMAIL secret (Cloudflare)

```bash
# value only reaches the Worker; falls back to himanshu1305@gmail.com if unset.
printf '%s' 'himanshu1305@gmail.com' | ./node_modules/.bin/wrangler secret put ADMIN_EMAIL
# (optional) point the monitor at a specific base URL for the create-order probe:
printf '%s' 'https://bornclock.com' | ./node_modules/.bin/wrangler secret put OPS_BASE_URL
```
Never use `npx wrangler` (re-downloads, hangs). Verify: `./node_modules/.bin/wrangler secret list`.

## Step 3 — Register the routes in `functions/_worker.ts`

Add the imports (note `.js` extensions — required for the Worker ESM runtime):

```ts
import { POST as opsMonitor } from '../api/ops-monitor.js';
import { POST as opsDigest }  from '../api/ops-digest.js';
```

Add to the `apiRoutes` map:

```ts
  '/api/ops-monitor': opsMonitor,
  '/api/ops-digest':  opsDigest,
```

## Step 4 — Wire the scheduled() dispatch in `functions/_worker.ts`

The Worker already has one `scheduled()` handler that calls the daily-email cron.
Multiple crons all invoke the SAME `scheduled()` function, so branch on
`event.cron`. Replace the current `scheduled` with:

```ts
  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    bridgeEnv(env);
    const base = process.env.OPS_BASE_URL || 'https://bornclock.usdvisionai.workers.dev';
    switch (event.cron) {
      case '0 6 * * *':                 // existing daily email
        return cronHandler.scheduled(event, env, ctx);
      case '10 6 * * *':                // ops monitor — daily 06:10 UTC (all checks incl. integrity)
        ctx.waitUntil(fetch(`${base}/api/ops-monitor`, { method: 'POST' }));
        return;
      case '0 7 * * 1':                 // integrity emphasis — Monday 07:00 UTC
        ctx.waitUntil(fetch(`${base}/api/ops-monitor`, { method: 'POST' }));
        return;
      case '0 9 * * 0':                 // digest — Sunday 09:00 UTC
        ctx.waitUntil(fetch(`${base}/api/ops-digest`, { method: 'POST' }));
        return;
      default:
        return cronHandler.scheduled(event, env, ctx);
    }
  },
```

> Note on times: the prompt's "daily 06:00 monitor" is scheduled at **06:10**
> (`10 6 * * *`) because the existing daily-email cron already owns the exact
> `0 6 * * *` expression, and two crons cannot share an identical expression
> (`event.cron` could not tell them apart). 06:10 preserves the daily-06:00 intent.
> The Mon 07:00 run is an integrity emphasis pass (ops-monitor already runs the
> integrity check daily). Adjust freely.

## Step 5 — Add the cron triggers in `wrangler.toml`

Current: `crons = ["0 6 * * *"]`. Change to:

```toml
[triggers]
crons = [
  "0 6 * * *",    # daily email (existing)
  "10 6 * * *",   # ops monitor — daily 06:10 UTC
  "0 7 * * 1",    # integrity emphasis — Mon 07:00 UTC
  "0 9 * * 0",    # ops digest — Sun 09:00 UTC
]
```

## Step 6 — Deploy & smoke test

```bash
./node_modules/.bin/wrangler deploy
# run the monitor once by hand:
curl -s -X POST https://bornclock.com/api/ops-monitor | head
# force the digest (sends nothing if no open items):
curl -s -X POST https://bornclock.com/api/ops-digest
```
Then open `/admin` → **Ops** tab. A healthy run shows "All clear"; a failing
create-order sentinel produces an urgent row + an email to ADMIN_EMAIL.

## Rollback

Remove the three added lines from `wrangler.toml [triggers]`, revert the
`_worker.ts` route + scheduled changes, redeploy. The table can stay (harmless)
or be dropped: `DROP TABLE public.pending_reviews; DROP FUNCTION public.mark_review_reviewed(bigint);`.

---

# Weekly Digest (retention) — activation (BUILD-NOT-DEPLOYED)

The retention email is **built but inert**: `api/subscribe.ts`, `api/weekly-digest.ts`,
`api/unsubscribe.ts` are routed in the Worker, but the `email_subscribers` table does
not exist yet and NO cron sends the digest. Soft capture on `/results` degrades
gracefully (returns ok:false) until the table exists.

### Step A — Create the table (Supabase Studio, one statement at a time)
Run `supabase/migrations/NOTES-email-subscribers.sql` (email_subscribers table + RLS +
`profiles.weekly_digest` column). Verify with the queries at the bottom of that file.

### Step B — (already done) routes
`/api/subscribe`, `/api/weekly-digest`, `/api/unsubscribe` are registered in
`functions/_worker.ts` `apiRoutes`. No action needed.

### Step C — Schedule the weekly send (when ready — DO NOT APPLY NOW)
The digest is single-recipient by design this session (compose + send to one address).
Before scheduling a fan-out, add a batch path to `api/weekly-digest.ts` that pages
`email_subscribers WHERE weekly_digest AND unsubscribed_at IS NULL` and sends per row
(respecting Resend rate limits). Then add ONE cron to `wrangler.toml [triggers]`:

```toml
  "0 8 * * 1",   # weekly digest — Monday 08:00 UTC
```

and a branch in the Worker `scheduled()` switch (mirrors the ops pattern):

```ts
      case '0 8 * * 1':                 // weekly digest — Mon 08:00 UTC
        ctx.waitUntil(fetch(`${base}/api/weekly-digest`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"batch":true}' }));
        return;
```

### Step D — Test send (single email to ADMIN_EMAIL)
```bash
curl -s -X POST https://bornclock.com/api/weekly-digest -H 'content-type: application/json' -d '{"test":true}'
# → { "sent": true, "to": "<ADMIN_EMAIL>", ... }
```
Unsubscribe: every digest carries `https://bornclock.com/api/unsubscribe?token=<row token>`.
