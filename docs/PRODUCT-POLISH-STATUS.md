# Product-Polish Batch — Status Log

Branch: `product-polish` (off develop, up to date w/ origin). Local commits per phase.
No push until final gate. Started 2026-07-27.

Morning source of truth. One entry appended per phase.

Payment files NEVER edited: api/razorpay-webhook.ts, api/verify-payment.ts, api/_crypto.ts.

---

## Phase 0 — Ops Activation (code side)

Applied `docs/OPS-ACTIVATION.md` Steps 3-5 (code only; founder does Step 1 SQL + Step 2
secret + Step 6 deploy manually).

- **Step 3 (routes):** registered `import { POST as opsMonitor } from '../api/ops-monitor.js'`
  and `opsDigest` from `../api/ops-digest.js`; added `'/api/ops-monitor'` + `'/api/ops-digest'`
  to `apiRoutes` in `functions/_worker.ts`.
- **Step 4 (scheduled dispatch):** replaced the single `cronHandler.scheduled` call with a
  `switch (event.cron)` branching exactly per doc — `0 6 * * *`→daily email,
  `10 6 * * *`→ops-monitor, `0 7 * * 1`→ops-monitor (integrity), `0 9 * * 0`→ops-digest,
  default→daily email. `base = process.env.OPS_BASE_URL || workers.dev`.
- **Step 5 (crons):** `wrangler.toml [triggers]` expanded from `["0 6 * * *"]` to the 4-cron
  block, verbatim from the doc (no invented schedules).
- **Extra (required for correctness):** added `ADMIN_EMAIL`, `OPS_BASE_URL` to `BRIDGE_KEYS`
  so those secrets reach `process.env` through the CF Proxy-env shim (ops handlers read
  `process.env.ADMIN_EMAIL` / `OPS_BASE_URL`; without bridging they'd silently fall back).

Schedules NOT activated in production (deploy is founder Step 6 / final gate only).
Evidence: `git diff functions/_worker.ts wrangler.toml` pasted in session — matches doc.

Status: DONE. Commit: chore(ops): wire ops-monitor/digest routes + scheduled dispatch + crons.
