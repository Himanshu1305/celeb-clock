import type { ReactNode } from 'react';
import { PajPage, type PajPageProps, type PajVariant } from './PajPage';
import { PageHeader } from './PageHeader';

/**
 * The seven central page layouts. Each owns the header block (breadcrumb from the
 * shell + eyebrow · H1 · lead · trust from PageHeader) over the central PajPage
 * shell, and maps to a `.paj` hero variant. A page passes its header-block props
 * and its remaining sections as children; `variant` can override the default where
 * a page's approved look used a different `.paj` hero.
 */
type ShellProps = Omit<PajPageProps, 'variant' | 'children'>;
type HeaderBlock = { eyebrow?: ReactNode; h1: ReactNode; lead?: ReactNode; trust?: string; headerWhite?: boolean };
export type LayoutProps = ShellProps & HeaderBlock & { variant?: PajVariant; children: ReactNode };

function makeLayout(defaultVariant: PajVariant) {
  return function Layout({ eyebrow, h1, lead, trust, headerWhite, variant, children, ...shell }: LayoutProps) {
    return (
      <PajPage variant={variant ?? defaultVariant} {...shell}>
        <PageHeader eyebrow={eyebrow} h1={h1} lead={lead} trust={trust} white={headerWhite} />
        {children}
      </PajPage>
    );
  };
}

/** 1. Tool — input → result (most calculators). */
export const ToolLayout = makeLayout('workbench');
/** 2. Report — long results (Kundli, matching, career report). */
export const ReportLayout = makeLayout('editorial');
/** 4. Collection — index/row lists (zodiac, chinese/vedic zodiac). */
export const CollectionLayout = makeLayout('atlas');
/** 5. Article — editorial reading pages (/answers/*, long-form). */
export const ArticleLayout = makeLayout('editorial');
/** 6. Money — pricing / upgrade / gift (visual only; logic untouched). */
export const MoneyLayout = makeLayout('editorial');
/** 7. Utility — legal, sign-in, account, 404. */
export const UtilityLayout = makeLayout('');

/**
 * 3. Hub — the category landing. Uses a bespoke editorial hero rather than the
 * standard section header, so it takes a `hero` slot instead of PageHeader props.
 */
export function HubLayout({ hero, children, ...shell }: ShellProps & { variant?: PajVariant; hero?: ReactNode; children: ReactNode }) {
  const { variant, ...rest } = shell as ShellProps & { variant?: PajVariant };
  return (
    <PajPage variant={variant ?? 'editorial'} {...rest}>
      {hero}
      {children}
    </PajPage>
  );
}
