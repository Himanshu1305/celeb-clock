import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { duplicateRedirect } from '@/lib/seo/duplicateRedirects';
import { INDIA_BORNON_SLUGS } from '@/lib/seo/indiaBornOnSlugs';

/**
 * Client-side twin of the Worker's 301s for retired duplicate URLs (Batch 6 SEO).
 * Uses the same mapping (src/lib/seo/duplicateRedirects.ts), so an in-app link to an
 * old URL lands on exactly the page Google is sent to.
 *
 * - When the current path maps to a kept URL → <Navigate replace> there (query and
 *   hash preserved).
 * - Otherwise render `fallback` (the real page for a kept route), or, for a retired
 *   route with an impossible date, go to `otherwise`.
 */
export function LegacyRedirect({ fallback, otherwise = '/born-on' }: { fallback?: ReactNode; otherwise?: string }) {
  const { pathname, search, hash } = useLocation();
  const target = duplicateRedirect(pathname, { indiaSlugs: INDIA_BORNON_SLUGS });
  if (target) return <Navigate to={`${target}${search}${hash}`} replace />;
  if (fallback !== undefined) return <>{fallback}</>;
  return <Navigate to={otherwise} replace />;
}

export default LegacyRedirect;
