-- =====================================================================
-- BORNCLOCK — ATOMIC CREDIT REDEMPTION
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- RUN MANUALLY IN SUPABASE STUDIO, ONE STATEMENT AT A TIME.
-- Do not attempt via Claude Code — no pg driver / CLI auth on this repo.
--
-- WHY THIS EXISTS
-- The old api/redeem-credit.ts did read-credits → decrement → unlock as
-- THREE separate PostgREST calls (three transactions). A double-fire of the
-- client auto-redeem effect (React remount / dep re-fire) therefore burned
-- TWO credits for ONE report: 3 → 1 was reproduced on report wugid5cz.
--
-- The fix mirrors issue_invoice() in NOTES-invoicing.sql: allocation +
-- mutation happen in ONE function call = ONE transaction, and the function
-- is IDEMPOTENT per report. A second call for an already-unlocked report
-- returns success WITHOUT decrementing.
--
-- DEPENDENCY: references birthday_reports.unlock_source. Run
-- NOTES-unlock-source.sql (adds that column) BEFORE this file, or the
-- CREATE FUNCTION below fails to compile.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STATEMENT 1 — redeem_report_credit()
--
-- THE ONLY WAY A REPORT CREDIT IS EVER SPENT.
--
-- Ordering is deliberate:
--   1. lock the report row FOR UPDATE — this serialises two concurrent
--      redemptions of the SAME report. The second waiter reads is_paid =
--      true (set by the first) and returns idempotently.
--   2. lock the profile row FOR UPDATE — no lost update on report_credits.
--   3. if the report is already paid → return current balance, spend nothing.
--   4. if no credits → 402-shaped result, spend nothing.
--   5. otherwise decrement + unlock + stamp unlock_source, all one txn.
--
-- Returns jsonb the API can map straight to an HTTP response.
-- ---------------------------------------------------------------------
create or replace function public.redeem_report_credit(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_paid  boolean;
  v_credits  integer;
begin
  -- 1. lock the report first (serialises same-report redemptions)
  select is_paid into v_is_paid
    from public.birthday_reports
   where slug = p_slug
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'report_not_found');
  end if;

  -- 2. lock the owning profile (no lost update on the balance)
  select report_credits into v_credits
    from public.profiles
   where user_id = p_user_id
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'user_not_found');
  end if;

  -- 3. IDEMPOTENT: already unlocked → succeed, decrement nothing
  if v_is_paid then
    return jsonb_build_object(
      'ok', true, 'already_paid', true,
      'credits_remaining', coalesce(v_credits, 0)
    );
  end if;

  -- 4. genuinely locked but no credits to spend
  if coalesce(v_credits, 0) <= 0 then
    return jsonb_build_object(
      'ok', false, 'error', 'no_credits',
      'credits_remaining', coalesce(v_credits, 0)
    );
  end if;

  -- 5. spend one credit and unlock, in this one transaction
  update public.profiles
     set report_credits = report_credits - 1
   where user_id = p_user_id;

  update public.birthday_reports
     set is_paid       = true,
         unlock_source = 'credit',
         expires_at    = now() + interval '30 days'
   where slug = p_slug;

  return jsonb_build_object(
    'ok', true, 'already_paid', false,
    'credits_remaining', v_credits - 1
  );
end;
$$;


-- ---------------------------------------------------------------------
-- STATEMENT 2 — let the service role (and only it) call the function
--
-- The API calls this with the service-role key. No user-facing grant:
-- redemption is server-authorised only.
-- ---------------------------------------------------------------------
revoke all on function public.redeem_report_credit(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_report_credit(uuid, text) to service_role;


-- =====================================================================
-- VERIFICATION — run after statement 2, on a throwaway account
-- =====================================================================

-- A. reset a test profile to 3 credits (matches the launch handoff)
-- set local role service_role;
-- update public.profiles set report_credits = 3 where email = 'hdixit@rediffmail.com';

-- B. redeem a genuinely locked report → expect ok=true, already_paid=false,
--    credits_remaining=2, and the row now is_paid=true, unlock_source='credit'.
-- select public.redeem_report_credit(
--   (select user_id from public.profiles where email = 'hdixit@rediffmail.com'),
--   'PUT_LOCKED_SLUG_HERE');

-- C. call it AGAIN with the same slug → expect ok=true, already_paid=true,
--    credits_remaining STILL 2. The reload/double-fire must not burn a credit.
-- select public.redeem_report_credit(
--   (select user_id from public.profiles where email = 'hdixit@rediffmail.com'),
--   'PUT_LOCKED_SLUG_HERE');

-- D. confirm the balance held at 2.
-- select report_credits from public.profiles where email = 'hdixit@rediffmail.com';
