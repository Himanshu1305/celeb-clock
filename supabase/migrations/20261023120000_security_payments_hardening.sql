-- =====================================================================
-- 20261023120000_security_payments_hardening.sql
-- BornClock (Supabase project jwrpqiypvystivtqyhro)
--
-- NEEDS FOUNDER APPROVAL TO APPLY. Not applied by the fix branch.
-- Apply AFTER the matching code (branch fix-security-payments) is deployed:
-- the report page must already read through /api/report before step 1 removes
-- the browser's direct read access. Every statement is idempotent.
--
-- Live state checked read-only on 23 Oct 2026 before writing this:
--   * birthday_reports SELECT policy "Anyone can read reports by slug" =
--     (expires_at > now()) for role public  → any anon key lists every report.
--   * birthday_reports has NO insert/update policy and anon/authenticated hold
--     only SELECT (writes were closed on 22 Oct) — nothing to change there.
--   * profiles: users may INSERT/UPDATE their own row; trigger
--     trg_guard_premium_columns (BEFORE UPDATE) protects only premium_status,
--     subscription_id/plan/status, premium_until. NOT protected: report_credits,
--     credits_granted_month, promo_premium_until, created_at (= the 7-day trial
--     clock). No INSERT guard.
--   * promo_codes: "Anyone can read promo codes" (USING true) → all codes listable.
--   * issue_invoice(jsonb) / issue_credit_note(jsonb) are SECURITY DEFINER and
--     EXECUTE-able by anon → anyone could create invoices / burn GST numbers.
--   * All 10 paid reports have expires_at in the past (30-day expiry).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. birthday_reports — no public listing; paid reports are permanent
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can read reports by slug" on public.birthday_reports;

-- Owners keep reading their own rows ("Users can read own reports" is kept).
-- Admin dashboard counts still work for admins:
drop policy if exists "Admins can read all reports" on public.birthday_reports;
create policy "Admins can read all reports"
  on public.birthday_reports for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));

-- Belt and braces: browsers never write reports (server APIs use service role).
revoke insert, update, delete, truncate on public.birthday_reports from anon, authenticated;

-- Founder decision (Oct 2026): paid reports never expire. Restore every paid
-- report (all 10 live paid reports had already "expired").
update public.birthday_reports
   set expires_at = 'infinity'
 where is_paid = true
   and expires_at <> 'infinity';


-- ---------------------------------------------------------------------
-- 2. profiles — server-only entitlement columns (extends the column guard)
-- ---------------------------------------------------------------------
create or replace function public.guard_premium_columns()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- Server paths (service role), dashboard/SQL-editor maintenance, and admins.
  if current_setting('role', true) = 'service_role'
     or session_user in ('postgres', 'supabase_admin')
     or public.has_role(auth.uid(), 'admin'::app_role) then
    return new;
  end if;

  if (new.premium_status        is distinct from old.premium_status)
  or (new.subscription_id       is distinct from old.subscription_id)
  or (new.subscription_plan     is distinct from old.subscription_plan)
  or (new.subscription_status   is distinct from old.subscription_status)
  or (new.premium_until         is distinct from old.premium_until)
  or (new.report_credits        is distinct from old.report_credits)
  or (new.credits_granted_month is distinct from old.credits_granted_month)
  or (new.promo_premium_until   is distinct from old.promo_premium_until)
  or (new.created_at            is distinct from old.created_at)   -- trial clock
  or (new.user_id               is distinct from old.user_id)
  then
    raise exception
      'Direct writes to premium/subscription/credit/trial columns are not allowed. '
      'Use the server-side payment, credit or promo endpoints.';
  end if;

  return new;
end;
$function$;

-- (trg_guard_premium_columns BEFORE UPDATE already points at this function.)
drop trigger if exists trg_guard_premium_columns on public.profiles;
create trigger trg_guard_premium_columns
  before update on public.profiles
  for each row execute function public.guard_premium_columns();

-- INSERT guard: a browser-side insert can never start with entitlements.
-- handle_new_user() sets none of these columns, so forcing defaults is a no-op
-- for normal sign-ups.
create or replace function public.guard_profile_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if current_setting('role', true) = 'service_role'
     or session_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  new.premium_status        := false;
  new.subscription_id       := null;
  new.subscription_plan     := null;
  new.subscription_status   := 'none';
  new.premium_until         := null;
  new.report_credits        := 0;
  new.credits_granted_month := null;
  new.promo_premium_until   := null;
  new.created_at            := now();
  return new;
end;
$function$;

drop trigger if exists trg_guard_profile_insert on public.profiles;
create trigger trg_guard_profile_insert
  before insert on public.profiles
  for each row execute function public.guard_profile_insert();


-- ---------------------------------------------------------------------
-- 3. Promo codes — validated and applied only by /api/redeem-promo
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can read promo codes" on public.promo_codes;
drop policy if exists "Admins manage promo codes" on public.promo_codes;
create policy "Admins manage promo codes"
  on public.promo_codes for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role))
  with check (public.has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Authenticated users can redeem" on public.promo_code_redemptions;
-- ("Users can see their redemptions" — SELECT own rows — is kept.)
revoke insert, update, delete, truncate on public.promo_code_redemptions from anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. One free trial report per person (S17)
-- ---------------------------------------------------------------------
-- Keyed by normalised email (lower-case, +tag dropped, Gmail dots dropped).
-- Kept when the account is deleted, so delete-and-re-sign-up cannot re-claim.
create table if not exists public.trial_claims (
  normalized_email text primary key,
  user_id          uuid references auth.users(id) on delete set null,
  claimed_at       timestamptz not null default now()
);
alter table public.trial_claims enable row level security;   -- no policies: service role only
revoke all on public.trial_claims from anon, authenticated;

-- Backfill: people who already used their trial report.
insert into public.trial_claims (normalized_email, user_id, claimed_at)
select distinct on (k.normalized_email) k.normalized_email, k.user_id, k.created_at
from (
  select
    case
      when split_part(lower(u.email), '@', 2) in ('gmail.com', 'googlemail.com')
        then replace(split_part(split_part(lower(u.email), '@', 1), '+', 1), '.', '') || '@gmail.com'
      else split_part(split_part(lower(u.email), '@', 1), '+', 1) || '@' || split_part(lower(u.email), '@', 2)
    end as normalized_email,
    r.user_id,
    r.created_at
  from public.birthday_reports r
  join auth.users u on u.id = r.user_id
  where r.unlock_source = 'trial' and u.email is not null
) k
order by k.normalized_email, k.created_at
on conflict (normalized_email) do nothing;


-- ---------------------------------------------------------------------
-- 5. SECURITY DEFINER functions: server (service role) only
-- ---------------------------------------------------------------------
revoke execute on function public.issue_invoice(jsonb)               from public, anon, authenticated;
revoke execute on function public.issue_credit_note(jsonb)           from public, anon, authenticated;
revoke execute on function public.increment_report_view_count(uuid)  from public, anon, authenticated;
revoke execute on function public.touch_report_view(text)            from public, anon, authenticated;
grant  execute on function public.issue_invoice(jsonb)               to service_role;
grant  execute on function public.issue_credit_note(jsonb)           to service_role;
grant  execute on function public.increment_report_view_count(uuid)  to service_role;
grant  execute on function public.touch_report_view(text)            to service_role;


-- ---------------------------------------------------------------------
-- 6. Credit-unlocked reports are permanent too
-- ---------------------------------------------------------------------
create or replace function public.redeem_report_credit(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_is_paid  boolean;
  v_owner    uuid;
  v_credits  integer;
begin
  select is_paid, user_id into v_is_paid, v_owner
    from public.birthday_reports
   where slug = p_slug
   for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'report_not_found');
  end if;
  if v_owner is distinct from p_user_id then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;
  select report_credits into v_credits
    from public.profiles
   where user_id = p_user_id
   for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'user_not_found');
  end if;
  if v_is_paid then
    return jsonb_build_object('ok', true, 'already_paid', true,
                              'credits_remaining', coalesce(v_credits, 0));
  end if;
  if coalesce(v_credits, 0) <= 0 then
    return jsonb_build_object('ok', false, 'error', 'no_credits',
                              'credits_remaining', coalesce(v_credits, 0));
  end if;
  update public.profiles
     set report_credits = report_credits - 1
   where user_id = p_user_id;
  update public.birthday_reports
     set is_paid       = true,
         unlock_source = 'credit',
         expires_at    = 'infinity'          -- was now() + 30 days
   where slug = p_slug;
  return jsonb_build_object('ok', true, 'already_paid', false,
                            'credits_remaining', v_credits - 1);
end;
$function$;
revoke execute on function public.redeem_report_credit(uuid, text) from public, anon, authenticated;
grant  execute on function public.redeem_report_credit(uuid, text) to service_role;


-- ---------------------------------------------------------------------
-- 7. Credit notes use the same GST split as invoices
-- ---------------------------------------------------------------------
-- Full refund → the credit note mirrors the invoice's stored lines exactly.
-- Partial refund → equal CGST/SGST heads, each round(gross × 9/118, 2), taxable
-- = gross − heads (IGST: round(gross × 18/118, 2)); always foots to the total.
create or replace function public.issue_credit_note(p jsonb)
returns credit_notes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_inv     public.invoices;
  v_seq     bigint;
  v_row     public.credit_notes;
  v_gross   numeric(12,2);
  v_taxable numeric(12,2);
  v_cgst    numeric(12,2) := 0;
  v_sgst    numeric(12,2) := 0;
  v_igst    numeric(12,2) := 0;
begin
  select * into v_row from public.credit_notes where refund_id = p->>'refund_id';
  if found then
    return v_row;
  end if;

  select * into v_inv from public.invoices where payment_id = p->>'payment_id';
  if not found then
    raise exception 'No invoice found for payment_id %', p->>'payment_id';
  end if;

  v_gross := coalesce((p->>'gross_amount')::numeric, v_inv.gross_amount);
  if v_gross > v_inv.gross_amount then
    raise exception 'Credit note amount % exceeds invoice amount %', v_gross, v_inv.gross_amount;
  end if;

  if v_gross = v_inv.gross_amount then
    v_taxable := v_inv.taxable_value;
    v_cgst := v_inv.cgst; v_sgst := v_inv.sgst; v_igst := v_inv.igst;
  elsif v_inv.tax_mode = 'EXPORT' then
    v_taxable := v_gross;
  elsif v_inv.tax_mode = 'IGST' then
    v_igst    := round(v_gross * 18 / 118, 2);
    v_taxable := v_gross - v_igst;
  else
    v_cgst    := round(v_gross * 9 / 118, 2);
    v_sgst    := v_cgst;
    v_taxable := v_gross - v_cgst - v_sgst;
  end if;

  update public.invoice_counters
     set next_value = next_value + 1
   where series = 'BN/26-27'
  returning next_value - 1 into v_seq;
  if v_seq is null then
    raise exception 'Series BN/26-27 missing from invoice_counters';
  end if;

  insert into public.credit_notes (
    credit_note_no, series, seq,
    invoice_id, original_invoice_no, original_invoice_date,
    refund_id, reason,
    user_id, buyer_name, buyer_email,
    tax_mode, currency,
    gross_amount, taxable_value, cgst, sgst, igst
  ) values (
    'BN/26-27/' || v_seq, 'BN/26-27', v_seq,
    v_inv.id, v_inv.invoice_no, v_inv.invoice_date,
    p->>'refund_id',
    coalesce(p->>'reason', 'Customer refund — 7-day guarantee'),
    v_inv.user_id, v_inv.buyer_name, v_inv.buyer_email,
    v_inv.tax_mode, v_inv.currency,
    v_gross, v_taxable, v_cgst, v_sgst, v_igst
  )
  returning * into v_row;
  return v_row;
exception
  when unique_violation then
    select * into v_row from public.credit_notes where refund_id = p->>'refund_id';
    return v_row;
end;
$function$;
revoke execute on function public.issue_credit_note(jsonb) from public, anon, authenticated;
grant  execute on function public.issue_credit_note(jsonb) to service_role;


-- ---------------------------------------------------------------------
-- Verify after applying (read-only):
--   select policyname from pg_policies where tablename = 'birthday_reports';
--     -- expect: "Users can read own reports", "Admins can read all reports"
--   select count(*) from birthday_reports where is_paid and expires_at <> 'infinity';  -- expect 0
--   select has_function_privilege('anon', 'public.issue_invoice(jsonb)', 'execute');   -- expect false
-- =====================================================================
