/**
 * ONE renderer for the daily content block, used by BOTH the Cloudflare Worker
 * (string injection into the prerendered shell) and the browser (React
 * dangerouslySetInnerHTML) — so server HTML and client DOM are always identical.
 *
 * Contract relied on by ./inject.ts: the body HTML never contains a `<div` tag (it
 * is injected inside `<div data-daily="body">`, and the injector finds that div's
 * end as the first `</div>` after it). Use section/h2/p/ul/li/details only.
 * Dependency-free (Worker-safe).
 */
import type { DailyEntry, DailyTone } from './types';

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LABELS = {
  en: { answer: 'Today in brief', why: 'Why today', faq: 'Questions about today', good: 'Supportive', mixed: 'Mixed', care: 'Go gently' },
  hi: { answer: 'आज संक्षेप में', why: 'आज ऐसा क्यों', faq: 'आज से जुड़े प्रश्न', good: 'अनुकूल', mixed: 'मिश्रित', care: 'सावधानी से' },
} as const;

const TONE_CLASS: Record<DailyTone, string> = {
  good: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  mixed: 'text-amber-800 bg-amber-50 border-amber-200',
  care: 'text-sky-800 bg-sky-50 border-sky-200',
};

/** The daily content block's inner HTML (no wrapping div). */
export function renderDailyBodyHtml(e: DailyEntry): string {
  const L = { ...(LABELS[e.lang] ?? LABELS.en), ...(e.labels ?? {}) };
  const out: string[] = [];

  out.push(
    `<section class="daily-answer rounded-2xl border border-border p-5 mb-6 bg-gradient-to-br from-card to-muted/20" data-daily-part="answer">` +
      `<h2 class="text-lg font-semibold text-foreground mb-2">${escapeHtml(L.answer)}</h2>` +
      `<p class="text-foreground leading-relaxed">${escapeHtml(e.answer)}</p>` +
    `</section>`,
  );

  if (e.why.length) {
    out.push(
      `<section class="daily-why rounded-xl border border-border p-4 mb-6" data-daily-part="why">` +
        `<h2 class="font-semibold text-foreground mb-2">${escapeHtml(L.why)}</h2>` +
        `<ul class="space-y-2 text-sm">` +
        e.why.map(w => `<li><strong class="text-foreground">${escapeHtml(w.label)}</strong><span class="text-muted-foreground"> — ${escapeHtml(w.text)}</span></li>`).join('') +
        `</ul>` +
      `</section>`,
    );
  }

  for (const s of e.sections) {
    const tone = s.tone
      ? ` <span class="inline-block align-middle ml-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${TONE_CLASS[s.tone]}">${escapeHtml(L[s.tone])}</span>`
      : '';
    let inner = `<h2 class="font-semibold text-foreground mb-1">${escapeHtml(s.heading)}${tone}</h2>`;
    if (s.text) inner += `<p class="text-sm text-muted-foreground leading-relaxed">${escapeHtml(s.text)}</p>`;
    if (s.items && s.items.length) {
      inner += `<ul class="mt-2 space-y-1 text-sm">` +
        s.items.map(it =>
          `<li><span class="text-muted-foreground">${escapeHtml(it.label)}:</span> <strong class="text-foreground">${escapeHtml(it.value)}</strong>` +
          (it.note ? `<br><span class="text-xs text-muted-foreground">${escapeHtml(it.note)}</span>` : '') +
          `</li>`).join('') +
        `</ul>`;
    }
    if (s.links && s.links.length) {
      inner += `<ul class="mt-2 flex flex-wrap gap-2 text-sm">` +
        s.links.map(l => `<li><a href="${escapeHtml(l.href)}" class="inline-block px-3 py-1.5 rounded-lg border border-border text-primary hover:bg-primary/5">${escapeHtml(l.label)} →</a></li>`).join('') +
        `</ul>`;
    }
    out.push(`<section id="daily-${escapeHtml(s.id)}" class="daily-section rounded-xl border border-border p-4 mb-4" data-daily-part="${escapeHtml(s.id)}">${inner}</section>`);
  }

  if (e.faq.length) {
    out.push(
      `<section class="daily-faq mt-8 mb-6" data-daily-part="faq">` +
        `<h2 class="text-xl font-semibold text-foreground mb-3">${escapeHtml(L.faq)}</h2>` +
        e.faq.map(f =>
          `<details class="rounded-lg border border-border p-3 mb-2"><summary class="font-medium text-foreground cursor-pointer">${escapeHtml(f.q)}</summary>` +
          `<p class="text-sm text-muted-foreground mt-2 leading-relaxed">${escapeHtml(f.a)}</p></details>`).join('') +
      `</section>`,
    );
  }
  return out.join('');
}

/** Placeholder shown (client only) while the day's JSON loads. Contains no div. */
export const DAILY_LOADING_HTML = '<p class="text-muted-foreground py-6" data-daily-part="loading">…</p>';

/** JSON-LD graph for a daily page: WebPage (with dateModified) + FAQPage. */
export function dailyJsonLd(e: DailyEntry, canonicalUrl: string): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: e.title,
      description: e.description,
      url: canonicalUrl,
      inLanguage: e.lang === 'hi' ? 'hi-IN' : 'en-IN',
      datePublished: e.date,
      dateModified: e.date,
      isPartOf: { '@type': 'WebSite', name: 'BornClock', url: 'https://bornclock.com/' },
    },
  ];
  if (e.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: e.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON safe to place inside a <script> element (no `</script>` break-out). */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Canonical absolute URL (trailing slash, as the sitemap and prerender use). */
export function canonicalFor(path: string): string {
  return `https://bornclock.com${path.replace(/\/+$/, '')}/`;
}
