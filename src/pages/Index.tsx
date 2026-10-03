/**
 * BornClock homepage (Part AN) — built to docs/design-reference/homepage-final.dc.html.
 *
 * Real React + real data + the site's OWN functions (src/utils/homepageDecode wraps
 * calculateWesternZodiac / calculateLifePathNumber / BIRTHSTONE_DATA) — never the mockup's copies.
 * Clock, "Born today" and decoded values are client-side (never prerendered — the page is
 * prerendered at build time). Everything reads as an EXAMPLE until the visitor enters their own
 * date or a saved profile is in use. No date is ever put in the URL (Part AD). Structured data is
 * body-rendered via JsonLd (never Helmet). The ticking clock is NOT an ARIA live region.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { JsonLd } from '@/components/JsonLd';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { useBirthDate } from '@/context/BirthDateContext';
import { zodiacSign, lifePath, birthstoneForMonth, marsAge, marsYearProgress, marsWeightKg } from '@/utils/homepageDecode';
import { getRankedBirthdayCelebrities, type CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/homepage.css';

const EXAMPLE_ISO = '1998-03-14';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');
const parseIso = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d, 0, 0, 0); };
const isValidIso = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, day] = iso.split('-').map(Number);
  const d = parseIso(iso);
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day && d.getTime() <= Date.now();
};

// ── Born-today band (client-side; real daily celebrities + real photos) ──────
function BornTodayPhoto({ name }: { name: string }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => { let c = false; fetchCelebrityImage(name).then(u => { if (!c) setImg(u); }).catch(() => {}); return () => { c = true; }; }, [name]);
  const initials = name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  return <div className="ph">{img ? <img src={img} alt={name} loading="lazy" decoding="async" /> : initials}</div>;
}

function BornToday() {
  const now = useMemo(() => new Date(), []);
  const mmdd = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const [people, setPeople] = useState<CelebrityBirthdayResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    let c = false;
    getRankedBirthdayCelebrities(mmdd, null, 3).then(r => { if (!c) setPeople(r); }).catch(() => {});
    supabase.from('celebrity_sitelinks').select('*', { count: 'exact', head: true }).eq('birth_month_day', mmdd)
      .then(({ count }) => { if (!c && typeof count === 'number') setTotal(count); });
    return () => { c = true; };
  }, [mmdd]);
  const moreLabel = total != null ? `+${Math.max(0, total - people.length)} more today →` : 'See everyone born today →';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '12px 24px', background: '#FFFFFF', borderBottom: '1px solid #E4DCC8', flexWrap: 'wrap', minHeight: 60 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.7px', color: '#B5432A', whiteSpace: 'nowrap' }}>
        BORN TODAY · {now.getDate()} {MONTHS[now.getMonth()].toUpperCase()}
      </div>
      {people.map((p, i) => (
        <div className="bt" style={{ animationDelay: `${0.1 + i * 0.15}s` }} key={p.name}>
          <BornTodayPhoto name={p.name} />
          <div style={{ fontSize: 12.5 }}>
            <b style={{ color: '#0E2238' }}>{p.name}</b>
            <div style={{ fontSize: 10.5, color: '#5B6472' }}>{(p.occupation || p.knownFor || 'Notable person')}{p.birthDate ? ` · ${p.birthDate.slice(0, 4)}` : ''}</div>
          </div>
        </div>
      ))}
      <Link to="/todays-birthdays" className="bt" style={{ animationDelay: '.55s', fontSize: 12.5, fontWeight: 700, color: '#B5432A' }}>{moreLabel}</Link>
    </div>
  );
}

// ── Directory tool columns (every link a real route) ─────────────────────────
type Tool = { label: string; tag: string; to: string };
const VEDIC_TOOLS: Tool[] = [
  { label: 'Kundli Chart', tag: 'free', to: '/kundali' },
  { label: 'Kundali Matching', tag: '36-point', to: '/kundali-match' },
  { label: 'Dasha Timing', tag: 'to Pratyantar', to: '/kundali' },
  { label: 'Yoga Detection', tag: 'graded', to: '/kundali' },
  { label: 'Sade Sati Checker', tag: 'real transit', to: '/sade-sati' },
  { label: 'Muhurat Finder', tag: 'by city', to: '/muhurat' },
  { label: 'Gemstone Recommendation', tag: 'Lagna-based', to: '/gemstones' },
  { label: 'Rashi Ratna', tag: 'by Rashi', to: '/rashi-ratna' },
  { label: 'Career Report', tag: '10th house', to: '/career-report' },
  { label: 'AI Astrologer', tag: 'chat', to: '/astrologer' },
];
const BIRTHDAY_TOOLS: Tool[] = [
  { label: 'Celebrity Birthday Twins', tag: 'real profiles', to: '/celebrity-birthday' },
  { label: "Today's Birthdays", tag: 'live', to: '/todays-birthdays' },
  { label: 'Age Calculator', tag: 'to the second', to: '/age-calculator' },
  { label: 'Birthstone', tag: 'by month', to: '/birthstone' },
  { label: 'Indian Celebrities by Date', tag: 'daily', to: '/born-on/india' },
  { label: 'Birthday Blueprint', tag: '8-page PDF', to: '/birthday-report' },
];
const MYSTIC_TOOLS: Tool[] = [
  { label: 'Numerology', tag: 'Life Path + Name', to: '/numerology' },
  { label: 'Western Zodiac', tag: 'sun sign', to: '/zodiac' },
  { label: 'Chinese Zodiac', tag: 'lunar year', to: '/chinese-zodiac' },
  { label: 'Tarot by Birthday', tag: 'birth card', to: '/tarot-card-by-birthday' },
  { label: 'Compatibility', tag: 'names + dates', to: '/compatibility' },
  { label: 'Biorhythm', tag: 'daily cycles', to: '/biorhythm' },
];
const SCIENCE_TOOLS: Tool[] = [
  { label: 'Life Expectancy', tag: 'WHO / NIH-informed', to: '/life-expectancy' },
  { label: 'Biological Age Test', tag: '10 questions', to: '/biological-age' },
  { label: 'Country Comparison', tag: '57 countries', to: '/country-comparison' },
  { label: 'Planetary Age', tag: 'orbital periods', to: '/planetary-age' },
  { label: 'Planetary Weight', tag: 'NASA 2023', to: '/weight-on-planets' },
];
function ToolList({ tools }: { tools: Tool[] }) {
  return <div className="tools">{tools.map(t => <Link key={t.label + t.to} to={t.to}>{t.label} <span>{t.tag}</span></Link>)}</div>;
}

export default function Index() {
  const navigate = useNavigate();
  const { setBirthDate } = useBirthDate();
  const { profile } = useSavedProfile();

  const savedDob = profile?.dob && isValidIso(profile.dob) ? profile.dob : null;
  const [entered, setEntered] = useState<string | null>(null);
  const activeIso = (entered && isValidIso(entered)) ? entered : (savedDob ?? EXAMPLE_ISO);
  const isExample = !(entered && isValidIso(entered)) && !savedDob;

  // Ticking clock (NOT an ARIA live region).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // One-time polite announcement when the visitor's own results first appear.
  const [announce, setAnnounce] = useState('');
  const announcedRef = useRef(false);

  const birth = parseIso(activeIso);
  const [y, m, d] = activeIso.split('-').map(Number);

  const yearsLived = (() => { let a = now.getFullYear() - y; if (now < new Date(now.getFullYear(), m - 1, d)) a--; return a; })();
  const lastBday = new Date(y + yearsLived, m - 1, d);
  const nextBday = new Date(y + yearsLived + 1, m - 1, d);
  const totalSec = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / 1000));
  const daysInYear = Math.floor((now.getTime() - lastBday.getTime()) / 86400000);
  const nextIn = Math.ceil((nextBday.getTime() - now.getTime()) / 86400000);
  const pct = Math.min(100, Math.max(0, ((now.getTime() - lastBday.getTime()) / (nextBday.getTime() - lastBday.getTime())) * 100));
  const isBirthdayToday = now.getMonth() + 1 === m && now.getDate() === d;

  const sign = zodiacSign(d, m);
  const lp = lifePath(d, m, y);
  const stone = birthstoneForMonth(m);
  const marsYears = marsAge(birth, now);
  const marsPctThisYear = Math.floor(marsYearProgress(birth, now) * 100);
  const marsKg = marsWeightKg(70);

  const onDate = (v: string) => {
    if (isValidIso(v)) {
      setEntered(v);
      if (!announcedRef.current) { announcedRef.current = true; setAnnounce('Your birth date has been decoded below.'); }
    }
  };

  const kundaliUrl = useMemo(() => {
    const params = new URLSearchParams({ dob: activeIso });
    if (!entered && savedDob && profile?.time && profile?.city) {
      params.set('time', profile.time);
      params.set('place', profile.city.name);
      params.set('lat', String(profile.city.lat)); params.set('lon', String(profile.city.lon)); params.set('tz', String(profile.city.tz));
    }
    return `/kundali?${params.toString()}`;
  }, [activeIso, entered, savedDob, profile]);

  const seeFullProfile = () => { setBirthDate(birth); navigate('/results'); };

  const exampleLabel = isExample ? `Example: ${d} ${MONTHS[m - 1]} ${y} — enter yours` : null;
  const DEC = [
    { lab: 'WESTERN SIGN', color: '#6E5AA6', top: '#6E5AA6', val: sign, sub: 'by date cut-offs' },
    { lab: 'LIFE PATH', color: '#6E5AA6', top: '#6E5AA6', val: String(lp), sub: 'every digit summed' },
    { lab: 'BIRTHSTONE', color: '#B5432A', top: '#F0715A', val: stone, sub: 'by birth month' },
    { lab: 'AGE ON MARS', color: '#2F6FB0', top: '#2F6FB0', val: `${marsYears.toFixed(1)} yrs`, sub: 'Mars year = 1.881 Earth yrs' },
    { lab: 'WEIGHT ON MARS', color: '#2F6FB0', top: '#2F6FB0', val: `${marsKg.toFixed(1)} kg`, sub: 'per 70 kg on Earth (0.38×)' },
  ];

  return (
    <div className="hp">
      <SEO
        title="Birthday, Zodiac & Longevity Calculator | BornClock"
        description="Everything your birth date reveals: your Vedic birth chart, celebrity birthday twins, numerology and zodiac, and longevity science — all from one date. Free birthday, zodiac & longevity calculators."
        keywords="birthday calculator, zodiac calculator, longevity calculator, numerology, life path, vedic birth chart, kundli, celebrity birthdays, biological age"
        canonicalUrl="/"
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      {/* Structured data — body-rendered (Part AM JsonLd), never Helmet */}
      <JsonLd id="org" data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'BornClock', url: 'https://bornclock.com/', logo: 'https://bornclock.com/og/default.png' }} />
      <JsonLd id="website" data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'BornClock', url: 'https://bornclock.com/', potentialAction: { '@type': 'SearchAction', target: 'https://bornclock.com/celebrity?q={search_term_string}', 'query-input': 'required name=search_term_string' } }} />
      <JsonLd id="webpage" data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'BornClock — Birthday, Zodiac & Longevity Calculator', description: 'Everything your birth date reveals — Vedic chart, celebrity twins, numerology, zodiac and longevity science from one date.', url: 'https://bornclock.com/' }} />

      {/* Polite, one-time announcement (NOT the ticking clock) */}
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{announce}</div>

      {/* Header — real Navigation + AuthNav on the navy bar (global Navigation not restyled) */}
      <header style={{ background: '#0E2238', padding: '0 24px', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Navigation />
        <AuthNav />
      </header>

      <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

        {/* HERO */}
        <div className="hero" style={{ display: 'flex', gap: 28, padding: '30px 24px', borderBottom: '1px solid #E4DCC8' }}>
          <div style={{ flex: 1.05, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', color: '#806125' }}>RIGOROUSLY CALCULATED BIRTH INTELLIGENCE</div>
            <h1 style={{ fontSize: 42, lineHeight: 1.08, color: '#0E2238', fontWeight: 700 }}>Everything your birth date reveals.</h1>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: '#3E4759', margin: 0, maxWidth: 540 }}>Your Vedic birth chart, the celebrities who share your birthday, your numerology and zodiac, and what longevity science says — all from one date.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <label htmlFor="dob" style={{ fontSize: 12, fontWeight: 700, color: '#0E2238' }}>Your birth date</label>
              <input id="dob" type="date" defaultValue={activeIso} max={new Date().toISOString().slice(0, 10)}
                onInput={e => onDate((e.target as HTMLInputElement).value)}
                style={{ height: 40, border: '1px solid #D8D2C2', borderRadius: 6, padding: '0 12px', fontSize: 14, background: '#FFFFFF' }} />
              <button type="button" onClick={() => { const el = document.getElementById('dob') as HTMLInputElement | null; if (el) onDate(el.value); }}
                style={{ height: 40, background: '#0E2238', color: '#FFFFFF', border: 'none', borderRadius: 6, fontSize: 13.5, fontWeight: 700, padding: '0 18px' }}>Decode my date</button>
            </div>
            {exampleLabel && <div style={{ fontSize: 11.5, fontWeight: 600, color: '#B5432A' }}>{exampleLabel}</div>}
            <div className="doors" data-testid="choose-your-path">
              <Link className="door" to="/vedic-astrology" style={{ ['--ac' as string]: '#C6A15B' }}><b>Vedic Astrology</b><span>Kundli · Matching · Sade Sati</span></Link>
              <Link className="door" to="/celebrity-birthday" style={{ ['--ac' as string]: '#F0715A' }}><b>Birthday &amp; Celebrity</b><span>Celebrity twins · Today's birthdays</span></Link>
              <Link className="door" to="/mystic-corner" style={{ ['--ac' as string]: '#6E5AA6' }}><b>Mystic Corner</b><span>Numerology · Zodiac · Tarot</span></Link>
              <Link className="door" to="/life-expectancy" style={{ ['--ac' as string]: '#2F6FB0' }}><b>Science &amp; Longevity</b><span>Life expectancy · Biological age</span></Link>
            </div>
          </div>
          {/* Live clock panel */}
          <div style={{ flex: 0.95, background: '#FFFFFF', border: '1px solid #E4DCC8', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', color: '#B5432A' }}>{isExample ? 'EXAMPLE — ALIVE FOR' : "YOU'VE BEEN ALIVE FOR — LIVE"}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div><div className="tick">{yearsLived}</div><div className="ticklab">YEARS</div></div>
              <div><div className="tick">{daysInYear}</div><div className="ticklab">DAYS</div></div>
              <div><div className="tick">{now.getHours()}</div><div className="ticklab">HOURS</div></div>
              <div><div className="tick">{pad(now.getMinutes())}</div><div className="ticklab">MINUTES</div></div>
              <div><div className="tick" style={{ color: '#B5432A' }}>{pad(now.getSeconds())}</div><div className="ticklab">SECONDS</div></div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #EFE9DA', paddingTop: 10 }}>
              <div style={{ fontSize: 12.5, color: '#1A2230' }}><b>{totalSec.toLocaleString()}</b> seconds in total</div>
              <div style={{ fontSize: 12.5, color: '#1A2230' }}>≈ <b>{Math.floor(totalSec * 1.2).toLocaleString()}</b> heartbeats</div>
              {isBirthdayToday
                ? <div style={{ fontSize: 12.5, color: '#B5432A', fontWeight: 700 }}>🎉 Happy birthday — today's the day!</div>
                : <div style={{ fontSize: 12.5, color: '#1A2230' }}>Next birthday in <b>{nextIn}</b> days</div>}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#1A2230', marginBottom: 5 }}>
                <span>Year <b>{yearsLived + 1}</b> of {isExample ? 'this life' : 'your life'}</span><span><b>{Math.floor(pct)}</b>% complete</span>
              </div>
              <div className="pbar" role="progressbar" aria-label="Progress through the current year of life" aria-valuenow={Math.floor(pct)} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${pct.toFixed(2)}%` }} /></div>
            </div>
            <div style={{ fontSize: 10.5, color: '#5B6472' }}>Heartbeats estimated at an average 72 bpm. Clock assumes a 00:00 birth time.</div>
          </div>
        </div>

        {/* YOUR DATE, DECODED */}
        <div style={{ padding: '10px 24px 0', display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', color: '#0E2238' }}>YOUR DATE, DECODED</span>
          {exampleLabel && <span style={{ fontSize: 11, color: '#B5432A', fontWeight: 600 }}>{exampleLabel}</span>}
          <button type="button" onClick={seeFullProfile} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#B5432A', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>See your full birthday profile →</button>
        </div>
        <div className="decrow" key={activeIso} style={{ display: 'flex', margin: '8px 24px 18px', background: '#FFFFFF', border: '1px solid #E4DCC8', borderRadius: 10 }}>
          {DEC.map((c, i) => (
            <div className="dec" key={c.lab} style={{ borderTop: `3px solid ${c.top}`, ...(i === 0 ? { borderTopLeftRadius: 10 } : {}) }}>
              <div className="lab" style={{ color: c.color }}>{c.lab}</div>
              <div className="val pop">{c.val}</div>
              <div className="sub">{c.sub}</div>
            </div>
          ))}
          <div className="dec" style={{ borderTop: '3px solid #C6A15B', borderTopRightRadius: 10 }}>
            <div className="lab" style={{ color: '#806125' }}>VEDIC CHART</div>
            <div className="val">Free</div>
            <div className="sub">needs time + place · <Link to={kundaliUrl} style={{ fontWeight: 700 }}>generate</Link></div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="trust" style={{ display: 'flex', padding: '14px 24px', background: '#FFFFFF', borderTop: '1px solid #E4DCC8', borderBottom: '1px solid #E4DCC8' }}>
          <div style={{ flex: 1, borderRight: '1px solid #E4DCC8', paddingRight: 16 }}><span style={{ fontSize: 10.5, fontWeight: 700, color: '#806125' }}>CROSS-CHECKED — </span><span style={{ fontSize: 12, color: '#3E4759' }}>Vedic calculations checked against independent reference calculations, not a template.</span></div>
          <div style={{ flex: 1, borderRight: '1px solid #E4DCC8', padding: '0 16px' }}><span style={{ fontSize: 10.5, fontWeight: 700, color: '#806125' }}>CLASSICAL — </span><span style={{ fontSize: 12, color: '#3E4759' }}>the 36-point Ashtakoota system, per the Brihat Parashara Hora Shastra.</span></div>
          <div style={{ flex: 1, paddingLeft: 16 }}><span style={{ fontSize: 10.5, fontWeight: 700, color: '#806125' }}>SOURCED — </span><span style={{ fontSize: 12, color: '#3E4759' }}>WHO, Harvard, NIH, UN WPP 2024 and NASA's Planetary Fact Sheet (2023).</span></div>
        </div>

        {/* BORN TODAY (client-side) */}
        <BornToday />

        {/* DIRECTORY */}
        <div className="dir" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#FAF7F0', borderBottom: '1px solid #E4DCC8' }}>
          <div className="col" id="vedic" style={{ ['--ac' as string]: '#C6A15B' }}>
            <div className="eyebrow" style={{ color: '#806125' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#806125" strokeWidth="1.4" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" /><path d="M1.5 1.5l13 13M14.5 1.5l-13 13" /></svg>VEDIC ASTROLOGY</div>
            <h2>Traditional systems, computed.</h2>
            <div className="teaser"><span>Your real Kundli — Lagna, Nakshatra and Dasha — free. <span style={{ color: '#5B6472', fontSize: 11 }}>House 1 (Lagna) sits at the top, as in the classical North-Indian chart.</span></span></div>
            <ToolList tools={VEDIC_TOOLS} />
            <Link className="explore" to="/vedic-astrology" style={{ color: '#806125' }}>Explore Vedic Astrology →</Link>
          </div>
          <div className="col" id="birthday" style={{ ['--ac' as string]: '#F0715A' }}>
            <div className="eyebrow" style={{ color: '#B5432A' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#B5432A" strokeWidth="1.4" aria-hidden="true"><path d="M2 14h12M3 14V8h10v6M8 8V5M8 5c-1-1-1-2 0-3 1 1 1 2 0 3z" /></svg>BIRTHDAY &amp; CELEBRITY</div>
            <h2>Specific beats generic.</h2>
            <div className="teaser">{isBirthdayToday ? 'Your birthday is today — see who else celebrates it.' : <>Next birthday in <b>{nextIn}</b> days — see who else celebrates it.</>}</div>
            <ToolList tools={BIRTHDAY_TOOLS} />
            <Link className="explore" to="/celebrity-birthday" style={{ color: '#B5432A' }}>Explore Birthdays →</Link>
          </div>
          <div className="col" id="mystic" style={{ ['--ac' as string]: '#6E5AA6' }}>
            <div className="eyebrow" style={{ color: '#6E5AA6' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6E5AA6" strokeWidth="1.4" aria-hidden="true"><path d="M8 1.5l1.6 4.9L14.5 8l-4.9 1.6L8 14.5 6.4 9.6 1.5 8l4.9-1.6z" /></svg>MYSTIC CORNER</div>
            <h2>Many symbols. Different rules.</h2>
            <div className="teaser">Your Life Path is <b>{lp}</b> — see what it's said to mean.</div>
            <ToolList tools={MYSTIC_TOOLS} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span className="chip">Each system has its own rules — we say which</span>
              <span className="chip">Western ≠ Vedic sign</span>
            </div>
            <Link className="explore" to="/mystic-corner" style={{ color: '#6E5AA6' }}>Explore Mystic Corner →</Link>
          </div>
          <div className="col" id="science" style={{ ['--ac' as string]: '#2F6FB0', background: '#FFFFFF' }}>
            <div className="eyebrow" style={{ color: '#2F6FB0' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#2F6FB0" strokeWidth="1.4" aria-hidden="true"><path d="M1 9h3l2-5 3 9 2-6 1 2h3" /></svg>SCIENCE &amp; LONGEVITY</div>
            <h2>Numbers with a source trail.</h2>
            <div className="teaser"><span>You're <b>{marsYears.toFixed(1)}</b> years old on Mars — <b>{marsPctThisYear}</b>% through your current Mars year.</span></div>
            <ToolList tools={SCIENCE_TOOLS} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {['WHO', 'Harvard', 'NIH', 'UN WPP 2024', 'NASA 2023'].map(s => <span className="chip" key={s}>{s}</span>)}
            </div>
            <div style={{ fontSize: 11, color: '#237A60', fontWeight: 600 }}>Estimates, not predictions — limits stated on every page.</div>
            <Link className="explore" to="/life-expectancy" style={{ color: '#2F6FB0' }}>Explore Science &amp; Longevity →</Link>
          </div>
        </div>

        {/* FOOTER SITEMAP (real routes; extended so every current-homepage link stays reachable) */}
        <div style={{ background: '#0E2238', padding: '22px 24px 16px' }}>
          <div className="foot" style={{ display: 'flex', gap: 28 }}>
            <FootCol color="#D9BC82" title="VEDIC" links={[['Kundli', '/kundali'], ['Matching', '/kundali-match'], ['Sade Sati', '/sade-sati'], ['Muhurat', '/muhurat'], ['Gemstones', '/gemstones'], ['Rashi Ratna', '/rashi-ratna'], ['Career', '/career-report'], ['AI Astrologer', '/astrologer']]} />
            <FootCol color="#F7A08E" title="BIRTHDAY" links={[['Celebrity Twins', '/celebrity-birthday'], ["Today's Birthdays", '/todays-birthdays'], ['Age Calculator', '/age-calculator'], ['Birthstone', '/birthstone'], ['Indian Celebrities', '/born-on/india'], ['Blueprint', '/birthday-report']]} />
            <FootCol color="#B3A4DE" title="MYSTIC" links={[['Numerology', '/numerology'], ['Name Numerology', '/name-numerology'], ['Western Zodiac', '/zodiac'], ['Chinese Zodiac', '/chinese-zodiac'], ['Tarot', '/tarot-card-by-birthday'], ['Compatibility', '/compatibility'], ['Biorhythm', '/biorhythm']]} />
            <FootCol color="#8FC1E6" title="SCIENCE" links={[['Life Expectancy', '/life-expectancy'], ['Biological Age', '/biological-age'], ['Country Comparison', '/country-comparison'], ['Planetary Age', '/planetary-age'], ['Planetary Weight', '/weight-on-planets']]} />
            <FootCol color="#FFFFFF" title="BORNCLOCK" links={[['How it works', '/how-it-works'], ['Answers', '/answers'], ['Articles', '/articles'], ['About', '/about'], ['Editorial Policy', '/editorial-policy'], ['Pricing', '/pricing'], ['Privacy', '/privacy'], ['Contact', '/contact']]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FootCol({ color, title, links }: { color: string; title: string; links: Array<[string, string]> }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 11.5, lineHeight: 1.9 }}>
        {links.map(([label, to], i) => (
          <span key={to}>{i > 0 && <span style={{ color: '#5B6472' }}> · </span>}<Link to={to} style={{ color: '#B9C2CF' }}>{label}</Link></span>
        ))}
      </div>
    </div>
  );
}
