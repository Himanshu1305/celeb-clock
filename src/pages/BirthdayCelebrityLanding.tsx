/**
 * Birthday & Celebrity category landing — /celebrity-birthday (Part AJ redesign).
 *
 * Rebuilt to the finalized "Field Guide" design (docs/design-reference/birthday-final.html),
 * using the shared scoped design system (src/styles/part-aj.css). class="paj field-guide".
 *
 * ── Part 2 ARCHITECTURE DECISION (documented in docs/part-aj-flags.md) ──────────
 * Per the brief, /celebrity-birthday becomes the HOME FOR FREE, INTERACTIVE RESULTS:
 * the hero DOB now computes the birthday-twins grid + the date snapshot INLINE
 * (it no longer navigates away to /birthday-report). /birthday-report remains the
 * dedicated PAID "Birthday Blueprint" report/checkout flow — not duplicated here,
 * only linked. This resolves (not reintroduces) the Part AF duplicate-content concern:
 * free interactive results live here, the paid report lives there — a clean split.
 *
 * REAL DATA + REAL IMAGES (confirmed requirement):
 *  - Twins + "today's birthdays" come from getRankedBirthdayCelebrities (the canonical
 *    Supabase celebrity query used across the site), ranked by global recognition.
 *  - Name search queries the real celebrity_sitelinks table (28k+ rows).
 *  - Cards render real photos via fetchCelebrityImage (Wikipedia, cached), initials only
 *    as a genuine last-resort fallback.
 *  - Each card's "View profile & source ↗" is the real Wikipedia attribution URL.
 *  - The snapshot (zodiac / life path / weekday) is computed from the real calc utils.
 *  - WhatsApp share (reused WhatsAppShareButton) at the twins result moment.
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { DobInput, type DobValue, parseDob } from '@/components/DobInput';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
import { calculateWesternZodiac, calculateLifePathNumber } from '@/utils/celebrityCalculations';
import { getRankedBirthdayCelebrities, type CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/part-aj.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const mmdd = (month: number, day: number) => `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

type Person = Pick<CelebrityBirthdayResult, 'name' | 'birthDate' | 'occupation' | 'knownFor' | 'wikipediaUrl' | 'nationality'>;

function formatDOB(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}
const fieldOf = (p: Person) => p.occupation || p.knownFor || 'Notable person';
const sourceOf = (p: Person) => p.wikipediaUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.name.replace(/ /g, '_'))}`;
const initialsOf = (name: string) => name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

function PersonCard({ p }: { p: Person }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchCelebrityImage(p.name).then(u => { if (!cancelled) setImg(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [p.name]);
  return (
    <article className="person">
      <div className="person-avatar" aria-hidden={!img}>
        {img
          ? <img src={img} alt={p.name} loading="lazy" decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', zIndex: 1 }} />
          : <span>{initialsOf(p.name)}</span>}
      </div>
      <div>
        <span className="eyebrow">{fieldOf(p)}</span>
        <h3>{p.name}</h3>
        <p>{formatDOB(p.birthDate)}{p.nationality ? ` · ${p.nationality}` : ''}</p>
        <a className="text-button" href={sourceOf(p)} target="_blank" rel="noopener noreferrer">View profile &amp; source ↗</a>
      </div>
    </article>
  );
}

// Fixed-height skeleton card — reserves the real .person footprint during async load so the
// grid populating from the Supabase query does not shift the page (keeps CLS low, Part AJ step 6).
function PersonSkeleton() {
  return (
    <article className="person" aria-hidden="true">
      <div className="person-avatar" />
      <div style={{ width: '100%' }}>
        <div style={{ height: 10, width: '40%', background: 'var(--line)', borderRadius: 2 }} />
        <div style={{ height: 18, width: '70%', background: 'var(--line)', borderRadius: 2, margin: '8px 0' }} />
        <div style={{ height: 10, width: '55%', background: 'var(--line)', borderRadius: 2 }} />
      </div>
    </article>
  );
}

function PeopleGrid({ people, loading, emptyNote, skeletonCount = 6 }: { people: Person[]; loading: boolean; emptyNote: string; skeletonCount?: number }) {
  if (loading) return <div className="people-grid">{Array.from({ length: skeletonCount }, (_, i) => <PersonSkeleton key={i} />)}</div>;
  if (!people.length) return <div className="people-grid"><p className="empty-state muted">{emptyNote}</p></div>;
  return <div className="people-grid">{people.map(p => <PersonCard key={p.name + (p.birthDate ?? '')} p={p} />)}</div>;
}

/** Twins / today's-birthdays via the canonical Supabase query (ranked by recognition). */
function useBirthdayPeople(monthDay: string | null, limit = 9) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!monthDay) { setPeople([]); return; }
    let cancelled = false;
    setLoading(true);
    getRankedBirthdayCelebrities(monthDay, null, limit)
      .then(rows => { if (!cancelled) setPeople(rows); })
      .catch(() => { if (!cancelled) setPeople([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [monthDay, limit]);
  return { people, loading };
}

export default function BirthdayCelebrityLanding() {
  const now = useMemo(() => new Date(), []);
  const todayMMDD = mmdd(now.getMonth() + 1, now.getDate());

  // The date whose twins we show in §results. Defaults to today so there is real
  // content on first paint; the hero DOB updates it inline (no navigation).
  const [dob, setDob] = useState<DobValue>({ day: '', month: '', year: '' });
  const [active, setActive] = useState<{ day: number; month: number; year?: number }>({ day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() });
  const [message, setMessage] = useState('');

  const activeMMDD = mmdd(active.month, active.day);
  const { people: twins, loading: twinsLoading } = useBirthdayPeople(activeMMDD, 9);
  const { people: todayPeople, loading: todayLoading } = useBirthdayPeople(todayMMDD, 6);

  // Name search against the real celebrity_sitelinks table (28k+ rows).
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);
  const runSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (term.length < 2) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('celebrity_sitelinks')
        .select('name, birth_date, occupation, known_for, wikipedia_url, nationality')
        .ilike('name', `%${term}%`).not('birth_date', 'is', null)
        .order('sitelinks', { ascending: false }).limit(9);
      if (error) throw error;
      setSearchResults(((data as any[]) ?? []).map(r => ({
        name: r.name, birthDate: (r.birth_date ?? '').slice(0, 10),
        occupation: r.occupation, knownFor: r.known_for, wikipediaUrl: r.wikipedia_url, nationality: r.nationality,
      })));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);
  useEffect(() => { const t = setTimeout(() => runSearch(query), 400); return () => clearTimeout(t); }, [query, runSearch]);

  const onDobSubmit = () => {
    const { date, error } = parseDob(dob.day, dob.month, dob.year);
    if (!date) { setMessage(error || 'Please enter a full date of birth.'); return; }
    setActive({ day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() });
    setMessage(`Showing the people who share ${MONTHS[date.getMonth()]} ${date.getDate()}.`);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Snapshot (computed) for the active date.
  const zodiac = calculateWesternZodiac(active.day, active.month);
  const lifePath = active.year ? calculateLifePathNumber(active.day, active.month, active.year) : null;
  const weekday = active.year ? new Date(active.year, active.month - 1, active.day).toLocaleDateString('en-US', { weekday: 'long' }) : null;

  const top3 = twins.slice(0, 3);
  const shareMsg = top3.length
    ? `I share my birthday (${MONTHS[active.month - 1]} ${active.day}) with ${top3.map(t => t.name).join(', ')} 🎂 Who shares yours? https://bornclock.com/celebrity-birthday`
    : `Find out which famous people share your birthday at BornClock: https://bornclock.com/celebrity-birthday`;

  const faqs: Array<[string, string]> = [
    ['What does “birthday twin” mean?', 'Someone who shares your birth month and day. The year can be different. It is a calendar connection, not evidence that you share personality traits.'],
    ['Where does the celebrity data come from?', 'Real people from our celebrity database, matched on month and day and ranked by global recognition. Photos are pulled live from Wikipedia; each card links to its source.'],
    ['Can I share my birthday result?', 'Yes — the WhatsApp share button composes a note with your date and your top birthday twins. It shares the month and day, not your full birth year.'],
  ];

  return (
    <div className="paj field-guide" data-category="birthday" data-testid="birthday-celebrity-page">
      <SEO
        title="Everything Your Birthday Reveals — Celebrity Twins | BornClock"
        description="Find the famous people who share your birthday — real profiles, real photos, ranked by recognition — plus your zodiac, life path and the weekday you were born. Free."
        keywords="celebrity birthday twins, famous birthdays, who shares my birthday, born on this day, birthday zodiac, life path number"
        canonicalUrl="/celebrity-birthday"
        ogType="website"
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <header className="site-header" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Navigation />
        <AuthNav />
      </header>
      <div className="breadcrumb">
        <div><span className="crumb-parent">BornClock&nbsp; /&nbsp; </span><span className="crumb-name">Birthday &amp; Celebrity</span></div>
        <div className="edition"><span className="dot" />Real dates · sourced profiles</div>
      </div>

      <main id="main">
        {/* HERO (field-guide) */}
        <section className="hero" id="start" aria-label="Introduction">
          <div className="wide-title">
            <div>
              <span className="eyebrow kicker">Your date. Good company.</span>
              <h1>Everything your birthday reveals.<br /><em>Made for your story.</em></h1>
            </div>
            <span className="serial" aria-hidden="true">02</span>
          </div>
          <div className="hero-top">
            <div className="hero-copy">
              <div>
                <div className="accent-rule" />
                <p className="lead">Some connections deserve to be celebrated. Start with the date that’s yours, then meet the people who turned it into something memorable.</p>
                <div className="hero-links">
                  <a className="btn" href="#results">Meet the birthday twins →</a>
                  <a className="text-button" href="#today">Today’s birthdays</a>
                </div>
              </div>
              <p className="hero-note">Date connections are factual. Zodiac and numerology are playful traditions, clearly labelled — not personality science.</p>
            </div>
            <div className="hero-visual">
              <div className="visual-wrap">
                <div className="visual-top"><strong>The birthday club</strong><span className="pill accent">Same day. Different stories.</span></div>
                <div className="birthday-ticket">
                  <div className="big-date">
                    <div className="month">{MONTHS[active.month - 1]}</div>
                    <div className="day">{active.day}</div>
                    <div className="day-foot">ONE DATE. MANY POSSIBILITIES.</div>
                  </div>
                  <div className="ticket-side">
                    <span className="badge">A LITTLE SERENDIPITY</span>
                    <h3>You’re in<br />good company.</h3>
                    <div className="initial-stack" aria-hidden="true">
                      {(top3.length ? top3 : [{ name: 'B C' }, { name: 'C D' }, { name: 'E F' }]).map((t, i) => <span key={i}>{initialsOf(t.name)}</span>)}
                    </div>
                    <p className="small">{top3.length ? top3.map(t => t.name).join('. ') + '. And perhaps, you.' : 'Enter your date to meet your birthday twins.'}</p>
                  </div>
                </div>
                <div className="visual-caption">
                  <span>Birthday twins share a month and day.<br />Not a personality. Not a destiny.</span>
                  <span><a className="textlink" href="#results">Meet your twins →</a></span>
                </div>
              </div>
            </div>
            <div className="guide-form">
              <span className="eyebrow">Your starting point</span>
              <h3>When were you born?</h3>
              <DobInput value={dob} onChange={setDob} label="" idPrefix="bc" />
              <button className="btn" type="button" data-testid="bc-hero-submit" onClick={onDobSubmit} style={{ width: '100%', marginTop: 14 }}>
                Find my birthday twins <span aria-hidden="true">→</span>
              </button>
              <p className="form-message" role="status" aria-live="polite">{message}</p>
              <div className="guide-steps"><span>01</span> Begin — <span>02</span> Explore — <span>03</span> Understand</div>
            </div>
          </div>
        </section>

        <div className="trust-strip">
          <div><span className="tick" aria-hidden="true">✓</span>Real dates, sourced profiles</div>
          <div><span className="tick" aria-hidden="true">✓</span>Real photos, ranked by recognition</div>
          <div><span className="tick" aria-hidden="true">✓</span>A little wonder, no big claims</div>
        </div>

        {/* RESULTS — twins + name search */}
        <section className="section white" id="results">
          <div className="section-head">
            <div><span className="eyebrow">The birthday club</span><h2>Meet your birthday twins.</h2></div>
            <p>Same month and day, not necessarily the same year — real people, ranked by global recognition.</p>
          </div>
          <div className="inline-actions" style={{ marginBottom: 14, gap: 10 }}>
            <label htmlFor="celebSearch" className="eyebrow" style={{ margin: 0 }}>Search a name directly</label>
            <input id="celebSearch" type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Einstein, Simone Biles…"
              style={{ flex: 1, minWidth: 220, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 3, font: 'inherit', background: 'var(--bg)' }} />
          </div>
          {(query.trim().length >= 2) && (
            <div style={{ marginBottom: 18 }}>
              <PeopleGrid people={searchResults} loading={searching} skeletonCount={3} emptyNote={`No one found matching “${query}”. Try another name.`} />
            </div>
          )}
          <div className="inline-actions" style={{ marginBottom: 14 }}>
            <span className="pill accent">{MONTHS[active.month - 1].slice(0, 3)} {active.day} · {twins.length} profile{twins.length !== 1 ? 's' : ''}</span>
            <WhatsAppShareButton message={shareMsg} label="Share a birthday note" />
          </div>
          <PeopleGrid people={twins} loading={twinsLoading} skeletonCount={9} emptyNote="No notable profiles recorded for this date yet. Try another date, or search a name above." />
          <p className="small-note">Photos load live from Wikipedia; initials stand in only when no photo is on file. Each card links to its source.</p>
        </section>

        {/* SNAPSHOT — computed */}
        <section className="section white" id="snapshot">
          <div className="section-head">
            <div><span className="eyebrow">A playful first look</span><h2>A few more sides to your date.</h2></div>
            <p>Calendar facts on one side; symbolic traditions, clearly labelled, on the other.</p>
          </div>
          <div className="snapshot">
            <div><span className="eyebrow">Western zodiac · tradition</span><strong>{zodiac.symbol} {zodiac.sign}</strong><p>Conventional date-based Sun sign. A conversation starter, not a scientific personality result.</p></div>
            <div><span className="eyebrow">Numerology · tradition</span><strong>{lifePath ? <>Life path {lifePath}</> : 'Life path —'}</strong><p>{lifePath ? 'A symbolic interpretation from your birth-date digits.' : 'Enter your full date of birth above to compute your life-path number.'}</p></div>
            <div><span className="eyebrow">Calendar fact</span><strong>{weekday || '—'}</strong><p>{weekday ? 'The weekday you were born, calculated from your date.' : 'Enter your birth year above to compute the weekday you were born.'}</p></div>
          </div>
        </section>

        {/* TODAY'S BIRTHDAYS */}
        <section className="section" id="today">
          <div className="section-head">
            <div><span className="eyebrow">The daily celebration</span><h2>Today’s birthdays.</h2></div>
            <p>A fresh reason to be curious about the date on your calendar.</p>
          </div>
          <div className="today-head" style={{ marginBottom: 15 }}>
            <span className="pill accent">{MONTHS[now.getMonth()]} {now.getDate()} · today</span>
            <div className="browse-dates"><Link to="/todays-birthdays"><button type="button">See the full list →</button></Link></div>
          </div>
          <PeopleGrid people={todayPeople} loading={todayLoading} emptyNote="No notable profiles recorded for today yet." />
        </section>

        {/* HONESTY */}
        <section className="section" id="honesty">
          <div className="honesty">
            <div><span className="eyebrow">Our approach</span><h2>Real connections.<br />A little play. No big claims.</h2></div>
            <div className="honesty-items">
              <div><h3>Facts have sources</h3><p>Birth dates and photos link to a reference. A birthday twin shares your month and day — not necessarily your year.</p></div>
              <div><h3>Play stays labelled</h3><p>Zodiac and numerology snippets are symbolic entertainment, not evidence of shared personality or destiny.</p></div>
            </div>
          </div>
        </section>

        {/* PAID REPORT */}
        <section className="report" id="report">
          <div><span className="eyebrow">The keepsake · paid report</span><h2>Your Birthday Blueprint.<br />A date made personal.</h2></div>
          <p>Birthday twins, calendar discoveries and clearly labelled symbolic insights, gathered into one shareable keepsake — for yourself or as a gift.</p>
          <div className="report-actions">
            <Link className="btn light" to="/birthday-report" data-testid="bc-final-cta">Create the Birthday Blueprint →</Link>
            <p className="small">A personalised, giftable report.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section white">
          <div className="faq-layout">
            <div><span className="eyebrow">Before you begin</span><h2>A few good questions.</h2></div>
            <div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
          </div>
        </section>

        {/* EXPLORE + cross-category */}
        <section className="section">
          <div className="section-head"><div><span className="eyebrow">Explore by topic</span><h2>Everything in one place.</h2></div></div>
          <p className="lead" data-testid="bc-explore" style={{ maxWidth: 'none' }}>
            {([
              ['Celebrity profiles', '/celebrity'], ['Today’s birthdays', '/todays-birthdays'],
              ['Born on this day', '/born-on'], ['Age calculator', '/age-calculator'],
              ['Your numerology', '/numerology'], ['Western zodiac', '/zodiac'],
              ['Chinese zodiac', '/chinese-zodiac'], ['Birthday Blueprint', '/birthday-report'],
            ] as Array<[string, string]>).map(([label, to], i, arr) => (
              <span key={label}><Link className="textlink" to={to}>{label}</Link>{i < arr.length - 1 && <span className="muted"> · </span>}</span>
            ))}
          </p>
          <div className="crosslinks" style={{ marginTop: 20 }}>
            <Link className="crosslink" to="/vedic-astrology">
              <div><span className="eyebrow">The computed lens</span><h3>Vedic Astrology →</h3><p>Your real sidereal birth chart — planets, Nakshatra and Dasha, computed.</p></div><span>↗</span>
            </Link>
            <Link className="crosslink" to="/mystic-corner">
              <div><span className="eyebrow">Different systems</span><h3>Mystic Corner →</h3><p>Numerology, Western and Chinese zodiac — each one actually computed.</p></div><span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
            <p className="subtle">One birth date. Different kinds of discovery. Facts, traditions and research — with the difference made clear.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/vedic-astrology">Vedic Astrology</Link>
            <Link to="/celebrity-birthday">Birthday &amp; Celebrity</Link>
            <Link to="/mystic-corner">Mystic Corner</Link>
            <Link to="/life-expectancy">Science &amp; Longevity</Link>
            <Link to="/how-it-works">Methodology</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>© 2026 BornClock · Independent perspectives. Clear boundaries.</span></div>
      </footer>
    </div>
  );
}
