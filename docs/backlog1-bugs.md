# Backlog-1 Bug Log

Format: `[ID] <item> — <severity> — <description> → <fix> → <retest result>`

(Baseline test suite: 155 files / 1888 tests passing, recorded 2026-10-08. Load avg at baseline run: 5.40.)

---

- [B1] Item E — minor — subagent-generated pages emitted a page-level BreadcrumbList JSON-LD that duplicated the one `SEO.tsx` already emits → removed the page-level one from all 4 pages (kept the unique FAQPage) → served HTML now shows exactly 1 BreadcrumbList + 1 FAQPage each. Retested via build + grep.
- [B2] Item E — trivial — Kaal Sarp meta description 164 chars (>160) → trimmed to 149 → OK.
- [B3] Item G — trivial (test-only) — en-dash codepoint mismatch made a marriage-guardrail regex flaky → rewrote the assertion to robustly prove *no* day-precision date appears (stronger check). Retest: 5/5 pass.
- [B4] Item F — content/honesty (Rule 6) — `/kundali` page + its served meta falsely claimed "Swiss Ephemeris"; live engine is astronomy-engine (sidereal Lahiri) → corrected page SEO/footer + `prerender-titles.mjs` → served HTML verified. (Related `/vedic-astrology` claims left as out-of-scope; flagged under "Needs the person".)

No functional defects shipped. All items verified green at commit time.

