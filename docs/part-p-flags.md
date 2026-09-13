# Part P — flags for the person's review

## 🚩 BIGGEST FINDING: scheduled triggers (cron) are genuinely broken — NOT harmless
The recurring "schedules failed to deploy" message, dismissed as harmless in prior
sessions, was investigated for real this time. The worker HAS a proper `scheduled()`
handler and 4 crons in `wrangler.toml`, but **every deploy's `PUT …/schedules` call
returns `400 Bad Request`** (confirmed in the wrangler deploy logs), so **the cron
schedules are rejected and never registered** — the daily job does not reliably fire.
(A read-only API re-verify was attempted but the stored wrangler OAuth token is expired;
the 400 across multiple deploy logs is conclusive on its own. The exact 400 body is
sanitized in the logs — most likely the Workers-with-Static-Assets + custom-domain deploy
model rejecting triggers.)

**Impact:** any feature that depends on a background daily job (including the "existing"
daily-email-cron and weekly-digest) is NOT actually running on schedule in this
environment. Worth a dedicated fix if scheduled email matters — likely needs an external
scheduler (GitHub Action / external cron hitting the existing `POST /api/daily-email-cron`
manual endpoint) rather than Cloudflare cron triggers.

**Consequence for Part 2:** per the prompt's explicit instruction, Part 2 does NOT build a
cron-dependent job. See Part 2 below.

## Part 1 — optional name field (display/identification ONLY)
- Added an OPTIONAL `name` to the saved profile (`SavedBirthProfile.name`) + the shared
  birth form. It is **never** sent to any astrological calculation — purely headings/labels.
- **Consent:** the name lives in the SAME opt-in structure already consented to (device
  localStorage; account `birth_profile` jsonb via Part L). No new storage/consent surface,
  no DB migration. A user who doesn't save a profile stores no name.
- **Kundali:** results heading reads "Priya's chart, interpreted" when a name is given,
  else "Your chart, interpreted".
- **Matching:** "Person A / Person B" become the entered names throughout the report
  (score line, synthesis, Koota text, doshas, timing) via a pure display-time transform;
  falls back to "Person A / Person B" when no name is given. Names are NOT sent to the API.
- **Gift-a-Kundali separation:** the Kundali page's "Gift a Kundali" is a link to a
  SEPARATE page (`BirthdayReportGiftPage`) with its own `recipientName`/`giverName` state
  that never reads the saved profile — so the user's saved name can NOT leak into a gift
  recipient field. Verified by inspection.
- **Adversarial handling:** `sanitizeName` trims, collapses whitespace, strips control
  characters, and caps length at 60; unicode/accented names (Zoë, कृष्णा, 李明) are kept.
- Real examples (Playwright): Kundali "Priya's chart, interpreted" vs "Your chart,
  interpreted"; Matching "Arjun (Kanya/Hasta) × Meera (Kanya/Uttara Phalguni)" with the
  Koota text using the names and zero "Person A/B" remnants, vs the neutral unnamed case.

<!-- Part 2 & 3 flags appended below as they complete. -->
