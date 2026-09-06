Create a comprehensive PROJECT_CONTEXT.md for BornClock that serves as the
complete knowledge base for any new Claude Code session. A session starting
with this document must never need to run discovery scripts or ask basic
questions about the codebase.

BEFORE WRITING ANYTHING: read every file listed below in full. Do not
write a section until you have read its source files. If a file does not
exist or cannot be read, write "[FILE NOT FOUND: <path>]" in that section
rather than guessing or omitting it. If a value only exists in an external
dashboard (Cloudflare, Razorpay, Supabase UI) and not in the code, write
"[IN DASHBOARD ONLY: <where to find it>]".

FILES TO READ (read all of these before writing):
Core: package.json, wrangler.toml or wrangler.json (whichever exists),
  _worker.ts, vite.config.ts or equivalent, tsconfig.json
Payment (read every line of these — they are the most critical):
  supabase/functions/verify-payment/index.ts (or wherever it lives)
  supabase/functions/razorpay-webhook/index.ts (or wherever it lives)
  src/lib/razorpay.ts or wherever client-side Razorpay checkout is initiated
  Any checkout modal or region-capture component
  The daily scheduled cron handler (in _worker.ts or a separate file)
  The invoice HTML template(s)
Database:
  All files in supabase/migrations/ — read them in chronological order
  supabase/functions/_shared/ — all files
  Any seed files
Build and deploy:
  scripts/ — all files (prerender, title injection, etc.)
  public/_headers, public/_redirects if they exist
  .env.example or .env.template if it exists
Testing:
  Any test files (*.test.ts, *.spec.ts, e2e/ directory)
  Any gauntlet or verification scripts
SEO/Content:
  Any sitemap generation script
  Any celebrity data pipeline scripts
Config:
  Any ops monitoring files
  Any cron/scheduled task files

━━━ SECTION 1 — PROJECT OVERVIEW ━━━
- What BornClock is (product, audience, core value prop, current URL)
- Live URL and Cloudflare project name
- GitHub repo URL and default branch
- Full tech stack with versions (read from package.json)
- USD Vision AI LLP legal details:
  GSTIN, PAN, SAC code, LUT ARN, invoice sequences (domestic and export),
  GST rate, whether prices are GST-inclusive or exclusive

━━━ SECTION 2 — ARCHITECTURE ━━━
- Directory structure (3 levels, with purpose of each directory)
- Build pipeline end-to-end: local → build → prerender → deploy
- THE EXACT DEPLOY COMMAND with the reason why it is this command and
  not npx (this is a critical invariant — document it prominently)
- The env bridge pattern in _worker.ts:
  * What it is and why it exists
  * The exact BRIDGE_KEYS array (list every key by name)
  * What breaks if a key is missing from BRIDGE_KEYS
- How environment variables flow from .env → Cloudflare secrets → runtime
- Prerendering: the exact script, how titles are injected, the concurrency
  setting, and WHY it cannot be raised (document the failure mode)
- Which pages are prerendered vs dynamic, and how to tell the difference
- ESM import rules: the .js extension requirement on relative imports,
  why it matters (runtime crash, not type error), where it applies

━━━ SECTION 3 — WORKING MODEL ━━━
- The exact git remote name and URL
- The "DO NOT PUSH" rule: when it applies, who pushes, how
- Read-before-write discipline: what it means in practice
- Staging environment: URL, project ref, credentials location, how to switch
- npm run preview vs npm run dev: the exact difference and when each is used
- How to verify a build without deploying (the exact command)
- The "built ≠ run and passed" rule with a concrete example of what it means
- The "rendered pages are not database verification" rule

━━━ SECTION 4 — PAYMENT SYSTEM ━━━
This is the most critical section. Read every payment file in full before
writing this section. Include actual code snippets for every critical path.

4a. Plans and pricing:
  - Every Razorpay plan ID (test and live) with amount, currency, interval
  - How plan IDs are stored (hardcoded, env var, database?)
  - The 5 plan types and their amounts (read from the code)

4b. Client-side subscription checkout (read the checkout component):
  - Step-by-step flow from "click upgrade" to "payment confirmed"
  - The exact Razorpay options object (copy it from the source)
  - How currency is determined (client detection? region modal?)
  - The CheckoutRegionModal: when it opens, what it captures, how data
    flows to the payment handler
  - What happens after Razorpay closes (success and failure paths)

4c. verify-payment edge function (read the full file):
  - Every step it performs, in order, with file:line
  - The HMAC signature verification: the exact Web Crypto implementation
    (copy the relevant code block)
  - How premium is granted: which table, which column, which Supabase
    client (SERVICE ROLE — document why anon fails here)
  - THE GUARD_PREMIUM_COLUMNS BUG: what it was, what caused it,
    the exact fix (file:line), how to detect if it regresses
  - GST invoice generation: where it sits in the function, the math,
    the non-fatal try/catch, what happens if it fails
  - Idempotency: how duplicate payment events are detected and ignored
  - Every environment variable it reads

4d. razorpay-webhook.ts (read the full file):
  - Why this file is FROZEN — what "frozen" means and what breaks if modified
  - Every webhook event it handles with what it does for each
  - Signature verification implementation
  - How renewal payments update the database
  - The service-role key usage and exactly why anon key fails
  - Every environment variable it reads

4e. GST invoicing:
  - The exact GST-inclusive math for each price point
    (e.g. ₹299 = ₹X taxable + ₹Y CGST + ₹Z SGST — read from the code)
  - The issue_invoice() RPC: its exact signature and what it does
  - Invoice numbering sequences with format (domestic and export)
  - The HTML invoice template: where it lives, how it is rendered to PDF
  - How the PDF is emailed: the Resend call, attachment format
  - The buyer_state/buyer_state_code/buyer_country columns: where they
    are set and why they are legally required

4f. One-time payments (birthday reports):
  - How a Razorpay order is created (not a subscription)
  - The verify-payment path for one-time vs subscription (what differs)
  - How premium/access is granted for one-time purchases

4g. Daily ops cron (the non-webhook invoice sweep):
  - Why it exists (the webhook is frozen)
  - Exactly what it does, step by step
  - How it finds payments that need invoicing (the join query)
  - Idempotency guarantee

4h. Cancellation and subscription management:
  - How cancellation works (cancel_at_period_end or immediate?)
  - How access is revoked
  - What the database state looks like for cancelled subscriptions

4i. Test environment:
  - Which test cards work for subscription recurring payments
    (document the specific cards — the "recurring payments not supported"
    error was caused by wrong test cards)
  - How to switch between test and live keys
  - Any other test-environment gotchas

━━━ SECTION 5 — DATABASE ━━━
Read all migration files in chronological order before writing this section.

- Every table with all columns, types, defaults, and constraints
  (generate from the migrations, not from memory)
- The profiles table in complete detail — every column
- The invoices table in complete detail
- All RLS policies: which tables, what they allow, any gotchas
- All triggers: name, table, what they do
- All database functions: name, signature, purpose
- Migration history: list every migration file with what it does
- CRITICAL OPERATIONAL RULES:
  * The Supabase Studio project breadcrumb confirmation rule
    (confirm which project before ANY DDL)
  * The large SQL paste silent rollback issue
    (files over X lines silently roll back — the exact limit if known)
  * How to run migrations safely

━━━ SECTION 6 — KNOWN BUGS AND INVARIANTS ━━━
For each known bug: what it was, what caused it, the fix (file:line),
how to detect if it regresses. Never omit a bug — these save hours.

For each invariant: state the rule, why it exists, what breaks if violated.

Known items to document (find others in the codebase):
- guard_premium_columns bug (from Section 4c)
- The ESM .js extension runtime crash
- The npx wrangler vs local binary issue
- Large SQL paste silent rollback
- npm run preview requirement for layout verification
- git add . permanently dirtying package.json/package-lock.json
- Payment testing requires clean browser (Firefox content blockers
  half-load Razorpay — document the exact symptom)
- Rendered pages are not database verification
- The EasyList class name prohibition
  (ad/banner/promo/sponsor never in class names, filenames, or routes —
  document every prohibited term and why)
- The Supabase Studio breadcrumb confirmation
- Wrangler secret extraction: cut -d'=' -f2 not cut -d'"' -f2

━━━ SECTION 7 — ENVIRONMENT VARIABLES ━━━
Complete table for every environment variable. Read wrangler.toml,
.env.example, and every file that calls Deno.env.get() or process.env
or import.meta.env to find all of them.

For each variable:
| Name | Description | Where set | Which files read it | Test vs live | Missing = |
Document what breaks when it is missing or wrong — not just "it won't work"
but the exact failure mode.

━━━ SECTION 8 — EXTERNAL SERVICES ━━━
For each service:

Supabase:
- Project ref (prod), project ref (staging if any)
- Region
- Which client is used where (anon vs service-role — this is critical)
- Connection pooler vs direct connection and when each is used
- Rate limits that matter

Razorpay:
- Account details (name, business type)
- Which features are enabled (International, recurring, etc.)
- Webhook URL registered
- Signature verification method

Resend:
- Which domain is verified
- From address used for invoices
- From address used for transactional emails
- Rate limits

Cloudflare:
- Project name
- Account ID (if in code)
- Custom domains configured
- Any Page Rules or Transform Rules

━━━ SECTION 9 — SEO AND CONTENT ━━━
- How prerendered titles/metas work (the exact mechanism)
- Celebrity data: total count, source, enrichment pipeline, Wikidata query
- Which programmatic SEO pages exist and how they are generated
- Sitemap: generation script, location in dist, format
- Content invariants: celebrity ordering rules, India-first logic,
  any editorial rules baked into the code

━━━ SECTION 10 — TESTING AND VERIFICATION ━━━
- How to run the test suite (exact command)
- The E2E gauntlet: what it covers, exact command, expected output
- PDF export verification: why it is the only reliable visual test,
  how to run it
- Payment E2E: exact steps to test a payment end-to-end on test keys
- Post-deploy verification checklist (exact steps, exact commands)

━━━ SECTION 11 — OPERATIONAL RUNBOOKS ━━━
Step-by-step, copy-paste ready:
- Deploy to production (every step, every command)
- Roll back a bad deploy
- Rotate a secret/key (which files to update, which commands to run)
- Add a new environment variable (client-side vs server-side path differs)
- Run a database migration safely
- Post-deploy verification (the exact curl commands or checks)

━━━ SECTION 12 — RECURRING LESSONS ━━━
Things that have caused problems more than once. Format each as:
RULE: [the rule in one sentence]
WHY: [what happened when it was violated]
HOW TO AVOID: [the specific behaviour required]

Include at minimum: all items from Section 6, plus any others found
in git commit messages, comments marked IMPORTANT/WARNING/NOTE, or
FORENSIC_AUDIT.md if it exists.

━━━ FORMAT REQUIREMENTS ━━━
- Clear markdown headers for every section and subsection
- Code blocks (with language tag) for all commands, SQL, and code snippets
- Tables where structured data is clearer than prose
- Every file path relative to the repo root
- Every command copy-paste ready — no placeholders like <your-key>
- Secrets: write [CLOUDFLARE SECRET: VARIABLE_NAME] or [IN .env: VARIABLE_NAME]
- Missing information: write [FILE NOT FOUND: path] or [IN DASHBOARD ONLY: where]
  Never omit and never guess
- Length: as long as needed. Do not summarise where specifics matter.
  A session reading this document must never need to run a discovery script.

Save the output to docs/PROJECT_CONTEXT.md in the repo root.
Write the complete PROJECT_CONTEXT.md now. Read every file listed above
before writing. Start with the files, then write the document.
DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Commit with message: "docs: add PROJECT_CONTEXT.md knowledge base"
