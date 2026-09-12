# Part N — Admin / testing bypass: design, decisions, and how to use it

## What was built (in one line)
Unlimited astrologer-chat access for you, granted **only** when the server verifies
your logged-in identity (a signed Supabase token) against an admin allowlist — never
by anything a normal user could copy from the browser.

## How YOU use it (plain steps)
1. **Log in** to BornClock with an admin email. The allowlist already contains
   `himanshu1305@gmail.com` and `hello@bornclock.com` (`src/lib/adminEmails.ts`).
2. **Go to the Astrologer page** (`/astrologer`) with a saved birth profile.
3. That's it. The badge shows **"∞ Unlimited (admin / testing mode)"** and you can ask
   as many questions as you want — the 3/day cap does not apply.

No secret to enter, no code to touch each time, no query parameter. Being logged in as
an allowlisted account IS the switch.

## How to turn it OFF later (revocable two ways, no engineering session)
- **Permanent:** remove the email from the list in `src/lib/adminEmails.ts` and redeploy.
  (This also removes their `/admin` access, since it's the same list.)
- **Ops-only, no client rebuild:** the server ALSO honours an optional `ADMIN_EMAILS`
  environment variable (comma-separated) on the worker, merged with the file list.
  You can add/remove a *testing-only* admin there and redeploy just the worker — handy
  if family/help ever needs temporary access and you want it gone afterward without a
  code change. Unset it and they're back to normal limits immediately.

## The design decisions the brief asked me to make explicitly

**Tier interaction (where admin sits vs free/paid).** Admin is a **third tier checked
FIRST and short-circuits** the free/paid logic. In `api/vedic-chat.ts` the tier is
re-derived server-side: `admin.isAdmin ? 'admin' : (client says paid ? 'paid' : 'free')`.
`limitForTier('admin')` is `Infinity`, so the rate-limit block is skipped entirely for a
verified admin. Free/paid enforcement for everyone else is **byte-for-byte unchanged**
(regression-tested).

**It's identity-based and server-verified — not a client secret.** The browser sends
your own Supabase access token (`Authorization: Bearer …`), exactly like the existing
"delete account" flow. The worker validates it with Supabase (`auth.getUser`) to get your
*real* email, then checks the allowlist. A client claiming `tier:"admin"`, faking an
`isAdmin` flag, or editing localStorage gets **nothing** — proven by the tests below.
The `isAdmin` flag in the browser only changes the *label/counter*; the server is the
only thing that actually grants unlimited.

**Fails closed.** No token, forged token, non-allowlisted login, or Supabase mis-config
→ treated as a normal user (capped). There is no path that defaults to "admin".

**Doesn't skew analytics.** Admin requests are logged distinctly
(`[vedic-chat] admin/testing bypass — excluded from usage analytics: <email>`) and the
API response is tagged `admin: true`, so testing traffic is identifiable and excludable
from real usage numbers later.

**Interaction with Part L account sync (deliberate choice).** Admin status and the
saved-profile sync are **orthogonal** — being an admin does not touch profile sync; it
only lifts rate limits. BUT: whatever account you *test on* will still sync whatever
birth profile you save on it (Part L). **Recommendation, made deliberately:** keep your
**personal** account (with your real saved birth profile) separate from a **testing**
account. Both admin emails are already allowlisted, so the clean pattern is:
- use `himanshu1305@gmail.com` (or whichever holds your real profile) for personal use, and
- use `hello@bornclock.com` as the **dedicated testing identity** — hammer it with many
  pairings/profiles without ever overwriting or conflicting with your personal synced
  profile.
This keeps heavy testing from polluting your own saved chart via account sync.

## Honest caveats
- **The underlying chat cap was never a hard security boundary.** It's enforced in the
  browser (localStorage) with only a courtesy server check that trusts the client's own
  count (see `docs/part-n-touchpoints.md`). So *any* user could already exceed 3/day with
  dev tools today — this session did **not** make that worse. What this session guarantees
  is narrower and correct: the **admin grant itself** cannot be self-claimed or discovered,
  and normal enforcement is unchanged. If/when the cap becomes truly server-enforced (with
  the payment system), this same verified-`admin`-tier short-circuit is already the correct
  place for your bypass to live.
- **Convenience tradeoff:** the switch is "log in as an allowlisted email," which is the
  simplest genuinely-safe option given real auth already exists. There is deliberately no
  magic URL or toggle, because any such thing would be copyable by others.

## Test evidence (all real)
**Unit (14 tests, `api/__tests__/adminAuth.test.ts`):** admin email → admin; non-admin →
not; no token → not (verifier never called); forged token → not; Supabase throwing →
fails closed; case/space normalised; env-var allowlist merges; bearer parsing; and the
`admin` rate-limit tier is unlimited while free/paid are unchanged.

**Live end-to-end (wrangler dev, real Supabase JWTs, temp users created then deleted):**

| # | Scenario | Result |
|---|---|---|
| 1 | Normal user, 0 used | 200 — allowed (normal use works) |
| 2 | Normal user, 3 used | 429 — capped (cap intact, unchanged) |
| 3 | Adversarial: body says `tier:"admin"`, no token | 429 — capped (can't self-promote) |
| 4 | Adversarial: forged Bearer token | 429 — capped (can't spoof) |
| 5 | Adversarial: a REAL login that isn't allowlisted | 429 — capped (login ≠ admin) |
| 6 | Verified admin token, 99 used | 200 — unlimited, `admin:true` (bypass works) |

**Client-bundle discoverability:** the server-role key and Gemini key are absent from the
built client bundle; no bypass token/secret/magic-param was added. The only admin content
shipped to the browser is the admin *emails* (pre-existing) — identifiers, not secrets,
useless without the account's login.

**Regression:** full unit suite 1774/141 green (was 1760/140), zero regressions to
existing free/paid behaviour.
