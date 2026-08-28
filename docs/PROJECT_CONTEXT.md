# BornClock — PROJECT_CONTEXT.md

> Session-start knowledge base. Read this once at the start of a session and you should
> not need to run discovery scripts or re-read the codebase to answer basic questions.
> Compiled by reading source files in full. Every fact is cited to `file:line` where
> practical. Secrets are shown as `[CLOUDFLARE SECRET: NAME]` / `[IN .env: NAME]`;
> dashboard-only values as `[IN DASHBOARD ONLY: where]`; missing files as
> `[FILE NOT FOUND: path]`. Verified 2026-08-07 against the `develop` branch.

---

## SECTION 1 — PROJECT OVERVIEW

**What it is.** BornClock is a free age / birthday / longevity web app: exact-age calculators,
celebrity-birthday matching, zodiac/numerology/astrology tools, a life-expectancy + biological-age
suite, and a paid one-time "Birthday Blueprint" PDF report plus a Premium subscription. Audience:
global + India-first (large curated Indian-celebrity dataset). Value prop tagline in code: *"Know
your time. Live it well."*

| Item | Value | Source |
|---|---|---|
| Live URL | `https://bornclock.com` | `scripts/generate-sitemap.mjs:17` |
| Staging URL | `https://staging.bornclock.com` | `wrangler.toml:8`, `playwright.config.ts:12` |
| workers.dev | `https://bornclock.usdvisionai.workers.dev` | `functions/_worker.ts:157` (default `OPS_BASE_URL`) |
| Cloudflare project | `bornclock` | `wrangler.toml:1` |
| Cloudflare account subdomain | `usdvisionai` | derived from workers.dev host |
| GitHub repo URL | `[IN DASHBOARD ONLY: GitHub]` — **no** CF↔GitHub integration; all deploys manual | `docs/ARCHITECTURE-DECISIONS.md:54` |
| Default git branch | `main` (never edited directly); work happens on `develop` | `docs/ARCHITECTURE-DECISIONS.md:14` |
| Supabase prod ref | `jwrpqiypvystivtqyhro` (internal name "Lifespan") | `src/integrations/supabase/client.ts:5`, `supabase/config.toml` |
| Supabase staging ref | `[NONE FOUND]` — single project used for dev+prod | — |
| Lovable project id | `60a1494d-ef9c-4a62-b4f0-e5b7019f662a` | `README.md:5` |

> **Stale "Vercel" references.** `README.md`, root `ARCHITECTURE-DECISIONS.md`,
> `REQUIRED_ENV_VARS.md`, `MIGRATIONS_TO_APPLY.md` and a `vercel.json` still mention Vercel. The
> **live runtime is Cloudflare Workers** (`wrangler.toml`, `functions/_worker.ts`). The authoritative
> architecture doc is **`docs/ARCHITECTURE-DECISIONS.md`** (updated 2026-07-08); the root-level copy
> is older/shorter — prefer the `docs/` version where they differ.

### Tech stack (from `package.json`)
- Vite `^5.4.19` + React `^18.3.1` + `react-dom ^18.3.1` SPA, TypeScript `^5.8.3`, `@vitejs/plugin-react-swc`.
- `react-router-dom ^6.30.1`, `@tanstack/react-query ^5.83.0`, `react-hook-form ^7.61.1` + `zod ^3.25.76`.
- UI: Tailwind `^3.4.17` + `@tailwindcss/typography` + extensive `@radix-ui/*` (shadcn/ui).
- Data: `@supabase/supabase-js ^2.57.4`.
- PDF/print: `jspdf ^3.0.3`, `html2canvas ^1.4.1`, `react-to-print ^3.3.0`, `pdfjs-dist ^6.1.200` (dev).
- Prerender/OG: `puppeteer-core ^25.3.0`, `@sparticuz/chromium ^149.0.0`.
- Deploy/test: `wrangler ^4.110.0` (dev), `@playwright/test ^1.61.0`, `vitest ^4.1.8`.
- `package.json` name is `vite_react_shadcn_ts`, version `0.0.0`, `"type": "module"`.

### USD Vision AI LLP — legal / GST (supplier block, `src/lib/invoice-generator.ts:41-56`, hardcoded, never from env)
| Field | Value |
|---|---|
| Legal name | **USD Vision AI LLP** |
| Brand | BornClock |
| GSTIN | **`36AAJFU0315K1Z5`** |
| PAN | `[NOT IN CODE]` — no standalone PAN constant. It is embedded in the GSTIN: `36` (Telangana) + **`AAJFU0315K`** (PAN) + `1Z5`. |
| LLPIN | `ACR-6615` |
| SAC code | **`998439`** — "Other on-line contents n.e.c." |
| Registered state / code | Telangana / **36** |
| Address | A206, Aparna Sarovar Zenith, Kanchi Gachibowli Road, Nallagandla, Hyderabad, Telangana 500046 |
| Contact | hello@bornclock.com |
| LUT ARN / date | **`AD360726011878N`** dated **27/07/2026** (FY 2026–27) |
| GST rate | **18%** total — domestic CGST 9% + SGST 9%; inter-state IGST 18%; export zero-rated |
| Prices are | **GST-INCLUSIVE** (always back-calculated; see §4e) |

**Invoice sequences** (table `invoice_counters`, seeded — see §4e / §5):
| Series | Purpose | Start |
|---|---|---|
| `BC/26-27` | Domestic (CGST+SGST or IGST) | 1001 |
| `BX/26-27` | Export under LUT (zero-rated) | 1001 |
| `BN/26-27` | Credit notes (Section 34 refunds) | 1001 |

---

## SECTION 2 — ARCHITECTURE

### Directory structure (purpose)
```
api/                 Shared HTTP handlers (Vercel-shaped, read process.env). The REAL payment/
                     email/ops logic lives here. Files prefixed `_` are shared libs, not routes.
functions/           Cloudflare Worker entry.
  _worker.ts         Module worker: fetch() (routing + env bridge + redirects + OG) + scheduled() (cron).
  _cron/             Cron sub-handlers (daily-email.ts).
  api/               Thin CF wrappers that re-export ../../api/*.js handlers.
  og-report.ts       Personalised report OG-card rendering + tag injection.
src/                 React SPA.
  pages/  components/  hooks/  services/  lib/  data/  integrations/supabase/
supabase/
  migrations/        20 applied *.sql (timestamped) + NOTES-*.sql (manual/unapplied ops notes).
  functions/         Deno edge functions: delete-account, generate-weekly-blog.
  config.toml        project_id = jwrpqiypvystivtqyhro.
scripts/             Build (prerender, sitemap, OG), celebrity data pipeline, PDF verifiers, test/diagnostic mjs.
e2e/                 Playwright: launch-gauntlet/ (12 specs) + prelaunch/ (~30 specs).
public/              Static assets (logo, favicon). NB: no _headers / _redirects here (see below).
dist/                Build output (git-ignored).
docs/                Batch prompts + reports + ARCHITECTURE-DECISIONS.md (institutional memory).
```

### Build pipeline (`package.json:8`)
```
vite build && tsx scripts/generate-og-cards.mts && node scripts/prerender.mjs && node scripts/generate-sitemap.mjs
```
1. `vite build` → SPA into `dist/`.
2. `generate-og-cards.mts` → per-page OG images.
3. `prerender.mjs` → static-render each route with puppeteer, inject title/meta/canonical/JSON-LD.
4. `generate-sitemap.mjs` → `dist/sitemap.xml` + `public/sitemap.xml`.
Takes ~10 min (1300+ routes). `npx tsc --noEmit` must be clean before shipping.

### THE DEPLOY COMMAND (critical invariant)
```bash
./node_modules/.bin/wrangler deploy
```
**Always the local binary. NEVER `npx wrangler deploy`** — `npx` re-downloads wrangler each invocation
and **hangs on large asset sets** (~1400+ `dist` assets). (`docs/ARCHITECTURE-DECISIONS.md:294-296`.)
There is no `deploy` npm script and no auto-deploy on push. A trailing
`schedules`/exit-1 message after "Uploaded bornclock" + "Deployed bornclock triggers" is a **known
non-fatal** cron-registration warning, not a failure (`docs/ADMIN-FIX-REPORT.md:124`).

### The env bridge in `functions/_worker.ts` (critical)
CF Worker `env` is a Proxy — `Object.entries(env)` returns `[]` even when secrets exist, so keys must
be named explicitly (`_worker.ts:29-30`). `bridgeEnv(env)` (called at the top of both `fetch` `:78`
and `scheduled` `:156`) copies a fixed allow-list into `process.env` so the `api/*` handlers work
unchanged. It only sets a key if the value is a non-empty string and `process.env[key]` isn't already
set (never overwrites).

**Exact `BRIDGE_KEYS` (`_worker.ts:31-42`):**
```ts
const BRIDGE_KEYS = [
  'VITE_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET', 'VITE_CRON_SECRET',
  'RESEND_API_KEY', 'ANTHROPIC_API_KEY', 'ADMIN_SECRET_KEY',
  'GEMINI_API_KEY', 'COACH_PROVIDER',
  'VITE_RAZORPAY_PLAN_INDIA_MONTHLY', 'VITE_RAZORPAY_PLAN_INDIA_ANNUAL',
  'VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY', 'VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL',
  'ADMIN_EMAIL', 'OPS_BASE_URL',
  'BROWSER_RENDERING_TOKEN', 'CF_ACCOUNT_ID',
  'DIGEST_LIVE',
];
```
**What breaks if a key is missing from this array:** the secret is invisible to every `api/*` handler
(`process.env.X === undefined`) even though it exists as a Cloudflare secret. Adding a secret in the CF
dashboard is **not enough — it must also be added to `BRIDGE_KEYS`.** Concrete failure modes: omit
`SUPABASE_SERVICE_ROLE_KEY` → all DB writes fail; omit `RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET`
→ order creation / webhook signature verification fail; omit `BROWSER_RENDERING_TOKEN`/`CF_ACCOUNT_ID`
→ invoice-PDF + OG rendering return null (fall back to HTML).

### Env var flow
`.env.local` (dev) / Cloudflare secrets (prod, added via dashboard) → bridged into `process.env` by
`BRIDGE_KEYS` for server handlers. Client vars must be `VITE_`-prefixed and are **baked into the JS
bundle at build time** (`import.meta.env.VITE_*`). Preview env = TEST keys, Production env = LIVE keys
(`docs/ARCHITECTURE-DECISIONS.md:42`).

### Prerendering (`scripts/prerender.mjs` + `scripts/prerender-titles.mjs`)
- Serves `dist` on `127.0.0.1:14321` with SPA fallback; puppeteer-core + @sparticuz/chromium (falls
  back to local Chrome); per route `goto(waitUntil:'networkidle0')`, 500ms settle, capture
  `documentElement.outerHTML`.
- **Titles/metas are injected by string-replacement on the captured HTML** (`:124`), *deliberately
  bypassing react-helmet-async's rAF timing* which does not flush reliably before capture.
  `getTitleForRoute(route)` (prerender-titles.mjs) returns `{title, description}`; regex-replaces
  `<title>`, meta description (either attribute order), `og:`/`twitter:` title/url, canonical (with
  **trailing slash**), OG card, and a per-route BreadcrumbList JSON-LD.
- **Concurrency = 8** (`prerender.mjs:24`). Guardrails: total time budget **25 min** (`:25`) — routes
  past it are skipped and fall back to runtime SPA rendering; per-route timeout **15s** (`:29`, kept
  cheap so slow routes can't starve the budget); browser recycled every 300 routes.
  ⚠️ There is **no in-file comment forbidding a higher concurrency**; the real ceiling is the time
  budget + memory (browser restart) — raising concurrency risks OOM/timeouts, not a documented crash.
- Root `/` is rendered **last** so it overwrites `dist/index.html`. Writes `dist/prerender-manifest.json`.
  Never fails the build (`process.exit(0)`).
- Route list: `scripts/prerender-routes.mjs` (`STATIC_ROUTES` + `ANSWER_ROUTES` + templated families).
  Adding a page = add to App.tsx route + `prerender-routes.mjs` + (for a clean title) `prerender-titles.mjs`.

### Prerendered vs dynamic
Everything in `prerender-routes.mjs` → static HTML in `dist/<route>/index.html` (grep it to confirm).
Everything else is client-only SPA (served via `not_found_handling=single-page-application`).
DB-driven per-record pages (e.g. `/report/:slug`) are dynamic (rendered client-side / OG-injected by
the Worker), not prerendered.

### ESM `.js` extension rule (runtime crash, not a type error)
All **relative** imports in `api/*`, `functions/*` must carry an explicit `.js` extension even in `.ts`
files (`import { X } from './_email.js'`). The Node/Worker ESM resolver requires it. TypeScript warning
**TS2835 is NOT type-only — it means a runtime `ERR_MODULE_NOT_FOUND` on the deployed platform.** Local
dev and the Playwright gauntlet do **not** catch it. (`docs/ARCHITECTURE-DECISIONS.md:44`;
`functions/_worker.ts:1-22` shows every import ending `.js`.) `_`-prefixed files (`api/_email.ts` etc.)
are shared libs imported directly (with `.js`), never self-fetched over HTTP, and the prefix stops the
platform treating them as routes.

### Edge caching / headers
`public/_headers` → `[FILE NOT FOUND: public/_headers]`. `public/_redirects` →
`[FILE NOT FOUND: public/_redirects]`. Caching/redirects are handled in **`functions/_worker.ts`**
instead: it 301-redirects legacy/canonical paths, does trailing-slash 307s, injects report OG tags,
and forces `Cache-Control: no-cache, must-revalidate` on `text/html` asset responses (prevents a
stale edge shell from pinning an old JS bundle).

---

## SECTION 3 — WORKING MODEL

- **Git remote:** `[IN DASHBOARD ONLY: GitHub]` — no CF↔GitHub integration, deploys are manual
  (`docs/ARCHITECTURE-DECISIONS.md:54`). `main` is the default branch and is never edited directly;
  work happens on `develop`.
- **DO NOT PUSH.** In this workflow Claude commits **locally only**; the human pushes. Never `git push`
  unless explicitly told. Never `git add .` (see §6 — package.json/package-lock.json are permanently
  dirty); stage specific files per focused commit.
- **Read-before-write.** For any DB change dump the real schema/indexes/**triggers** for touched tables
  first; for any payment change read the full file before editing. The `api/_crypto.ts`,
  `api/razorpay-webhook.ts`, `api/verify-payment.ts` are treated as **frozen** — do not modify without
  explicit instruction.
- **Staging.** `https://staging.bornclock.com` is the same Worker + the same Supabase project
  (`jwrpqiypvystivtqyhro`) — there is no separate staging DB. Service-role key for local/e2e is in
  `.env.local` (`set -a; source .env.local; set +a`).
- **`npm run preview` vs `npm run dev`.** `dev` = Vite dev server (cold compile, ~90s to first paint of
  a heavy route). `preview` = `vite preview` serving the **pre-built `dist/`** (ready ~1s). Print/layout
  verification uses `preview` because react-to-print's `@page`/header/footer CSS only exists in the
  built print path, not the dev route DOM.
- **Verify a build without deploying:** `npm run build` then inspect `dist/**/index.html` (grep titles /
  content) and `dist/sitemap.xml`. For print: `node scripts/verify-print.mjs`.
- **"Built ≠ run and passed."** A green local build/gauntlet does NOT prove Cloudflare module resolution
  or env presence. After any API-touching deploy run the **mandatory smoke test** (§11).
- **"Rendered pages ≠ database verification."** A stale deploy can make removed code look like working
  data. Verify against the DB, not a rendered page (`docs/ARCHITECTURE-DECISIONS.md:34`). This is why
  `verify-print.mjs` embeds a `·LIVE·`/`·FROZEN·` sentinel (§10).

---

## SECTION 4 — PAYMENT SYSTEM

> Payments run on **Cloudflare Workers `api/`** (Razorpay), not Supabase edge functions.
> `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` are **frozen**.

### 4a. Plans & pricing
Single client source `src/lib/pricing.ts`:
```ts
// pricing.ts:13-21
export const SUBSCRIPTION = { monthly: { INR: 299, USD: 4.99 }, annual: { INR: 2499, USD: 39.99 } };
export const REPORT_PRICE = { INR: 199, USD: 6.99 };
export const CREDITS = { perMonth: 3, cap: 9, carryForward: true };
```
Razorpay plan IDs — env var with **hardcoded LIVE fallbacks** (`pricing.ts:25-34`):
| billing / currency | plan ID (live fallback) | amount |
|---|---|---|
| monthly INR | `plan_T7ppISx7AUnHVE` | ₹299 |
| annual INR | `plan_T7pqpODIo107Bp` | ₹2499 |
| monthly USD | `plan_T9K6U90fwpqrIg` | $4.99 |
| annual USD | `plan_T9K7XDk2tx8Q0h` | $39.99 |
Env overrides: `VITE_RAZORPAY_PLAN_{INDIA,GLOBAL}_{MONTHLY,ANNUAL}`. Server
(`create-subscription.ts:24-31`) reads the same env vars with **no** fallback (unknown plan → 400).
One-time product `birthday_report`: **server-authoritative** amounts in smallest unit
(`create-order.ts:21-23`): `{ INR: 19900, USD: 699 }`.

### 4b. Client subscription checkout
Files: `src/pages/Upgrade.tsx`, `src/components/CheckoutRegionModal.tsx`, `src/services/RazorpayService.ts`.
1. On mount, `detectCountry()` (IP geo) sets **display** currency; prices from `pricing.ts`.
2. Click "Subscribe" → stores `pendingBilling`, opens **CheckoutRegionModal** (does NOT open Razorpay yet).
3. The modal is a GST **place-of-supply legal declaration**: India requires a state (validated vs
   `INDIA_STATES`); "Outside" requires a country. Its confirm button shows a region-reactive price
   (INR for India, USD for Outside) so the amount corrects before payment.
4. On confirm it emits `{ buyerCountry, buyerState, buyerStateCode, taxMode, currency }` (India→INR +
   CGST_SGST/IGST; Outside→USD + EXPORT) → `startSubscription(sel)` → `initiateSubscription()`.
5. `initiateSubscription` (`RazorpayService.ts:45-177`): **confirmed region wins over IP geo**
   (`checkoutCurrency = currency ?? countryInfo.currency`), picks plan via `RAZORPAY_PLANS`, loads
   `checkout.razorpay.com/v1/checkout.js`, POSTs `/api/create-subscription` → `{ subscription_id }`.

Exact Razorpay options (`RazorpayService.ts:106-166`):
```ts
const rzpOptions = {
  key: keyId,
  subscription_id: subscriptionId,
  name: 'BornClock',
  description: `BornClock Premium — ${billing === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
  image: 'https://bornclock.com/favicon.png',
  prefill: { email: userEmail, name: userName || '' },
  notes: { email: userEmail, userId, billing,
           buyer_country: buyerCountry ?? '', buyer_state: buyerState ?? '',
           buyer_state_code: buyerStateCode ?? '', tax_mode: taxMode ?? '' },
  theme: { color: '#4F46E5' },
  modal: { ondismiss: onDismiss, confirm_close: true, escape: false },
  handler: async (response) => {
    const res = await fetch('/api/verify-payment', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_subscription_id: response.razorpay_subscription_id,
        razorpay_signature: response.razorpay_signature,
        user_id: userId, product: 'subscription', amount: 0, currency: checkoutCurrency,
        billing, buyer_country: buyerCountry, buyer_state: buyerState,
        buyer_state_code: buyerStateCode, tax_mode: taxMode }) });
    /* !res.ok → onError; then */ onSuccess();
  },
};
```
- **Currency** — display: `detectCountry()` (`ipapi.co/json`, IN→INR else USD, 24h cache, `?currency=`
  override). Checkout (authoritative): the **confirmed region** from the modal.
- **Success:** `handler` POSTs `/api/verify-payment`; on ok → `PaymentSuccessModal`; closing it
  `window.location.reload()`.
- **Failure:** verify not-ok/throw → `onError`; Razorpay `payment.failed` → `onError`; **dismiss**
  (user closes Razorpay) → just clears loading (no success/error).
- One-time report checkout mirrors this via `initiateOrderPayment` → `/api/create-order` (server holds
  paise/cents); a `409` → "This report has already been purchased."

### 4c. `verify-payment.ts` (frozen — read full file before touching)
Env read: `SUPABASE_URL` `:9`, `SUPABASE_SERVICE_ROLE_KEY` `:10`, `RAZORPAY_KEY_SECRET` `:52`,
`VITE_RAZORPAY_KEY_ID` `:121/:145`, `PRODUCTION_URL` `:254`.
Steps: POST-guard `:48` → require secret `:52` → parse body `:59` → validate fields `:89-97` →
**HMAC verify `:99-114` (403 on fail)** → service client `:116` → fetch authoritative amount
(subscription: `/v1/payments/{id}` `:120-138`; report: `/v1/orders/{id}` `:141-179`) → insert
`payments` (idempotent) `:181-202` → grant entitlement `:205-239` → capture receipt `:244-266` →
**GST invoice (non-fatal try/catch) `:268-381`** → send ONE merged purchase email `:383-396` →
`{ success:true, product }` `:398`.

**HMAC signature verification** — message build (`verify-payment.ts:24-45`):
```ts
let message;
if (razorpay_subscription_id) message = `${razorpay_payment_id}|${razorpay_subscription_id}`;
else if (razorpay_order_id)   message = `${razorpay_order_id}|${razorpay_payment_id}`;
else return false;
return verifyHmacSha256(keySecret, new TextEncoder().encode(message), razorpay_signature);
```
Web Crypto verify (`api/_crypto.ts:31-53`):
```ts
export async function verifyHmacSha256(secret, message, sigHex) {
  try {
    const subtle = crypto.subtle;
    const key = await subtle.importKey('raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = hexToBytes(sigHex);
    return await subtle.verify('HMAC', key, sigBytes, message);
  } catch { return false; }
}
```
`hexToBytes` returns `Uint8Array(0)` on bad input → `verify` returns false (clean 403, never 500).

**How premium is granted** — table `profiles`, **service-role client** (`SUPABASE_SERVICE_ROLE_KEY`;
anon is subject to RLS + the `guard_premium_columns` trigger and cannot write premium columns for
another user). Subscription grant (`verify-payment.ts:205-214`): `premium_status:true`,
`subscription_id`, `subscription_status:'active'` — **keyed `.eq('id', user_id)`**. Report grant
(`:224-239`): `birthday_reports.is_paid:true` + 30-day `expires_at`, keyed `.eq('slug', slug)`.

> ⚠️ **THE `id` vs `user_id` PREMIUM-GRANT TRAP (known, documented, high-risk) — see §6.**
> `profiles.id` is a **random** PK (`handle_new_user` inserts `(user_id,…) VALUES (NEW.id,…)`; `id`
> defaults `gen_random_uuid()`). Premium grant here (`:214`) and the webhook (`razorpay-webhook.ts:123`)
> key `.eq('id', user_id)`, but the client reads premium `.eq('user_id', …)` (`useAuth.ts:80/103/229`),
> and the same file's invoice block correctly uses `.eq('user_id', …)` with the comment "profiles.id is
> a random PK". This only works if in the **live DB** `profiles.id == user_id` for real rows.
> `docs/FINAL-FIXES-REPORT.md:283-286` explicitly kept the premium-grant sites on `.eq('id', …)` as
> "out of scope — premium-grant logic must stay". **Detect regression:** a paying user whose `profiles`
> row (keyed by `user_id`) does not get `premium_status=true`, or who pays but the client still shows
> non-premium. **New code must always key `profiles` on `user_id`.**

**GST invoice** — non-fatal try/catch (`:272-380`); RPC `db.rpc('issue_invoice', { p:{…} })`
(idempotent by `payment_id`); place-of-supply persisted on first subscription payment keyed
`.eq('user_id', user_id)` (`:305-312`). If it throws, payment + entitlement already committed; error
logged and swallowed.
**Idempotency:** `payments.razorpay_payment_id` UNIQUE; Postgres `23505` treated as idempotent success
(`:194-202`). `issue_invoice` dedupes on `payment_id`.

### 4d. `razorpay-webhook.ts` (FROZEN)
"Frozen" = it carries **no GST region declaration** for renewal charges; the daily sweep back-fills
those invoices (see 4g). Do not add invoicing here. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`RAZORPAY_WEBHOOK_SECRET` (`:34`).
Signature (`:40-49`): read raw body **once** via `arrayBuffer()`, HMAC-verify with
`verifyHmacSha256(webhookSecret, rawBody, x-razorpay-signature)` → 403 on invalid.
Idempotency (`:68-83`): insert into `webhook_events`; `23505` → 200 `{duplicate:true}` so Razorpay stops
retrying. **All handler errors return 200** (`:237-241`) so Razorpay doesn't retry-storm.
| Event | Action |
|---|---|
| `subscription.activated` / `.charged` | resolve userId (notes or `auth.admin.listUsers`); `profiles` → `premium_status:true`, `subscription_id/plan/status:'active'`, `premium_until=current_end`; upsert `payments`; `.activated` sends `premium_activated` email. Keyed `.eq('id', userId)` (see trap) |
| `subscription.cancelled` | keep `premium_status:true`, `subscription_status:'cancelled'`, `premium_until=current_end`; send cancellation email (access-until date) |
| `subscription.completed` / `.expired` / `.halted` / `.paused` | `premium_status:false`, status=suffix; **no email** |
| `payment.failed` | log only |
Service role is required for `auth.admin.listUsers/getUserById` (admin-only) and RLS-bypassing writes.

### 4e. GST invoicing
**Prices GST-inclusive; back-calculation is identical in `verify-payment.ts:318-327`,
`invoice-sweep.ts:115-124`, and DB (`NOTES-credit-notes.sql`):**
```
taxable  = round(gross / 1.18, 2)
totalTax = round(gross - taxable, 2)
CGST_SGST: cgst = round(taxable * 0.09, 2); sgst = totalTax - cgst   // SGST is PLUGGED
IGST:      igst = totalTax
EXPORT:    taxable = gross; cgst = sgst = igst = 0; fx_rate required (fallback 87.20)
```
Per price point (domestic in-state):
| Gross | Taxable | CGST | SGST | Foots |
|---|---|---|---|---|
| ₹199 (report) | 168.64 | 15.18 | 15.18 | 199.00 |
| ₹299 (monthly) | 253.39 | 22.81 | 22.80 | 299.00 |
| ₹2499 (annual) | 2117.80 | 190.60 | 190.60 | 2499.00 |
IGST case: same taxable, `igst = totalTax`. USD with no Indian state → EXPORT (zero-rated, `fx_rate`
mandatory; fixed fallback **87.20**). Tax-mode select: state_code `36`→CGST_SGST; other state→IGST;
USD/no-state→EXPORT; INR/no-state→IGST (an INR charge never becomes EXPORT).

**`issue_invoice(p jsonb) returns public.invoices`** (SECURITY DEFINER, `NOTES-invoicing.sql:125-193`):
idempotent by `payment_id`; picks series by tax_mode (`EXPORT→BX/26-27` else `BC/26-27`); row-locks
`invoice_counters` (`UPDATE … next_value+1 RETURNING next_value-1`); inserts invoice
`invoice_no = series || '/' || seq` in one txn; on `unique_violation` returns the row that landed first
(burns one number rather than double-invoicing). `invoice_counters` is a **plain table, not a Postgres
SEQUENCE** — a rolled-back insert must not burn a number.

**buyer_state / buyer_state_code / buyer_country** — on `invoices` (frozen at issue; null state for
exports) and on `profiles` (added by `NOTES-subscription-invoicing.sql`, written by
`verify-payment.ts:305-312` on first subscription payment, keyed `user_id`). Legally required as the
GST **place of supply** for every renewal (which arrives via the frozen webhook with no region of its
own — the sweep reads these persisted columns).

**PDF** — HTML template `src/lib/invoice-generator.ts` `generateInvoiceHTML(inv)`: self-contained,
system fonts only, inline base64 logo, A4 `@page`, renders only values already on the `invoices` row
(never re-computes tax). Rendered to PDF by `api/_pdf.ts` `renderPdfFromHtml()` which POSTs the
**Cloudflare Browser Rendering REST API**
`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering/pdf`
(`Bearer ${BROWSER_RENDERING_TOKEN}`, 10s timeout). Returns bytes only if body starts with `%PDF-`;
**returns `null` on any failure** and callers MUST fall back to attaching the HTML (invoice delivery is
a legal obligation, must not depend on the render service). Emailed via `api/_invoice-email.ts` →
Resend `POST https://api.resend.com/emails`, `from: 'BornClock <hello@bornclock.com>'`,
`attachments:[{ filename, content /* base64 */ }]`.

### 4f. One-time payments (birthday reports)
`create-order.ts`: server picks amount from `PRODUCT_AMOUNTS`; double-purchase guard (409 if
`birthday_reports.is_paid`); creates a Razorpay **order** (`/v1/orders`, notes carry region + slug);
returns `{ order_id, amount, currency, report_slug }`. verify-payment path differs from subscription:
sig message = `order_id|payment_id`; amount from the **order**; entitlement = `birthday_reports.is_paid`
+ 30-day expiry keyed by slug (not `profiles`).

### 4g. Daily ops cron / invoice sweep (`api/invoice-sweep.ts`)
Exists because renewals hit the **frozen** webhook (no region) — the sweep back-fills their invoices.
Scheduled at **`10 6 * * *`** by `functions/_worker.ts scheduled()` (which fires BOTH `/api/ops-monitor`
AND `/api/invoice-sweep`). Steps: load `payments` where `product='subscription'` (limit 1000) → build a
Set of already-invoiced `payment_id` (anti-join) → `pending` = subscription payments not failed, with a
`razorpay_payment_id`, not already invoiced (sliced to `MAX_PER_RUN=200`) → per payment read
place-of-supply from `profiles` (**skip + log if no region persisted — never issue a wrong split**) →
same GST back-calc → `issue_invoice` → render + `sendInvoiceEmail`. **Double idempotency:** the sweep
skips already-invoiced ids AND `issue_invoice` dedupes on `payment_id` (the inline-invoiced first
payment is never double-billed; a re-run is a no-op).

### 4h. Cancellation & subscription management
No dedicated cancel endpoint in-repo — handled by the webhook. `subscription.cancelled` =
**cancel-at-period-end**: `premium_status:true`, `subscription_status:'cancelled'`,
`premium_until=current_end`; the client derives `isPremium=false` once `premium_until` passes.
`subscription.halted` (payment failed) = **immediate**: `premium_status:false`, no grace, no email.

### 4i. Test environment
- **Recurring/subscription test card: `5267 3181 8797 5449`, CVV `123`, OTP `123456`**
  (`scripts/diagnose-razorpay.mjs:261-262`). The `4111…` Visa card does **NOT** support recurring
  mandates in test mode — this caused "recurring payments not supported" errors.
- Test vs live: Preview env = TEST keys (`rzp_test_…`), Production = LIVE. `VITE_RAZORPAY_KEY_ID` is
  baked into the bundle at build — wrong key opens checkout in the wrong mode regardless of server keys.
- Never diagnose a payment failure in a content-blocked browser (§6, Firefox/uBlock).
- Payment diagnostics: `node --env-file=.env.local scripts/diagnose-razorpay.mjs --latest`
  (`--sub <id>`, `--create-fresh`, `--cancel-orphans`).

---

## SECTION 5 — DATABASE

Source of truth: `supabase/migrations/*.sql` in order. **Timestamped files are applied migrations;
`NOTES-*.sql` are manual/unapplied operational notes** (apply statement-by-statement in Studio).
Project ref `jwrpqiypvystivtqyhro`.

### Applied tables (cumulative shape)
- **`profiles`** (see full list below).
- **`user_roles`** — `id` uuid PK, `user_id` uuid NOT NULL FK→auth.users CASCADE, `role app_role` NOT NULL,
  `created_at`, UNIQUE(user_id, role). Enum `app_role = (admin, moderator, user)`.
- **`analytics_events`** — id, user_id?, session_id, event_type NOT NULL, event_name NOT NULL,
  metadata jsonb, created_at.
- **`blog_posts`** — id, slug UNIQUE, title, meta_title, excerpt, meta_description, content, author
  DEFAULT 'Team Celeb Clock', author_bio, category, tags[], keywords[], featured_image, og_image,
  read_time DEFAULT 5, faqs jsonb, `status` (draft|pending_review|approved|published|rejected),
  reviewed_by, review_notes, is_auto_generated, generation_prompt, created/updated/published/scheduled.
- **`user_reviews`** — id, user_id, rating 1–5, title, content, country, display_name, is_approved,
  is_featured, created/updated. Seeded 7 (8 live per NOTES).
- **`blog_drafts`, `email_templates`, `status_checks`** — created by `20260525172213_mongodb_to_supabase`
  (filename misleading; it's these three tables, not a Mongo import).
- **`celebrity_sitelinks`** — id serial, name, birth_date, birth_month_day (MM-DD), death_date,
  sitelinks int (Wikipedia edition count), nationality, nationality_code, occupation, wikidata_id,
  wikipedia_url, created_at (+ `known_for`, `tier` added live 2026-07). UNIQUE(name, birth_date).
- **`promo_codes`** / **`promo_code_redemptions`** (UNIQUE(code,user_id)).
- **`celebrity_boosts`**, **`longevity_scores`** (UNIQUE user/week), **`leaderboard_entries`**
  (user_id UNIQUE), **`family_members`** (+ `relationship`), **`pdf_reports_log`**.
- **`birthday_reports`** — id, user_id?, slug UNIQUE, recipient_name, recipient_dob, gifter_name,
  personal_message, country DEFAULT 'India', gender, report_data jsonb, is_premium_report, expires_at
  NOT NULL, created_at, view_count, `last_viewed_at` (added `20260705…`). ⚠️ `is_paid` and
  `unlock_source` are **read/written by code but NOT defined in any migration** — live-DB only (see gaps).
- **`payments`** — id, user_id FK SET NULL, `razorpay_payment_id` UNIQUE NOT NULL, razorpay_order_id,
  razorpay_subscription_id, amount int, currency DEFAULT 'INR', status DEFAULT 'captured', product
  CHECK(subscription|birthday_report), report_slug FK→birthday_reports(slug) SET NULL, created_at.
- **`webhook_events`** — event_id PK, event_type, payload jsonb, processed_at.
- **`report_downloads`** — id, report_slug FK CASCADE, user_id FK SET NULL, downloaded_at.

### NOT-applied tables (NOTES)
- **`invoice_counters`** — `series` PK, `next_value` bigint CHECK>0. Seeded `BC/26-27`=1001,
  `BX/26-27`=1001 (+ `BN/26-27`=1001 from credit-notes). Plain table, not a sequence.
- **`invoices`** — see 4e; constraints: UNIQUE(series,seq); `invoices_foots`
  (`round(taxable+cgst+sgst+igst,2)=round(gross,2)` — do not relax); `invoices_export_shape`
  (EXPORT ⇒ taxes 0 AND fx_rate not null). payment_id UNIQUE (idempotency).
- **`credit_notes`** (BN series; foots check; refund_id UNIQUE), **`pending_reviews`** (ops inbox),
  **`feedback`** (two-key publication), **`email_subscribers`** (REVOKE all from anon/authenticated).

### `profiles` — full column list
Base (`20250921…`): `id` uuid PK DEFAULT gen_random_uuid() (**random synthetic PK**),
`user_id` uuid NOT NULL UNIQUE FK→auth.users CASCADE (**auth link**), `name`, `email`,
`premium_status` bool DEFAULT false, `email_notifications` bool (DEFAULT flipped to true in
`20260124…`), `created_at`, `updated_at`. Added `20260122…`: `first_name`, `last_name`, `country`,
`blog_subscription` DEFAULT true. Added `20260615180000_subscription_fields`: `subscription_id`,
`subscription_plan`, `subscription_status` DEFAULT 'none', `premium_until`.
NOTES-added (not applied): `buyer_state`, `buyer_state_code`, `buyer_country`, `welcomed_at`
(subscription-invoicing); `promo_premium_until` (promo-column); `weekly_digest` (email-subscribers).
⚠️ **Gaps** — `report_credits` and `credits_granted_month` are read/written by
`redeem_report_credit`/`get-credits` but **have no ADD COLUMN in any migration** → live-DB only.

### RLS (highlights + gotchas)
- `profiles`: owner CRUD by `user_id`; admin view/update via `has_role(...,'admin')`. The
  `guard_premium_columns` trigger further restricts which columns a non-service-role UPDATE may touch.
- `payments`, `webhook_events`, `invoice_counters`: **service-role only** (deny-by-default; all access
  via `api/*`).
- `birthday_reports`: **public SELECT while `expires_at > now()`** (slug is the public access key);
  authenticated INSERT/SELECT own.
- `report_downloads`: anon INSERT allowed (guest recipients record downloads).
- `analytics_events`: INSERT `WITH CHECK (user_id IS NULL OR auth.uid()=user_id)` (fixed from the old
  spoofable `WITH CHECK(true)`).
- NOTES REVOKE gotchas: `pending_reviews` and `email_subscribers` REVOKE INSERT/UPDATE/DELETE from
  anon+authenticated — even admins write only via service-role or the SECURITY DEFINER RPC.

### Triggers
| trigger | table | function | purpose |
|---|---|---|---|
| `update_profiles_updated_at` | profiles | update_updated_at_column | stamp updated_at |
| `on_auth_user_created` | auth.users | handle_new_user | create profile row on signup |
| `update_blog_posts_updated_at` / `update_user_reviews_updated_at` | resp. | update_updated_at_column | stamp updated_at |
| `trg_guard_premium_columns` | profiles | guard_premium_columns | block non-service-role writes to premium/subscription columns |
| `update_feedback_updated_at` | feedback (NOTES) | update_updated_at_column | stamp |

### Functions / RPCs
`update_updated_at_column()`; `handle_new_user()` (SECURITY DEFINER; inserts `(user_id,…) VALUES
(NEW.id,…)` — **does not set `id`**, hence the random-PK trap); `has_role(uuid, app_role)`
(SECURITY DEFINER, canonical admin gate); `guard_premium_columns()`; `touch_report_view(p_slug)`;
`increment_report_view_count(report_id)` (the view-count RPC, GRANT anon/authenticated);
**`issue_invoice(p jsonb)`**, **`issue_credit_note(p jsonb)`**, **`redeem_report_credit(p_user_id,
p_slug)`** (service-role only; the ONLY way a credit is spent — locks report+profile, ownership +
idempotency + no-credits checks, decrements `report_credits`, sets `is_paid`/`unlock_source='credit'`
+30d; depends on the live-only columns), **`mark_review_reviewed(p_id)`** (email-allowlist gated).

### Migration history (one-liner each)
`20250921…` profiles + RLS + handle_new_user · `20250922062204` handle_new_user→SECURITY DEFINER ·
`20250922062441` seed founder premium · `20260122…` app_role + user_roles + has_role + profile cols ·
`20260123…` email_notifications default true + analytics_events · `20260124…` blog_posts ·
`20260125…` user_reviews (+7 seed) · `20260525…mongodb_to_supabase` blog_drafts/email_templates/status_checks ·
`20260605…rls_security_fixes` analytics spoof fix + admin profile update + review self-delete ·
`20260612…celebrity_sitelinks` · `20260614120000 promo_codes` · `…130000 celebrity_boosts` ·
`…140000 longevity_scores` · `…150000 leaderboard` · `…160000 family_members` · `…170000 pdf_reports_log` ·
`20260615180000 subscription_fields` · `20260616120000 birthday_reports` · `20260619100000 relationship` ·
`20260705120000 payments-and-rls` (payments/webhook_events/report_downloads + guard_premium_columns +
touch_report_view + last_viewed_at) · `20260708100000 view_count_rpc`.
NOTES (unapplied): invoicing, subscription-invoicing, credit-notes, admin-invoice-read, admin-roles,
feedback, ops-inbox, email-subscribers, promo-column, redeem-credit-atomic, unlock-source,
delete-account-fks, user-reviews-disposition.

### Operational rules (DB)
- **Confirm the Supabase Studio project breadcrumb** = BornClock (`jwrpqiypvystivtqyhro`, "Lifespan")
  before ANY DDL — DDL has been run against the wrong project before.
- **Large multi-statement pastes silently roll back** in Studio (no error, 0 rows). Run
  statement-by-statement and confirm each; for bulk data use a Node script (service-role, per-row) —
  pattern `scripts/migrate-indian-celebs.mjs`. `[EXACT LINE LIMIT: not numerically stated in the
  migration files; the detail lives in docs/ARCHITECTURE-DECISIONS.md §2]`.
- Deliberately keep `invoices`/`credit_notes`/`payments` FKs `ON DELETE SET NULL` (retain GST records
  ~8 years, de-identified) — do NOT change to CASCADE. `session_replication_role = replica` is **not**
  used in this repo's migrations.

---

## SECTION 6 — KNOWN BUGS & INVARIANTS

**FIXED 2026-08-28 — `profiles.id` vs `user_id` premium grant.** `handle_new_user` never sets `id`
(random PK). The August 2026 audit verified against the live DB that **`id != user_id` for ALL rows**,
so the old grants `.eq('id', user_id)` (`verify-payment.ts`) + `.eq('id', userId)` (`razorpay-webhook.ts`)
matched **zero rows** — the "kept deliberately" decision in `docs/FINAL-FIXES-REPORT.md:283-286` was a
latent bug, not a working design. **Both grant sites now key on `user_id`** (matching the read side in
`useAuth.ts` and the invoice block). The webhook cancelled/expired/halted handlers stay keyed on the
real `id` PK because they first select the row by `subscription_id`. **INVARIANT (guarded by a test):**
a `profiles` write and its read MUST use the same key column — always `user_id`. See
`BORNCLOCK_AUDIT_FIXES.md` and `api/__tests__/audit-fixes-invariants.test.ts`.

**INVARIANT — `guard_premium_columns` trigger** (`20260705120000`): blocks non-service-role UPDATEs to
`premium_status`/`subscription_*`/`premium_until`. Consequence: the client can never self-grant premium;
only `verify-payment`/webhook (service role) can. Do not drop it.

**BUG CLASS — ESM `.js` extension** (§2): missing `.js` on a relative import in `api/`/`functions/` = a
runtime `ERR_MODULE_NOT_FOUND` crash on deploy, invisible to local dev + gauntlet. Add `.js` immediately
to any new shared module.

**INVARIANT — deploy with the local wrangler binary** (`./node_modules/.bin/wrangler deploy`), never
`npx wrangler` (re-downloads, hangs on 1400+ assets).

**BUG — large SQL paste silent rollback** (§5): Studio rolls back big pastes with no error. Use Node
scripts for bulk; single statements only in Studio.

**INVARIANT — `npm run preview` for layout/print verification** (§3): `dev` cold-compiles and lacks the
print CSS path; `preview` serves built `dist/`.

**RULE — never `git add .`**: `package.json` + `package-lock.json` are permanently dirty from an aborted
chromium install (`docs/ARCHITECTURE-DECISIONS.md:20`). Stage specific files per commit.

**BUG — Firefox/uBlock content blockers half-load Razorpay**: suppress the phone step, show wrong
amounts (₹5 vs ₹299), throw spurious `input_validation_failed`. Confirmed via Safari control. **Only
test payments in Safari / clean Chrome / incognito with extensions off.** Never diagnose a payment
failure seen in a content-filtered browser. (Console `moz-extension://…content-end.ts.js` = extension
noise, ignore.)

**RULE — "rendered pages ≠ DB verification"** and **"built ≠ run and passed"** (§3): verify against the
DB and the live Worker (post-deploy smoke), not a rendered page or a green local build.

**RULE — wrangler secret extraction**: `grep '^NAME=' .env.local | cut -d'=' -f2 | tr -d '"' | tr -d '\n'`.
**NOT `cut -d'"' -f2`** — that yields an EMPTY secret for unquoted lines, which passes
`wrangler secret list` (name exists) but fails at runtime (empty string). Verify with a real API call.

**INVARIANT — celebrity ordering** (§9): every list is global `sitelinks DESC`. Silent country
reordering is prohibited (caused prerender/hydration mismatch + cross-surface inconsistency). India-first
sorting exists ONLY in the print report (`ReportView.tsx:915`) and as additive labeled sections.

**INVARIANT — system fonts only** in print/invoice HTML (Google Fonts corrupted print glyphs).

**INVARIANT — health/longevity inputs are browser-only, never persisted server-side**
(`docs/ARCHITECTURE-DECISIONS.md:236`; `5Q-addendum-storage-posture.md`).

**EasyList / ad-blocker class-name prohibition** — `[NOT DEFINED IN REPO]`. It appears only as a
to-document item in `docs/PROJECT_CONTEXT-PROMPT.md:181-183` (intended prohibited terms: **ad, banner,
promo, sponsor** in class names / filenames / routes, because ad-blocker filter lists hide such
elements). No rule or rationale is committed anywhere else. **Treat as an active convention to honour**
(avoid those tokens) even though the formal rule was never written.

---

## SECTION 7 — ENVIRONMENT VARIABLES

All server secrets are Cloudflare secrets bridged via `BRIDGE_KEYS` (§2). Client vars are `VITE_`-prefixed
and baked at build. Missing-value failure modes:

| Name | Purpose | Where | Read by | Test vs live | Missing ⇒ |
|---|---|---|---|---|---|
| `SUPABASE_URL` | Supabase REST base | `[CLOUDFLARE SECRET]` / `[IN .env]` | most `api/*`, scripts | same | all DB calls fail |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role (RLS bypass) | `[CLOUDFLARE SECRET]` | all server DB writes | same | all writes/grants fail |
| `VITE_SUPABASE_*` (anon) | browser client | baked / `client.ts` | `src/integrations/supabase/client.ts` | same | client can't read Supabase |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | server Razorpay auth | `[CLOUDFLARE SECRET]` | create-order/subscription, ops-monitor, verify-payment | TEST(preview)/LIVE(prod) | order/subscription create + amount fetch fail |
| `VITE_RAZORPAY_KEY_ID` | client checkout key | baked | RazorpayService, verify-payment | TEST/LIVE | checkout opens wrong/none |
| `RAZORPAY_WEBHOOK_SECRET` | webhook HMAC | `[CLOUDFLARE SECRET]` | razorpay-webhook | same | all webhooks 403 (renewals stop updating) |
| `VITE_RAZORPAY_PLAN_*` (4) | plan IDs | baked (+ hardcoded live fallback) | pricing.ts, create-subscription | TEST/LIVE | falls back to hardcoded live IDs (client); server 400 |
| `RESEND_API_KEY` | email send | `[CLOUDFLARE SECRET]` | all senders | same | no emails (invoices/receipts/nudges) |
| `BROWSER_RENDERING_TOKEN` / `CF_ACCOUNT_ID` | CF Browser Rendering PDF | `[CLOUDFLARE SECRET]` | `_pdf.ts`, og-report | same | PDF/OG return null → HTML fallback |
| `CRON_SECRET` / `VITE_CRON_SECRET` | cron auth | `[CLOUDFLARE SECRET]` | daily-email-cron, `_cron` | same | cron endpoints 401 |
| `ADMIN_EMAIL` | ops-alert recipient | `[CLOUDFLARE SECRET]` | `_ops`, ops-digest, weekly-digest | same | falls back to `himanshu1305@gmail.com` |
| `ADMIN_SECRET_KEY` | admin API auth | `[CLOUDFLARE SECRET]` | admin endpoints | same | admin ops blocked |
| `OPS_BASE_URL` | self-call base for cron | `[CLOUDFLARE SECRET]` | ops-monitor, `_worker` | same | defaults to workers.dev URL |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `COACH_PROVIDER` | AI Longevity Coach | `[CLOUDFLARE SECRET]` | longevity-coach | same | coach fails / provider switch |
| `PRODUCTION_URL` | report links in email | `[CLOUDFLARE SECRET]` | verify-payment | same | defaults `https://bornclock.com` |
| `DIGEST_LIVE` | gate weekly digest send | `[CLOUDFLARE SECRET]` | weekly-digest, `_worker` | same | weekly digest no-ops unless `true` |

Full canonical list: `REQUIRED_ENV_VARS.md`.

---

## SECTION 8 — EXTERNAL SERVICES

**Supabase.** Prod ref `jwrpqiypvystivtqyhro` (`https://jwrpqiypvystivtqyhro.supabase.co`). Region
`[IN DASHBOARD ONLY: Supabase → Project Settings]`. Clients: **anon** (hardcoded in `client.ts`, browser,
RLS-bound) vs **service-role** (server/scripts only, bypasses RLS — never expose to browser). Pooler vs
direct: `[IN DASHBOARD ONLY]`. Edge functions with `verify_jwt=false`: `generate-weekly-blog`
(header `X-Blog-Secret`), `delete-account` (validates its own Bearer). Single project for dev+prod.

**Razorpay.** Account = USD Vision AI LLP. Webhook `/api/razorpay-webhook`, HMAC-SHA256 via
`RAZORPAY_WEBHOOK_SECRET`. Registered webhook URL `https://bornclock.com/api/razorpay-webhook`
`[confirm IN DASHBOARD: Razorpay → Webhooks]`. Recurring test card `5267 3181 8797 5449`. International
cards not supported by Razorpay alone — tier-1 $ payments deferred to a second processor
(`docs/ARCHITECTURE-DECISIONS.md:331`). Live plan IDs: see §4a.

**Resend.** Verified domain **`bornclock.com`**; single from address **`hello@bornclock.com`** for both
transactional and invoice email (no separate invoice sender). Ops alerts fall back to
`himanshu1305@gmail.com`. Key `RESEND_API_KEY`.

**Cloudflare.** Project `bornclock`, account subdomain `usdvisionai`, custom domain
`staging.bornclock.com` (+ `bornclock.com` prod via same Worker). compat date `2026-07-08`, flags
`nodejs_compat` + `nodejs_compat_populate_process_env`, main `functions/_worker.ts`, assets `./dist`
(SPA fallback). Browser Rendering used for PDF/OG. Crons: `0 6 * * *`, `10 6 * * *`, `0 7 * * 1`,
`0 9 * * 0`. Page/Transform rules `[IN DASHBOARD ONLY]`.

**Anthropic / Gemini.** AI Longevity Coach (`/api/longevity-coach`), provider-switchable via
`COACH_PROVIDER`.

---

## SECTION 9 — SEO & CONTENT

- **Titles/metas:** injected at prerender by string replacement (§2), source of truth
  `scripts/prerender-titles.mjs` (`getTitleForRoute`). Families: static map (~50 routes) + templated
  `/zodiac/:sign`, `/numerology/:n`, `/birthstone/:month`, `/born-in-:month`, `/chinese-zodiac/:animal`,
  `/vedic-zodiac/:rashi`, `/compatibility/:a/:b`, `/born-on/:slug`(+`/india`), `/blog/:slug`,
  `/birthday/:month(/:day)`, `/answers/:slug`, fitness pages. Adding a page: App.tsx route +
  `prerender-routes.mjs` + `prerender-titles.mjs` entry.
- **Sitemap:** `scripts/generate-sitemap.mjs` → `dist/sitemap.xml` + `public/sitemap.xml`,
  `BASE_URL=https://bornclock.com`, **trailing slash on every URL except root** (Worker 307s non-slash),
  priority/changefreq by page family.
- **Celebrity data — table `celebrity_sitelinks`.** `sitelinks` = number of Wikipedia language editions
  (the fame proxy). Global seed ≈ **25,952 rows** (Hugging Face `jeggers/celebrity-dates`, CC BY 4.0,
  imported by `scripts/import-celebrity-sitelinks.mjs` from local `scripts/celebrity-dates.json`, batch
  upsert `onConflict:'name,birth_date'`). Live baseline ≈ **28,148 rows** (~2,627 Indian) after imports;
  UI copy says "25,000+"/"28,000". Indian discovery via **Wikidata SPARQL** (`import-indian-celebrities.mjs`):
  humans (`P31=Q5`) with `P27=Q668` (India), day-precision birth (`prec>=11`), `sitelinks>=15`. Curated
  overlay `src/data/indianCelebrities.ts` (598 entries, migrated via `migrate-indian-celebs.mjs`).
- **Enrichment** (`scripts/enrich-celebrities.mjs`): fills `wikidata_id`/`occupation`/`wikipedia_url`
  only where NULL (never overwrites, never touches dates); 4-stage matcher (exact→year→search→variants),
  HIGH/MEDIUM confidence auto, multi-candidate skipped; ≤1 req/s; resumable. ~93.4% enriched, 1,740 hard
  exceptions remain.
- **India born-on facet:** `scripts/gen-india-borndates.mjs` (MIN_COUNT=3) writes
  `src/data/indiaBornOnDates.json` — the source of truth for which `/born-on/:slug/india` pages exist.
- **Ordering invariant (§6):** global `sitelinks DESC` everywhere; India-first only in the print report
  (`ReportView.tsx:915-917`) and additive labeled sections. Methodology page:
  `/blog/how-we-rank-celebrity-birthdays-sitelinks`.

---

## SECTION 10 — TESTING & VERIFICATION

- **Unit (vitest):** no dedicated npm script; run `npx vitest` (`vitest.config.ts`: node env, `@`→`./src`).
- **E2E gauntlet (canonical):**
  ```bash
  npx playwright test --config e2e/launch-gauntlet/gauntlet.config.ts --reporter=list
  ```
  **Must pass `--config` explicitly** — the bare `playwright.config.ts` targets stale staging
  (`baseURL: https://staging.bornclock.com`) → false failures. Gauntlet + prelaunch target
  `http://localhost:3000` (Vite) proxying `/api`→`:3001`, so start both servers first:
  `wrangler dev --port 3001` and `npm run dev`, with `set -a; source .env.local; set +a`. Combined:
  `npm run test:prelaunch` (gauntlet `&&` prelaunch). 12 gauntlet specs (public pages, report lifecycle,
  multi-date PDF, auth, payment endpoints, returnTo, subscriptions, born-on, mobile, emails, SEO,
  edge cases). Prelaunch ~30 specs (auth, currency, delete-account, DOB, invoice-render, paywall,
  pricing-card states, coach, subscribe). Prelaunch retries=2 (cold-start flake policy), workers=1.
- **PDF export verification (the only reliable visual/print test).** `npm run build` is necessary but
  not sufficient for print — print chrome uses native `<table>` thead/tfoot (the only Blink mechanism
  that repeats per page), only provable by rendering to PDF.
  - `node scripts/verify-print.mjs` — renders the real Neeraj report (slug `osenyz63`) via
    Playwright+Chromium on `vite preview`; asserts running header/footer on every content page, page
    count, no dialog furniture; **embeds an invisible `·LIVE·`/`·FROZEN·` sentinel** so the run fails if
    a stale frozen blob was served instead of a live Supabase fetch. Read the sparse-page list, not just
    pass/fail. `--slug=` for other reports, `--rebuild` to force a fresh build.
  - `node scripts/verify-pdf-coverage.mjs` — mobile-emulated (390px, DSF 3) rasterization measuring
    vertical fill (`MIN_FILL`) to catch "content-then-void" sparse pages; `--cmdp` simulates native Cmd+P.
- **Payment E2E on test keys:** ensure Preview/TEST `VITE_RAZORPAY_KEY_ID`; use recurring test card
  `5267 3181 8797 5449` (OTP `123456`) in a clean browser; complete checkout → confirm
  `/api/verify-payment` returns `{success:true}` and the `profiles` row (by `user_id`) reflects premium.
- **Post-deploy smoke (mandatory):** see §11.

---

## SECTION 11 — OPERATIONAL RUNBOOKS

**Deploy to production**
```bash
# from repo root, on the intended branch (main is prod; deploys are manual)
npm run build                 # vite + og + prerender + sitemap (~10 min)
npx tsc --noEmit              # must be clean
./node_modules/.bin/wrangler deploy    # NEVER npx wrangler
```
A trailing `schedules`/exit-1 cron warning after "Deployed bornclock triggers" is non-fatal.

**Post-deploy verification (mandatory after any API change)**
```bash
curl -s -X POST https://staging.bornclock.com/api/create-order \
  -H 'Content-Type: application/json' \
  -d '{"product":"birthday_report","report_slug":"zzzzzzzz","userId":"test-user","currency":"INR"}'
# expect exactly:  {"error":"Report not found"}
```
Any other response ⇒ env vars missing from `BRIDGE_KEYS`/dashboard, or an ESM `.js` resolution break.

**Rotate a secret**
```bash
VAL=$(grep '^RESEND_API_KEY=' .env.local | cut -d'=' -f2 | tr -d '"' | tr -d '\n')  # NOT cut -d'"'
printf '%s' "$VAL" | ./node_modules/.bin/wrangler secret put RESEND_API_KEY
```
Then verify with a real API call (not `wrangler secret list`). For `VITE_*`/Razorpay keys: Preview=TEST,
Production=LIVE; the `VITE_` value is baked at build so rebuild+redeploy after changing it.

**Add an environment variable** — server: add the CF secret AND add its name to `BRIDGE_KEYS`
(`functions/_worker.ts:31`) or the handler can't read it. Client: prefix `VITE_`, rebuild.

**Run a migration safely** — Supabase Studio SQL editor, **confirm the project breadcrumb first**
(`jwrpqiypvystivtqyhro`), run statements **one at a time**, confirm each. For bulk data use a Node
service-role script (`scripts/migrate-indian-celebs.mjs` pattern), never a big Studio paste.

**Roll back a bad deploy** — no discrete documented procedure; redeploy the previous good build (check
out the prior commit, `npm run build`, `./node_modules/.bin/wrangler deploy`). Phase base/commit hashes
for manual reverts are in `RESTRUCTURE_REPORT.md`.

**Dormancy sweep** — `scripts/sweep-dormant-reports.sql` (SELECT to review, then DELETE) run manually in
Studio; reports unviewed 12 months. Quarterly; no scheduler by design.

---

## SECTION 12 — RECURRING LESSONS

**RULE:** Deploy only with `./node_modules/.bin/wrangler deploy`.
**WHY:** `npx wrangler` re-downloads and hangs on 1400+ dist assets.
**HOW:** use the local binary; a trailing schedules exit-1 warning is non-fatal.

**RULE:** Every relative import in `api/`/`functions/` ends in `.js`.
**WHY:** ESM resolution needs it at runtime; TS2835 is a real `ERR_MODULE_NOT_FOUND`, not a type nit; dev+gauntlet don't catch it.
**HOW:** add `.js` to new shared modules immediately; run the post-deploy smoke curl.

**RULE:** Never modify `api/verify-payment.ts`, `api/razorpay-webhook.ts`, `api/_crypto.ts` without
explicit instruction.
**WHY:** they are frozen; the billing flow (idempotency, GST, HMAC) is load-bearing.
**HOW:** all `profiles` access keys on `user_id`; verify behaviour against the live DB after any change.

**RULE:** A `profiles` write and its read MUST use the same key column — always `user_id`, never the
random `id` PK.
**WHY:** `profiles.id` defaults to `gen_random_uuid()` and (verified 2026-08-28) `id != user_id` for
every live row. The premium grant historically keyed on `id` and silently matched zero rows — paying
users never became premium. Fixed 2026-08-28; guarded by `api/__tests__/audit-fixes-invariants.test.ts`.
**HOW:** grep new endpoints for `.eq('id',` on `profiles`; it should almost always be `.eq('user_id',`.

**RULE:** Operational DDL in `supabase/migrations/NOTES-*.sql` can be silently never applied — treat a
NOTES file as "maybe applied, verify."
**WHY:** the invoicing schema (`invoices`/`invoice_counters`/`issue_invoice()`) lived only in
`NOTES-invoicing.sql` and was hand-applied to prod with nothing in the migration history recording it;
a rebuild-from-migrations would have silently shipped payments with no invoicing (caught non-fatally).
**HOW:** promote applied NOTES DDL to a timestamped, idempotent migration
(`20260828120000_invoicing_schema_and_fx_provenance.sql` is the pattern); verify table/function
existence against the live DB with a read-only script before assuming.

**RULE:** Add a new secret to `BRIDGE_KEYS` too.
**WHY:** CF `env` is a Proxy; unlisted keys are invisible to `api/*` handlers even though the secret exists.
**HOW:** edit `functions/_worker.ts:31-42`, redeploy, smoke-test.

**RULE:** Never bulk-paste SQL into Supabase Studio; confirm the project breadcrumb before DDL.
**WHY:** large pastes silently roll back (0 rows), and DDL has been run against the wrong project.
**HOW:** one statement at a time; Node service-role scripts for bulk.

**RULE:** Test payments only in Safari / clean Chrome / incognito with extensions off.
**WHY:** content blockers half-load Razorpay (wrong ₹5 amount, missing phone step, false `input_validation_failed`).
**HOW:** reproduce in a clean browser before diagnosing; ignore `moz-extension` console noise.

**RULE:** Use the recurring test card `5267 3181 8797 5449` for subscriptions.
**WHY:** `4111…` doesn't support recurring mandates in test mode ("recurring payments not supported").

**RULE:** Verify against the DB and the live Worker, not a rendered page or a green local build.
**WHY:** stale deploys make removed code look like live data; local green ≠ platform env/resolution correct.
**HOW:** post-deploy smoke curl; `verify-print.mjs` `·LIVE·` sentinel; query the DB directly.

**RULE:** `npm run preview` (not `dev`) for layout/print verification; system fonts only in print HTML.
**WHY:** print CSS lives only in the built print path; Google Fonts corrupt print glyphs.

**RULE:** Never `git add .`; extract secrets with `cut -d'=' -f2 | tr -d '"'`.
**WHY:** package.json/lock are permanently dirty; `cut -d'"'` yields empty secrets that pass `secret list` but fail at runtime.

**RULE:** Keep celebrity lists globally `sitelinks DESC`; avoid ad/banner/promo/sponsor tokens in
class names, filenames, routes.
**WHY:** silent country reordering caused prerender/hydration mismatch; ad-blocker filter lists hide
matching elements (the "why" was never formally written — treat as convention).

---

### Open gaps flagged during compilation (verify against the live DB / dashboards)
1. `profiles.report_credits`, `profiles.credits_granted_month`, `birthday_reports.is_paid`,
   `birthday_reports.unlock_source` are used by code but have **no `ADD COLUMN` in any migration** —
   they exist in the live DB only (apply the relevant `NOTES-*.sql`).
2. The `.eq('id', user_id)` premium-grant trap (§4c/§6) — confirm live `profiles.id == user_id`.
3. `public/_headers` / `public/_redirects` do not exist (caching is in `_worker.ts`).
4. GitHub repo URL, Supabase region/pooler, Razorpay/Resend/Cloudflare dashboard specifics are
   dashboard-only.
5. The EasyList prohibition is a convention only — never formally documented in-repo.
