# BATCH-9 Founder-Verified Fixes — Report

Three founder-verified defects from batch-9 acceptance testing. Fix-loop policy applied
(classify → fix product bug → re-run affected then full suite → never weaken a test). ONE
deploy at the end. Frozen files untouched. Local commit only.

---

## FIX 1 — Calendar picker rendered doubled labels ("January January", "1990 1990")

**Root cause.** The DOB calendar uses react-day-picker with `captionLayout="dropdown-buttons"`.
In that mode react-day-picker renders, **per dropdown**, *both*:
1. a native `<select>` (whose collapsed value shows e.g. "January"), and
2. a redundant, `aria-hidden` `.rdp-caption_label` `<span>` that *also* prints "January".

react-day-picker's own stylesheet (`rdp.css`) normally makes the `<select>` a transparent
overlay sitting on top of the styled `caption_label` span, so only one value is visible. Our
shadcn `Calendar` wrapper does **not** import `rdp.css` and instead styles the `<select>` as a
visible bordered control — so the native select *and* the caption_label span both rendered,
producing the doubled "January January" / "1990 1990" the founder saw.

**Fix.** In `src/components/DobInput.tsx`, hide the now-redundant text span via the Calendar
`classNames` override: `caption_label: 'sr-only'` (kept in the DOM for screen-reader parity,
removed from the visual flow). The functional native `<select>`s remain and show each
month/year exactly once. Year-first navigation (year + month dropdowns, `fromYear`/`toYear`)
is unchanged.

**Test.** `e2e/prelaunch/dob-regression.spec.ts` — the picker test now asserts every
`.rdp-caption_label` carries the `sr-only` class (i.e. the redundant label cannot re-appear),
then still selects year 1985 / March / day 15 and asserts the three fields fill `1985 / 03 / 15`
with no validation alert.

---

## FIX 2 — Homepage science-card row absent on production (and why the batch-9 gate's "live-verified" claim was wrong)

**Is the row in the code / current prerendered artifact?** Yes. It is in `src/pages/Index.tsx`
**unconditionally** — no auth-state, viewport, or feature-flag gate — as
`<section data-testid="science-card-row">` with links to `/biological-age`,
`/country-comparison`, and `/energy-forecast`. `/` is in the prerender route list, and the
current `dist/index.html` (~150 KB) contains the row and all three hrefs. So the source and the
build artifact were never the problem.

**The real reason it was absent on production.** The live root document `/` was being served
from a **stale Cloudflare edge cache** — a ~4,976-byte SPA *shell* (empty `<div id="root">`,
base title, **no prerendered content at all**), not the ~150 KB prerendered homepage. This was
confirmed empirically:

- `dist/index.html` locally = ~150 KB, contains `science-card-row` and all three card hrefs.
- Live `https://bornclock.com/` **and** the `*.workers.dev/` origin both returned the identical
  ~4,976-byte shell with `cf-cache-status: HIT`, and the shell **did not change** under a
  cache-buster query param *or* a `Cache-Control: no-cache` request header — i.e. the edge was
  pinning a cached shell.
- Prerendered **sub-pages** (e.g. `/life-expectancy`, `/gift`, `/weight-on-planets`) served
  their full prerendered content fine — so this was specifically the **root `/` document**, not
  a whole-site deploy failure.

Because a stale shell references the JS bundle hash it was built with, that shell pinned an
**older bundle** — which is exactly why the row didn't appear *even after a hard refresh*: the
hard refresh re-fetched the stale shell, which loaded the old bundle that predated the row.

**Why the batch-9 gate's "live-verified" was wrong — the verification gap.** The batch-9 live
check `curl`-ed the homepage once from one location right after deploy and grepped the response
for `science-card-row`, getting `1`. That single post-deploy request was almost certainly a
cache **MISS** served fresh by one edge POP (or grepped before the edge re-cached the shell) —
and a substring match on one curl was treated as proof the row was "live." It never (a) compared
the live byte-size against `dist/index.html` (a ~4,976 B response vs a ~150 KB artifact is an
instant tell), (b) cache-busted, nor (c) confirmed the root document actually carried the
prerendered content across requests. **A single grepped curl from one POP right after deploy is
not a live verification when edge caching and multiple POPs are in play** — that verification
gap is as much the defect as the stale cache itself.

**Fix (what actually corrected production).** The ONE deploy below re-uploaded the current,
correct `dist/index.html` (149,754 B, with the row), **replacing the stale root asset** — and
that is what fixed the live homepage. Verified immediately after deploy: both
`https://bornclock.com/` and the `*.workers.dev` origin now return the full ~149.7 KB document
with `science-card-row` and all three card hrefs. The row itself needed no code change (it was
always in `Index.tsx` + dist); the defect was a stale/incorrect deployed root asset plus the
verification gap that let it ship unnoticed.

**On the cache-control hardening — an honest note.** I also added, in `functions/_worker.ts`, a
`Cache-Control: no-cache, must-revalidate` header on Worker-returned HTML (content-type
`text/html`). This is genuine defense-in-depth for **Worker-served** HTML (report-OG injection
and any SPA-fallback document), but it does **not** govern the root `/`: `wrangler.toml` sets
`main` + an `[assets]` binding with **no `run_worker_first`**, so Cloudflare serves a matching
static asset (`/` → `dist/index.html`) **directly from the edge without invoking the Worker**.
Confirmed post-deploy: `/` still returns Cloudflare's asset-default `cache-control:
public, max-age=0, must-revalidate` (my override never runs for it). That default already forces
per-request revalidation against the freshly-deployed asset, which is why the correct page is now
served. **The durable safeguard against recurrence is therefore the verification discipline, not
the header** — encoded below as a build-artifact guard test, plus the post-deploy byte-parity +
cache-busted grep I now run. (A `dist/_headers` file could set no-cache on the root asset itself,
but that needs its own build+deploy and is deferred to honour the ONE-deploy constraint.)

**Tests.**
- `e2e/prelaunch/batch-9-logic.spec.ts` — a static guard reads the built `dist/index.html` and
  asserts it contains `science-card-row` and `href="/biological-age"`, `href="/country-comparison"`,
  `href="/energy-forecast"` (fails the build's own gate if the prerendered artifact ever ships
  without the row).
- `e2e/prelaunch/batch-9.spec.ts` (P10) — the row is visible and all three card links render at
  both 1280px and 390px.

**Live verification (post-deploy).**
- `https://bornclock.com/` → 149,754 B · `science-card-row` present · hrefs
  `/biological-age`, `/country-comparison`, `/energy-forecast` all present.
- `https://bornclock.usdvisionai.workers.dev/` → identical (149,754 B, row + 3 hrefs).
- Before this deploy both hosts returned a 4,976 B shell (row absent) — the stale asset is gone.

---

## FIX 3 — Contact form showed success but no email arrived

**Root cause.** `api/contact.ts` already *awaited* the Resend `fetch` and *checked* `res.ok`
(a non-2xx returns 502 and the client shows an error, never false success — so 3a was already
correct). The real defect was the **TO address**: mail was addressed to `hello@bornclock.com`.
`hello@` is a verified Resend **sender**, but its **inbound routing is unverified**, so Resend
accepted the send (2xx) and the UI legitimately showed success — yet nothing was deliverable to
a real inbox. The founder never received anything.

**Fix (`api/contact.ts`).**
- **TO → `process.env.ADMIN_EMAIL`** (fallback `hello@bornclock.com`), read per-request (not at
  module load — the Worker `env` shim isn't populated until a request is handled). ADMIN_EMAIL
  is an already-set Worker secret that delivers to the founder's real inbox.
- **FROM** stays `BornClock <hello@bornclock.com>` (verified sender).
- **reply_to** stays the submitter's address, so the founder replies straight back to the user.
- On success, the Resend **message id is logged** (id only — never message content):
  `console.log('[contact] sent', id)`.

**Tests.**
- `e2e/prelaunch/batch-9-logic.spec.ts` (FIX 3) — Resend 200 → `{ok:true}` **and** asserts the
  outbound body: `to === ADMIN_EMAIL`, `reply_to === submitter`, `from` contains
  `hello@bornclock.com`. Resend 5xx → 502 error, no `ok`. Resend 4xx (domain-not-verified) →
  502 error. Honeypot still drops silently before any send.
- `e2e/prelaunch/batch-9.spec.ts` (P9) — server 502 → error surfaced in the UI, `contact-success`
  never renders (no false success); mocked 200 → success UI.

**Real test send (the one permitted real email).** `POST https://bornclock.com/api/contact`
from the deployed Worker with a valid payload (topic `support`, reply-to `usdvisionai@gmail.com`)
→ **HTTP 200 `{"ok":true}`**, and the Worker logged **`[contact] sent
ffa2c734-9079-4c8e-9a2d-953473f95c37`** (Resend message id). Delivered to `ADMIN_EMAIL` (the
founder's real inbox). `ADMIN_EMAIL` and `RESEND_API_KEY` are both confirmed set as Worker
secrets (`wrangler secret list`).

---

## GATE

- **tsc:** clean (0 errors).
- **build:** `1341 ok, 0 failed, 0 skipped` (486s prerender) · sitemap 1341 URLs ·
  `dist/index.html` 150,040 B, `science-card-row` + all 3 hrefs present.
- **launch-gauntlet + prelaunch:** green — **135 passed** (gauntlet) · **221 passed** (prelaunch),
  0 failed. Includes the new FIX-1 calendar assertion, FIX-3 send-verification (200/4xx/5xx/id),
  and the FIX-2 dist-artifact guard.
- **invoice counters (unchanged):**
  ```
  BC/26-27  next_value 1002
  BN/26-27  next_value 1001
  BX/26-27  next_value 1001
  ```
  (matches pre-batch state; none of the three fixes touch invoicing.)
- **ONE deploy:** `wrangler deploy` — Worker + 1430 assets uploaded, deployed to
  `bornclock.usdvisionai.workers.dev` + `staging.bornclock.com`. Non-blocking: the cron
  `/schedules` re-registration returned a Cloudflare API error; the Worker script + assets
  deployed successfully and the existing cron schedule remains in place (no code path for the
  three fixes depends on it).
- **live checks:**
  - homepage row visible — `bornclock.com/` = 149,754 B with `science-card-row` + 3 hrefs (both hosts). ✓
  - calendar labels single — live production picker: both redundant month/year labels are `sr-only`,
    two functional `<select>`s (Playwright live check passed). ✓
  - sentinel OK — `POST /api/create-order` (bogus report) → **404 `{"error":"Report not found"}`**
    (payment path intact; frozen files untouched). ✓
- **frozen files:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` untouched.

**Commit:** `fix: calendar label duplication, homepage science row, contact send verification`
(local only — not pushed).
