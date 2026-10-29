/**
 * Batch 10 tool pages: a visible FAQ whose answers are always in the HTML (no collapsed
 * accordion), with ONE FAQPage JSON-LD carrying exactly the same text — emitted in-body so
 * the prerender snapshot captures it (same reason as PageFAQ). Plus a small "Sources" list.
 */
export interface ToolFaqItem { q: string; a: string }

export function ToolFaq({ items, title = 'Questions', testId = 'tool-faq' }: { items: ToolFaqItem[]; title?: string; testId?: string }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section className="mb-8" data-testid={testId}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div key={i} className="rounded-lg border border-border p-4 bg-card/40">
            <h3 className="font-semibold text-foreground text-sm mb-1">{f.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolSources({ items, testId = 'tool-sources' }: { items: Array<{ label: string; href?: string; note?: string }>; testId?: string }) {
  return (
    <section className="mb-8 text-xs text-muted-foreground" data-testid={testId}>
      <h2 className="text-sm font-semibold text-foreground mb-2">Method &amp; sources</h2>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((s, i) => (
          <li key={i}>
            {s.href ? <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline break-words">{s.label}</a> : s.label}
            {s.note ? <> — {s.note}</> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
