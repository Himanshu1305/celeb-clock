import { Link } from '@/components/seo/CanonicalLink';
import { LANGS } from '@/lib/lang/langs.js';
import { POPULAR_TOOLS } from './popularTools';

export type FooterLink = { label: string; to: string };

const DEFAULT_NAV: FooterLink[] = [
  { label: 'Vedic Astrology', to: '/vedic-astrology/' },
  { label: 'Rashifal 2027', to: '/rashifal-2027/' },
  { label: 'Festivals 2027', to: '/hindu-calendar-2027/' },
  { label: 'Birthday & Celebrity', to: '/celebrity-birthday/' },
  { label: 'Mystic Corner', to: '/mystic-corner/' },
  { label: 'Science & Longevity', to: '/life-expectancy/' },
  { label: 'Methodology', to: '/how-it-works/' },
  { label: 'Accuracy', to: '/accuracy/' },
  { label: 'Privacy', to: '/privacy/' },
  { label: 'Contact', to: '/contact/' },
];

/**
 * Central navy site footer (`.paj .site-footer`). Defaults to the standard
 * cross-category nav; pages may pass their own `nav`, `tagline` and `note`.
 */
export function SiteFooter({
  tagline = 'One birth date. Different kinds of discovery. Facts, traditions and research — with the difference made clear.',
  nav = DEFAULT_NAV,
  note = '© 2026 BornClock',
}: {
  tagline?: string;
  nav?: FooterLink[];
  note?: string;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
          <p className="subtle">{tagline}</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          {nav.map((l) => <Link key={l.to + l.label} to={l.to}>{l.label}</Link>)}
        </nav>
      </div>
      <nav className="footer-nav" aria-label="Popular free tools" data-testid="footer-popular" style={{ display: 'flex', padding: '0 0 12px', flexWrap: 'wrap', gap: '4px 14px' }}>
        <span>Free tools:</span>
        {POPULAR_TOOLS.map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
      </nav>
      {/* B18: "Read in" — the language landing pages (src/lib/lang/langs.js). */}
      <nav className="footer-nav" aria-label="Read in" data-testid="footer-read-in" style={{ display: 'flex', padding: '0 0 12px', flexWrap: 'wrap' }}>
        <span>Read in:</span>
        <Link to="/" lang="en">English</Link>
        <Link to="/hi/rashifal/" lang="hi">हिन्दी</Link>
        {LANGS.map(l => <Link key={l.code} to={`/${l.code}/`} lang={l.code}>{l.native}</Link>)}
      </nav>
      <div className="footer-bottom"><span>{note}</span></div>
    </footer>
  );
}
