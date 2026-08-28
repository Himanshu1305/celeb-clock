-- =====================================================================
-- BORNCLOCK — GST invoicing schema (version-controlled) + FX provenance
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- WHY THIS MIGRATION EXISTS
-- The invoicing schema (invoices, invoice_counters, issue_invoice()) was
-- previously defined ONLY in supabase/migrations/NOTES-invoicing.sql — an
-- "operational note" that is not part of the applied migration history. The
-- August 2026 payments audit found it HAD been applied by hand to the live DB,
-- but nothing in version control recorded that. If the project were ever rebuilt
-- from migrations, invoicing would silently be absent and every payment would
-- succeed while quietly issuing no GST invoice (caught non-fatally in
-- verify-payment.ts). This migration captures the applied schema so it can never
-- be silently missing again.
--
-- It is IDEMPOTENT (create ... if not exists / create or replace /
-- on conflict do nothing / drop policy if exists) and therefore SAFE to run
-- against the already-provisioned live DB: it is a no-op there except for the
-- two new fx_rate_* provenance columns and the refreshed issue_invoice() body.
--
-- Apply order note: this file also depends on nothing outside auth.users. The
-- credit_notes table (NOTES-credit-notes.sql) is orthogonal and not recreated
-- here. Run in Supabase Studio one statement at a time if applying by hand;
-- confirm the project breadcrumb (jwrpqiypvystivtqyhro) first.
-- =====================================================================


-- STATEMENT 1 — counter table (plain table, NOT a sequence: a rolled-back
-- insert must not burn a number and leave a permanent gap in the series).
create table if not exists public.invoice_counters (
  series      text primary key,
  next_value  bigint not null check (next_value > 0)
);

-- STATEMENT 2 — seed FY 2026-27 series. on conflict do nothing so re-running
-- NEVER resets a live counter back to 1001 (that would double-issue numbers).
insert into public.invoice_counters (series, next_value) values
  ('BC/26-27', 1001),   -- domestic (CGST+SGST or IGST)
  ('BX/26-27', 1001)    -- export under LUT (zero-rated)
on conflict (series) do nothing;

-- STATEMENT 3 — invoices table. Every field the PDF renders is frozen here at
-- issue time; nothing is re-derived later.
create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  invoice_no        text        not null unique,
  series            text        not null references public.invoice_counters(series),
  seq               bigint      not null,
  invoice_date      date        not null default current_date,
  order_id          text        not null,
  payment_id        text        not null unique,   -- idempotency key
  user_id           uuid        references auth.users(id) on delete set null,
  buyer_name        text        not null,
  buyer_email       text        not null,
  buyer_gstin       text,
  buyer_country     text        not null,
  buyer_state       text,
  buyer_state_code  text,
  place_of_supply   text        not null,
  tax_mode          text        not null check (tax_mode in ('CGST_SGST','IGST','EXPORT')),
  currency          text        not null check (currency in ('INR','USD')),
  fx_rate           numeric(12,4),
  gross_amount      numeric(12,2) not null,
  taxable_value     numeric(12,2) not null,
  cgst              numeric(12,2) not null default 0,
  sgst              numeric(12,2) not null default 0,
  igst              numeric(12,2) not null default 0,
  line_items        jsonb       not null,
  pdf_url           text,
  emailed_at        timestamptz,
  created_at        timestamptz not null default now(),
  constraint invoices_series_seq_unique unique (series, seq),
  constraint invoices_foots check (
    round(taxable_value + cgst + sgst + igst, 2) = round(gross_amount, 2)
  ),
  constraint invoices_export_shape check (
    tax_mode <> 'EXPORT'
    or (cgst = 0 and sgst = 0 and igst = 0 and fx_rate is not null)
  )
);

create index if not exists invoices_user_idx    on public.invoices (user_id);
create index if not exists invoices_payment_idx on public.invoices (payment_id);

-- STATEMENT 4 — FX provenance columns (audit fix 2.6). An export invoice carries
-- a fixed fallback rate today; these record WHEN it was captured and WHERE it
-- came from, so the invoice never presents a stale rate as a live one.
alter table public.invoices add column if not exists fx_rate_date   date;
alter table public.invoices add column if not exists fx_rate_source text;

-- STATEMENT 5 — issue_invoice(): THE ONLY way an invoice number is allocated.
-- Allocation + insert in ONE transaction; idempotent by payment_id; row-locks
-- the counter. Refreshed here to also persist fx_rate_date / fx_rate_source.
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
  select * into v_row from public.invoices where payment_id = p->>'payment_id';
  if found then
    return v_row;
  end if;

  -- 2. series from tax mode
  v_series := case when p->>'tax_mode' = 'EXPORT' then 'BX/26-27' else 'BC/26-27' end;

  -- 3. take the next number under row lock
  update public.invoice_counters
     set next_value = next_value + 1
   where series = v_series
  returning next_value - 1 into v_seq;

  if v_seq is null then
    raise exception 'Unknown invoice series: %  (add it to invoice_counters)', v_series;
  end if;

  -- 4. insert in the same transaction
  insert into public.invoices (
    invoice_no, series, seq,
    order_id, payment_id, user_id,
    buyer_name, buyer_email, buyer_gstin,
    buyer_country, buyer_state, buyer_state_code, place_of_supply,
    tax_mode, currency, fx_rate, fx_rate_date, fx_rate_source,
    gross_amount, taxable_value, cgst, sgst, igst,
    line_items
  ) values (
    v_series || '/' || v_seq, v_series, v_seq,
    p->>'order_id', p->>'payment_id', (p->>'user_id')::uuid,
    p->>'buyer_name', p->>'buyer_email', p->>'buyer_gstin',
    p->>'buyer_country', p->>'buyer_state', p->>'buyer_state_code', p->>'place_of_supply',
    p->>'tax_mode', p->>'currency', (p->>'fx_rate')::numeric,
    (p->>'fx_rate_date')::date, p->>'fx_rate_source',
    (p->>'gross_amount')::numeric, (p->>'taxable_value')::numeric,
    coalesce((p->>'cgst')::numeric, 0),
    coalesce((p->>'sgst')::numeric, 0),
    coalesce((p->>'igst')::numeric, 0),
    p->'line_items'
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    -- concurrent retry for the same payment: return the row that landed first.
    select * into v_row from public.invoices where payment_id = p->>'payment_id';
    return v_row;
end;
$$;

-- STATEMENT 6 — lock both tables down (service-role only, plus owner read).
alter table public.invoice_counters enable row level security;
alter table public.invoices         enable row level security;

drop policy if exists invoices_owner_read on public.invoices;
create policy invoices_owner_read
  on public.invoices
  for select
  using (auth.uid() = user_id);
