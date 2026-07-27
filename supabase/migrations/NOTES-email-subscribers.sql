-- NOTES-email-subscribers.sql — email capture + weekly digest opt-in.
-- NOT APPLIED. Run in Supabase Studio ONE STATEMENT AT A TIME (Studio silently
-- rolls back large multi-statement pastes — see ARCHITECTURE-DECISIONS §2).
-- Confirm the project breadcrumb is the BornClock project before running.
--
-- Powers: api/subscribe.ts (soft capture on /results), api/weekly-digest.ts,
-- api/unsubscribe.ts. Until this is applied those endpoints tolerate the missing
-- table/column and no-op gracefully.

-- 1) Anonymous / soft email capture (no account required).
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email             text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  source            text,                       -- e.g. 'results-page'
  consent_marketing boolean NOT NULL DEFAULT false,
  weekly_digest     boolean NOT NULL DEFAULT true,
  dob               date,                       -- optional, for personalisation
  country_code      text,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribed_at   timestamptz
);

-- 2) One row per email (idempotent capture).
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_key
  ON public.email_subscribers (lower(email));

-- 3) Fast lookup by unsubscribe token.
CREATE INDEX IF NOT EXISTS email_subscribers_token_idx
  ON public.email_subscribers (unsubscribe_token);

-- 4) RLS: lock the table down. The service-role key (used by the Worker API)
--    bypasses RLS; anon/authenticated get NO direct access — all writes go
--    through the vetted API endpoints.
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_subscribers FROM anon, authenticated;

-- 5) Weekly-digest opt-in for logged-in users lives on their profile (the
--    audit's existing storage location for account-holder email preferences).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_digest boolean NOT NULL DEFAULT false;

-- Verify:
--   SELECT count(*) FROM public.email_subscribers;                          -- 0
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='profiles' AND column_name='weekly_digest';          -- 1 row
