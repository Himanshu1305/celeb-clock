# Product-Polish Batch — Final Report

**Branch:** `product-polish` → merged to `develop` (merge `dcf5715`), pushed.
**Deploy:** one `./node_modules/.bin/wrangler deploy` → live at
`https://bornclock.usdvisionai.workers.dev` + `staging.bornclock.com`.
**Payment files:** NEVER modified (verified — see Gate).
**Date:** 2026-07-27.

---

## Gate results (all green except cron registration)

| Check | Result |
|---|---|
| Payment files touched (`git diff develop..product-polish` grep razorpay-webhook/verify-payment/_crypto) | **EMPTY** ✓ |
| Typecheck (`tsc -p tsconfig.app.json`) | **47 errors = develop baseline, 0 new** ✓ (all pre-existing stale-Supabase types) |
| Full build (`npm run build`) | **1313 ok, 0 failed, 0 skipped** prerenders; sitemap 1313 URLs ✓ |
| Gauntlet (`playwright --config e2e/launch-gauntlet/gauntlet.config.ts`) | **135 passed, 0 failed** ✓ |
| Deploy | Worker + 1317 assets uploaded & live ✓ |
| Smoke: create-order sentinel | `{"error":"Report not found"}` ✓ |
| Smoke: `/methodology` | `301 → /how-it-works` ✓ |
| Smoke: `/pricing/ /answers/ /born-on/india/ /how-it-works/` | all `200`, correct titles ✓ |
| ⚠ Cron schedule registration | **FAILED** — Cloudflare `/workers/scripts/bornclock/schedules` API error. Worker code is live; only the `[triggers] crons` didn't register. Re-run `./node_modules/.bin/wrangler deploy` or set crons via the CF dashboard. Likely a plan/transient API issue, not a code fault. |

---

## Phase-by-phase (root cause / change / evidence)

### Phase 0 — Ops activation (code side)
- **Change:** wired `/api/ops-monitor` + `/api/ops-digest` routes, branched `scheduled()` on
  `event.cron` (exact schedules from OPS-ACTIVATION.md), expanded `wrangler.toml [triggers]` to 4 crons,
  bridged `ADMIN_EMAIL`/`OPS_BASE_URL`.
- **Evidence:** diff matches the doc; create-order sentinel still `{"error":"Report not found"}` after
  the routing change (both local :3001 and live).

### Phase 1 — PDF pagination (round 3)
- **Root cause:** the full print-pagination CSS (cover `break-after`, `@page margin:0`, table thead/tfoot
  insets, header styling) lived ONLY in ReportView's react-to-print `pageStyle` string. The founder prints
  via the browser's **Cmd+P** (title-derived filename), which gets ONLY `index.css @media print` — so the
  cover never broke and the running-header `<thead>` painted mid-page-1 with Twins bleeding onto it.
- **Change:** promoted the pagination block into `index.css @media print` (all paths now identical) +
  orphaned-heading guard (break-after:avoid chained across the heading cluster) + trailing-page fix
  (`.report-closing` padding trim). Longevity untouched (separate iframe doc; harness-clean).
- **Evidence — per-path coverage (mobile 390px / dSF3):**

  | Path | Pages | Void pages | Layout audit (header band + orphans) |
  |---|---|---|---|
  | Birthday — **Cmd+P** (founder's) BEFORE | 19 | 0 (fill blind) | ❌ header mid-page-1 (PNG-confirmed) |
  | Birthday — **Cmd+P** AFTER | **21** | **0** | **✅** cover-only page 1, header top-band only |
  | Birthday — **react-to-print** AFTER | **21** | **0** | **✅** |
  | Longevity — headless page.pdf | 11 | 0 | n/a (page 2 fill 95.8% — founder void not reproducible in browser-print equivalent; documented) |

  Trailing near-empty page removed (22→21; last-page ink 2.2%→21%). Page-1 PNG before=header mid-page,
  after=clean cover.

### Phase 2 — Celebrity-birthday layout
- **Root cause:** `<CelebritySearch/>` was buried below results/zodiac at the page foot — invisible on mobile.
- **Change:** search promoted into the hero as one of two equal paths (name-search + calendar); input gains
  an inside icon, full-width `h-12`, responsive stacking; buried duplicate + scroll-CTA removed.
- **Evidence:** 390px screenshot — prominent search is the first element after the hero; calendar directly below.

### Phase 3 — Monetization surfaces
- **Change:** homepage `BirthdayReportShowcase` (styled section mockups, ₹199/₹149, CTAs) before the feature
  grid; new indexable `/pricing` (Free/Premium/one-time-report + real comparison table); live credit balance
  on `/profile`; credits FAQ + corrected "is it free" answer; hello@bornclock.com trust line at every buy point.
- **All benefits grepped from code** (create-order amounts, get-credits accrual, Upgrade feature lists).
- **⚠ Founder decision:** the prompt's "3 credits/month" ≠ the code's **1/month, carry-forward, cap 3**
  (get-credits.ts). All surfaces state the TRUE mechanism. To deliver 3/month, change get-credits accrual
  (payment-adjacent — left for you).

### Phase 4 — Navigation + discovery
- **Change:** `/born-on/india` hub (350 dates from indiaBornOnDates.json, real counts) + `/answers` hub
  (13 answer pages, themed); footer Explore block; header Explore dropdown (desktop + mobile); homepage
  "Explore BornClock" grid + 12-sign zodiac chips. Registered in routes/prerender/titles/sitemap.
- **Evidence:** both hubs screenshot-verified and live (200).

### Phase 5 — /methodology → /how-it-works
- **Change:** route+label renamed; Worker **301** `/methodology`→`/how-it-works` (new redirect pattern) +
  client `<Navigate>` fallback; product-overview box added (report, longevity, India facet, answers — all
  linked) while KEEPING every science-citation section; all internal links updated (grep-clean).
- **Evidence:** live `curl /methodology` → `301 → /how-it-works`.

### Phase 6 — Email capture audit + retention (build-not-cron)
- **Audit map (evidence-based):**

  | Capture point | Where | Stored | Consent flag |
  |---|---|---|---|
  | Account signup | `useAuth.signUp` (Auth.tsx) | `profiles.email/.blog_subscription/.email_notifications` | `blog_subscription` bool (signup checkbox); `email_notifications` bool |
  | Homepage "Save your results" banner | Index.tsx | — (links to signup) | funnels to signup |
  | Blog "Never Miss an Article" box | Blog.tsx:322 | **NOT WIRED** (bare input, no handler) | none |
  | Contact form | Contact.tsx | support email (not marketing) | n/a |

  Storage = `profiles` ONLY; no anon capture, no subscribers table, no digest flag before this batch.
- **Change:** `NOTES-email-subscribers.sql` (email_subscribers table + RLS + `profiles.weekly_digest`;
  NOT applied); `api/subscribe.ts` (consent-gated soft capture, tolerates missing table);
  `SaveResultsCapture` on `/results` (soft, not a wall); `api/weekly-digest.ts` (real-data digest:
  days-to-birthday + biorhythm + celebs-this-week global+IN) + `api/unsubscribe.ts` (tokened). Routed,
  NOT croned — activation in OPS-ACTIVATION.md.
- **Test send:** Resend **HTTP 200**, id `6ef488fc-2796-4cfd-98f0-dc40d31e25c2`, to ADMIN fallback
  (himanshu1305@gmail.com — ADMIN_EMAIL unset locally), 3 global + 3 India celebs from the live DB.

### Phase 7 — Sharing + funnel events
- **Change:** `NativeShareButton` (navigator.share + copy/WhatsApp fallback) on `/results` and the report
  header. Funnel beacons via the EXISTING `analytics_events` table + `useAnalytics.trackFunnel`
  (event_type='funnel', consent-gated): `report_preview_viewed`, `checkout_opened`, `purchase_completed`
  (client confirmation only — webhook/verify untouched), `upgrade_modal_opened`, `report_shared`.
- **OG verification:** homepage/`/` (results share target) has full branded OG (verified in dist). Report
  page had only title+desc+noindex → added name-appropriate og:title/description/url. **og:image is still
  the branded default** (no per-report dynamic OG image — larger build, flagged for you).

---

## Founder re-test checklist (in order)

1. **Review** `git log develop` for the merge `dcf5715` and the phase commits.
2. **Phone-test the PDF fix** on staging: open a paid report on mobile, use **Ctrl/Cmd+P → Save as PDF**
   AND the in-app "Download PDF" — both should have a clean cover page 1, header only at page tops, no
   orphaned headings, no near-empty trailing page. Also re-check the **Longevity** PDF page 2 on your
   device (that void was NOT reproducible in the headless harness).
3. **Re-register the crons** (deploy left them unregistered): re-run `./node_modules/.bin/wrangler deploy`
   or add the `[triggers]` crons in the CF dashboard. Verify in Workers → bornclock → Triggers.
4. **Apply the SQL (Studio, one statement at a time):** `supabase/migrations/NOTES-ops-inbox.sql` (if not
   already) and `supabase/migrations/NOTES-email-subscribers.sql`. Until the latter is applied, the
   `/results` capture returns ok:false (no-op) and the digest has no audience.
5. **Decide the credits copy:** keep "1/month, carry-forward, cap 3" (current, truthful) OR change
   get-credits.ts to actually grant 3/month, then update the surfaces.
6. **Set `ADMIN_EMAIL` secret** if you want ops/digest emails to go somewhere other than the
   himanshu1305@gmail.com fallback: `printf '%s' '<email>' | ./node_modules/.bin/wrangler secret put ADMIN_EMAIL`.
7. **Spot-check** the live monetization surfaces: `/pricing/`, homepage report showcase, `/profile` credit
   balance, report unlock trust line.
8. **(Optional) per-report OG image** for richer WhatsApp share cards — currently the branded default.

---

## Files of note
- Build-only / not-applied: `supabase/migrations/NOTES-email-subscribers.sql`, `NOTES-ops-inbox.sql`.
- Docs: `docs/OPS-ACTIVATION.md` (ops + weekly-digest activation), `docs/PRODUCT-POLISH-STATUS.md`
  (per-phase log with evidence).
- Dev tools added: `scripts/shot.mjs` (viewport screenshotter), `scripts/test-digest.mjs`,
  `scripts/verify-pdf-coverage.mjs` gained `--cmdp` + `layoutAudit`.
