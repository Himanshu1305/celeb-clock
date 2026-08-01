# ADMIN-FIX — phantom column + error surfacing + auth-gated fetches + diagnostic invoice note

Two founder-verified /admin bugs, both root-caused in the prior read-only investigation and fixed here.
`himanshu1305@gmail.com` already has the DB `admin` role, so RLS-by-role was **not** the blocker.

---

## FIX 1 — Users section empty for every admin (phantom column)

### Root cause
`fetchUsers` explicitly selected `profiles.promo_premium_until`, a column that **does not exist** on the
live `profiles` table (never migrated). PostgREST 400s the *entire* query when a selected column is missing,
so `data` came back `null`. The old code destructured only `{ data }` and did `setUsers(data ?? [])` — the
error was swallowed and the list silently emptied to "No users found" for **every** admin. The same phantom
column also broke `grantPromo` and `revoke` writes (they failed silently while the toast claimed success).

### Before
```ts
const { data } = await supabase
  .from('profiles')
  .select('id, email, name, country, created_at, premium_status, promo_premium_until')
  .order('created_at', { ascending: false })
  .limit(50);
setUsers((data as UserProfile[]) ?? []);   // error swallowed → [] → "No users found"
```

### After
Logic extracted to `src/lib/adminUsers.ts` (`loadAdminUsers`) so it is unit-testable:
1. `await getSession()` first (see Fix 2), then `select` the **full** column list.
2. On error: log it, **retry the select WITHOUT `promo_premium_until`** (fallback), and set a **visible
   admin error banner** with the original message — never a silent empty list.
3. If the fallback also fails → banner + empty list (surfaced, not silent).

```ts
const res = await loadAdminUsers(supabase);
if (res.error)   { setAdminError(`Could not load users: ${res.error}`); setUsers([]); return; }
if (res.warning) setAdminError(`Users loaded via fallback — promo column missing, apply NOTES-promo-column.sql. (${res.warning})`);
setUsers(res.users);
```

### Fallback behaviour
- **Pre-migration** (column absent): full select 400s → fallback select (no promo column) succeeds → all
  user details (email / name / country / status / created) render, plus an amber banner telling the founder
  to apply `NOTES-promo-column.sql`. The Users section is usable *immediately*, before the DDL lands.
- **Post-migration** (column present): full select succeeds → no fallback, no banner, promo dates included.

`grantPromo` / `grantFull` / `revoke` now capture `{ error }` and show a **destructive toast** with the DB
message on failure (and skip the success toast + refetch). Pre-migration, a promo grant/revoke that writes
`promo_premium_until` will surface the real "column does not exist" error instead of pretending success;
after the migration it works.

### NOTES-promo-column.sql (apply in Studio)
```sql
alter table public.profiles add column if not exists promo_premium_until timestamptz;
```
Not auto-applied. Run in Supabase Studio (project "Lifespan" / `jwrpqiypvystivtqyhro`). Code works **both
before and after** it lands.

---

## FIX 2 — GST / invoices card shows the amber note despite policy + role + data present

### Auth-timing finding — stated plainly
The old mount effect was `useEffect(() => { fetchStats(); fetchMetrics(); }, [])` with **no wait for session
readiness**. `supabase-js` restores the persisted session from `localStorage` **asynchronously** after the
client constructs. On a hard refresh there is therefore a real window in which these RLS-gated reads can fire
**before the JWT is attached → they execute as ANON → RLS returns 0 rows → the amber note renders**, even
though `invoices_admin_read` is applied, the founder has the admin role, and an invoices row exists.

I could **not deterministically reproduce the founder's admin session locally** (no admin password, and
supabase-js has no service-role JWT impersonation), so I cannot claim with certainty that this specific race
fired on his machine — but the old code *did not guard against it*, which makes it the most likely cause of
an intermittent-yet-fully-configured amber note. The fix removes the race regardless, and the new diagnostic
note (below) will show the exact state if it ever recurs.

### Fix
All admin data fetches now **await `supabase.auth.getSession()` before querying**, so the JWT is hydrated
first (in the mount effect, in `fetchMetrics`, and inside `loadAdminUsers`). The mount effect also
**re-runs on `SIGNED_IN` / `TOKEN_REFRESHED`** via `onAuthStateChange`, so a late-arriving session refetches.

```ts
useEffect(() => {
  let cancelled = false;
  (async () => { await supabase.auth.getSession(); if (!cancelled) { fetchStats(); fetchMetrics(); } })();
  const { data: sub } = supabase.auth.onAuthStateChange((e) => {
    if (e === 'SIGNED_IN' || e === 'TOKEN_REFRESHED') { fetchStats(); fetchMetrics(); }
  });
  return () => { cancelled = true; sub.subscription.unsubscribe(); };
}, []);
```

### Diagnostic invoice note
The amber note now distinguishes **RLS-empty (0 rows, no error)** from a **query error**, and includes the
observed row count + session state:
- 0 rows: `0 invoices readable · session: present. Session is present, so apply/verify invoices_admin_read (NOTES-admin-invoice-read.sql).`
- 0 rows, anon: `0 invoices readable · session: ABSENT. Session was ABSENT — this ran as anon; hard-refresh /admin so the JWT loads before the query.`
- error: `invoices query error · session: <state>: <message> — verify invoices_admin_read (NOTES-admin-invoice-read.sql).`

So the founder's next refresh tells him exactly which branch he's in.

---

## Tests (e2e/prelaunch/admin-fix.spec.ts — 5, all green)
Pure-logic over `src/lib/adminUsers.ts` (no servers):
1. happy path → full details render, no fallback.
2. promo column absent → fallback select → details still render + warning surfaced.
3. query error (both selects fail) → surfaced error + empty list, never silent.
4. delayed session → fetch awaits `getSession` before querying (asserts call order — not anon-first).
5. grantPromo / revoke error path returns the DB message (component surfaces it); success → null.

---

## Gate
- **tsc**: 0 errors (0 new). ✅
- **build**: `1340 ok, 0 failed, 0 skipped` (prerender) · sitemap 1340 URLs. ✅
- **test:prelaunch**: gauntlet **135/135** ✅ · prelaunch **137/137** (132 baseline + 5 new admin-fix) ✅.
  - First combined run showed 5 prelaunch failures — classified as an **environment collision, not product
    bugs**: my `npm run build` ran concurrently and wipes+regenerates `dist/`, so the prerendered-content
    specs (`batch-5` /gift /coach, `batch-6` /compatibility) hit `ENOENT: dist/.../index.html` mid-rebuild,
    and `delete-account`'s heavy real-user flow timed out under the build's competing chromium. Re-run with a
    stable `dist/` and no competing build → **137/137 green**. No assertion weakened; none touch /admin.
- **frozen files untouched**: `_crypto.ts`, `razorpay-webhook.ts`, `verify-payment.ts` — empty diff. ✅
- **invoice_counters unchanged**: BC/26-27 → 1002, BN/26-27 → 1001, BX/26-27 → 1001. ✅
- **deploy**: ONE. `Uploaded bornclock` + `Deployed bornclock triggers`; trailing exit 1 is the known
  non-fatal cron `schedules` token-scope error. ✅
- **live sentinel**: POST /api/create-order (report_slug "zzzzzzzz") → `{"error":"Report not found"}`. ✅

---

## Founder re-test list
Hard-refresh **/admin** signed in as `himanshu1305@gmail.com`:
1. **Users tab** — the table shows full rows (email / name / country / status / created) for all users. If the
   promo column isn't migrated yet, you'll also see an amber banner: *"Users loaded via fallback — promo
   column missing, apply NOTES-promo-column.sql."* Apply `NOTES-promo-column.sql` to clear it.
2. **Metrics tab (default)** — the GST revenue card renders numbers, OR the amber note now states exactly
   why: read the `session: present/ABSENT` + count. If it says `session: ABSENT`, hard-refresh once (the
   session was still hydrating). If `session: present` with `0 invoices readable`, verify
   `invoices_admin_read` is applied.
3. **Grant/Revoke** — if a promo grant fails pre-migration you'll now see a red error toast with the DB
   message instead of a false "granted"; it works after `NOTES-promo-column.sql`.
