# Growth programme — bug log

Bugs found and fixed during the Growth phases (Rule 5). Format: ID · phase ·
symptom · fix · status.

## P1

- **P1-BUG-1 · P1 · SEO titles > 70 chars.** The already-committed P1 work
  (rashifal, panchang, blue-zones, attitude, chaldean, nakshatra) shipped 8
  titles over the 70-char limit, failing `titleValidator.test.ts` (the sole
  baseline failure). **Fixed** — trimmed all 8 to ≤70c (commit: P1 title fix).
  Status: **closed**.

- **P1-BUG-2 · P1 · festival engine: Krishna-paksha festivals a month off.**
  First festival-engine pass placed Karwa Chauth, Dhanteras and Maha Shivratri
  ~30 days late because the North-Indian Purnimanta naming convention was not
  mapped to the amanta months used internally, and the month-boundary Amavasya
  was double-counted. **Fixed** — Krishna-paksha festivals mapped to amanta
  month = Purnimanta−1; scan window capped at the closing new moon. Re-validated
  16/17 vs Drik Panchang 2025. Status: **closed**.

- **P1-BUG-3 · P1 · festival engine: evening/night festivals off by one.**
  Diwali, Dhanteras and Maha Shivratri resolved a day late under a pure
  sunrise-tithi rule. **Fixed** — timing-aware tithi matching (pradosh /
  moonrise / midnight observance times per festival). Status: **closed**.

No open product-failure bugs from P1 at report time.

## P2

- **P2-BUG-1 · P2 · `/api/life-report` returned 404 on the preview.** The new
  life-report endpoint (`api/life-report.ts`) was created but not registered in
  the worker's API route map, so every real request 404'd while the career and
  kundali endpoints worked. Found during the end-of-phase real-use check against
  the live preview worker (curl returned `{"error":"Not found"}`). **Fixed** —
  imported `lifeReport` and added `'/api/life-report': lifeReport` to the route
  map in `functions/_worker.ts`; re-uploaded the preview and re-verified (all 4
  life areas returned, health wellbeing-framed). Status: **closed**.

No other open product-failure bugs from P2 at report time.
