# PDF Invoices — Priority Prompt
# Save as docs/PDF-INVOICE-PROMPT.md, then: "Read docs/PDF-INVOICE-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/PDF-INVOICE-REPORT.md.

PRIORITY CONTEXT: BornClock is LIVE with real customers. Invoice BC/26-27/1001 has
already been issued. Invoices are currently emailed as .html attachments asking the
customer to print-to-PDF themselves. Founder decision: customers must receive a real
PDF. This is the only task — nothing else.

HARD RULES:
- api/_crypto.ts, api/razorpay-webhook.ts: never touched.
- api/verify-payment.ts: NOT touched. All changes live in the email helper
  (api/_invoice-email.ts or wherever sendInvoiceEmail lives) and new files.
- PDF generation must be NON-FATAL twice over: if it fails, the email still goes
  out with the HTML attachment (invoice delivery is a legal obligation and must
  never depend on a rendering service being up).
- The site is LIVE. Deploy only after the full gate passes. One deploy.

---

## PHASE 0 — INVESTIGATE THE RENDERING PATH (report findings before building)

Preferred mechanism, in order. Verify availability for THIS account
(account_id 9ad1ef464c60a7db797b4bb097d545e5, free plan) and pick the first that works:

A. **Cloudflare Browser Rendering REST API — /pdf endpoint** (preferred: no
   binding, no wrangler.toml change, just an authenticated fetch from the Worker):
     POST https://api.cloudflare.com/client/v4/accounts/{account_id}/browser-rendering/pdf
     body: { "html": "<full invoice html>" }  → returns PDF bytes.
   Auth: an API token with Browser Rendering permission (founder will create it —
   see MANUAL STEPS). Free plan includes a daily Browser Rendering allowance;
   confirm current limits from the docs and state them in the report. Invoice
   volume is a handful/day — well within any tier.

B. **Workers binding (@cloudflare/puppeteer)** — only if A is unavailable on this
   plan. Requires a browser binding in wrangler.toml + the puppeteer package.
   More moving parts; use only as fallback.

C. If neither A nor B is available on the free plan: STOP. Do not integrate a
   third-party PDF SaaS without founder sign-off. Report the finding and the
   cheapest viable option.

Write a tiny probe first (a test script or curl in the report) proving the chosen
path returns a valid PDF for a fixture invoice HTML before wiring anything.

## PHASE 1 — WIRE PDF INTO THE INVOICE EMAIL

Read api/_invoice-email.ts (and any other caller of the invoice send: the
verify-payment invoice block calls this helper; the /api/invoice-sweep renewal cron
does too — grep and confirm all call sites).

In the helper:
1. Render the invoice HTML exactly as today (generateInvoiceHTML — unchanged).
2. Call the Browser Rendering path to convert HTML → PDF.
   - A4, print background on, margins 0 (the HTML's own @page/padding governs).
   - Verify the ₹ glyph renders correctly in the output (system fonts in headless
     Chrome include it; confirm on the fixture and say so in the report).
3. Attach as `${invoice_no with / → -}.pdf` (e.g. BC-26-27-1001.pdf).
4. ON ANY FAILURE (non-2xx, timeout ≤10s, empty bytes): log '[invoice-pdf] fallback'
   with the reason and attach the HTML exactly as today. The email must always send.
5. Update the email body copy: "Your GST tax invoice ... is attached as a PDF."
   Keep a graceful line for the fallback case — simplest: make the body generic
   ("is attached") so it is true for both attachment types, OR branch the copy on
   which attachment was used. Choose one and say which.

## PHASE 2 — PROFILE DOWNLOAD BECOMES A REAL PDF

Read the Invoices card on /profile (current behaviour: client-side print-to-PDF).
Add a Worker endpoint GET /api/invoice-pdf?invoice_no=... that:
- Authenticates the caller and verifies ownership (invoices.user_id = caller) —
  read how other authed endpoints validate the user and copy that pattern exactly.
- Loads the invoice row, renders HTML via generateInvoiceHTML, converts via the
  same rendering path, returns application/pdf with a content-disposition filename.
- On rendering failure: return the HTML with a clear content-type instead (the
  user can still print) — never a 500 for a rendering outage.
Point the profile Download button at this endpoint. Keep the old print flow as the
visible fallback only if the fetch fails.

## PHASE 3 — SECONDARY (same code path, only if PHASE 1-2 are green):
Merge the two purchase emails ("Payment confirmed" + "Your BornClock invoice")
into ONE email: subject "Payment confirmed — your BornClock invoice BC/…", body =
the confirmation content, attachment = the PDF. Grep for where the confirmation
email is sent, remove the duplicate send, keep a single send site. If this proves
non-trivial (different senders, webhook path involvement), SKIP and report — the
PDF is the deliverable, this is polish.

## MANUAL STEPS FOR FOUNDER (list prominently at the top of the report)
1. Create the Cloudflare API token: dash.cloudflare.com → My Profile → API Tokens
   → Create Token → Custom: Account · Browser Rendering · Edit, scoped to the
   USD Vision AI account. (Claude Code cannot create tokens.)
2. Set the secrets:
     printf 'TOKEN' | ./node_modules/.bin/wrangler secret put BROWSER_RENDERING_TOKEN
     printf '9ad1ef464c60a7db797b4bb097d545e5' | ./node_modules/.bin/wrangler secret put CF_ACCOUNT_ID
   The code must read these names. Until they exist, the fallback path (HTML)
   carries all sends — tolerate missing secrets gracefully, log a marker.
3. Re-test: one staging purchase (or trigger a resend for BC/26-27/1001 via a
   small admin-only resend script IF one exists — do not build one) and confirm
   the PDF opens in Preview/Acrobat with correct layout and ₹ symbols.

## GATE
1. tsc 45 baseline, 0 new · build 1313+ ok
2. npm run test:prelaunch green (fix regressions, never weaken)
3. Frozen files untouched; verify-payment.ts untouched (empty diff — the helper
   boundary makes this possible)
4. Fixture proof in the report: PDF bytes generated for all three invoice modes
   (CGST_SGST / IGST / EXPORT), sizes noted, ₹ glyph confirmed
5. Live smoke sentinel after deploy: {"error":"Report not found"}
6. One deploy.

Commit: "feat: real PDF invoice attachments via Browser Rendering, with HTML fallback"
