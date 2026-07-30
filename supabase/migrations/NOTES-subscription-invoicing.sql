-- =====================================================================
-- BORNCLOCK — SUBSCRIPTION INVOICING + EMAIL IDEMPOTENCY (place-of-supply)
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- RUN MANUALLY IN SUPABASE STUDIO, ONE STATEMENT AT A TIME.
-- Do not attempt via Claude Code — no pg driver / CLI auth on this repo.
-- After each statement, confirm success before moving to the next.
--
-- These columns are ADDITIVE and nullable. The application tolerates their
-- absence (try/catch → falls back to prior behaviour and logs a marker), so
-- deploying the code before these run is safe; renewals simply won't invoice
-- and the welcome guard falls back to the client-side guard until they exist.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STATEMENT 1 — persist the buyer's GST place-of-supply on the profile.
--
-- Written by verify-payment (inside the non-fatal invoice block only) on
-- the FIRST subscription payment. These are the authoritative place-of-
-- supply for every future renewal charge, which arrives via the (frozen)
-- razorpay-webhook and carries no region declaration of its own. The daily
-- invoice sweep reads them to issue renewal invoices.
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists buyer_state       text,
  add column if not exists buyer_state_code  text,
  add column if not exists buyer_country     text;


-- ---------------------------------------------------------------------
-- STATEMENT 2 — server-side send-once guard for the welcome email.
--
-- The confirmation link opens a NEW TAB, so two browser contexts race and
-- the per-context in-memory Set + localStorage guards both fire. This is
-- the authoritative claim: /api/send-email atomically sets welcomed_at
--   update profiles set welcomed_at = now()
--   where user_id = X and welcomed_at is null returning user_id
-- Exactly one context gets the row back and sends; the other sees no row
-- and returns 200 silently.
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists welcomed_at timestamptz;


-- =====================================================================
-- VERIFICATION
-- =====================================================================

-- A. columns exist
select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles'
   and column_name in ('buyer_state','buyer_state_code','buyer_country','welcomed_at')
 order by column_name;

-- B. (optional) after the founder's first subscription payment, confirm the
--    place-of-supply landed on the profile:
-- select user_id, buyer_country, buyer_state, buyer_state_code, welcomed_at
--   from public.profiles where buyer_state_code is not null;
