-- NOTES-admin-roles.sql — grant the DB 'admin' role to EVERY email-allowlist admin.
-- NOT APPLIED. Run in Supabase Studio (BornClock project "Lifespan" /
-- jwrpqiypvystivtqyhro). Single statement; confirm the project breadcrumb first.
--
-- ROOT CAUSE (BATCH-7 P2 — both founder-verified issues):
--   /admin is gated by the EMAIL allowlist in src/lib/adminEmails.ts
--   (himanshu1305@gmail.com, hello@bornclock.com). But the admin-read RLS policies
--   on public.profiles and public.invoices use has_role(auth.uid(),'admin'), which
--   reads public.user_roles. Only himanshu1305@gmail.com currently has that role.
--   So hello@bornclock.com can OPEN /admin (email allowlist says yes) but every
--   detailed read is DENIED by RLS → the Users section shows rows with no
--   email/name ("6 users but no details"), and the GST invoices card can't read
--   public.invoices so it never renders. Granting the DB role to every allowlist
--   admin realigns the two mechanisms; no code change is needed.
--
-- Idempotent: inserts only the missing (user_id, 'admin') pairs.

insert into public.user_roles (user_id, role)
select u.id, 'admin'::app_role
from auth.users u
where lower(u.email) in ('himanshu1305@gmail.com', 'hello@bornclock.com')
  and not exists (
    select 1
    from public.user_roles r
    where r.user_id = u.id
      and r.role = 'admin'::app_role
  );

-- Verify (should list both admin emails with role = admin):
--   select u.email, r.role
--   from public.user_roles r
--   join auth.users u on u.id = r.user_id
--   where r.role = 'admin'::app_role;
--
-- After applying, sign in as hello@bornclock.com and reload /admin: the Users
-- section shows email/status/created for all users, and the GST revenue card
-- renders (1 purchase / ₹199 / INR from invoice BC/26-27/1001).
