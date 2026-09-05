# GitHub Actions — Setup

The workflow at `.github/workflows/deploy.yml` builds and deploys BornClock to
Cloudflare, and runs the nightly bio auto-fill on a schedule. It triggers on:

- **push** to `main` — build + deploy
- **schedule** (`cron: 30 2 * * *`) — nightly bio fill → refresh data → build → deploy
- **workflow_dispatch** — manual run from the Actions tab

## Required repository secrets

Add these under **Settings → Secrets and variables → Actions → New repository secret**.
Never commit these values — the workflow reads them via `${{ secrets.X }}`.

| Secret | Purpose |
| --- | --- |
| `CF_API_TOKEN` | Cloudflare API token with Workers + Pages edit permission (used by `wrangler-action`) |
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `SUPABASE_URL` | Supabase project URL — used by `export-celebrities.ts` and the nightly bio fill |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key for `auto-bio-fill.ts` |

## Creating the Cloudflare token

1. Cloudflare dashboard → **My Profile → API Tokens → Create Token**.
2. Use the **Edit Cloudflare Workers** template.
3. Scope it to the BornClock account and zone.
4. Copy the token into the `CF_API_TOKEN` secret above.

## Notes

- The nightly step only runs on `schedule` events and is a safe no-op when there
  are no missing bios or the `GEMINI_API_KEY` is absent.
- The scheduled run commits refreshed `celebrity-bios.json` / `celebrities.json`
  back to the repo so the next deploy ships the new content.
- To disable the nightly automation, delete the `schedule:` block from the workflow.
