/**
 * B18 — "Read this in: हिन्दी · தமிழ் · …": links from an English (or Hindi) Rashifal,
 * Rashifal 2027, Panchang or Kundali-matching page to the same page in the other
 * languages (only where that page exists — src/lib/lang/langs.js).
 */
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { ALL_LANGS, describePath, pathFor } from '@/lib/lang/langs.js';

export function OtherLanguages({ path, label = 'Read this in' }: { path?: string; label?: string }) {
  const loc = useLocation();
  const here = describePath(path ?? loc.pathname);
  if (!here) return null;
  const links = ALL_LANGS.filter(l => l.code !== here.lang)
    .map(l => ({ ...l, to: pathFor(here.desc, l.code) }))
    .filter((l): l is typeof l & { to: string } => !!l.to);
  if (!links.length) return null;
  return (
    <p data-testid="other-languages" className="text-sm text-brand-ink-soft !my-3">
      {label}:{' '}
      {links.map((l, i) => (
        <span key={l.code}>{i > 0 && ' · '}<Link to={`${l.to}/`} lang={l.code} hrefLang={l.code} className="underline">{l.native}</Link></span>
      ))}
    </p>
  );
}
