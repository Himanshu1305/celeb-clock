-- NOTES-notifications.sql — P3 opt-in daily notifications. NOT APPLIED AUTOMATICALLY.
-- Review and run in Supabase Studio when you want the daily horoscope / transit-alert
-- channels live. Everything here is additive and safe (IF NOT EXISTS / nullable).
--
-- Context: the email_subscribers table already exists (NOTES-email-subscribers.sql) with
-- weekly_digest. These columns add the two new opt-in daily channels and the Moon-sign
-- index the daily job needs to render a real reading without recomputing the chart.
--
-- Nothing SENDS until you also set the worker secret NOTIFY_LIVE=true (daily channels)
-- and DIGEST_LIVE=true (weekly digest). With them unset the jobs run in dry-run and mail
-- no one. See api/_notify.ts and api/cron-dispatch.ts.

-- 1) email_subscribers: daily channels + Moon sign (0=Mesh … 11=Meen)
ALTER TABLE public.email_subscribers
  ADD COLUMN IF NOT EXISTS daily_horoscope boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transit_alerts  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rashi_index     integer;

-- Index the opted-in rows so the daily job's scan stays cheap as the list grows.
CREATE INDEX IF NOT EXISTS email_subscribers_daily_idx
  ON public.email_subscribers (daily_horoscope, transit_alerts)
  WHERE unsubscribed_at IS NULL;

-- 2) birthday_reminders already exists (supabase/migrations/birthday_reminders.sql).
--    It carries friend_name, friend_dob, relationship, remind_days_before, notify_email.
--    The daily job fires a reminder when a saved birthday is exactly remind_days_before
--    away (so each reminder fires once per year, given the scheduler runs once daily).
--    Optional hardening if you ever run the dispatcher more than once per day — a guard
--    column so a reminder can't double-send within a calendar year:
-- ALTER TABLE public.birthday_reminders
--   ADD COLUMN IF NOT EXISTS last_notified_year integer;

-- GitHub Actions scheduler secrets (repo Settings → Secrets, NOT Cloudflare):
--   CRON_TARGET_URL = https://bornclock-staging.usdvisionai.workers.dev   (while testing)
--   CRON_SECRET     = <the same value already set on the worker>
-- The workflow (.github/workflows/scheduled-tasks.yml) fires only from the DEFAULT branch.
