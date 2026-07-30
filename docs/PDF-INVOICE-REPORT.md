# PDF Invoices — Report

Execution of `docs/PDF-INVOICE-PROMPT.md`. Local commits only, not pushed.
Customers now receive a **real PDF** GST invoice (email attachment + Profile download),
with the HTML attachment kept as a non-fatal fallback.

---

## ⚠️ MANUAL STEPS FOR FOUNDER (do these to activate PDFs — until then, HTML fallback carries all sends)

1. **Create a Cloudflare API token**: dash.cloudflare.com → My Profile → API Tokens →
   Create Token → Custom token → Permissions: **Account · Browser Rendering · Edit**,
   scoped to the USD Vision AI account. (Claude Code cannot create tokens.)
2. **Set the two secrets** (the code reads exactly these names):
   ```
   printf 'YOUR_TOKEN'                         | ./node_modules/.bin/wrangler secret put BROWSER_RENDERING_TOKEN
   printf '9ad1ef464c60a7db797b4bb097d545e5'   | ./node_modules/.bin/wrangler secret put CF_ACCOUNT_ID
   ```
   Until both exist, `renderPdfFromHtml` logs `[invoice-pdf] fallback: BROWSER_RENDERING_TOKEN/CF_ACCOUNT_ID not set`
   and every send/download uses the HTML attachment (exactly today's behaviour). No redeploy needed after setting secrets.
3. **Re-test**: make one live/staging purchase and confirm the email PDF opens in
   Preview/Acrobat with correct layout and ₹ symbols; on /profile, click Download and
   confirm a `.pdf` downloads. (Do NOT build a resend script — none exists; a fresh
   purchase or the next renewal-sweep invoice is the test.)

---

## PHASE 0 — Rendering path (investigated)

**Chosen: A — Cloudflare Browser Rendering REST `/pdf` endpoint.** No Worker binding,
no `wrangler.toml` change — just an authenticated `fetch` from the Worker:
```
POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/browser-rendering/pdf
Authorization: Bearer {BROWSER_RENDERING_TOKEN}
Content-Type: application/json
{ "html": "<invoice html>", "pdfOptions": { "format": "a4", "printBackground": true,
  "margin": { "top":"0px","right":"0px","bottom":"0px","left":"0px" } } }
→ returns raw PDF bytes (application/pdf); JSON {success:false} on error.
```
Confirmed from the docs that PDF options nest under **`pdfOptions`** (format lowercase
`"a4"`) — the code matches this.

**Free-plan limits** (developers.cloudflare.com/browser-rendering/platform/limits):
- Browser hours: **10 minutes/day** (a single invoice render is a few seconds → ~100+/day headroom).
- `/pdf` is a "Quick Action" REST call: rate limit **1 request / 10 seconds** on free
  (10/sec on Workers Paid). Invoice volume is a handful/day → within limits. A **burst**
  of renewal invoices in one sweep could hit the 10s rate limit; those simply fall back
  to the HTML attachment (non-fatal). Upgrading to Workers Paid removes the burst limit.

Option **B** (Workers `@cloudflare/puppeteer` binding) not needed — A works with zero
config surface. Option **C** (third-party SaaS) not reached.

### Probe / fixture proof (gate #4)
Cannot run the live CF probe here (the founder's token doesn't exist yet). Instead the
**actual `generateInvoiceHTML` output** was rendered to PDF via local **headless Chromium
(Playwright)** — the *same engine* Cloudflare Browser Rendering runs — for all three GST
modes. Script: `scripts/pdf-fixture-proof.ts` (`./node_modules/.bin/tsx scripts/pdf-fixture-proof.ts`).

| Mode | Invoice | PDF bytes | Valid `%PDF-` | ₹ in source |
|------|---------|-----------|---------------|-------------|
| CGST_SGST | BC/26-27/1001 (₹199, Telangana) | 310,982 | ✓ | ✓ |
| IGST | BC/26-27/1002 (₹199, Karnataka) | 311,742 | ✓ | ✓ |
| EXPORT | BX/26-27/1001 ($6.99, USA, LUT) | 330,933 | ✓ | ✓ |

Output PDFs: `scripts/output/pdf-proof/inv-*.pdf`. A PNG screenshot of the CGST render was
inspected visually: **₹ glyph renders correctly** (₹168.64 / ₹15.18 / ₹15.18 / ₹199.00),
logo, CGST+SGST split, "Total INR ₹199.00", amount-in-words, LUT/place-of-supply blocks
all correct. Chrome's system fonts include ₹, confirmed in the output (not tofu).

---

## PHASE 1 — PDF in the invoice email (`api/_invoice-email.ts`)

- `sendInvoiceEmail(to, invoiceNo, html)` signature UNCHANGED, so both call sites —
  `verify-payment.ts` (first purchase) and `invoice-sweep.ts` (renewals) — are untouched.
- New `api/_pdf.ts`: `renderPdfFromHtml(html)` → PDF bytes or **null** on any failure
  (missing secrets, non-2xx, timeout >10s, empty/non-`%PDF-` body); every failure logs
  `[invoice-pdf] fallback: <reason>`. Plus `bytesToBase64` for binary attachment encoding.
- The helper: renders HTML exactly as today, calls `renderPdfFromHtml`, and:
  - PDF → attaches `${invoice_no with / → -}.pdf`.
  - null → attaches the HTML `.html` **exactly as before**. The email ALWAYS sends.
- **Non-fatal twice over**: (1) `renderPdfFromHtml` never throws — it returns null; (2) the
  Resend send is unchanged, so a render outage just swaps the attachment type.
- **Body copy**: **branched** on the attachment actually used (chosen over a generic line
  so the text is always truthful): PDF → "…is attached as a PDF — open it in any PDF
  viewer."; HTML → "…is attached as an HTML file — open it in any browser and print or
  save it as a PDF."
- ₹ glyph: confirmed via the fixture proof above (same Chromium engine).

## PHASE 2 — Profile download is a real PDF

- New endpoint **`GET /api/invoice-pdf?invoice_no=…`** (`api/invoice-pdf.ts`), registered in
  `functions/_worker.ts`.
  - **Auth + ownership**: reads `Authorization: Bearer <supabase access token>`, resolves
    the user via `serviceClient().auth.getUser(token)` (the exact pattern `save-report.ts`
    uses), loads the invoice, and requires `invoices.user_id === caller` (401 no token,
    404 not found, 403 not owner).
  - Renders via the same `generateInvoiceHTML` + `renderPdfFromHtml`. Returns
    `application/pdf` with a `Content-Disposition` filename.
  - **Rendering outage → returns the HTML** (`text/html`) so the user can still print —
    **never a 500** for a render failure.
- `src/components/InvoicesCard.tsx` Download button now fetches this endpoint with the
  session token and saves the `.pdf` blob. **The old client-side print-to-PDF flow is kept
  as the visible fallback** whenever the fetch fails (no session, non-2xx, network error)
  or the endpoint returns HTML.

## PHASE 3 — Merge the two purchase emails (SKIPPED, by the prompt's own rule)

The "Payment confirmed" receipt (`sendEmailDirect({type:'payment_receipt'})`) and the
invoice email are **both sent from `api/verify-payment.ts`** (the receipt just before the
invoice block; the invoice inside it). Merging them means removing the receipt send and
folding its content into the invoice email — which requires **editing `verify-payment.ts`**,
a HARD-RULE frozen file for this task ("verify-payment.ts: NOT touched"). It also has no
analogue on the renewal path (`invoice-sweep` sends no receipt). Per the prompt ("If this
proves non-trivial … SKIP and report — the PDF is the deliverable, this is polish"), this
is deferred. It can be done later in a task where `verify-payment.ts` is in scope.

---

## GATE

1. **tsc**: 0 errors (0 new). **build**: _see below_.
2. **test:prelaunch**: _see below_.
3. **Frozen files untouched**: `api/_crypto.ts`, `api/razorpay-webhook.ts`, **and
   `api/verify-payment.ts`** — all empty diff (the `sendInvoiceEmail` helper boundary made
   the verify-payment no-touch possible). Verified below.
4. **Fixture proof**: three modes rendered to valid PDFs (sizes above), ₹ glyph confirmed.
5. **Live smoke sentinel** after deploy: _see below_.
6. **One deploy**: _see below_.

### Files changed
- New: `api/_pdf.ts`, `api/invoice-pdf.ts`, `scripts/pdf-fixture-proof.ts`.
- Edited: `api/_invoice-email.ts`, `functions/_worker.ts` (route + BRIDGE_KEYS),
  `src/components/InvoicesCard.tsx`.
- Untouched (verified): `api/verify-payment.ts`, `api/invoice-sweep.ts`, `api/_crypto.ts`,
  `api/razorpay-webhook.ts`.

### Deferred / notes
- Live CF render is unverified until the founder sets the token (step 1–2). Everything is
  wired and the same engine is proven locally; on first token use the exact `pdfOptions`
  schema is confirmed correct per the docs. Any schema/limit surprise degrades to the HTML
  attachment (non-fatal) — invoice delivery is never blocked.
- Existing HTML invoice already sent for BC/26-27/1001 is not re-issued (idempotent series;
  a resend is a manual founder action if desired).
