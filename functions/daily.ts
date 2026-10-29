// Worker helper for daily-changing pages (see src/lib/daily/index.ts).
// Given a prerendered HTML shell for a registered daily route, fetch today's precomputed
// entry (India date) from the static assets and inject it. No engine runs here.
import { matchDailyRoute, dailyJsonPath, dailyFilePath, dailyFileKey, dailyPageDate } from '../src/lib/daily/registry.js';
import { entryFromMonthFile } from '../src/lib/daily/templates.js';
import { injectDailyHtml } from '../src/lib/daily/inject.js';
import { monthKey, msUntilNextIstMidnight } from '../src/lib/daily/dates.js';
import type { DailyMonthFile } from '../src/lib/daily/types.js';

type Assets = { fetch: (request: Request) => Promise<Response> };

// Per-isolate memo of month files. A deploy starts fresh isolates, so it never outlives
// the assets it was read from. Entries expire at the next India midnight anyway.
const memo = new Map<string, { file: DailyMonthFile | null; until: number }>();

async function loadMonth(assets: Assets, origin: string, path: string, now: Date): Promise<DailyMonthFile | null> {
  const hit = memo.get(path);
  if (hit && hit.until > now.getTime()) return hit.file;
  let file: DailyMonthFile | null = null;
  try {
    const res = await assets.fetch(new Request(new URL(path, origin).toString()));
    const ct = res.headers.get('content-type') || '';
    if (res.ok && !ct.includes('text/html')) file = (await res.json()) as DailyMonthFile;
  } catch { file = null; }
  if (memo.size > 500) memo.clear();
  memo.set(path, { file, until: now.getTime() + msUntilNextIstMidnight(now) });
  return file;
}

export interface DailyInjection {
  html: string;
  date: string;
  kind: string;
  slug: string;
  /** Seconds until the content changes (next India midnight). */
  maxAge: number;
}

/** Returns the injected HTML, or null when the path is not a daily page or today's entry is missing. */
export async function applyDailyContent(pathname: string, html: string, assets: Assets, origin: string, now: Date = new Date()): Promise<DailyInjection | null> {
  const m = matchDailyRoute(pathname);
  if (!m) return null;
  // The page's date: today (India), or tomorrow for the Batch 10 "tomorrow" views.
  const date = dailyPageDate(m.def, now);
  const month = monthKey(date);
  // Compact data file (data + render kinds), else the page's own finished-entries file.
  // (Period kinds — weekly / monthly / yearly — read the file of the period containing today.)
  let file = await loadMonth(assets, origin, dailyFilePath(m.def, m.slug, dailyFileKey(m.def, date)), now);
  if (!file && m.def.data) file = await loadMonth(assets, origin, dailyJsonPath(m.def.kind, m.slug, month), now);
  const entry = entryFromMonthFile(m.def, m.slug, date, file);
  if (!entry) {
    // Deploy older than the precomputed window: serve the shell; the browser computes it.
    console.warn(`[daily] missing ${m.def.kind}/${m.slug} for ${date}`);
    return null;
  }
  const { html: out } = injectDailyHtml(html, { kind: m.def.kind, slug: m.slug, path: m.def.path(m.slug), entry });
  return { html: out, date, kind: m.def.kind, slug: m.slug, maxAge: Math.max(60, Math.floor(msUntilNextIstMidnight(now) / 1000)) };
}
