# Pre-Launch Test Suite — Report

**Branch:** develop (local commit only — NOT pushed).
**Scope:** 11 new Playwright suites (A–K) under `e2e/prelaunch/`, extending the existing 135-test launch gauntlet. Every product bug the suites surfaced was fixed (outside frozen files) and re-verified.
**Frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts`.
**Date:** 2026-07-30.

---

## 1. FINDINGS — product bugs found by the suite (all fixed)

No frozen-file blockers. Five genuine product bugs, all fixed outside frozen files and re-run green:

### F1 — "Generate another report" left the pricing card lying (Suite D) — highest value
`handleReset()` in `BirthdayReport.tsx` called `setDob('')`, but there is no `setDob` (dob is derived from day/month/year). At runtime this threw a **ReferenceError that aborted the reset before `refreshEntitlement()` ran**, so after generating the free trial report the card kept showing "1 free report" instead of the ₹199 price — the exact B3 bug the last batch tried to fix, still broken because the reset crashed. **Fix:** clear `day`/`month`/`year` instead of the non-existent `setDob`. This also removed a real tsc baseline error (46 → 45).
**Re-run:** `generation-flow.spec.ts` → green; card now flips to ₹199 after "Generate another".

### F2 — Solar System Ages rendered "Mars" first, not Earth (Suite J)
B6 added Earth as the first `ORBITAL_PERIODS` key, but `report_data` is stored as **JSONB, which normalises object-key order by length** — so on read-back `Object.entries(planetaryAges)` starts with "Mars" (4 chars), and Earth was mid-list. The "Earth first" guarantee only held in-memory before the DB round-trip. **Fix:** `ReportView.tsx` now renders planets in an explicit fixed order (`Earth, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune`), filtering to those present (old 7-planet reports still render correctly).
**Re-run:** `report-content.spec.ts` → green; first card is Earth, 8 cards total.

### F3 — /pricing free tier showed the wrong currency (Suite F)
`Pricing.tsx` free-tier price used `isIndia` (raw geo) instead of the resolved `currency`, so `?currency=USD` still rendered **₹0** to a US visitor. **Fix:** `currency === 'INR' ? '₹0' : '$0'`.

### F4 — /upgrade free tier hardcoded ₹0 (Suite F)
`Upgrade.tsx` hardcoded **₹0** for the free plan — a US visitor always saw ₹. **Fix:** derive `currency = resolveCurrency(countryInfo?.currency)` and gate the symbol on it.

### F5 — entitlement GET was browser-cacheable (Suite D, defensive)
`refreshEntitlement()` re-fetched the same `/api/report-entitlement` URL; without `cache:'no-store'` a browser could serve the stale pre-generation copy. **Fix:** added `{ cache: 'no-store' }`. (F1 was the primary cause; this hardens it.)

---

## 2. Fix-loop log (per suite)

| Suite | Iters | Test-bug (b) reclassifications — justified |
|---|---|---|
| A auth | 2 | Toast renders title+description as ONE concatenated status node (error-context: `"…Sign In ErrorInvalid login credentials"`). Switched from `getByText(title)` to `body.toContainText(/error text/)` — still asserts the specific error, just not the brittle title node. |
| B delete-account | 2 | Same toast-concatenation fix on the re-login assertion. |
| C pricing-card-states | 1 | — (green first run) |
| D generation-flow | 3 | Product bug F1/F5 (not a test bug). |
| E paywall-modal | 1 | — |
| F currency | 3 | (b) CTA-page priced CTA is behind `{result && …}` → added per-page calculator triggers. (b) `/pricing` shows only the monthly price and links to `/upgrade` for annual by design → parity re-scoped to "/upgrade lists monthly+annual+saving; /pricing monthly matches". Plus product bugs F3/F4. |
| G profile | 1 | — |
| H navigation | 2 | (b) `a[href="/birthday-report"].first()` matched the **hidden desktop** link at 390px → scoped to `:visible`. |
| I invoice-render | 1 | — (pure unit) |
| J report-content | 2 | Product bug F2 (not a test bug). |
| K ops-seo | 1 | — |

No assertion was weakened to force green; every (b) change is a selector/scope correction with the evidence above.

---

## 3. Coverage matrix (inventory # → suite → mode → status)

| # (founder inventory) | Suite | Mode | Status |
|---|---|---|---|
| 3,4,5,7,8 | A auth | real | ✅ |
| 9,10,11,12,20 | B delete-account | real | ✅ |
| 21–26 | C pricing-card-states | mocked | ✅ |
| 27,28,29,34,35 | D generation-flow | real | ✅ |
| 33,36,40 | E paywall-modal | real | ✅ (stops at region modal) |
| 46–52 | F currency | real | ✅ |
| 54,56 / 55 | G profile | real / mocked | ✅ |
| 60–64 | H navigation | real | ✅ |
| 65–72 | I invoice-render | real (unit) | ✅ (73 covered in Studio) |
| 74–78 | J report-content | real + unit | ✅ |
| 82,86,88–94 (sample) | K ops-seo | real | ✅ |

---

## 4. NOT AUTOMATED — the founder's manual set (nothing silently dropped)
- **1, 2, 6** — real-inbox auth emails (confirmation/welcome delivery).
- **13–18** — delete-account email delivery + Razorpay dashboard cancellation visuals.
- **73** — invoice-counter allocation (proven in Studio; counters left at 1001).
- **79–81** — printed PDF visuals (the existing verify-pdf harness / founder eyeball).
- Live **payment completion** — deliberately never run (would burn invoice number 1001). Suite E stops at the region modal.

---

## 5. Gate evidence

| Gate | Result |
|---|---|
| Existing gauntlet (135) | **no regression** — 135 green at baseline; **53-test prelaunch clean; 130/135 in the combined run** (the 5 that failed were `net::ERR` and **pass 5/5 in isolation**). Every gauntlet failure across runs was a connection error, never an assertion. |
| New suites (A–K) | **53 passed, 0 failed, 0 flaky** (clean single run) |
| tsc -p tsconfig.app.json | **45** (was 46 baseline; F1 removed a real one — **0 new**) |
| npm run build | **1313 ok, 0 failed** |
| Frozen payment files | untouched |
| invoice_counters | `BC/26-27=1001, BN/26-27=1001, BX/26-27=1001` (no number burned) |
| Test-user sweep | **0 e2e users remain** (each suite cleans up in afterAll) |
| Deploy | worker + assets live (cron-trigger error = pre-existing unrelated CF issue) |
| `npm run test:prelaunch` | added to package.json (gauntlet + prelaunch) |

**Environment note (d) — Vite dev-server instability.** The Vite dev server (:3000) repeatedly crashed under sustained Playwright load (a full 135+53 marathon, or a parallel `npm run build`), producing mass `net::ERR_CONNECTION_REFUSED`. This is NOT a product regression — proven by (a) all 53 prelaunch tests passing in one clean run, (b) the 5 gauntlet tests that crashed passing 5/5 in isolation, (c) every failure being a connection error, never an assertion. **Recommendation:** run the gauntlet and prelaunch configs separately, never alongside a build, and consider a Playwright `webServer` block with a health-check/auto-restart for CI so a mid-run crash self-heals.

---

## 6. How to run
```
set -a; source .env.local; set +a
./node_modules/.bin/wrangler dev --port 3001   # terminal 1
npm run dev                                     # terminal 2
npm run test:prelaunch                          # gauntlet + all 11 prelaunch suites
```
Cleanup a crashed run: `node -e "import('./e2e/helpers/db.ts').then(m=>m.sweepTestUsers().then(n=>console.log('swept',n)))"` (or re-run any suite — each cleans its own users in afterAll). Test users match `e2e+*@bornclock-test.invalid`.

## Commit
`test: pre-launch suite with fix loop — auth, paywall, currency, invoice, content` on `develop` (local only, not pushed).
