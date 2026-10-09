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

## P3 retest (2026-10-09)
- **P3-DASH-SIGNINDEX** — Dashboard "your day" used the /api/kundali Moon `signIndex`
  directly as a 0-based index for computeRashifal, but the API returns planet signIndex
  **1-based** (verified live: Sun=Mesha=1, Moon=Karka=4, lagna=Vrischika=8). This showed
  the reading for the NEXT sign (e.g. Simha instead of Karka) and passed an off-by-one /
  out-of-range rashiIndex to /api/subscribe. Fixed: subtract 1 and clamp 0..11 in
  DashboardPage. Found by real-use of the live local chart API (Rule 4).

## P4 retest (2026-10-09)
- **P4-CELEB-CONTRAST** — Pre-existing serious color-contrast violation on
  `/celebrity/:slug` (hard-coded `text-gray-400` labels: rarity percentile, "Based on
  publicly available information", Lucky Colour/Stone/Day/Numbers). Surfaced by the new
  P4 axe gate (the celebrity page was never axe-gated before P4). Fixed: `text-gray-400`
  → `text-gray-600` (WCAG AA) on CelebrityPage + BirthdayRarityCard (`bfb8050`);
  re-verified 0 serious/critical on the built artifact (Chromium desktop + Pixel 5). My
  own P4 additions (birth-time note, rank badge/line, CZ horoscope, Hindi panchang,
  on-this-day) were axe-clean from the start. Status: **closed**.
- **P4-WRANGLER-TRACKED** — A retest-time `git add -A` pulled transient Miniflare build
  artifacts (`.wrangler/tmp/dev-*/_worker.js`) into commit `bfb8050`. Fixed: untracked
  the whole `.wrangler/` directory (`git rm -r --cached`) and added it to `.gitignore`.
  Status: **closed**.

No product-failure bugs found in P4 real-use (all new features rendered correct,
computed/live content on both engines tested).

## P5 (infrastructure & measurement)
No new product bugs. Resolved during the P5 end-of-phase retest:
- **P5-B1 (fixed):** pre-existing color-contrast on `/todays-birthdays` — the
  historical-record caption used `text-gray-400` (#9ca3af) on the cream bg
  (#faf7f0), contrast 2.37 (axe serious). Darkened to `text-gray-600`; axe now
  0 serious/critical across `/kundali`, `/todays-birthdays`, `/results`
  (desktop + Pixel5). Not introduced by P5 — surfaced by the new P5 axe gate.
- **P5-T1 (tooling, not a product bug):** the born-today photo-endpoint e2e
  flaked under parallel cold-cache load because the unauthenticated Wikimedia
  API rate-limits concurrent requests, yielding a transient null. The endpoint
  edge-caches resolved photos for 7 days, so real users don't see this; the
  test now retries. curl confirms reliable resolution (Einstein, Marie Curie).
- **P5-T2 (tooling):** one prerender route (`/born-on/january/11`) hit a 15s
  navigation timeout under build-host load (load ~7.5). The route serves 200
  via the SPA fallback on the preview; prior build prerendered it fine. No
  product defect; not a P5-touched page.
