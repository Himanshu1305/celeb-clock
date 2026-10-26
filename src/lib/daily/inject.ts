/**
 * Server-side injection of a day's precomputed content into a prerendered page shell.
 * Pure string transform (no HTMLRewriter) so it runs identically in the Cloudflare
 * Worker and in vitest. Dependency-free apart from ./render.
 *
 * Markers the page component renders (see ./DailyParts.tsx):
 *   <span data-daily="h1">…</span>                  → entry.h1
 *   <span data-daily="date">…</span>  (any number)  → entry.dateLabel
 *   <div data-daily="body">…</div>                  → renderDailyBodyHtml(entry)
 *   <script type="application/ld+json" data-daily="jsonld">…</script> → dailyJsonLd(entry)
 * plus <title>, meta description and og/twitter title + description.
 * An embedded <script id="daily-data" type="application/json"> lets the browser render
 * the same entry on first paint without a second request.
 */
import type { DailyEntry } from './types';
import { canonicalFor, dailyJsonLd, escapeHtml, jsonForScript, renderDailyBodyHtml } from './render';

export interface DailyInjectInput {
  kind: string;
  slug: string;
  path: string;
  entry: DailyEntry;
}

export interface DailyInjectResult {
  html: string;
  /** Which markers were found and replaced (for tests / logging). */
  replaced: { title: boolean; description: boolean; h1: boolean; date: boolean; body: boolean; jsonld: boolean };
}

const attr = (s: string) => escapeHtml(s);

function replaceMetaContent(html: string, selector: RegExp, value: string): { html: string; hit: boolean } {
  let hit = false;
  const out = html.replace(selector, (tag) => {
    hit = true;
    return tag.replace(/\bcontent="[^"]*"/i, `content="${attr(value)}"`);
  });
  return { html: out, hit };
}

/** The script id the browser reads on first render. */
export const DAILY_DATA_SCRIPT_ID = 'daily-data';

export function injectDailyHtml(html: string, inp: DailyInjectInput): DailyInjectResult {
  const e = inp.entry;
  const replaced = { title: false, description: false, h1: false, date: false, body: false, jsonld: false };
  let out = html;

  // <title>
  out = out.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => { replaced.title = true; return `<title>${escapeHtml(e.title)}</title>`; });

  // meta description + social title/description (all copies — helmet may duplicate them).
  const d = replaceMetaContent(out, /<meta\b[^>]*\bname="description"[^>]*>/gi, e.description); out = d.html; replaced.description = d.hit;
  out = replaceMetaContent(out, /<meta\b[^>]*\bproperty="og:description"[^>]*>/gi, e.description).html;
  out = replaceMetaContent(out, /<meta\b[^>]*\bname="twitter:description"[^>]*>/gi, e.description).html;
  out = replaceMetaContent(out, /<meta\b[^>]*\bproperty="og:title"[^>]*>/gi, e.title).html;
  out = replaceMetaContent(out, /<meta\b[^>]*\bname="twitter:title"[^>]*>/gi, e.title).html;

  // H1 + visible date(s).
  out = out.replace(/(<span\b[^>]*\bdata-daily="h1"[^>]*>)[\s\S]*?(<\/span>)/i, (_m, a, b) => { replaced.h1 = true; return `${a}${escapeHtml(e.h1)}${b}`; });
  out = out.replace(/(<span\b[^>]*\bdata-daily="date"[^>]*>)[\s\S]*?(<\/span>)/gi, (_m, a, b) => { replaced.date = true; return `${a}${escapeHtml(e.dateLabel)}${b}`; });

  // Main content block. The renderer guarantees no <div> inside, so the first </div>
  // after the opening tag closes the block.
  out = out.replace(/(<div\b[^>]*\bdata-daily="body"[^>]*>)[\s\S]*?(<\/div>)/i, (_m, a: string, b) => {
    replaced.body = true;
    const open = a.replace(/\bdata-daily-date="[^"]*"/, `data-daily-date="${attr(e.date)}"`);
    return `${open}${renderDailyBodyHtml(e)}${b}`;
  });

  // A WebPage JSON-LD captured from react-helmet at build time carries the build day's
  // headline; drop it — the daily graph below is the page's one current WebPage.
  out = out.replace(/<script\b(?![^>]*\bdata-daily=)[^>]*type="application\/ld\+json"[^>]*>\s*\{"@context":"https:\/\/schema\.org","@type":"WebPage"[\s\S]*?<\/script>/gi, '');

  // JSON-LD (WebPage dateModified + FAQPage).
  const ld =jsonForScript(dailyJsonLd(e, canonicalFor(inp.path)));
  out = out.replace(/(<script\b[^>]*\bdata-daily="jsonld"[^>]*>)[\s\S]*?(<\/script>)/i, (_m, a, b) => { replaced.jsonld = true; return `${a}${ld}${b}`; });

  // Embedded data for the browser's first render (idempotent).
  out = out.replace(new RegExp(`<script\\b[^>]*\\bid="${DAILY_DATA_SCRIPT_ID}"[^>]*>[\\s\\S]*?<\\/script>`, 'gi'), '');
  const data = jsonForScript({ kind: inp.kind, slug: inp.slug, date: e.date, entry: e });
  const tag = `<script type="application/json" id="${DAILY_DATA_SCRIPT_ID}">${data}</script>`;
  out = out.includes('</head>') ? out.replace('</head>', () => `${tag}</head>`) : tag + out;

  return { html: out, replaced };
}
