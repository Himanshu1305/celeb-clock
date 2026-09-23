# Part AF — Birthday & Celebrity page (/celebrity-birthday): flags, link map, decisions

Branch `part-af-birthday-celebrity-page` off develop **214a8cd** (Step 0: includes Part AE ✓). Builds the design brief onto the **existing indexed `/celebrity-birthday` URL** (was a redirect to `/celebrity/` — now the enhanced category page, per the brief's explicit decision). Left unmerged for review.

## 🔶 Visual-direction choice (flagged — not separately reviewed)
No mockup existed. Per instruction, this reuses the **exact same navy #0E2238 / gold #C6A15B / ivory #FAF7F0 palette, Fraunces + Public Sans, and dense hairline-divided edge-to-edge layout** already shipped on `/vedic-astrology`, for cross-page consistency — with a slightly warmer, **ivory-forward** hero (vs. the Vedic page's navy-forward look) per the brief's "can feel warmer" note. If a different tone is wanted here, that's a follow-up.

## Hero mechanics (per brief — verified, not duplicated)
The hero is an **input-only DOB form** (`DobInput`) that on submit **navigates to `/birthday-report?dob=YYYY-MM-DD`** (zero-padded ISO) — the exact `?dob=` deep-link `/born-on/` CTAs already use (`BirthdayReportCTA.tsx`, `CelebritySearch.tsx`), consumed by `parseDobSeed` (`/^\d{4}-(\d{2})-(\d{2})$/` → prefills month+day). It does **NOT** render `DobInput` + the generate/results UI here — one input here, one real results destination there (avoids the query-param/duplicate-content class the Part AD SEO fixes eliminated).

## §5 sample data — REAL, verified (no fabrication)
Reference date **October 2**, anchored to Mahatma Gandhi's real DOB:
- Western zodiac **Libra ♎** — from `calculateWesternZodiac(2, 10)`.
- Life Path **9** — from `calculateLifePathNumber(2, 10, 1869)` (Gandhi, 2 Oct 1869).
- Celebrity twins (born Oct 2), verified in `src/data/celebrities.json`: **Mahatma Gandhi (1869), Lovlina Borgohain (1997), Hina Khan (1987)**.

## Verified link map (every link → real route)
| On-page link | Destination | Note |
|---|---|---|
| Hero form submit | /birthday-report?dob=YYYY-MM-DD | real deep-link into the Birthday Report engine |
| §2 Celebrity Birthday Twins | /birthday-report | personalized twins result |
| §2 Browse All Celebrity Birthdays | /celebrity | existing browse index |
| §2 Today's Birthdays | /todays-birthdays | |
| §2 Zodiac & Numerology Snapshot | /age-calculator | shows zodiac + Life Path (ZodiacAndFacts) |
| §2 Vedic Rashi & Nakshatra | /vedic-astrology | the funnel |
| §3 Chinese Zodiac | /chinese-zodiac | |
| §3 Life Path Number | /numerology | |
| §3 Full Vedic Kundli | /vedic-astrology | funnel (per brief) |
| §3 Complete Birthday Blueprint | /birthday-report | paid PDF product |
| §8 Explore: Celebrity Twins / Today's / Numerology / Western Zodiac / Chinese Zodiac / Age Calculator / Born On | /birthday-report, /todays-birthdays, /numerology, /zodiac, /chinese-zodiac, /age-calculator, /born-on | all real |
| §9 reverse-funnel | /vedic-astrology | |
| §10 Final CTA "Unlock Birthday Blueprint ₹199" | /birthday-report | reuses real `initiateOrderPayment`→Razorpay flow (no new checkout) |
| footer | /how-it-works, /privacy, /contact | |

Science & Longevity deliberately excluded (positioning). No dead links; no new checkout path.

## Changes
- `src/pages/BirthdayCelebrityLanding.tsx` (new) · `src/App.tsx` (route now renders the page, lazy import) · `scripts/prerender-titles.mjs` (title/meta updated; ≤70 chars for validate-dist) · `src/components/__tests__/CelebritySearch.test.tsx` (updated the old redirect assertion to the new page assertion).
- Full unit suite: 1855 → 1855. Verification (links, direct-URL soft-404, mobile, deep-link end-to-end) on the `wrangler versions upload` preview — see final report. NOT deployed to production.
