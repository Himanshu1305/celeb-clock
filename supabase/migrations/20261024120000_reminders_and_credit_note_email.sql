-- 20261024120000_reminders_and_credit_note_email.sql
-- NEEDS FOUNDER APPROVAL TO APPLY. Additive and safe to re-run.
-- Apply BEFORE deploying the code that uses it (api/reminders.ts inserts these columns).
--
-- 1) birthday_reminders (audit round 2, T5 — /reminders never sent emails)
--    last_notified_year : birthday year already reminded → the daily job sends once per year
--    unsubscribe_token  : one-click "stop birthday reminders" link in every email
--    unsubscribed_at    : set by /api/unsubscribe?list=reminders; the job skips these rows
--    consent_at         : when the address owner (or signed-in user) agreed to reminder emails
ALTER TABLE public.birthday_reminders
  ADD COLUMN IF NOT EXISTS last_notified_year integer,
  ADD COLUMN IF NOT EXISTS unsubscribe_token  uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS unsubscribed_at    timestamptz,
  ADD COLUMN IF NOT EXISTS consent_at         timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS birthday_reminders_unsub_token_key
  ON public.birthday_reminders (unsubscribe_token);
CREATE INDEX IF NOT EXISTS birthday_reminders_notify_email_idx
  ON public.birthday_reminders (notify_email);
CREATE INDEX IF NOT EXISTS birthday_reminders_active_idx
  ON public.birthday_reminders (friend_dob)
  WHERE unsubscribed_at IS NULL AND notify_email IS NOT NULL;

-- Reminders are now saved only through /api/reminders (service role), which decides the
-- address to email (the account's own email, or a guest's address with consent). Close
-- the direct client insert so nobody can point reminders at an arbitrary inbox.
-- Select/delete of one's own rows stay as they are.
DROP POLICY IF EXISTS "own reminders - insert" ON public.birthday_reminders;

-- 2) credit_notes: emailed_at so the refund credit-note email is sent exactly once
--    (mirrors invoices.emailed_at, which now guards the purchase email).
ALTER TABLE public.credit_notes
  ADD COLUMN IF NOT EXISTS emailed_at timestamptz;
