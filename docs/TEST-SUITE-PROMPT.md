# Automated Test Suite + Fix Loop — Claude Code Prompt
# Save as docs/TEST-SUITE-PROMPT.md, then: "Read docs/TEST-SUITE-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/TEST-SUITE-REPORT.md at the end with a full pass/fail matrix.

GOAL: extend the existing Playwright launch gauntlet (e2e/launch-gauntlet/, 135 tests)
with a pre-launch suite covering the inventory below — AND fix every product bug the
suite finds, then re-run until green. The founder is manually testing payment, email
delivery, and PDF visuals in parallel; everything automatable is yours, end to end.

---

## FIX POLICY (read carefully — this governs the whole session)

When a test fails, classify the failure before touching anything:

  (a) PRODUCT BUG — the app misbehaves. FIX THE APP, outside frozen files, then
      re-run the suite. This is the default assumption for a failure.
  (b) TEST BUG — wrong selector, wrong fixture, race in the test. Fix the TEST.
      State in the report why it was a test bug, with evidence.
  (c) FROZEN-FILE BUG — the fix would require touching api/_crypto.ts,
      api/razorpay-webhook.ts, or api/verify-payment.ts. DO NOT FIX. Record as a
      BLOCKER FINDING at the top of the report and keep the test red.
  (d) ENVIRONMENT — local server flake, port clash, cold start. Retry (Playwright
      retries: 2); if it passes on retry, note it as flaky, don't count as a bug.

ABSOLUTE RULE: never make a red test green by weakening the assertion, broadening a
selector to match anything, adding a sleep to skate past a race, or deleting the test.
Every assertion change must be justified in the report as classification (b) with the
evidence. A green suite achieved by softening tests is worse than a red suite.

LOOP: run suite → classify failures → fix → re-run THAT suite → when green, re-run the
FULL suite set (a fix can break another test). Max 3 fix iterations per suite; if still
red after 3, record as a FINDING with your best diagnosis and move on.

---

## HARD RULES
- NEVER modify api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts
- NEVER complete a Razorpay payment, real or test (invoice counters are seeded at 1001
  for launch; a payment burns a number). Suite E stops AT the region modal.
- NEVER call issue_invoice / issue_credit_note / any path mutating invoice_counters
- Every created test user is deleted in afterAll/teardown, EVEN ON FAILURE — use
  try/finally, and add a sweep helper that deletes all users matching the test-email
  pattern so a crashed run can be cleaned by re-running the sweep
- Read existing conventions first and follow them; ./node_modules/.bin/wrangler only
- Tests run against LOCAL servers (wrangler dev :3001 + vite :3000,
  `set -a; source .env.local; set +a`) — same as the gauntlet. Deploy at most ONCE at
  the very end, and only if product fixes were made.

## PHASE 0 — READ THE INFRASTRUCTURE
1. e2e/launch-gauntlet/gauntlet.config.ts + 3-4 existing specs (conventions).
2. scripts/test-subscription-lifecycle.mjs — the proven PostgREST/service-role DB
   assertion pattern. Extract into e2e/helpers/db.ts and reuse.
3. api/report-entitlement.ts, src/lib/pricing.ts, src/lib/reportFacts.ts,
   src/lib/zodiacPlurals.ts, src/hooks/useCurrency.ts — assertion targets.
4. Run the EXISTING gauntlet before writing anything: must be 135 green. This is the
   baseline; if it is not green, stop and report.

## TEST-USER STRATEGY
- supabase.auth.admin.createUser({ email, password, email_confirm: true }) with the
  service-role key — no confirmation emails fire, and the user is genuinely in-trial.
- Emails: e2e+<suite>+<timestamp>@bornclock-test.invalid (sweepable pattern).
- States not creatable from outside (post-trial, subscriber-with-credits): mock
  /api/report-entitlement via page.route for UI-state tests, tag [mocked].
  Server-enforcement tests use only genuinely creatable states, tag [real].

## EXECUTION ORDER
Write and stabilise ONE SUITE AT A TIME: write → run → fix loop → green → next suite.
Do not write all suites first and run at the end. After the last suite is green,
run everything together (gauntlet + all new suites) as the final proof.

---

## SUITES (mapped to the founder's numbered inventory)

### Suite A — auth.spec.ts (3,4,5,7,8)
Login success / wrong-password error / unconfirmed-email message (one user created
with email_confirm:false) / sign-out clears session / /profile redirects when logged out.
(1,2,6 = real inboxes — founder's list.)

### Suite B — delete-account.spec.ts (9,10,11,12,20)
Modal disabled until exact "DELETE"; wrong text stays disabled; Cancel leaves account
intact. Full delete of a purpose-made user: login then fails, profiles row gone
(DB assert), re-signup with same email succeeds. (13-18 founder's list.)

### Suite C — pricing-card-states.spec.ts (21-26) [mocked]
Mock entitlement per state; assert the exact strings:
trial-unused "1 free report" · trial-used price + "Launch price" and NO "free" ·
credits=2 "2 report credits available" + "1 remaining after" · credits=0 price +
"no credits left this month" · post-trial price + "Launch price".
Every state: exactly ONE currency in the DOM (₹ XOR $).

### Suite D — generation-flow.spec.ts (27,28,29,34,35) [real]
Fresh in-trial user: report #1 → DB assert is_paid=true, unlock_source='trial'.
Report #2 → is_paid=false. After "Generate another": card no longer says "1 free
report". Success phase: result block present; "A peek inside", gift strip, pricing
card ALL absent from DOM. Do not unlock report #2 by any means.

### Suite E — paywall-modal.spec.ts (33,36,40)
Locked report → unlock → CheckoutRegionModal appears before any Razorpay iframe.
"Outside India" → $6.99 shown in modal. India→Karnataka → ₹199 stays. STOP THERE.

### Suite F — currency.spec.ts (46-52)
Confirm exact routes from the router first. For /birthday-report, /pricing, /upgrade
and the five CTA pages: default → ₹ only; ?currency=USD → $ only. /pricing vs
/upgrade price-string set-equality in both currencies. Annual visible on both with
the saving line.

### Suite G — profile.spec.ts (54,55[mocked],56)
Free user: upsell copy present, "0 of 9" absent. Subscriber [mocked]: "N of 9"
present. Invoices card empty-state line for a no-purchase user.

### Suite H — navigation.spec.ts (60-64)
Main bar has Birthday Report, not Planetary Age; Planetary Age under More;
Explore ∩ (main ∪ More) = ∅ asserted as DOM sets; 390px viewport parity;
Admin tab absent for a normal user.

### Suite I — invoice-render.spec.ts (65-72)
NO payments. Import generateInvoiceHTML directly with three fixture records
(CGST_SGST / IGST / EXPORT) and assert on the HTML: supplier block has GSTIN, LLPIN,
limited-liability line and NO address; footer has the address exactly once;
CGST fixture renders 168.64/15.18/15.18 → ₹199.00; IGST fixture 30.36; EXPORT fixture
zero tax + "AD360726011878N"; amount-in-words matches; BC/26-27/1001 and BX/26-27/1001
render as given. (73 proven in Studio — mark covered-elsewhere.)

### Suite J — report-content.spec.ts (74-78)
On the trial-unlocked report from Suite D: exactly 9 numbered section markers
(enumerate them); Solar System Ages has Earth FIRST and 8 planet cards; Moon Sign +
Nakshatra approximation caveats present. Unit-test zodiacPlurals for all 12 signs.
(79-81 = print visuals — founder's list / existing verify-pdf harness.)

### Suite K — ops-seo.spec.ts (82,86,88-94 sample)
/admin as normal user → redirected. create-order sentinel → {"error":"Report not
found"}. /methodology → 301 (status assert) → /how-it-works. /sitemap.xml ≥ 1313
URLs. Sample 10 sitemap pages: unique <title>, canonical ≠ home. /born-on/india and
/answers → 200 with expected h1.

---

## FINAL GATE (all must hold)
1. Existing gauntlet: 135 green (no regression from any fix)
2. All new suites green, or red only with classification (c) blocker findings
3. tsc 46 baseline, 0 new
4. npm run build 1313+ ok IF any product file changed
5. git diff: frozen files untouched
6. invoice_counters query: all three series still at 1001 — paste the result
7. Test-user sweep confirms zero e2e users remain in auth.users — paste the count
8. Deploy once IF product fixes were made; live smoke sentinel after
9. Add npm run test:prelaunch to package.json running gauntlet + new suites

## REPORT — docs/TEST-SUITE-REPORT.md
Order matters:
1. FINDINGS FIRST: every product bug found — what failed, root cause, the fix, and
   the re-run proof. Frozen-file blockers flagged at the very top if any.
2. Fix-loop log: per suite, iterations used, and any (b) test-bug reclassifications
   with their justification.
3. Matrix: inventory # → suite → [real|mocked] → final status.
4. NOT-AUTOMATED list (the founder's manual set) so nothing is silently dropped.
5. Counter + user-sweep evidence, gate results, how-to-run.

Commit: "test: pre-launch suite with fix loop — auth, paywall, currency, invoice, content"
