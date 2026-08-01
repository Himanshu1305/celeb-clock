-- NOTES-promo-column.sql — add the missing profiles.promo_premium_until column.
-- NOT APPLIED. Run in Supabase Studio (BornClock project "Lifespan" /
-- jwrpqiypvystivtqyhro). Single statement; confirm the project breadcrumb first.
--
-- ROOT CAUSE (ADMIN-FIX Fix 1): the app reads/writes profiles.promo_premium_until
-- (src/hooks/useAuth.ts, and Admin.tsx's fetchUsers / grantPromo / revoke) but the
-- column was never migrated onto the live profiles table. fetchUsers EXPLICITLY
-- selected it, so PostgREST returned a 400 ("column does not exist"), the Users list
-- came back empty for EVERY admin, and grant/revoke writes silently failed.
--
-- The code now tolerates its absence (fetchUsers falls back to a select without this
-- column and shows a banner; grant/revoke surface the write error). Applying this
-- makes the promo-grant feature fully work and removes the fallback banner.

alter table public.profiles
  add column if not exists promo_premium_until timestamptz;

-- Verify:
--   select column_name from information_schema.columns
--   where table_schema = 'public' and table_name = 'profiles'
--     and column_name = 'promo_premium_until';
