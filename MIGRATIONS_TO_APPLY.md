# Migrations to Apply

Run these in Supabase SQL Editor in order:

1. supabase/migrations/20260614120000_promo_codes.sql
   (from Wave 1 — may already be applied)

2. supabase/migrations/20260614130000_celebrity_boosts.sql
   (from Wave 1 — may already be applied)

3. supabase/migrations/20260614140000_longevity_scores.sql
   NEW — Longevity score tracking table

4. supabase/migrations/20260614150000_leaderboard.sql
   NEW — Longevity leaderboard table

5. supabase/migrations/20260614160000_family_members.sql
   NEW — Family longevity dashboard table

6. supabase/migrations/20260614170000_pdf_reports_log.sql
   NEW (Wave 3) — Birthday PDF generation quota tracking table

7. 20260615180000_subscription_fields.sql

8. 20260616120000_birthday_reports.sql — NEW · Birthday report storage with expiry (RLS)

To apply: go to supabase.com → your project → SQL Editor → paste content of each file → Run

---

# Environment Variables Needed

Add these to Vercel project settings (Settings → Environment Variables):

```
ANTHROPIC_API_KEY=your_key_here
```

Required for AI Longevity Coach feature (`/api/longevity-coach`).

Get your key from: console.anthropic.com

---

## Email System (Resend) — Added June 2026

Add these to Vercel project settings:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Required for all transactional emails via `/api/send-email`:
- Welcome email on signup
- Trial day 6 expiry warning
- Payment confirmation after Razorpay success
- Subscription cancellation confirmation
- Weekly re-engagement nudges (free + premium)

Get your key from: resend.com/api-keys
Sender domain: bornclock.com (already verified)
From address: hello@bornclock.com

**VERCEL_URL note:** The Razorpay webhook (`/api/razorpay-webhook`) calls
`/api/send-email` internally to send cancellation emails. Vercel automatically
sets `VERCEL_URL` (preview) and `VERCEL_PROJECT_PRODUCTION_URL` (production) —
no manual configuration required. If emails are not sending from the webhook,
verify both env vars are present in your Vercel project settings.

---

## P5-3 — (OPTIONAL) Durable AI-astrologer rate-limit store

The AI astrologer daily limit is now enforced **server-side** (per hashed client
IP) instead of being trusted from the browser — see
`src/lib/vedic/serverRateLimit.ts` and `api/vedic-chat.ts`. The default store is
in-memory per worker isolate: it already closes the "clear localStorage to reset"
bypass and resets at UTC midnight, but it is per-isolate (not shared across edge
locations and reset on restart).

For a GLOBALLY durable, tamper-proof counter, add EITHER:

**Option A — Cloudflare KV (recommended, no schema):** create a KV namespace and
bind it in `wrangler.toml` under `[env.staging]` (and production) as e.g.
`RATE_LIMIT_KV`, then swap the in-memory `Map` in `serverRateLimit.ts` for KV
reads/writes keyed by `"<hashedIp>:<utcDay>"` with a 48h TTL. Needs a Cloudflare
dashboard action (namespace creation) — a "Needs the person" item.

**Option B — Supabase usage table:** apply this DDL, then back `evaluate()` with
it (upsert + atomic increment via an RPC). Stores only a salted hash, never a raw
IP, and no PII:

```sql
create table if not exists ai_chat_usage (
  id          text primary key,          -- "<hashedIp>:<utcDay>"
  day         date not null,
  count       integer not null default 0,
  updated_at  timestamptz not null default now()
);
-- Service-role only; no public access.
alter table ai_chat_usage enable row level security;
-- (no policies → only the service role key used by the worker can read/write)
create index if not exists ai_chat_usage_day_idx on ai_chat_usage (day);
```

Either option is drop-in: the `peek()`/`record()` core is written against an
injectable store. Until then the in-memory limiter is live and tested.
