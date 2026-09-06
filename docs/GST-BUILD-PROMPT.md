# GST Invoicing Build — Claude Code Prompt
# Save as docs/GST-BUILD-PROMPT.md in the repo, then: "Read docs/GST-BUILD-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

Work autonomously. If a step fails, attempt a fix (max 3 retries), log what happened, move on.
At the end produce docs/GST-BUILD-REPORT.md covering every file changed, every decision made,
and anything needing manual attention.

---

## CONTEXT

Repo: /Users/hidixit/Development/celeb-clock
Branch: develop (work here, do NOT touch main)
Runtime: Cloudflare Workers (Web API only — no Node built-ins)
Deploy: ./node_modules/.bin/wrangler deploy (NEVER npx wrangler)
Payment files: api/razorpay-webhook.ts, api/verify-payment.ts, api/_crypto.ts
  — these may be READ but changes to verify-payment.ts require the surgical
    non-fatal try/catch pattern described below. NEVER modify _crypto.ts or
    razorpay-webhook.ts.

Supabase project: jwrpqiypvystivtqyhro ("Lifespan")
  — DDL CANNOT run via Claude Code. All DDL goes to NOTES-*.sql files.
  — The invoices table + issue_invoice() function are ALREADY LIVE in the DB
    (applied manually in Studio today). Do NOT attempt to create them again.

---

## PHASE 0 — READ FIRST, WRITE NOTHING

Before changing any file, read these in full:

1. api/verify-payment.ts          — understand the full payment flow end to end
2. api/razorpay-webhook.ts        — read-only, understand the webhook shape
3. src/components/Navigation.tsx  — understand the nav structure
4. src/pages/Profile.tsx          — understand the profile/account page
5. supabase/migrations/NOTES-invoicing.sql — the DDL already applied; understand
   the invoice_counters, invoices tables and issue_invoice() function signature

Also grep for the logo asset:
  grep -r "logo\|Logo\|favicon" src/ public/ index.html --include="*.tsx" --include="*.ts" --include="*.html" -l
Then read the logo component or path so you know the exact file to inline.

Grep for the existing one-time purchase flow:
  grep -r "birthday_report\|one.time\|oneTime\|199" src/ api/ --include="*.tsx" --include="*.ts" -l
Read the relevant files to understand how currency and amount are determined per order.

Grep for the Resend email pattern used in the existing codebase:
  grep -r "resend\|Resend\|sendEmail\|from:.*bornclock" api/ --include="*.ts" -l
Read one working email file to understand the exact pattern used.

Only after reading all of the above, proceed to Phase 1.

---

## PHASE 1 — LOGO INLINING FOR INVOICE

The invoice PDF is generated client-side and emailed as an attachment.
External URLs silently 404 in that context. The logo MUST be inline.

1. Find the logo SVG or PNG used on the site (from your Phase 0 grep).

2a. If it is an SVG file:
    - Read the SVG file content
    - Store it as a TypeScript constant: export const BORNCLOCK_LOGO_SVG = `<svg ...>...</svg>`
    - Place it in src/lib/invoice-logo.ts (create this file)

2b. If it is a PNG/JPG file:
    - Convert to base64:
      node -e "const fs=require('fs'); console.log(fs.readFileSync('public/logo.png').toString('base64'))"
      (adjust path to actual logo path)
    - Store as: export const BORNCLOCK_LOGO_B64 = 'data:image/png;base64,...'
    - Place it in src/lib/invoice-logo.ts

Do NOT reference any external URL anywhere in the invoice rendering path.

---

## PHASE 2 — INVOICE GENERATION LIBRARY

Create src/lib/invoice-generator.ts

This module must:
- Run in both browser (for PDF) and Workers runtime (for email attachment generation)
- Use only Web APIs — no Node built-ins (no fs, no path, no Buffer — use btoa() for base64)
- Export one function: generateInvoiceHTML(invoice: InvoiceRecord): string

The InvoiceRecord type maps directly to the invoices table columns:
  invoice_no, invoice_date, order_id, payment_id,
  buyer_name, buyer_email, buyer_gstin, buyer_country,
  buyer_state, buyer_state_code, place_of_supply,
  tax_mode ('CGST_SGST' | 'IGST' | 'EXPORT'),
  currency ('INR' | 'USD'), fx_rate,
  gross_amount, taxable_value, cgst, sgst, igst,
  line_items (jsonb array)

The generated HTML is a SELF-CONTAINED single file (all CSS inline or in a <style> block).
It must match the design in docs/GST-BUILD-PROMPT.md exactly (see INVOICE DESIGN below).
System fonts ONLY — never load Google Fonts (causes glyph corruption in PDF).
The logo comes from src/lib/invoice-logo.ts (inline SVG or base64).

### INVOICE DESIGN (implement exactly)

Supplier constants (hardcoded — never from env):
  legalName: "USD Vision AI LLP"
  product:   "BornClock"
  address:   "A206, Aparna Sarovar Zenith"
  address2:  "Kanchi Gachibowli Road, Nallagandla, Hyderabad, Telangana 500046"
  gstin:     "36AAJFU0315K1Z5"
  llpin:     "ACR-6615"
  state:     "Telangana"
  stateCode: "36"
  email:     "hello@bornclock.com"
  site:      "bornclock.com"
  lutArn:    "AD360726011878N"
  lutDate:   "27/07/2026"
  sacCode:   "998439"
  sacLabel:  "Other on-line contents n.e.c."

Design tokens (match BornClock brand):
  --ink:   #0C1A2B
  --navy:  #103A5C
  --gold:  #B8862F
  --muted: #5A6A7A
  --rule:  #D8DEE5

Layout (A4, system fonts, inline CSS):
  HEADER: BornClock logo (inline) + wordmark "BornClock" large + "A product of USD Vision AI LLP"
          small gold text. Right side: "TAX INVOICE" heading + invoice number + date.
  PARTIES (3 columns):
    Col 1 — Supplier: USD Vision AI LLP, GSTIN, LLPIN, State, "Registered with limited liability" italic
    Col 2 — Billed to: buyer name, email, state+code (domestic) or country (export), GSTIN if present
             else "Unregistered", place of supply
    Col 3 — Invoice details: invoice no, date, order ID, payment ID, payment mode, fx rate (export only)
  LINE ITEMS TABLE: navy header row; columns: #, Description, SAC, Qty, Unit value, Taxable value, Tax
    CGST_SGST mode: two tax columns (CGST 9% | SGST 9%)
    IGST mode: one tax column (IGST 18%)
    EXPORT mode: tax = 0.00, rate = —
  TOTALS: right-aligned; taxable, cgst/sgst or igst rows, grand total bold navy
  AMOUNT IN WORDS: left panel next to totals; gold border-left
  DECLARATIONS:
    Domestic: "Tax payable on reverse charge basis: No. Prices inclusive of GST."
              "Place of supply determined from State declared by recipient at checkout."
    Export:   LUT block with gold border: "Supply meant for export under Letter of Undertaking
              without payment of Integrated Tax. LUT ARN: AD360726011878N · dated 27/07/2026 · FY 2026–27"
              "Zero-rated supply under Section 16 of the IGST Act, 2017."
  SIGNATURE BLOCK (bottom right):
    "For USD Vision AI LLP"
    "Issued electronically · no signature required" (muted, small)
  FOOTER (8.5px, muted, two rows):
    Row 1: "Registered office: A206, Aparna Sarovar Zenith, Kanchi Gachibowli Road,
            Nallagandla, Hyderabad, Telangana 500046"
    Row 2: "USD Vision AI LLP · LLPIN ACR-6615 · GSTIN 36AAJFU0315K1Z5 · bornclock.com · {invoice_no}"

GST maths (GST-inclusive back-calculation, always):
  taxable = round(gross / 1.18, 2)
  total_tax = round(gross - taxable, 2)
  CGST_SGST: cgst = round(taxable * 0.09, 2); sgst = total_tax - cgst  ← sgst is PLUGGED, never independently rounded
  IGST: igst = total_tax
  EXPORT: taxable = gross; cgst = sgst = igst = 0

Amount in words: Indian numbering system (crore/lakh/thousand).

---

## PHASE 3 — STATE/COUNTRY CAPTURE AT CHECKOUT

Read the existing checkout/upgrade modal flow carefully first.
Grep: grep -r "createOrder\|create-order\|razorpay\|RazorpayCheckout\|openCheckout" src/ --include="*.tsx" --include="*.ts" -l

The capture must happen BEFORE the Razorpay modal opens.

Add a two-step pre-checkout modal or inline selector:
  Step 1 — "Where are you based?" with two options: India | Outside India
  Step 2a (India): State dropdown — all 28 states + 8 UTs with their GST state codes.
    Pre-fill from ipapi detected country if India, but user must actively confirm or change.
    Do NOT silently infer — the selection is a legal declaration.
  Step 2b (Outside India): country field (text or dropdown, simplified) — just capture country name.

On confirm:
  - Store {buyerCountry, buyerState, buyerStateCode, taxMode} in component state
  - Pass to the create-order API call as extra fields in the request body
  - api/create-order.ts must forward these in the Razorpay order notes:
      notes: { buyer_state: ..., buyer_state_code: ..., tax_mode: ..., buyer_country: ... }
  - These notes travel with the payment and are readable in verify-payment.ts

State codes reference (add all — this is the complete list):
  Andhra Pradesh:01, Arunachal Pradesh:02, Assam:03, Bihar:04, Chhattisgarh:22,
  Goa:30, Gujarat:24, Haryana:06, Himachal Pradesh:02, Jharkhand:20,
  Karnataka:29, Kerala:32, Madhya Pradesh:23, Maharashtra:27, Manipur:14,
  Meghalaya:17, Mizoram:15, Nagaland:13, Odisha:21, Punjab:03,
  Rajasthan:08, Sikkim:11, Tamil Nadu:33, Telangana:36, Tripura:16,
  Uttar Pradesh:09, Uttarakhand:05, West Bengal:19,
  Andaman & Nicobar Islands:35, Chandigarh:04, Dadra & Nagar Haveli and Daman & Diu:26,
  Delhi:07, Jammu & Kashmir:01, Ladakh:38, Lakshadweep:31, Puducherry:34

taxMode logic:
  India + Telangana (stateCode=36) → 'CGST_SGST'
  India + any other state         → 'IGST'
  Outside India                   → 'EXPORT'

---

## PHASE 4 — HOOK INTO VERIFY-PAYMENT (SURGICAL — READ THIS CAREFULLY)

RULE: The HMAC verification path and the database premium-grant path are NEVER modified.
The invoice generation is a NON-FATAL try/catch appended AFTER the existing success response
has already been prepared.

Read verify-payment.ts in full. Find the point where the function:
  (a) has confirmed payment success, AND
  (b) has already called the DB to grant premium access, AND
  (c) is about to return the success Response

AFTER point (c) is prepared but before it is returned, insert:

```typescript
// --- GST INVOICE (non-fatal) ---
try {
  // 1. extract buyer details from order notes (set at checkout)
  const notes = paymentData?.notes ?? {}
  const buyerState     = notes.buyer_state ?? null
  const buyerStateCode = notes.buyer_state_code ?? null
  const buyerCountry   = notes.buyer_country ?? 'India'
  const taxMode        = notes.tax_mode ?? (buyerStateCode === '36' ? 'CGST_SGST' : buyerStateCode ? 'IGST' : 'EXPORT')

  // 2. determine currency + gross
  const currency    = paymentData.currency === 'USD' ? 'USD' : 'INR'
  const grossAmount = paymentData.amount / 100   // Razorpay stores paise/cents

  // 3. compute tax split
  const taxable = Math.round((grossAmount / 1.18) * 100) / 100
  const totalTax = Math.round((grossAmount - taxable) * 100) / 100
  let cgst = 0, sgst = 0, igst = 0
  if (taxMode === 'CGST_SGST') {
    cgst = Math.round(taxable * 0.09 * 100) / 100
    sgst = Math.round((totalTax - cgst) * 100) / 100
  } else if (taxMode === 'IGST') {
    igst = totalTax
  }
  // EXPORT: all zero

  // 4. fx rate for exports (use a fixed fallback — live rate is a future enhancement)
  const fxRate = taxMode === 'EXPORT' ? 87.20 : null

  // 5. call issue_invoice() — allocates number + inserts atomically
  const { data: invoiceRow, error: invoiceErr } = await supabase
    .from('invoices')
    .rpc('issue_invoice', {
      p: {
        order_id:        paymentData.order_id,
        payment_id:      paymentData.id,
        user_id:         userId ?? null,
        buyer_name:      paymentData.email ?? 'BornClock Customer',
        buyer_email:     paymentData.email ?? '',
        buyer_gstin:     null,
        buyer_country:   buyerCountry,
        buyer_state:     buyerState,
        buyer_state_code: buyerStateCode,
        place_of_supply: buyerState ? `${buyerState} (${buyerStateCode})` : buyerCountry,
        tax_mode:        taxMode,
        currency,
        fx_rate:         fxRate,
        gross_amount:    grossAmount,
        taxable_value:   taxMode === 'EXPORT' ? grossAmount : taxable,
        cgst,
        sgst,
        igst,
        line_items: [{
          desc: 'BornClock — Birthday Blueprint Report',
          note: 'Digital report, one-time purchase. Delivered electronically.',
          qty: 1,
          gross: grossAmount
        }]
      }
    })

  if (invoiceErr) throw invoiceErr

  // 6. generate PDF HTML
  const invoiceHTML = generateInvoiceHTML(invoiceRow)

  // 7. send email with invoice attached via Resend
  // Use the EXACT same Resend pattern already used in this codebase.
  // Attach as: { filename: `${invoiceRow.invoice_no}.html`, content: btoa(invoiceHTML) }
  // Subject: "Your BornClock invoice – {invoice_no}"
  // Body: plain friendly note — "Please find your GST tax invoice attached."
  await sendInvoiceEmail(invoiceRow.buyer_email, invoiceRow.invoice_no, invoiceHTML, env)

} catch (invoiceErr) {
  // Log but never fail the payment response — customer has paid and must get access.
  console.error('[invoice] non-fatal error:', invoiceErr)
}
// --- end GST INVOICE ---
```

IMPORTANT: Read the actual supabase client initialisation in verify-payment.ts and use
the same pattern. Do not introduce a new client. Use the same `env` object already
available in the function.

Also read how `paymentData` is shaped in verify-payment.ts — adjust field names
(paymentData.email may be entity.email or similar) to match exactly what the code has.
Use grep + read to confirm before writing.

---

## PHASE 5 — INVOICE DOWNLOAD ON /PROFILE

Read src/pages/Profile.tsx in full.

Add an "Invoices" section below the existing content:
  - Query: SELECT invoice_no, invoice_date, gross_amount, currency, buyer_email
            FROM invoices WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 20
  - Display as a simple table: Invoice No | Date | Amount | Download
  - Download button: generates the invoice HTML client-side via generateInvoiceHTML()
    then triggers browser print-to-PDF (window.print() inside an iframe, same pattern
    as the existing report PDF export — read that implementation first and replicate it)
  - If no invoices: show "Your invoices will appear here after your first purchase."
  - Handle loading + error states cleanly

The invoices table has RLS: users read only their own rows. The existing Supabase
client in the profile page will work as-is.

---

## PHASE 6 — SEND INVOICE EMAIL HELPER

Create api/_invoice-email.ts

Export: sendInvoiceEmail(to: string, invoiceNo: string, html: string, env: Env): Promise<void>

Use the EXACT same Resend pattern already used in the codebase (read existing email files first).
From: "BornClock <hello@bornclock.com>"
Subject: `Your BornClock invoice – ${invoiceNo}`
HTML body: clean, minimal — BornClock branding, one sentence ("Your tax invoice is attached."),
  invoice number, support email hello@bornclock.com
Attachment: { filename: `${invoiceNo.replace(/\//g, '-')}.html`, content: btoa(html) }

Note: Resend free tier supports HTML attachments. The invoice is sent as an .html file
which opens correctly in any browser and prints cleanly to PDF.

---

## PHASE 7 — REGISTER NEW ROUTE

In the Worker entry point (_worker.ts or wherever routes are registered):
  - Import and wire sendInvoiceEmail if needed
  - No new HTTP routes required — everything runs inside verify-payment

Grep for how routes are registered:
  grep -r "verify-payment\|createOrder\|razorpay" _worker.ts src/worker* 2>/dev/null || grep -r "route\|Route" *.ts --include="*.ts" -l

Follow the exact same pattern.

---

## PHASE 8 — TYPECHECK + BUILD

Run:
  npx tsc -p tsconfig.app.json --noEmit 2>&1 | head -60

Baseline is 47 pre-existing errors. Fix any NEW errors introduced by this build.
Do not touch pre-existing errors.

Then:
  npm run build

Expect: 1313+ ok, 0 failed, 0 skipped prerenders.
If the count increases (new pages from this build) that is fine.

---

## PHASE 9 — SMOKE TEST (local)

Start the worker locally:
  set -a; source .env.local; set +a
  ./node_modules/.bin/wrangler dev --port 3001 &

Run the existing smoke test:
  curl -s -X POST http://localhost:3001/api/create-order \
    -H "Content-Type: application/json" \
    -d '{"product":"birthday_report","report_slug":"zzzzzzzz","userId":"test-user","currency":"INR"}' \
  | grep -q '"error":"Report not found"' && echo "SMOKE OK" || echo "SMOKE FAIL"

Also verify the new state-capture UI renders without errors on /results.

---

## PHASE 10 — DEPLOY

  ./node_modules/.bin/wrangler deploy

Post-deploy smoke test (live):
  curl -s -X POST https://bornclock.usdvisionai.workers.dev/api/create-order \
    -H "Content-Type: application/json" \
    -d '{"product":"birthday_report","report_slug":"zzzzzzzz","userId":"test-user","currency":"INR"}' \
  | grep '"error":"Report not found"' && echo "LIVE SMOKE OK" || echo "LIVE SMOKE FAIL"

---

## PHASE 11 — REPORT

Write docs/GST-BUILD-REPORT.md covering:
- Every file created or modified (with reason)
- Logo asset found at (path) and inlined as (SVG/base64)
- State capture UI: where it appears, what it looks like
- verify-payment.ts: exact line range of the invoice hook insertion
- Any fields in paymentData that were different from the prompt's assumption
- Typecheck: N new errors (target 0), N pre-existing (target 47)
- Build result: N pages ok
- Smoke test results
- Anything requiring manual attention (Resend attachment limits, fx rate TODO, etc.)
- Commit hash

Commit message: "feat: GST invoicing — state capture, issue_invoice hook, PDF, email, profile download"

---

## HARD RULES (repeat for clarity)

1. NEVER modify api/_crypto.ts or api/razorpay-webhook.ts
2. verify-payment.ts changes: ONLY the non-fatal try/catch block described in Phase 4.
   The HMAC check and premium-grant logic are NEVER touched.
3. NEVER use npx wrangler — always ./node_modules/.bin/wrangler
4. DDL cannot run via Claude Code — the DB is already set up. Do not attempt any SQL.
5. Read before write — grep first, read the file, then edit.
6. One Claude Code session on this repo. Do not open a second.
7. Local commits only. Do NOT push to GitHub.
8. The invoice number series starts at BC/26-27/1001 and BX/26-27/1001 — already seeded.
   Do not seed again.
