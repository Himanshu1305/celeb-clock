/**
 * B14 — building blocks for the explanatory guides that sit BELOW each astrology tool
 * (never above it). Plain, server-renderable markup so the whole guide is in the
 * prerendered HTML. Colours come from the theme tokens only (text-foreground,
 * border-border, bg-primary/…) — no hard-coded hex.
 *
 * Schema: <GuideFAQ> emits the page's single FAQPage block (via PageFAQ); <GuideHowTo>
 * and <GuideWebApp> emit HowTo / WebApplication JSON-LD in the body (see JsonLd for why
 * not in <head>).
 */
import type { ReactNode } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PageFAQ } from '@/components/PageFAQ';
import { JsonLd } from '@/components/JsonLd';

const SITE = 'https://bornclock.com';

export function Guide({ id, lang, children }: { id: string; lang?: 'en' | 'hi'; children: ReactNode }) {
  return (
    <div data-testid={`guide-${id}`} className="guide" lang={lang === 'hi' ? 'hi' : undefined}>
      {children}
    </div>
  );
}

export function GuideSection({ id, eyebrow, title, children, white }: { id?: string; eyebrow?: string; title: ReactNode; children: ReactNode; white?: boolean }) {
  return (
    <section className={white ? 'section white' : 'section'} id={id}>
      <div className="max-w-3xl">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
        <div className="space-y-3 text-foreground leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

/** A definition list: term → plain-language meaning. */
export function TermList({ items }: { items: Array<[ReactNode, ReactNode]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([t, d], i) => (
        <div key={i} className="rounded-xl border border-border p-3">
          <dt className="font-semibold text-foreground">{t}</dt>
          <dd className="text-sm text-foreground mt-1">{d}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bulleted list with an optional bold lead per item. */
export function Bullets({ items }: { items: Array<ReactNode | [ReactNode, ReactNode]> }) {
  return (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((it, i) => (
        <li key={i}>{Array.isArray(it) ? <><strong>{it[0]}</strong> — {it[1]}</> : it}</li>
      ))}
    </ul>
  );
}

/** A worked sample from the engine (numbers come from src/data/guideSamples.json). */
export function SampleCard({ title, note, children, testId }: { title: ReactNode; note: ReactNode; children: ReactNode; testId?: string }) {
  return (
    <figure data-testid={testId} className="rounded-xl border border-border bg-primary/5 p-4 my-4" style={{ margin: '16px 0' }}>
      <figcaption className="font-semibold text-foreground mb-2">{title}</figcaption>
      {children}
      <p className="text-xs text-foreground mt-3">{note}</p>
    </figure>
  );
}

export function SampleTable({ head, rows, caption }: { head: ReactNode[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="table-scroll" style={{ overflowX: 'auto' }}>
      <table className="data-table w-full text-sm" style={{ width: '100%' }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead><tr>{head.map((h, i) => <th key={i} className="text-left p-1.5">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="p-1.5 border-t border-border">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export interface GuideLink { to: string; label: string; note?: string }

/** "Related tools" block — internal links, including the 2027 yearly hubs. */
export function RelatedLinks({ title, links }: { title: string; links: GuideLink[] }) {
  return (
    <section className="section" data-testid="guide-related">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {links.map(l => (
            <li key={l.to} className="rounded-xl border border-border p-3">
              <Link to={l.to} className="font-semibold text-foreground underline">{l.label}</Link>
              {l.note && <span className="block text-sm text-foreground mt-1">{l.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export interface FaqItem { question: string; answer: string }

/** The page's one FAQ section + FAQPage JSON-LD. */
export function GuideFAQ({ items, title }: { items: FaqItem[]; title?: string }) {
  return <PageFAQ variant="plain" items={items} title={title ?? 'Frequently asked questions'} />;
}

export function GuideHowTo({ name, description, steps, lang }: { name: string; description: string; steps: Array<{ name: string; text: string }>; lang?: string }) {
  return (
    <JsonLd id="howto" data={{
      '@context': 'https://schema.org', '@type': 'HowTo', name, description, ...(lang ? { inLanguage: lang } : {}),
      step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
    }} />
  );
}

export function GuideWebApp({ name, description, path, lang }: { name: string; description: string; path: string; lang?: string }) {
  return (
    <JsonLd id="webapp" data={{
      '@context': 'https://schema.org', '@type': 'WebApplication', name, description,
      url: `${SITE}${path.endsWith('/') ? path : `${path}/`}`,
      applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', ...(lang ? { inLanguage: lang } : {}),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      provider: { '@type': 'Organization', name: 'BornClock', url: SITE },
    }} />
  );
}

/** ISO yyyy-mm-dd → "26 Oct 2011" (fixed English month names; deterministic for prerender). */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
}
const MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
export function fmtDateHi(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MON_HI[m - 1]} ${y}`;
}
export const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'}`;
