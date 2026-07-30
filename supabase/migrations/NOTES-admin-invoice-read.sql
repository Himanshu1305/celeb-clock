-- =====================================================================
-- BORNCLOCK — ADMIN READ ACCESS TO INVOICES (Phase F revenue card)
-- Project: jwrpqiypvystivtqyhro ("Lifespan")
--
-- RUN MANUALLY IN SUPABASE STUDIO. One statement.
--
-- WHY: public.invoices currently has only the owner-read policy
--   (invoices_owner_read: auth.uid() = user_id), so an admin viewing the
--   dashboard can read only their OWN invoices. The Admin → System revenue
--   card (revenue split by currency, export count, this vs last month) needs
--   to read ALL invoices. This adds an admin SELECT policy using the same
--   has_role(auth.uid(), 'admin') helper the rest of the app already uses.
--
-- Until this runs, the card degrades gracefully: it shows an amber note
-- ("apply NOTES-admin-invoice-read.sql") instead of numbers, and nothing
-- breaks. No write access is granted — SELECT only.
-- =====================================================================

create policy invoices_admin_read
  on public.invoices
  for select
  using (public.has_role(auth.uid(), 'admin'::app_role));

-- VERIFY (as an admin user, from the app or Studio impersonation):
--   select currency, tax_mode, count(*), sum(gross_amount)
--     from public.invoices group by currency, tax_mode;
-- Expect the real current state — e.g. 1 row: INR / CGST_SGST / 1 / 199.00
-- (invoice BC/26-27/1001). Export (BX) invoices are the GSTR-1 Table 6A count.
