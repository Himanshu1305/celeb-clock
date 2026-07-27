-- =====================================================================
-- BORNCLOCK — GST CREDIT NOTES (Section 34, for refunds)
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- RUN MANUALLY IN SUPABASE STUDIO, ONE STATEMENT AT A TIME.
-- Required BEFORE cutover because the 7-day money-back guarantee is
-- advertised at every buy point: a refund without a credit note leaves
-- the GST already reported in GSTR-1 payable by us.
--
-- Mirrors the invoicing pattern exactly: counter table row, atomic
-- issue function, idempotent on the Razorpay refund id, foots check.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STATEMENT 1 — seed the credit-note series (reuses invoice_counters)
-- BN = credit Note. 13 chars with number, within the 16-char limit.
-- ---------------------------------------------------------------------
insert into public.invoice_counters (series, next_value) values
  ('BN/26-27', 1001);


-- ---------------------------------------------------------------------
-- STATEMENT 2 — credit_notes table
-- Every field frozen at issue time, mirroring the original invoice.
-- ---------------------------------------------------------------------
create table public.credit_notes (
  id                 uuid primary key default gen_random_uuid(),

  credit_note_no     text        not null unique,
  series             text        not null references public.invoice_counters(series),
  seq                bigint      not null,
  credit_note_date   date        not null default current_date,

  -- linkage: the invoice being reversed and the Razorpay refund
  invoice_id         uuid        not null references public.invoices(id),
  original_invoice_no text       not null,
  original_invoice_date date     not null,
  refund_id          text        not null unique,   -- Razorpay rfnd_... — idempotency key
  reason             text        not null default 'Customer refund — 7-day guarantee',

  user_id            uuid        references auth.users(id) on delete set null,
  buyer_name         text        not null,
  buyer_email        text        not null,

  -- amounts credited (mirror the original invoice's split; partial allowed)
  tax_mode           text        not null check (tax_mode in ('CGST_SGST','IGST','EXPORT')),
  currency           text        not null check (currency in ('INR','USD')),
  gross_amount       numeric(12,2) not null,
  taxable_value      numeric(12,2) not null,
  cgst               numeric(12,2) not null default 0,
  sgst               numeric(12,2) not null default 0,
  igst               numeric(12,2) not null default 0,

  created_at         timestamptz not null default now(),

  constraint credit_notes_series_seq_unique unique (series, seq),
  constraint credit_notes_foots check (
    round(taxable_value + cgst + sgst + igst, 2) = round(gross_amount, 2)
  )
);

create index credit_notes_invoice_idx on public.credit_notes (invoice_id);
create index credit_notes_user_idx    on public.credit_notes (user_id);


-- ---------------------------------------------------------------------
-- STATEMENT 3 — issue_credit_note(): atomic, idempotent, self-filling
--
-- Give it ONLY the payment_id + refund_id (+ optional partial amount);
-- it looks up the original invoice and mirrors its tax split, so the
-- credit note can never disagree with the invoice it reverses.
-- Full refund: omit p->>'gross_amount'. Partial: pass the amount and
-- the split is recomputed pro-rata with the same plug rule.
-- ---------------------------------------------------------------------
create or replace function public.issue_credit_note(p jsonb)
returns public.credit_notes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv    public.invoices;
  v_seq    bigint;
  v_row    public.credit_notes;
  v_gross  numeric(12,2);
  v_taxable numeric(12,2);
  v_tax    numeric(12,2);
  v_cgst   numeric(12,2) := 0;
  v_sgst   numeric(12,2) := 0;
  v_igst   numeric(12,2) := 0;
begin
  -- idempotency: one credit note per refund, ever
  select * into v_row from public.credit_notes
   where refund_id = p->>'refund_id';
  if found then
    return v_row;
  end if;

  -- find the invoice being reversed
  select * into v_inv from public.invoices
   where payment_id = p->>'payment_id';
  if not found then
    raise exception 'No invoice found for payment_id %', p->>'payment_id';
  end if;

  -- amount: full by default, partial if supplied
  v_gross := coalesce((p->>'gross_amount')::numeric, v_inv.gross_amount);
  if v_gross > v_inv.gross_amount then
    raise exception 'Credit note amount % exceeds invoice amount %',
      v_gross, v_inv.gross_amount;
  end if;

  -- mirror the invoice's tax treatment (same plug rule as issuance)
  if v_inv.tax_mode = 'EXPORT' then
    v_taxable := v_gross;
  else
    v_taxable := round(v_gross / 1.18, 2);
    v_tax     := round(v_gross - v_taxable, 2);
    if v_inv.tax_mode = 'IGST' then
      v_igst := v_tax;
    else
      v_cgst := round(v_taxable * 0.09, 2);
      v_sgst := round(v_tax - v_cgst, 2);
    end if;
  end if;

  -- allocate the number under row lock
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
    select * into v_row from public.credit_notes
     where refund_id = p->>'refund_id';
    return v_row;
end;
$$;


-- ---------------------------------------------------------------------
-- STATEMENT 4 — lock down + owner read (matches invoices)
-- ---------------------------------------------------------------------
alter table public.credit_notes enable row level security;

create policy credit_notes_owner_read
  on public.credit_notes
  for select
  using (auth.uid() = user_id);


-- =====================================================================
-- VERIFICATION (run after a TEST invoice exists, or after launch with
-- care — uses a throwaway refund id; clean up after)
-- =====================================================================

-- A. series seeded at 1001
select * from public.invoice_counters where series = 'BN/26-27';

-- B. Only if a test invoice exists for pay_TEST_1 (re-run the invoicing
--    file's verification B first if needed). Expect BN/26-27/1001 with
--    cgst 15.18 / sgst 15.18 mirroring the invoice:
-- select credit_note_no, gross_amount, cgst, sgst
-- from public.issue_credit_note('{"payment_id":"pay_TEST_1","refund_id":"rfnd_TEST_1"}'::jsonb);

-- C. idempotency: run B again — same credit_note_no, counter unchanged.

-- D. CLEANUP (mirror the invoicing file's step E):
-- delete from public.credit_notes where refund_id like 'rfnd_TEST_%';
-- delete from public.invoices where payment_id like 'pay_TEST_%';
-- update public.invoice_counters set next_value = 1001
--   where series in ('BC/26-27','BX/26-27','BN/26-27');


-- =====================================================================
-- REFUND RUNBOOK (manual, until a refund API is built):
-- 1. Refund in Razorpay dashboard → copy the rfnd_... id
-- 2. Studio: select public.issue_credit_note(
--      '{"payment_id":"pay_XXXX","refund_id":"rfnd_XXXX"}'::jsonb);
-- 3. Note the credit note in the month's GSTR-1 (Table 9B for the
--    relevant category); the tax liability reduces accordingly.
-- 4. Email the customer confirmation (credit note PDF generation from
--    this row is a post-launch enhancement; the DB record satisfies
--    the books requirement meanwhile — confirm with CA at first filing).
-- =====================================================================
