/**
 * Batch 11 (GSC) — the site's <Link>: react-router's Link with the destination put in
 * its canonical trailing-slash form (src/lib/seo/canonicalPath.js), so the HTML never
 * links to a URL that 301s (/privacy → /privacy/). Import it instead of react-router's:
 *
 *   import { Link } from '@/components/seo/CanonicalLink';
 *
 * Same props and ref as react-router-dom's Link. String and object (`{ pathname, … }`)
 * destinations are both handled; relative paths, '#hash', '?query', files and /api/
 * pass through unchanged. A test (src/lib/seo/__tests__/canonicalLinks.test.ts) fails
 * if a page imports Link straight from react-router-dom again.
 */
import { forwardRef } from 'react';
// eslint-disable-next-line no-restricted-imports -- this wrapper is the one allowed import
import { Link as RouterLink, type LinkProps, type To } from 'react-router-dom';
import { canonicalPath } from '@/lib/seo/canonicalPath';

export function canonicalTo(to: To): To {
  if (typeof to === 'string') return canonicalPath(to);
  if (to && typeof to.pathname === 'string') {
    const pathname = canonicalPath(to.pathname);
    return pathname === to.pathname ? to : { ...to, pathname };
  }
  return to;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function CanonicalLink({ to, ...rest }, ref) {
  return <RouterLink ref={ref} to={canonicalTo(to)} {...rest} />;
});

export type { LinkProps };
export default Link;
