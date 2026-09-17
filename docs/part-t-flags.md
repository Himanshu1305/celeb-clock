# Part T — Flags (genuine surprises / blocked items / uncertainties)

Running log kept per the standing "document-don't-guess / stop-and-flag" discipline.

## Structural (from Phase 0)
- **F1 — Staging lacks Parts Q/R/S.** Live probe: `/api/vedic-reading` returns no
  `reflections` field → staging = Part P-era deploy. Real API flows only run on staging.
  New Q/R/S features validated here via unit + mocked-e2e; need a staging deploy + live
  re-audit before launch. (Not a bug — a deploy-state fact.)
- **F2 — Admin-bypass chat testing blocked on user.** `api/_adminAuth.ts` needs a real
  Supabase admin JWT (fails closed); cannot be driven headlessly. Exhaustive real-Gemini
  chat testing via bypass deferred to the user; guardrails covered by unit suites.

## Hard-boundary stops (real-money / real-third-party)
- (logged below as encountered)

## Bugs found (with fix status)
- (logged below as encountered)

## Forensic findings (Part 4)
- **F3 — HTTPS not force-redirected; no HSTS/CSP.** `http://staging.bornclock.com/`
  AND `http://bornclock.com/` both return 200 over plain HTTP (no 301→https). No
  `Strict-Transport-Security`, `Content-Security-Policy`, or `X-Frame-Options` headers.
  HTTPS itself works and only the PUBLIC anon key is in the client bundle (no secrets),
  so this is hygiene, not a breach — but before launch, enable Cloudflare "Always Use
  HTTPS" + HSTS (dashboard setting, not a code change). → USER manual action.
- **SECURITY PASS (bundle):** no service_role key, no Gemini/ProKerala secrets, no
  private keys in `dist/assets`. Only the Supabase PUBLIC anon key (role=anon) + public
  URL are present — expected and safe. Extends the Part N check.

## Part 2 page-load crawl (164 static routes, real browser, staging)
- **160/164 clean.** 4 flagged, all EXPLAINED (none a bug):
  - `/family` — intentional "Family Dashboard — coming soon" placeholder (is it meant to
    be publicly linked at launch? → USER decision, minor).
  - `/results` — graceful "No Birthday Selected" empty-state when opened without input. OK.
  - `/widget/age-calculator` — minimal embeddable widget by design. OK.
  - `/todays-birthdays` — the "not valid JSON" celebrity-image error was a RATE-LIMIT
    artifact of my rapid crawl; a fresh single visit shows 28 images, 0 broken. Latent
    minor: `CelebrityLongevityService.ts:56` calls `.json()` without an `res.ok` guard,
    so under rate-limiting it logs a harmless parse error. Not a launch blocker.
- **F4 — ipapi.co geo/currency dependency.** On a normal visit, `ipapi.co/json/` is
  CORS-blocked/failing (logs a console error every load). It is gracefully caught
  (`CountryDetectionService.ts`), BUT the fallback is **India/INR for ALL users**. So if
  ipapi is down/blocked, international visitors are shown INR pricing. Functionally safe
  (no crash) but a real pricing-accuracy risk that depends on a flaky free external API.
  → USER awareness: consider a server-side geo (Cloudflare `request.cf.country`) instead.
