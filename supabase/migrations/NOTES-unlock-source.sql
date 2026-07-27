-- NOTES-unlock-source.sql — track HOW a birthday report got unlocked.
-- NOT APPLIED. Run in Supabase Studio (single statement). Confirm the BornClock
-- project breadcrumb first.
--
-- Powers the server-enforced "one free unlocked report during the 7-day trial"
-- (api/save-report.ts) and credit-unlock stamping (api/redeem-credit.ts). Until
-- this column exists, save-report/redeem-credit tolerate its absence and the
-- trial-free-report feature stays DORMANT (reports insert as today, is_paid=false).

-- Statement 1: track how a report got unlocked ('trial' | 'payment' | 'credit')
alter table public.birthday_reports
  add column if not exists unlock_source text;

-- Backfill note: existing is_paid=true rows may keep unlock_source = null — the
-- trial-usage check only counts unlock_source='trial', so nulls are harmless.
-- verify-payment.ts stamping ('payment') is intentionally DEFERRED (that file is
-- frozen post-GST); paid reports simply carry unlock_source = null. Acceptable gap.

-- Verify:
--   select count(*) from public.birthday_reports where unlock_source = 'trial';
