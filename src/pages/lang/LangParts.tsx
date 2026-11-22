/**
 * B18 — shared shell of the regional-language pages (Tamil … Punjabi): SEO with the
 * hreflang cluster and breadcrumbs, the page header, the "written in <language>" note,
 * intro blocks, the cross-links between the language's tools and the FAQ.
 */
import type { ReactNode } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { VOCAB } from '@/lib/lang/registry.js';
import { langDef, langPaths, hreflangCluster, pathFor, describePath } from '@/lib/lang/langs.js';
import { COPY } from '@/lib/lang/copy';
import type { FaqQA, IntroBlock, LangCode } from '@/lib/lang/types';

export function useLang(code: LangCode) {
  const def = langDef(code)!;
  return { def, v: VOCAB[code], cp: COPY[code], p: langPaths(def) };
}

export function LangNote({ code }: { code: LangCode }) {
  const v = VOCAB[code];
  return (
    <p data-testid="lang-note" className="text-xs text-brand-muted !mb-4">
      {v.ui.note} <Link to="/contact/" className="underline">{v.ui.tellUs}</Link>
    </p>
  );
}

export function Intro({ blocks, testId = 'lang-intro' }: { blocks: readonly IntroBlock[]; testId?: string }) {
  return (
    <div data-testid={testId} className="space-y-6 !mt-8">
      {blocks.map(b => (
        <div key={b.heading}>
          <h2 className="font-semibold text-brand-ink text-xl !mb-2">{b.heading}</h2>
          <div className="space-y-3 text-brand-ink leading-relaxed">{b.paras.map(x => <p key={x.slice(0, 32)}>{x}</p>)}</div>
        </div>
      ))}
    </div>
  );
}

/** Chips to the language's four tools + the English equivalent of this page. */
export function ToolLinks({ code, path }: { code: LangCode; path: string }) {
  const { v, p } = useLang(code);
  const here = describePath(path);
  const en = here ? pathFor(here.desc, 'en') : null;
  const links = [
    { to: p.rashifalHub, label: v.ui.rashifal },
    { to: p.yearHub, label: v.ui.rashifal2027 },
    { to: p.panchang(null), label: v.ui.panchang },
    { to: p.kundali, label: v.ui.kundali },
  ];
  return (
    <nav data-testid="lang-tools" aria-label={v.ui.landing} className="flex flex-wrap gap-2 !mt-6">
      <Link to={`${p.landing}/`} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{v.ui.landing}</Link>
      {links.map(l => (
        <Link key={l.to} to={`${l.to}/`} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{l.label}</Link>
      ))}
      {en && <Link to={`${en}/`} lang="en" className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{v.ui.englishVersion}</Link>}
    </nav>
  );
}

export function LangFaq({ code, items }: { code: LangCode; items: readonly FaqQA[] }) {
  return <PageFAQ variant="plain" title={COPY[code].faqTitle} items={items.map(x => ({ question: x.q, answer: x.a }))} />;
}

export interface LangShellProps {
  code: LangCode;
  path: string;
  title: string;
  description: string;
  crumbs: Array<{ label: string; to?: string }>;
  testId: string;
  children: ReactNode;
  ogType?: 'website' | 'article';
}

/** PajPage + SEO (canonical, hreflang cluster, BreadcrumbList) + language footer. */
export function LangShell({ code, path, title, description, crumbs, testId, children, ogType = 'website' }: LangShellProps) {
  const { def, v, p } = useLang(code);
  const trail = [{ label: v.ui.landing, to: `${p.landing}/` }, ...crumbs.slice(0, -1).map(c => ({ label: c.label, to: c.to ?? `${p.landing}/` }))];
  const current = crumbs.length ? crumbs[crumbs.length - 1].label : v.ui.landing;
  const crumbItems = [{ name: v.ui.landing, path: p.landing }, ...crumbs.filter(c => c.to).map(c => ({ name: c.label, path: c.to!.replace(/\/$/, '') }))];
  if (path !== p.landing && !crumbItems.some(c => c.path === path)) crumbItems.push({ name: current, path });
  const hreflang = hreflangCluster(path);
  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId={testId}
      seo={<SEO title={title} description={description} canonicalUrl={path} ogType={ogType} ogImage="https://bornclock.com/og/vedic.png"
        hreflang={hreflang.length > 1 ? hreflang : undefined} breadcrumbItems={path === p.landing ? undefined : crumbItems} />}
      breadcrumb={{ trail: path === p.landing ? [] : trail, current, edition: def.native }}
      footer={{
        tagline: v.meta.landing.h1,
        nav: [
          { label: v.ui.rashifal, to: `${p.rashifalHub}/` },
          { label: v.ui.rashifal2027, to: `${p.yearHub}/` },
          { label: v.ui.panchang, to: `${p.panchang(null)}/` },
          { label: v.ui.kundali, to: `${p.kundali}/` },
          { label: v.ui.freeKundli, to: '/kundali/' },
          { label: 'English', to: '/' },
        ],
      }}
    >
      {children}
    </PajPage>
  );
}

export function LangHeader({ code, eyebrow, h1, lead }: { code: LangCode; eyebrow: string; h1: ReactNode; lead?: ReactNode }) {
  return (
    <>
      <div className="section-head">
        <div><span className="eyebrow">{eyebrow}</span><h1 data-testid="lang-h1">{h1}</h1></div>
        {lead && <p>{lead}</p>}
      </div>
      <LangNote code={code} />
    </>
  );
}
