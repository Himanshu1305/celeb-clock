# Part N — Phase 0: every usage cap / rate limit in the codebase

Mapped before building the admin bypass. Verified against the actual code.

## 1. Astrologer chat — the ONLY user-facing usage cap
- **Where the number lives:** `src/lib/vedic/rateLimit.ts` — `FREE_DAILY_LIMIT = 3`, `PAID_DAILY_LIMIT = 15`, resets at local midnight (`dayKey`).
- **How it is ENFORCED (important):** the real enforcement is **client-side**. `src/components/AstrologerChat.tsx` calls `getStatus()` / `commitQuestion()` which read/write a **localStorage** counter (`bornclock-astrologer-usage`). The gate that actually stops you (`if (!status.allowed) …`) runs in the browser.
- **Server "double-check" is a courtesy, not a boundary:** `api/vedic-chat.ts` (step 3) calls `isOverLimit(questionCount, tier)` — but **both `questionCount` and `tier` are sent by the client in the request body**. The comment even says *"client is authoritative this session."* So a client that sends `questionCount: 0` (or clears localStorage) is never limited. **The existing cap is therefore not a real security boundary** — it's a soft, honour-system limit. This is the key fact shaping the bypass design: the bypass doesn't need to defeat a real server boundary, but it MUST NOT introduce a new, discoverable, universal bypass, and the *grant* of unlimited access must be genuinely server-verified so it can't be self-claimed.
- **Paid tier (15/day):** a stub. There is no payment system wired to the chat tier — `AstrologerChat` is rendered with the default `tier='free'`. `paid` exists in the rate-limit module and is unit-tested, but nothing sets it.

## 2. Contact form — anti-spam, NOT a usage cap (out of scope)
- `api/contact.ts` has `rateLimited(ip)` → 429. This is **per-IP abuse protection** on the contact form, not a per-user feature cap. It is deliberately left alone: bypassing it would only let the admin spam their own contact form, and it is keyed by IP, not identity. Documented here for completeness.

## 3. Everything else — NO caps
Confirmed by searching for the only real limiter (`isOverLimit`) and any 429s. These feature endpoints are **uncapped** (they only set HTTP cache headers):
- `/api/kundali-match` (Matching), `/api/career-report`, `/api/gemstones`, `/api/sade-sati`, `/api/muhurat`, `/api/vedic-reading`, `/api/vedic-profile`.
- So there is nothing to bypass on Matching / Career / etc. today. The admin tier built here is applied to the chat, and is ready to short-circuit any future cap that reuses the same `Tier` / `isOverLimit` machinery.

## 4. Auth / admin infrastructure that already exists (reused, not rebuilt)
- **Supabase email auth** (`src/hooks/useAuth.ts`) — real logins; `session.access_token` is a signed JWT available client-side.
- **Admin allowlist** — `src/lib/adminEmails.ts` → `ADMIN_EMAILS = ['himanshu1305@gmail.com', 'hello@bornclock.com']` + `isAdminEmail()`. Already used for `/admin` route gating and admin-only UI. (These emails are in the client bundle — that's fine: an email is an identifier, not a secret; the bypass requires being *authenticated* as that email, i.e. holding a valid session JWT.)
- **Server-verified-by-Bearer-token pattern** already in use — `useAuth.deleteAccount()` sends `Authorization: Bearer <access_token>` and the server validates it. Part N reuses exactly this pattern.
- **Worker has Supabase access** — `process.env.SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (used by `api/report-entitlement.ts`, `verify-payment.ts`, etc.), so the worker can validate a user's JWT with `supabase.auth.getUser(token)`.

**Conclusion:** a genuinely safe admin bypass is proportionate here — no new auth system is needed. See `docs/part-n-flags.md` for the design + the chosen answers to tier-interaction, revocability, and the Part L account-sync question.
