# Prompt 5-Q ADDENDUM — run together with 5Q-payment-integrity-and-compliance.md
Read the base 5-Q prompt fully first. This addendum amends it with product decisions made after it was written. Where they conflict, the addendum wins. All base rules (pre-mortem, preflights, checkpoints, one commit per task, no DB credentials, payment-code discipline) stand.

## Amendment 1 — Task 6 (privacy policy) copy is now decided; implement this framing
The policy amendments must present the two products' storage postures as a deliberate split, not an apology. Core copy to work into the existing structure (adapt phrasing to the page's voice, keep the substance exact):

- Lead distinction (add near the top of the Data Model section):
  "Two products, two promises. Your health data (Life Expectancy / Longevity): never stored — every calculation happens in your browser and no health input or result ever reaches our servers. Your Birthday Blueprint gift reports: stored only so your shareable link works — a gift report must exist on our servers for the recipient to open it. Deleted with your account, on request, or automatically after 12 months without a single view."
- "What We Do NOT Store → Saved forecasts or reports" clause: reword per the base prompt, now explicitly scoped: longevity forecasts/results never stored; Birthday Blueprint reports stored for delivery (name, date of birth, generated content).
- Gift-recipient subsection (base prompt item 2): unchanged, plus one sentence: recipients themselves may request deletion of a report about them via privacy@bornclock.com.
- Retention line (new): "Gift reports that have not been viewed for 12 months are automatically and permanently deleted."
- Deletion carve-out (base prompt item 3) and Resend row (item 4): unchanged.

## Amendment 2 — Task 1 SQL additions (dormancy tracking)
Add to the migration file, as individually runnable statements:
- ALTER the reports table: ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz (backfill existing rows to created_at so no live report is instantly dormant).
- The Task 7 report_downloads decision stands as specified; if you chose the downloads_count column, it coexists with last_viewed_at.

## Amendment 3 — NEW Task 8: view tracking + dormancy sweep
1. In ReportView, on successful load of a report, fire-and-forget an update of last_viewed_at (must never block or break rendering; a lightweight RPC or update via the existing service is fine — but note the RLS posture: the report page is viewed by anonymous recipients, so the write path must work without auth; prefer a narrow SECURITY DEFINER function touch_report_view(slug) that updates ONLY last_viewed_at, over any broad anon UPDATE policy).
2. Dormancy deletion: do NOT build a scheduler. Generate scripts/sweep-dormant-reports.sql — a single reviewed DELETE (reports where last_viewed_at < now() - interval '12 months') the user runs manually in Studio periodically; add a runbook line to docs/ARCHITECTURE-DECISIONS.md §9. Automating this is a post-launch item (pg_cron), noted in §8. Rationale: an automatic deleter of paid customer data does not ship unattended in week one.

## Amendment 4 — standing decision to record in the doc (Task 6 commit or the doc commit)
Add to docs/ARCHITECTURE-DECISIONS.md decision log: "Storage posture (2026-07-04): Longevity/health = never server-side, by design and policy — do not add server-side health storage; monthly-comparison features use browser localStorage; any future cross-device sync must be explicit opt-in. Birthday reports = stored for delivery, 12-month dormancy deletion, recipient deletion rights."

## Amendment 5 — Task 5 note
The report-created email must describe the link honestly per the new posture, e.g. "This link is live for your recipient — reports unviewed for 12 months are removed." One sentence, not legalese.

Everything else in base 5-Q proceeds unchanged, checkpoints included.
