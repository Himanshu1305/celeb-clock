-- =====================================================================
-- BORNCLOCK — GST INVOICING SCHEMA
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- RUN MANUALLY IN SUPABASE STUDIO, ONE STATEMENT AT A TIME.
-- Do not attempt via Claude Code — no pg driver / CLI auth on this repo.
-- After each statement, confirm success before moving to the next.
--
-- Statements 1–3 create structure. Statement 4 is the one that matters:
-- it is the only thing allowed to allocate an invoice number.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STATEMENT 1 — the counter table
--
-- One row per series. `next_value` is the number the NEXT invoice will
-- take. Deliberately a plain table, NOT a Postgres SEQUENCE: sequences
-- are non-transactional by design, so a rolled-back insert still burns
-- the number and leaves a permanent gap in the series.
-- ---------------------------------------------------------------------
create table public.invoice_counters (
  series      text primary key,
  next_value  bigint not null check (next_value > 0)
);


-- ---------------------------------------------------------------------
-- STATEMENT 2 — seed the two series for FY 2026-27
--
-- BC = domestic (India). BX = export under LUT.
-- Both start at 1001. Next April, insert 'BC/27-28' and 'BX/27-28'
-- at 1001 and change the series literals in statement 4.
-- ---------------------------------------------------------------------
insert into public.invoice_counters (series, next_value) values
  ('BC/26-27', 1001),
  ('BX/26-27', 1001);


-- ---------------------------------------------------------------------
-- STATEMENT 3 — the invoices table
--
-- Every field the invoice PDF renders is stored here at issue time.
-- Nothing is re-derived later: if GST rates change, or the buyer edits
-- their profile, already-issued invoices must not move.
--
-- Note the two constraints at the bottom — they are the safety net.
-- ---------------------------------------------------------------------
create table public.invoices (
  id                uuid primary key default gen_random_uuid(),

  -- identity
  invoice_no        text        not null unique,
  series            text        not null references public.invoice_counters(series),
  seq               bigint      not null,
  invoice_date      date        not null default current_date,

  -- payment linkage
  order_id          text        not null,
  payment_id        text        not null unique,   -- idempotency key
  user_id           uuid        references auth.users(id) on delete set null,

  -- buyer, frozen at issue time
  buyer_name        text        not null,
  buyer_email       text        not null,
  buyer_gstin       text,                          -- null = unregistered (B2C)
  buyer_country     text        not null,
  buyer_state       text,                          -- null for exports
  buyer_state_code  text,                          -- null for exports
  place_of_supply   text        not null,

  -- tax
  tax_mode          text        not null check (tax_mode in ('CGST_SGST','IGST','EXPORT')),
  currency          text        not null check (currency in ('INR','USD')),
  fx_rate           numeric(12,4),                 -- required when currency = USD
  gross_amount      numeric(12,2) not null,
  taxable_value     numeric(12,2) not null,
  cgst              numeric(12,2) not null default 0,
  sgst              numeric(12,2) not null default 0,
  igst              numeric(12,2) not null default 0,

  -- content + delivery
  line_items        jsonb       not null,
  pdf_url           text,
  emailed_at        timestamptz,
  created_at        timestamptz not null default now(),

  -- one number per series, ever
  constraint invoices_series_seq_unique unique (series, seq),

  -- the invoice must foot to the amount actually charged.
  -- if this ever fires, the rounding logic broke — do not relax it.
  constraint invoices_foots check (
    round(taxable_value + cgst + sgst + igst, 2) = round(gross_amount, 2)
  ),

  -- exports carry no tax and must record a conversion rate
  constraint invoices_export_shape check (
    tax_mode <> 'EXPORT'
    or (cgst = 0 and sgst = 0 and igst = 0 and fx_rate is not null)
  )
);

create index invoices_user_idx    on public.invoices (user_id);
create index invoices_payment_idx on public.invoices (payment_id);


-- ---------------------------------------------------------------------
-- STATEMENT 4 — issue_invoice()
--
-- THE ONLY WAY AN INVOICE NUMBER IS EVER ALLOCATED.
--
-- Allocation and insertion happen in ONE function call, therefore ONE
-- transaction. This is the whole point: PostgREST gives each HTTP
-- request its own transaction, so allocating via one call and inserting
-- via a second would leave a burnt number whenever anything fails in
-- between.
--
-- The UPDATE ... RETURNING takes a row lock on the counter, so two
-- simultaneous checkouts queue rather than collide.
--
-- Idempotent: Razorpay retries webhooks. A retry returns the invoice
-- already issued for that payment_id instead of issuing a second one.
-- ---------------------------------------------------------------------
create or replace function public.issue_invoice(p jsonb)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_series text;
  v_seq    bigint;
  v_row    public.invoices;
begin
  -- 1. already issued for this payment? return it, allocate nothing.
  select * into v_row
    from public.invoices
   where payment_id = p->>'payment_id';
  if found then
    return v_row;
  end if;

  -- 2. pick the series from the tax mode
  v_series := case
                when p->>'tax_mode' = 'EXPORT' then 'BX/26-27'
                else 'BC/26-27'
              end;

  -- 3. take the next number and advance the counter, under row lock
  update public.invoice_counters
     set next_value = next_value + 1
   where series = v_series
  returning next_value - 1 into v_seq;

  if v_seq is null then
    raise exception 'Unknown invoice series: %  (add it to invoice_counters)', v_series;
  end if;

  -- 4. insert, in the same transaction
  insert into public.invoices (
    invoice_no, series, seq,
    order_id, payment_id, user_id,
    buyer_name, buyer_email, buyer_gstin,
    buyer_country, buyer_state, buyer_state_code, place_of_supply,
    tax_mode, currency, fx_rate,
    gross_amount, taxable_value, cgst, sgst, igst,
    line_items
  ) values (
    v_series || '/' || v_seq, v_series, v_seq,
    p->>'order_id', p->>'payment_id', (p->>'user_id')::uuid,
    p->>'buyer_name', p->>'buyer_email', p->>'buyer_gstin',
    p->>'buyer_country', p->>'buyer_state', p->>'buyer_state_code', p->>'place_of_supply',
    p->>'tax_mode', p->>'currency', (p->>'fx_rate')::numeric,
    (p->>'gross_amount')::numeric, (p->>'taxable_value')::numeric,
    coalesce((p->>'cgst')::numeric, 0),
    coalesce((p->>'sgst')::numeric, 0),
    coalesce((p->>'igst')::numeric, 0),
    p->'line_items'
  )
  returning * into v_row;

  return v_row;

exception
  -- rare race: two concurrent retries for the same payment. the unique
  -- constraint on payment_id wins; return the row that landed first.
  -- this burns one counter value, which is an acceptable trade against
  -- ever issuing two invoices for one payment.
  when unique_violation then
    select * into v_row from public.invoices where payment_id = p->>'payment_id';
    return v_row;
end;
$$;


-- ---------------------------------------------------------------------
-- STATEMENT 5 — lock both tables down
--
-- RLS on with no policy on invoice_counters = service_role only.
-- Users may read their own invoices (for the account-page download),
-- and nothing else. No INSERT/UPDATE/DELETE policy exists for anyone.
-- ---------------------------------------------------------------------
alter table public.invoice_counters enable row level security;
alter table public.invoices         enable row level security;


-- ---------------------------------------------------------------------
-- STATEMENT 6 — the one user-facing read policy
-- ---------------------------------------------------------------------
create policy invoices_owner_read
  on public.invoices
  for select
  using (auth.uid() = user_id);


-- =====================================================================
-- VERIFICATION — run after statement 6, expect the noted results
-- =====================================================================

-- A. counters seeded, both at 1001
select * from public.invoice_counters order by series;

-- B. issue a throwaway domestic invoice; expect invoice_no BC/26-27/1001
select invoice_no, seq, gross_amount
from public.issue_invoice('{
  "order_id":"order_TEST", "payment_id":"pay_TEST_1", "user_id":null,
  "buyer_name":"Test Buyer", "buyer_email":"test@example.com",
  "buyer_country":"India", "buyer_state":"Telangana", "buyer_state_code":"36",
  "place_of_supply":"Telangana (36)",
  "tax_mode":"CGST_SGST", "currency":"INR",
  "gross_amount":199, "taxable_value":168.64, "cgst":15.18, "sgst":15.18,
  "line_items":[{"desc":"Test","qty":1,"gross":199}]
}'::jsonb);

-- C. call it AGAIN with the same payment_id.
--    expect the SAME invoice_no, and the counter still at 1002 — not 1003.
select invoice_no from public.issue_invoice('{
  "order_id":"order_TEST", "payment_id":"pay_TEST_1", "user_id":null,
  "buyer_name":"Test Buyer", "buyer_email":"test@example.com",
  "buyer_country":"India", "buyer_state":"Telangana", "buyer_state_code":"36",
  "place_of_supply":"Telangana (36)",
  "tax_mode":"CGST_SGST", "currency":"INR",
  "gross_amount":199, "taxable_value":168.64, "cgst":15.18, "sgst":15.18,
  "line_items":[{"desc":"Test","qty":1,"gross":199}]
}'::jsonb);

select * from public.invoice_counters where series = 'BC/26-27';

-- D. prove the foots-check bites. expect: ERROR, constraint violation.
--    (15.17 + 15.17 + 168.64 = 198.98, not 199 — the handoff figure.)
select public.issue_invoice('{
  "order_id":"order_TEST2", "payment_id":"pay_TEST_2", "user_id":null,
  "buyer_name":"Test Buyer", "buyer_email":"test@example.com",
  "buyer_country":"India", "buyer_state":"Telangana", "buyer_state_code":"36",
  "place_of_supply":"Telangana (36)",
  "tax_mode":"CGST_SGST", "currency":"INR",
  "gross_amount":199, "taxable_value":168.64, "cgst":15.17, "sgst":15.17,
  "line_items":[{"desc":"Test","qty":1,"gross":199}]
}'::jsonb);

-- E. CLEAN UP before any real payment. Counters must go back to 1001
--    so the first genuine invoice is BC/26-27/1001.
delete from public.invoices where payment_id like 'pay_TEST_%';
update public.invoice_counters set next_value = 1001 where series in ('BC/26-27','BX/26-27');
select * from public.invoice_counters order by series;


-- =====================================================================
-- STILL TO WRITE (separate NOTES file, before first refund):
--   credit_notes table + 'BN/26-27' series for Section 34 credit notes.
--   A refund without one leaves the GST already reported in GSTR-1
--   payable. Not needed to launch; needed before the first refund.
-- =====================================================================
