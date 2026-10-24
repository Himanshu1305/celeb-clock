/**
 * Weekly astrology drift check (.github/workflows/weekly-drift.yml).
 *
 * Runs the golden births and the 7 AstroSage couples through
 *   (a) "main"  — the API handlers in this checkout (the code on main), and
 *   (b) "live"  — the LIVE production API at bornclock.com (/api/kundali, /api/sade-sati,
 *                 /api/kundali-match), exactly as the site's own pages call them,
 * and compares every answer with the stored reference (goldenCharts.json). AstroSage / Drik are
 * NEVER fetched live (fragile + their terms); the stored golden values are the reference.
 *
 * Usage:
 *   npx tsx scripts/golden/driftCheck.ts [--source=main|live|both] [--base=https://bornclock.com]
 *                                        [--out=drift-report.md] [--json=drift-report.json]
 * Exit code: 0 = no drift, 1 = drift or an endpoint could not be checked.
 *
 * `runDrift()` takes an injectable fetch so it can be tested offline (scripts/__tests__/driftCheck.test.ts).
 */
import { writeFileSync } from 'node:fs';
import {
  GOLDEN, compareKundali, compareSadeSati, compareMatch, birthQuery, matchQuery, splitKnown, diffTable, KNOWN_ISSUES,
  type Diff,
} from './compareGolden';

export type Source = 'main' | 'live';
export type SourcedDiff = Diff & { source: Source };
export interface DriftResult {
  checkedAt: string;
  drift: SourcedDiff[];
  known: SourcedDiff[];
  /** Endpoints that could not be checked (HTTP error / network / bad JSON). */
  unreachable: Array<{ source: Source; url: string; error: string }>;
  checks: number;
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const UA = 'BornClock-drift-check/1.0 (+https://github.com; weekly accuracy check)';

/** A fetch that calls this checkout's API handlers directly (no network). */
export async function localFetch(url: string): Promise<Response> {
  const u = new URL(url);
  const handlers: Record<string, () => Promise<{ GET: (r: Request, env?: unknown) => Promise<Response> }>> = {
    '/api/kundali': () => import('../../api/kundali'),
    '/api/sade-sati': () => import('../../api/sade-sati'),
    '/api/kundali-match': () => import('../../api/kundali-match'),
  };
  const load = handlers[u.pathname];
  if (!load) return new Response(JSON.stringify({ error: 'unknown path' }), { status: 404 });
  return (await load()).GET(new Request(url));
}

export async function runDrift(opts: {
  sources: Source[];
  base?: string;
  fetchImpl?: FetchLike;
  now?: () => Date;
  delayMs?: number;
}): Promise<DriftResult> {
  const base = (opts.base || 'https://bornclock.com').replace(/\/$/, '');
  const liveFetch: FetchLike = opts.fetchImpl || ((u, i) => fetch(u, i));
  const now = opts.now || (() => new Date());
  const all: SourcedDiff[] = [];
  const unreachable: DriftResult['unreachable'] = [];
  let checks = 0;
  const stamp = now().toISOString().slice(0, 10);

  const get = async (source: Source, path: string, q: Record<string, string>) => {
    // `_drift` busts any edge cache for this run; the API ignores unknown parameters.
    const url = source === 'live'
      ? `${base}${path}?${new URLSearchParams({ ...q, _drift: stamp })}`
      : `http://localhost${path}?${new URLSearchParams(q)}`;
    const at = now();
    try {
      const res = source === 'live'
        ? await liveFetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
        : await localFetch(url);
      const text = await res.text();
      if (!res.ok) { unreachable.push({ source, url, error: `HTTP ${res.status}: ${text.slice(0, 160)}` }); return null; }
      try { return { body: JSON.parse(text), at }; } catch { unreachable.push({ source, url, error: `not JSON: ${text.slice(0, 160)}` }); return null; }
    } catch (e) {
      unreachable.push({ source, url, error: String((e as Error)?.message || e) });
      return null;
    } finally {
      if (source === 'live' && opts.delayMs) await new Promise(r => setTimeout(r, opts.delayMs));
    }
  };

  for (const source of opts.sources) {
    for (const g of GOLDEN.charts) {
      const k = await get(source, '/api/kundali', birthQuery(g));
      if (k) { checks++; all.push(...compareKundali(g, k.body, k.at).map(d => ({ ...d, source }))); }
      const s = await get(source, '/api/sade-sati', birthQuery(g));
      if (s) { checks++; all.push(...compareSadeSati(g, s.body, s.at).map(d => ({ ...d, source }))); }
    }
    for (const c of GOLDEN.couples) {
      const m = await get(source, '/api/kundali-match', matchQuery(c));
      if (m) { checks++; all.push(...compareMatch(c, m.body).map(d => ({ ...d, source }))); }
    }
  }
  const { drift, known } = splitKnown(all);
  return { checkedAt: now().toISOString(), drift, known, unreachable, checks };
}

/** Markdown body for the GitHub issue / job summary. */
export function renderReport(r: DriftResult, extra: { runUrl?: string; vitestFailed?: boolean } = {}): string {
  const lines: string[] = [];
  const ok = r.drift.length === 0 && r.unreachable.length === 0 && !extra.vitestFailed;
  lines.push(ok ? '## No astrology drift' : '## Astrology drift detected');
  lines.push('');
  lines.push(`Checked ${r.checks} responses at ${r.checkedAt} against the stored golden reference ` +
    '(`src/lib/vedic/__tests__/golden/goldenCharts.json` — Swiss Ephemeris + AstroSage values recorded 17 Oct 2026).');
  lines.push('"main" = the code on the main branch; "live" = the production API at bornclock.com.');
  if (extra.runUrl) lines.push(`Run: ${extra.runUrl}`);
  lines.push('');
  if (extra.vitestFailed) {
    lines.push('### Test suite on main failed');
    lines.push('`npx vitest run` (golden charts + Panchang/festival reference suites) failed on main — see the run log.');
    lines.push('');
  }
  if (r.drift.length) {
    lines.push(`### Differences (${r.drift.length})`);
    lines.push('');
    // GitHub issue bodies are capped at 65,536 characters — keep the table well inside that.
    const MAX_ROWS = 250;
    lines.push(diffTable(r.drift.slice(0, MAX_ROWS)));
    if (r.drift.length > MAX_ROWS) lines.push(`\n… and ${r.drift.length - MAX_ROWS} more rows (full list in the run's drift-report artifact).`);
    lines.push('');
  }
  if (r.unreachable.length) {
    lines.push(`### Could not check (${r.unreachable.length})`);
    lines.push('');
    for (const u of r.unreachable.slice(0, 30)) lines.push(`- **${u.source}** \`${u.url.replace(/\?.*/, '')}\`: ${u.error}`);
    if (r.unreachable.length > 30) lines.push(`- … and ${r.unreachable.length - 30} more`);
    lines.push('');
  }
  if (r.known.length) {
    lines.push(`### Known open issues (not counted as drift)`);
    lines.push('');
    for (const k of KNOWN_ISSUES) {
      const hits = r.known.filter(d => d.id === k.id && d.field === k.field);
      if (hits.length) lines.push(`- ${k.id} \`${k.field}\` (${hits.map(h => h.source).join(', ')}): ${hits[0].message}. ${k.note}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function arg(name: string): string | undefined {
  const a = process.argv.find(x => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

async function main() {
  const src = arg('source') || 'both';
  const sources: Source[] = src === 'both' ? ['main', 'live'] : [src as Source];
  const r = await runDrift({ sources, base: arg('base'), delayMs: 250 });
  const md = renderReport(r, { runUrl: process.env.RUN_URL, vitestFailed: process.env.VITEST_FAILED === '1' });
  console.log(md);
  const out = arg('out'); if (out) writeFileSync(out, md);
  const js = arg('json'); if (js) writeFileSync(js, JSON.stringify(r, null, 1));
  process.exit(r.drift.length || r.unreachable.length ? 1 : 0);
}

const isMain = process.argv[1] && /driftCheck\.(ts|js|mts)$/.test(process.argv[1]);
if (isMain) main().catch(e => { console.error(e); process.exit(2); });
