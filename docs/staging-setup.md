# BornClock — Staging Worker Setup (Part AO)

A **separate** Cloudflare Worker, `bornclock-staging`, defined under `[env.staging]` in
`wrangler.toml`. It shares the production Supabase database but has **no custom domain and no
routes**, so it can never serve or affect production. It is reachable only at its own
`*.workers.dev` address.

## What is already done (in code, verified)
- `[env.staging]` in `wrangler.toml`: `name = "bornclock-staging"`, `workers_dev = true`,
  `routes = []`, `triggers.crons = []`, assets + vars **re-declared** (named envs do not inherit
  vars/bindings). Verified with `npx wrangler deploy --env staging --dry-run` → bindings present,
  **no routes, no custom domains, no crons**.
- Hostname guardrails in `functions/_worker.ts` + `functions/host.ts` (unit-tested in
  `src/__tests__/stagingHost.test.ts`):
  - Only `bornclock.com` / `www.bornclock.com` are production. **Every other host** (the staging
    worker, all `*.workers.dev` previews, localhost) gets `X-Robots-Tag: noindex, nofollow` on HTML
    and a **disallow-all `robots.txt`** — decided by hostname, never by editing `public/robots.txt`
    or page HTML.
  - On non-production hosts, analytics / ad `<script>` tags (Cloudflare Insights beacon,
    googlesyndication, GTM, GA, adsbygoogle) are stripped via `HTMLRewriter`; `AdUnit` also refuses
    to render off production. Production behaviour is unchanged.
- Outbound-email suppression: `SUPPRESS_OUTBOUND_EMAIL="true"` + `EMAIL_ALLOWLIST` (staging vars
  only). `api/_email.ts` `sendEmailDirect`, the invoice sender in `api/_invoice-email.ts`, and
  (via `sendEmailDirect`) the Razorpay webhook all skip sending to any address not on the allowlist
  on staging. Production has no `[vars]` block, so the flag is false there.
- Scripts: `npm run deploy:staging` (builds with `--mode preview` → bakes the **test** Razorpay key,
  then `wrangler deploy --env staging`). The production deploy is a separate, explicitly-named
  `deploy:production:DANGER` so the two can never be confused.

## Deploy the staging worker
```
npm run deploy:staging
```
This builds with the test Razorpay key and deploys **only** `bornclock-staging`. It does not touch
the `bornclock` production worker. After deploy, confirm the served bundle contains `rzp_test_`
and never `rzp_live_`.

## Needs the person (cannot be done from here)
1. **Set staging secrets** (values live in the Cloudflare dashboard / local env files, not committed).
   For each, use `npx wrangler secret put <NAME> --env staging`. The production worker's secret
   names are:
   `ADMIN_EMAIL, ADMIN_SECRET_KEY, ANTHROPIC_API_KEY, BROWSER_RENDERING_TOKEN, CF_ACCOUNT_ID,
   CRON_SECRET, DIGEST_LIVE, GEMINI_API_KEY, PRODUCTION_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
   RAZORPAY_WEBHOOK_SECRET, RESEND_API_KEY, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
   SUPABASE_URL, VITE_PROKERALA_CLIENT_ID, VITE_PROKERALA_CLIENT_SECRET, VITE_RAZORPAY_KEY_ID,
   VITE_RAZORPAY_PLAN_*`.
   - **Use the Razorpay TEST key id/secret on staging** (the `rzp_test_*` pair from `.env.preview`),
     never the live pair. `build:staging` already bakes the test `VITE_RAZORPAY_KEY_ID` client-side;
     set the matching **test** `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` server-side.
   - Supabase URL + keys can be the same as production (shared DB) — writes in testing must be
     limited to the test account only.
2. **Supabase Auth redirect URLs**: add the staging `*.workers.dev` address to
   Supabase → Authentication → URL Configuration → Redirect URLs, or sign-in will be refused.
3. **Google sign-in allowed origins**: add the staging address to the Google OAuth client's
   Authorized JavaScript origins / redirect URIs.
4. **Domain move (later, optional)**: to point `staging.bornclock.com` at the staging worker,
   in the Cloudflare dashboard **detach** `staging.bornclock.com` from the `bornclock` (production)
   worker, then **attach** it to `bornclock-staging`. Do not do this from wrangler in this run —
   `[env.staging].routes` is intentionally empty so the move is a deliberate dashboard step.
   (Until then the staging worker is reached at its `*.workers.dev` URL, which is already noindex.)

## Production stays safe
- `wrangler deploy --env staging` only ever publishes `bornclock-staging`.
- Production (`bornclock.com`, `www.bornclock.com`) is indexable with the normal static
  `robots.txt`; the prerendered HTML contains no `noindex`. Proven by `stagingHost.test.ts` and the
  verification crawl in `docs/part-ao-report.md`.
