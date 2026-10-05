import { Link } from 'react-router-dom';

export type FooterLink = { label: string; to: string };

const DEFAULT_NAV: FooterLink[] = [
  { label: 'Vedic Astrology', to: '/vedic-astrology' },
  { label: 'Birthday & Celebrity', to: '/celebrity-birthday' },
  { label: 'Mystic Corner', to: '/mystic-corner' },
  { label: 'Science & Longevity', to: '/life-expectancy' },
  { label: 'Methodology', to: '/how-it-works' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Contact', to: '/contact' },
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
      <div className="footer-bottom"><span>{note}</span></div>
    </footer>
  );
}
