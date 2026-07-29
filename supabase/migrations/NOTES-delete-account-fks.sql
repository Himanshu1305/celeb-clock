-- =====================================================================
-- BORNCLOCK — DELETE-ACCOUNT FK HARDENING (belt-and-suspenders)
--
-- RUN MANUALLY IN SUPABASE STUDIO. Not executed by Claude Code.
--
-- WHY: three tables reference auth.users(id) with NO on-delete rule, so a
-- leftover row makes auth.admin.deleteUser() fail with a foreign-key violation.
-- The delete-account edge function now deletes these rows explicitly BEFORE
-- deleteUser, so this DDL is defence-in-depth: with ON DELETE CASCADE, deleting
-- the auth user cleans them up even if the function's explicit delete is skipped.
--
-- The constraints are unnamed inline FKs, so Postgres auto-named them
-- <table>_user_id_fkey. Confirm the exact names first:
--
--   select conname, conrelid::regclass as table
--     from pg_constraint
--    where contype = 'f'
--      and conrelid::regclass::text in
--          ('public.longevity_scores','public.celebrity_boosts','public.promo_code_redemptions')
--      and confrelid = 'auth.users'::regclass;
--
-- (Expected: longevity_scores_user_id_fkey, celebrity_boosts_user_id_fkey,
--  promo_code_redemptions_user_id_fkey. Adjust below if they differ.)
-- =====================================================================


-- 1. longevity_scores (user_id NOT NULL)
alter table public.longevity_scores
  drop constraint if exists longevity_scores_user_id_fkey,
  add  constraint longevity_scores_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;

-- 2. celebrity_boosts (user_id nullable — anonymous boosts use session_id)
alter table public.celebrity_boosts
  drop constraint if exists celebrity_boosts_user_id_fkey,
  add  constraint celebrity_boosts_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;

-- 3. promo_code_redemptions (user_id NOT NULL — one row per user redemption)
alter table public.promo_code_redemptions
  drop constraint if exists promo_code_redemptions_user_id_fkey,
  add  constraint promo_code_redemptions_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;


-- =====================================================================
-- NOTE: invoices, credit_notes and payments deliberately keep
-- ON DELETE SET NULL (retain GST records for 8 years, de-identified).
-- Do NOT change those to CASCADE.
-- =====================================================================
