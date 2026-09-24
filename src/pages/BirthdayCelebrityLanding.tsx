/**
 * Birthday Fun & Celebrity Twins category landing — /celebrity-birthday (Part AF).
 *
 * The enhanced version of the existing (indexed-traffic) /celebrity-birthday URL, which
 * previously just redirected to /celebrity/. Second category page after /vedic-astrology.
 *
 * VISUAL: reuses the EXACT navy/gold/ivory palette + Fraunces/Public Sans + dense,
 * hairline-divided, edge-to-edge layout shipped on /vedic-astrology, for visual
 * consistency across category pages (scoped to this page via arbitrary Tailwind + inline
 * styles; homepage/others untouched). Slightly warmer/ivory-forward tone per the brief.
 *
 * HERO MECHANICS (per brief, verified): the hero is an INPUT-ONLY DOB form. On submit it
 * NAVIGATES to /birthday-report using the existing ?dob=YYYY-MM-DD deep-link (the same
 * param /born-on/ CTAs use; parseDobSeed there prefills month+day). It does NOT duplicate
 * the generate/results UI here — one input here, one real results destination there. This
 * avoids the duplicate-content class the recent SEO fixes eliminated.
 *
 * §5 sample data is REAL: October 2 → Libra (calculateWesternZodiac), Life Path 9 for
 * Mahatma Gandhi's real DOB 1869-10-02 (calculateLifePathNumber), and three real people
 * born Oct 2 verified in src/data/celebrities.json. Nothing fabricated.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { DobInput, type DobValue } from '@/components/DobInput';

// ── palette (identical tokens to /vedic-astrology) ───────────────────────────
const NAVY = '#0E2238', GOLD = '#C6A15B', IVORY = '#FAF7F0';
const INK = '#1A2230', INK2 = '#3E4759', MUTE = '#5B6472', DIV = '#E4DCC8';
const serif = "'Fraunces', Georgia, serif";
const sans = "'Public Sans', system-ui, sans-serif";

function DenseRow({ items, testid }: { items: Array<{ title: string; desc: string; to: string }>; testid: string }) {
  return (
    <div data-testid={testid} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <Link key={it.to + it.title} to={it.to} className="block p-4 hover:bg-[#FAF7F0] transition-colors" style={{ borderLeft: `2px solid ${GOLD}` }}>
          <div className="font-semibold" style={{ color: INK, fontFamily: serif }}>{it.title}</div>
          <div className="mt-1 text-sm" style={{ color: INK2 }}>{it.desc}</div>
        </Link>
      ))}
    </div>
  );
}

export default function BirthdayCelebrityLanding() {
  const navigate = useNavigate();
  const [dob, setDob] = useState<DobValue>({ day: '', month: '', year: '' });

  const valid = /^\d{1,2}$/.test(dob.day) && /^\d{1,2}$/.test(dob.month) && /^\d{4}$/.test(dob.year)
    && Number(dob.month) >= 1 && Number(dob.month) <= 12 && Number(dob.day) >= 1 && Number(dob.day) <= 31;

  // Hero submit → navigate into the REAL /birthday-report engine via the existing ?dob=
  // deep-link (YYYY-MM-DD, zero-padded — matches parseDobSeed's /^\d{4}-\d{2}-\d{2}$/).
  const onSubmit = () => {
    if (!valid) return;
    const iso = `${dob.year}-${dob.month.padStart(2, '0')}-${dob.day.padStart(2, '0')}`;
    navigate(`/birthday-report?dob=${encodeURIComponent(iso)}`);
  };

  const faqs: Array<[string, string]> = [
    ['How do you find my celebrity birthday twins?',
     'We match your exact birthday (month and day) against a database of ~28,000 public figures from Wikidata, ranked by how many Wikipedia language editions cover them — a transparent, global measure of recognition rather than our own opinion.'],
    ['Is the numerology calculation real, or random?',
     'Real and deterministic. Your Life Path number is computed from your full date of birth by the standard digit-reduction method — the same input always gives the same result. It’s calculated, not templated or random.'],
    ['What if I was born on February 29?',
     'Leap-day birthdays work fine — Feb 29 is handled as a valid date. Your celebrity twins, zodiac (Pisces) and numerology all compute correctly; nothing breaks or rounds you to Feb 28.'],
    ['What’s the difference between this and my Western zodiac sign?',
     'Your Western (tropical) sun sign is one piece. This page also gives your Life Path number and celebrity twins — and, if you want the deeper picture, your Vedic Rashi and Nakshatra, which are computed from real sidereal astronomy on the Vedic Astrology page.'],
    ['What’s in the Birthday Blueprint report?',
     'The Birthday Blueprint is the full personalised report — celebrity twins, zodiac deep-dive, numerology, birthstone, tarot and more for your exact date. Celebrity twins are always free; the complete Blueprint unlocks for ₹199 (or is covered by a Premium membership’s monthly credits).'],
  ];

  return (
    <div data-testid="birthday-celebrity-page" style={{ background: '#fff', color: INK, fontFamily: sans }}>
      <SEO
        title="Everything Your Birthday Reveals — Celebrity Twins | BornClock"
        description="Enter your birthday: see your celebrity birthday twins, your Western zodiac and numerology Life Path, and unlock the full Birthday Blueprint. Real celebrities, real dates, real math."
        keywords="celebrity birthday twins, who shares my birthday, birthday zodiac, life path number, famous birthdays, birthday numerology"
        canonicalUrl="/celebrity-birthday"
        ogType="website"
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* 1 · HERO — input-only DOB → /birthday-report?dob= */}
      <section style={{ background: IVORY, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-9 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Birthday Fun &amp; Celebrity Twins</div>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: serif, color: INK }}>
              Everything your birthday reveals.
            </h1>
            <p className="mt-3 text-lg" style={{ color: INK2 }}>
              Enter your birthday. See your celebrity twins, your zodiac and numerology snapshot,
              and what today actually says about you — all in one place.
            </p>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#fff', border: `1px solid ${DIV}` }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Your date of birth</label>
            <DobInput value={dob} onChange={setDob} label="" idPrefix="bc" />
            <button
              data-testid="bc-hero-submit"
              onClick={onSubmit}
              disabled={!valid}
              className="mt-4 w-full py-3 rounded font-semibold disabled:opacity-50"
              style={{ background: NAVY, color: '#fff' }}
            >
              See my birthday results →
            </button>
            <p className="mt-2 text-xs text-center" style={{ color: MUTE }}>
              Celebrity twins are free · full Birthday Blueprint ₹199
            </p>
          </div>
        </div>
      </section>

      {/* 2 · WHAT YOU GET */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>What you get</h2>
          <DenseRow testid="bc-what-you-get" items={[
            { title: 'Celebrity Birthday Twins', desc: 'Real people who share your exact birthday.', to: '/birthday-report' },
            { title: 'Browse All Celebrity Birthdays', desc: 'Explore the full celebrity birthday index.', to: '/celebrity' },
            { title: "Today's Birthdays", desc: "Who's celebrating today, right now.", to: '/todays-birthdays' },
            { title: 'Zodiac & Numerology Snapshot', desc: 'Your Western sign and Life Path number, instantly.', to: '/age-calculator' },
            { title: 'Vedic Rashi & Nakshatra', desc: 'The Vedic equivalent of your sign.', to: '/vedic-astrology' },
          ]} />
        </div>
      </section>

      {/* 3 · GO DEEPER */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>Go deeper</h2>
          <DenseRow testid="bc-go-deeper" items={[
            { title: 'Chinese Zodiac', desc: 'Your animal sign and what it means.', to: '/chinese-zodiac' },
            { title: 'Life Path Number', desc: 'Your full numerology breakdown.', to: '/numerology' },
            { title: 'Full Vedic Kundli', desc: 'Your real sidereal birth chart.', to: '/vedic-astrology' },
            { title: 'Complete Birthday Blueprint', desc: 'The full personalised PDF report.', to: '/birthday-report' },
          ]} />
        </div>
      </section>

      {/* 4 · HOW IT WORKS */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['1', 'Enter your birthday', 'Just your date of birth — nothing else needed.'],
            ['2', 'See your instant results', 'Celebrity twins, zodiac and numerology, free.'],
            ['3', 'Go deeper into any of them', 'Chinese zodiac, full numerology, or your Vedic chart.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ borderLeft: `2px solid ${GOLD}` }} className="pl-4">
              <div className="text-2xl font-bold" style={{ color: GOLD, fontFamily: serif }}>{n}</div>
              <div className="mt-1 text-lg font-semibold" style={{ fontFamily: serif }}>{t}</div>
              <div className="mt-1 text-sm" style={{ color: '#C7CFDA' }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · SEE A REAL EXAMPLE (real data: Oct 2 → Libra, Life Path 9 for Gandhi 1869-10-02) */}
      <section style={{ background: IVORY }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: serif, color: INK }}>See a real example</h2>
          <div data-testid="bc-example" className="grid grid-cols-1 sm:grid-cols-3" style={{ border: `1px solid ${DIV}` }}>
            {([
              ['Date', 'October 2'],
              ['Western zodiac', 'Libra ♎'],
              ['Life Path (2 Oct 1869)', '9'],
            ] as Array<[string, string]>).map(([label, value], i) => (
              <div key={label} className="p-4" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${DIV}`, background: '#fff' }}>
                <div className="text-[11px] uppercase tracking-wider" style={{ color: MUTE }}>{label}</div>
                <div className="mt-1 font-semibold" style={{ color: INK, fontFamily: serif }}>{value}</div>
              </div>
            ))}
            <div className="col-span-1 sm:col-span-3 p-4" style={{ background: '#fff', borderTop: `1px solid ${DIV}` }}>
              <div className="text-[11px] uppercase tracking-wider" style={{ color: MUTE }}>Celebrity birthday twins (born October 2)</div>
              <div className="mt-1 font-semibold" style={{ color: INK, fontFamily: serif }}>
                Mahatma Gandhi (1869) · Lovlina Borgohain (1997) · Hina Khan (1987)
              </div>
            </div>
            <p className="col-span-1 sm:col-span-3 px-4 py-3 text-sm" style={{ color: INK2, background: IVORY, borderTop: `1px solid ${DIV}` }}>
              Real celebrities, real dates, real math — the zodiac and Life Path here are computed, and every name is a real person born on this date.
            </p>
          </div>
        </div>
      </section>

      {/* 6 · PROOF OF SUBSTANCE (exact brief line) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-base md:text-lg" style={{ color: INK2 }}>
            <strong style={{ color: INK }}>Real celebrities, real dates, real math</strong> — your numerology and zodiac
            results are calculated, not templated. And if you want to go past the fun stuff, your exact birth time and
            place unlock a full Vedic chart most birthday sites don’t offer at all.
          </p>
        </div>
      </section>

      {/* 7 · COMMON QUESTIONS */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: serif, color: INK }}>Common questions</h2>
          <div className="space-y-3">
            {faqs.map(([q, a]) => (
              <p key={q} style={{ color: INK2, borderTop: `1px solid ${DIV}`, paddingTop: '0.75rem' }}>
                <strong style={{ color: INK }}>{q}</strong> {a}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · EXPLORE BY TOPIC */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: MUTE }}>Explore by topic</h2>
          <p className="text-base leading-loose" data-testid="bc-explore">
            {([
              ['Celebrity Birthday Twins', '/birthday-report'], ["Today's Birthdays", '/todays-birthdays'],
              ['Numerology', '/numerology'], ['Western Zodiac', '/zodiac'], ['Chinese Zodiac', '/chinese-zodiac'],
              ['Age Calculator', '/age-calculator'], ['Born On any date', '/born-on'],
            ] as Array<[string, string]>).map(([label, to], i, arr) => (
              <span key={label}>
                <Link to={to} className="font-medium hover:underline" style={{ color: NAVY }}>{label}</Link>
                {i < arr.length - 1 && <span style={{ color: MUTE }}> · </span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 9 · REVERSE FUNNEL → Vedic */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold" style={{ fontFamily: serif, color: INK }}>Your birthday is just the surface.</h2>
          <p className="mt-2 max-w-3xl" style={{ color: INK2 }}>
            Your exact birth time and place reveal a real Vedic chart — Lagna, Nakshatra, planetary Dasha timing —
            most birthday sites don’t touch. See what BornClock’s Vedic Astrology tools show you.
          </p>
          <Link to="/vedic-astrology" className="mt-3 inline-block font-semibold hover:underline" style={{ color: NAVY }}>
            Explore Vedic Astrology →
          </Link>
        </div>
      </section>

      {/* 10 · FINAL CTA — real Birthday Blueprint purchase flow */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: serif }}>Want the complete picture?</h2>
          <Link to="/birthday-report" data-testid="bc-final-cta" className="mt-4 inline-block px-6 py-3 rounded font-semibold" style={{ background: GOLD, color: NAVY }}>
            Unlock your Birthday Blueprint — ₹199 →
          </Link>
          <p className="mt-3 text-sm" style={{ color: '#C7CFDA' }}>Premium members: covered by your monthly credits (3/month).</p>
        </div>
      </section>

      {/* footer */}
      <footer style={{ background: NAVY, color: '#C7CFDA' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>© {'2026'} BornClock · Real celebrities, real dates, real math.</span>
          <span className="flex gap-4">
            <Link to="/how-it-works" className="hover:underline" style={{ color: '#fff' }}>Methodology</Link>
            <Link to="/privacy" className="hover:underline" style={{ color: '#fff' }}>Privacy</Link>
            <Link to="/contact" className="hover:underline" style={{ color: '#fff' }}>Contact</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
