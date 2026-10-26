# BornClock — Batch 7 report (26 Oct 2026)

Branch `release-batch7-2026-10-26`, final commit 6b2adb9. Not deployed.
Checks: 3,654 tests pass, typecheck clean, build passes. An independent reviewer said GO.

## What's new

| Area | What it does | Sample URL |
|---|---|---|
| Daily Rashifal (EN + HI) | Today's horoscope for 12 rashis, from the real sky, updates itself daily | /rashifal/mesh/today, /hi/rashifal/mesha |
| Western daily horoscope | Today's horoscope for 12 sun signs | /zodiac/leo/today |
| Panchang by city | 50 biggest Indian cities, any date, all muhurtas, times rounded | /panchang/hyderabad |
| Rahu Kaal / Choghadiya | New pages for the same 50 cities, updated daily | /rahu-kaal/hyderabad, /choghadiya/hyderabad |
| Hindi Panchang | 10 cities, now updated daily | /hi/panchang/delhi |
| Divisional charts | All 16 vargas in the Kundali, meaning + BPHS source + birth-time check; D30 bug fixed | /kundali |
| Tarot | 78 card pages + index; yes/no tarot uses all 78 cards | /tarot/cards/the-fool |
| Angel numbers | 15 number pages + index | /angel-numbers/1111 |
| Baby names by nakshatra | 27 pages; link from Kundali | /baby-names/nakshatra/rohini |
| US life expectancy | State figures now from CDC 2022 | /life-expectancy-usa |
| Transit alert emails | Built and tested, switch OFF, nothing sent | — |
| SEO clean-up | One canonical per page; 63 duplicate celebrity pages and 1 duplicate article now 301; test blocks duplicate titles | — |

Daily pages: 400 days are precomputed at build (12 MB); the site shows today's text, no redeploy needed.
Sitemap: about 5,235 URLs (live today ~5,024).

## Accuracy
Daily Moon sign/nakshatra, Western sign changes, Panchang times (5 cities × 3 dates vs Drik; reviewer re-checked vs Swiss Ephemeris) and 480 varga placements match within 1 minute / exactly. Tithi/nakshatra end times can differ by up to 2 minutes (engine Moon ~30 s behind Swiss).

## Found and fixed during review
- Fake /hi/rashifal/… addresses returned a page instead of 404.
- New celebrity redirects could have been lost between build and deploy jobs.
- Western text said "turns direct" for a date already past.
- A life-expectancy test started failing on 26 Oct 2026 because of leap days; this would also have blocked any deploy from main.
- Removed baby name "Omisha" (meaning mentioned death, unsourced).

## Open (not blocking)
1. Satellite-city Panchang pages (e.g. Thane, Navi Mumbai) are 72–75% the same as the main city — decision: keep or drop.
2. Many pages carry two meta descriptions (site-wide, already live) — fix next batch.
3. Homepage has a second copy of its structured data (already live) — fix next batch.
4. Weekly rashifal shows the build week until the next deploy.
5. Images not added to tarot pages (licence pages couldn't be opened).
6. Existing 142 baby-name meanings were never sourced (only 3 new ones are).
