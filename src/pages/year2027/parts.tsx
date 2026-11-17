/**
 * B14 — small shared blocks for the 2027 pages (brand-token colours only).
 */
import type { ReactNode } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { JsonLd } from '@/components/JsonLd';
import type { Tone } from '@/lib/vedic/rashifal';
import { Y2027_PUBLISHED, Y2027_UPDATED } from '@/lib/year2027/meta.js';

const SITE = 'https://bornclock.com';
const abs = (p: string) => (p === '/' ? `${SITE}/` : `${SITE}${p.replace(/\/+$/, '')}/`);

/**
 * Article + BreadcrumbList + FAQPage (+ optional extra blocks such as Event) rendered in the
 * BODY (see src/components/JsonLd.tsx — Helmet-injected JSON-LD does not reliably survive the
 * prerender capture). Pages using this pass articleSchema={false} to <SEO>.
 */
export function YearJsonLd({ headline, description, path, crumbs, faq, lang, extra = [] }: {
  headline: string; description: string; path: string; lang: 'en' | 'hi';
  crumbs: Array<{ name: string; path: string }>;
  faq?: Array<{ question: string; answer: string }>;
  extra?: unknown[];
}) {
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', headline: headline.replace(/ \| BornClock$/, ''), description,
    inLanguage: lang === 'hi' ? 'hi-IN' : 'en-IN', url: abs(path), mainEntityOfPage: { '@type': 'WebPage', '@id': abs(path) },
    datePublished: Y2027_PUBLISHED, dateModified: Y2027_UPDATED, image: `${SITE}/og/vedic.png`,
    author: { '@type': 'Organization', name: 'BornClock', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'BornClock', logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
  };
  const bc = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
  const fq = faq?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  } : null;
  return (
    <>
      <JsonLd data={article} id="year2027-article" />
      <JsonLd data={bc} id="year2027-breadcrumb" />
      {fq && <JsonLd data={fq} id="year2027-faq" />}
      {extra.map((x, i) => <JsonLd key={i} data={x} id={`year2027-extra-${i}`} />)}
    </>
  );
}

export const TONE_STYLE: Record<Tone, string> = {
  favourable: 'bg-brand-green/10 text-brand-green-ink border-brand-green/40',
  mixed: 'bg-brand-gold/15 text-brand-gold-text border-brand-gold/50',
  challenging: 'bg-brand-coral/10 text-brand-coral-ink border-brand-coral/40',
};

export function ToneBadge({ tone, label }: { tone: Tone; label: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${TONE_STYLE[tone]}`}>{label}</span>;
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return <h2 id={id} className="mt-10 mb-3 scroll-mt-24">{children}</h2>;
}

export function Card({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) {
  return <div data-testid={testId} className={`rounded-xl border border-brand-line bg-brand-paper p-4 ${className}`}>{children}</div>;
}

export function FaqList({ items, testId }: { items: Array<{ question: string; answer: string }>; testId?: string }) {
  return (
    <div className="space-y-3" data-testid={testId}>
      {items.map(f => (
        <details key={f.question} className="rounded-xl border border-brand-line bg-brand-paper p-4" open>
          <summary className="font-semibold text-brand-ink cursor-pointer">{f.question}</summary>
          <p className="text-sm text-brand-ink-soft mt-2 leading-relaxed">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function LinkChips({ items, testId }: { items: Array<{ label: string; to: string; lang?: string }>; testId?: string }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {items.map(i => (
        <Link key={i.to} to={i.to} lang={i.lang} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">
          {i.label}
        </Link>
      ))}
    </div>
  );
}

/** A simple two-column table (label → value) that wraps on phones. */
export function KV({ rows, testId }: { rows: Array<{ label: string; value: ReactNode }>; testId?: string }) {
  return (
    <dl className="grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-2 text-sm" data-testid={testId}>
      {rows.map(r => (
        <div key={r.label} className="contents">
          <dt className="font-semibold text-brand-ink">{r.label}</dt>
          <dd className="text-brand-ink-soft">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
