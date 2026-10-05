import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { SiteHeader } from './SiteHeader';
import { SiteFooter, type FooterLink } from './SiteFooter';
import { Breadcrumb, type Crumb } from './Breadcrumb';
import type { Theme } from './themes';
import '@/styles/part-aj.css';
import '@/styles/central/themes.css';

export type PajVariant = 'editorial' | 'workbench' | 'atlas' | 'field-guide' | '';

/** Fraunces + Public Sans preload — one place instead of repeated per page. */
export function FontLinks() {
  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Helmet>
  );
}

export interface PajPageProps {
  /** central theme — sets BOTH data-theme (canonical) and data-category (back-compat). */
  theme: Theme;
  /** `.paj` hero variant class. */
  variant?: PajVariant;
  testId?: string;
  /** the page's <SEO> element (title/meta/canonical) — rendered first, unchanged. */
  seo?: ReactNode;
  /** any extra <Helmet> head content (structured data goes via JsonLd in children). */
  head?: ReactNode;
  /** include the font preload (default true). */
  fonts?: boolean;
  breadcrumb: { trail?: Crumb[]; current: string; edition?: string };
  footer?: { tagline?: string; nav?: FooterLink[]; note?: string };
  children: ReactNode;
}

/**
 * The central page shell. One place owns the themed `.paj` root, the site header,
 * the breadcrumb, the <main> landmark and the site footer — so every page that
 * renders through it stays consistent and follows a single change at the centre.
 */
export function PajPage({
  theme,
  variant = '',
  testId,
  seo,
  head,
  fonts = true,
  breadcrumb,
  footer,
  children,
}: PajPageProps) {
  return (
    <div
      className={variant ? `paj ${variant}` : 'paj'}
      data-theme={theme}
      data-category={theme}
      data-testid={testId}
    >
      {seo}
      {head}
      {fonts && <FontLinks />}
      <SiteHeader />
      <Breadcrumb {...breadcrumb} />
      <main id="main">{children}</main>
      <SiteFooter {...footer} />
    </div>
  );
}
