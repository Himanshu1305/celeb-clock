import { Link } from 'react-router-dom';

export type Crumb = { label: string; to?: string };

/**
 * Central breadcrumb row (`.paj .breadcrumb`). `trail` are the parent crumbs,
 * `current` is the active page name, `edition` is the optional right-side tag
 * (e.g. "Sidereal · Lahiri · Swiss Ephemeris").
 */
export function Breadcrumb({ trail = [], current, edition }: { trail?: Crumb[]; current: string; edition?: string }) {
  return (
    <div className="breadcrumb">
      <div>
        <span className="crumb-parent">
          <Link to="/" className="textlink" data-testid="breadcrumb-item">BornClock</Link>
          {'  /  '}
          {trail.map((c) => (
            <span key={c.label} data-testid="breadcrumb-item">
              {c.to ? <Link to={c.to} className="textlink">{c.label}</Link> : c.label}
              {'  /  '}
            </span>
          ))}
        </span>
        <span className="crumb-name" data-testid="breadcrumb-item">{current}</span>
      </div>
      {edition && (
        <div className="edition"><span className="dot" />{edition}</div>
      )}
    </div>
  );
}
