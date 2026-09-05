# BornClock — Weekly SEO & Growth Checklist

A repeatable weekly routine. Target ~60-90 minutes.

## 1. Measure (15 min)
- [ ] Export Google Search Console → **Performance → Queries → Export (CSV)**.
- [ ] Run `npx tsx scripts/keyword-monitor.ts --from-csv <file>`.
- [ ] Note the top 3-5 opportunity keywords (impressions ≥ 50, position 5-20).

## 2. Create (40 min)
- [ ] For each opportunity keyword, draft or expand content using
      `prompts/templates/celebrity.md` or `prompts/templates/article.md`.
- [ ] Ensure every new page has: ≤ 70-char title, canonical, OG image,
      appropriate JSON-LD, and ≥ 2 internal CTAs.

## 3. Verify (15 min)
- [ ] `npx vitest run` — 0 failing.
- [ ] `npm run build` — 0 prerender failures.
- [ ] Spot-check 2-3 new/changed URLs on staging.

## 4. Ship
- [ ] Merge `develop` → `main` (GitHub Actions deploys — see `GITHUB_ACTIONS_SETUP.md`).
- [ ] Confirm the sitemap URL count grew as expected.

## Monthly
- [ ] Review nightly bio-fill coverage (`npx tsx scripts/generate-celebrity-bios.ts --status`).
- [ ] Re-run `npx tsx scripts/export-celebrities.ts` to pull new celebrities.
- [ ] Audit internal-link graph (every article ≥ 2 inbound + 2 outbound).
