# Part AN — Decisions log (autonomous, no approval gates)

- **`--mode preview` build:** works with the full pipeline and bakes the Razorpay TEST key
  (`rzp_test_***`) into the bundle instead of `.env.local`'s live key — resolving the Part AM
  finding. Using it for the preview. (Homepage has no payment logic; this is hygiene.)
- **Header:** used the real `<Navigation/>` + `<AuthNav/>` on the navy bar (the shared redesigned
  header the other pages use), NOT the reference's simplified 4-link nav — per the rule "do not
  restyle the shared global Navigation." Keeps every nav link.
- **Footer:** the reference footer "BORNCLOCK" column lists only How it works · Answers · Privacy ·
  Contact. Extended it with **Articles, About, Editorial Policy, Pricing** so no internal link
  reachable from today's homepage is dropped. All footer items are real `<Link>`s to real routes.
- **FAQPage schema:** not added — the new homepage has no genuine Q&A section (the old PageFAQ block
  is not in the reference design). Per Step 3, no FAQPage without a real Q&A on the page.
- **Born-today count:** uses a real Supabase `count` query on `celebrity_sitelinks` for the day, so
  "+N more today" is a real number (falls back to "See everyone born today →" with no number if the
  count is unavailable — never invents a number).
- **Function agreement:** the site's own `calculateWesternZodiac` / `calculateLifePathNumber` /
  `BIRTHSTONE_DATA` match ALL the spec's verified expected values (test passes) — no disagreement to
  resolve.
- **prerender-titles cleanup:** my Part AM `/name-numerology` entry was a duplicate of a pre-existing
  one AND 76 chars (>70); removed my duplicate (kept the ≤70 original). Added the missing `/`
  homepage entry.
- **Homepage title:** kept the ranking key terms exactly ("Birthday, Zodiac & Longevity Calculator |
  BornClock", 51 chars ≤70); the new positioning ("Everything your birth date reveals") is the on-page
  H1 + meta description, since leading with it in the title and keeping the key terms would exceed 70.
- **Primary flow:** today's `/results` destination is preserved via the "See your full birthday
  profile →" button (sets BirthDateContext + navigates to `/results`). Inline decoding is additive.

## Title decision (final, after Fifth-Rule check of served output)
getTitleForRoute('/') hard-codes the homepage title, so the prerendered homepage served the proven
ranking title "Free Birthday, Zodiac & Longevity Calculator | BornClock" (≤70, all key terms incl.
"Free"). The constraints collide: keeping that full key phrase + brand + ≤70 leaves no room to also
lead with the 34-char positioning. Resolved by KEEPING the ranking title (lowest SEO risk for a
ranking homepage) and leading with the new positioning in the H1 + meta description (updated). Index
SEO title aligned to the same string; dead STATIC['/'] entry removed.
