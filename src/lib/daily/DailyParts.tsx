/**
 * React pieces of a daily page. They render the SAME markup the Worker injects
 * (./render.ts), inside the marker elements ./inject.ts looks for.
 */
import type { DailyEntry } from './types';
import { canonicalFor, dailyJsonLd, DAILY_LOADING_HTML, jsonForScript, renderDailyBodyHtml } from './render';

/** H1 text marker — pass `fallback` (e.g. "Mesh Rashifal Today") for the loading state. */
export function DailyH1({ entry, fallback }: { entry: DailyEntry | null; fallback: string }) {
  return <span data-daily="h1">{entry ? entry.h1 : fallback}</span>;
}

/** Visible date marker. */
export function DailyDate({ entry, fallback = '' }: { entry: DailyEntry | null; fallback?: string }) {
  return <span data-daily="date">{entry ? entry.dateLabel : fallback}</span>;
}

/** The main daily content block (answer, why today, sections, FAQ). */
export function DailyBody({ entry, testId }: { entry: DailyEntry | null; testId?: string }) {
  return (
    <div
      data-daily="body"
      data-testid={testId}
      data-daily-date={entry?.date ?? ''}
      dangerouslySetInnerHTML={{ __html: entry ? renderDailyBodyHtml(entry) : DAILY_LOADING_HTML }}
    />
  );
}

/** WebPage (dateModified) + FAQPage JSON-LD, in-body so the prerender snapshot keeps it. */
export function DailyJsonLd({ entry, path }: { entry: DailyEntry | null; path: string }) {
  const html = entry ? jsonForScript(dailyJsonLd(entry, canonicalFor(path))) : '{}';
  return <script type="application/ld+json" data-daily="jsonld" dangerouslySetInnerHTML={{ __html: html }} />;
}
