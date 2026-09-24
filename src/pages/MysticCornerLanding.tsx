/**
 * Mystic Corner category landing — /mystic-corner (Part AG).
 *
 * Bespoke hub for personality/divination systems that aren't classical Vedic and aren't
 * birthday-specific: numerology, Western zodiac, Chinese zodiac, tarot, compatibility.
 * Rebuilds the prior shared-template page into the same navy/gold/ivory + Fraunces/Public
 * Sans dense layout shipped on /vedic-astrology and /celebrity-birthday (scoped to this
 * page; homepage/others untouched).
 *
 * HERO: input-only DOB form → navigates to the VERIFIED /birthday-report?dob=YYYY-MM-DD
 * deep-link (which computes Life Path numerology + Western zodiac from the DOB). /numerology
 * has no ?dob= deep-link and the app deliberately doesn't persist DOB, so this reuses a real
 * working flow rather than duplicating calc logic — the conservative choice. See part-ag-flags.
 *
 * §5 example is REAL: Sachin Tendulkar (24 Apr 1973, real DOB in celebrities.json) →
 * Taurus (calculateWesternZodiac) + Life Path 3 (calculateLifePathNumber). Not fabricated.
 *
 * Every linked tool is a confirmed-real route: /numerology, /name-numerology, /zodiac,
 * /chinese-zodiac, /tarot-card-by-birthday, /compatibility.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { DobInput, type DobValue } from '@/components/DobInput';

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

export default function MysticCornerLanding() {
  const navigate = useNavigate();
  const [dob, setDob] = useState<DobValue>({ day: '', month: '', year: '' });
  const valid = /^\d{1,2}$/.test(dob.day) && /^\d{1,2}$/.test(dob.month) && /^\d{4}$/.test(dob.year)
    && Number(dob.month) >= 1 && Number(dob.month) <= 12 && Number(dob.day) >= 1 && Number(dob.day) <= 31;
  const onSubmit = () => {
    if (!valid) return;
    const iso = `${dob.year}-${dob.month.padStart(2, '0')}-${dob.day.padStart(2, '0')}`;
    navigate(`/birthday-report?dob=${encodeURIComponent(iso)}`);
  };

  const faqs: Array<[string, string]> = [
    ['How is numerology calculated?',
     'Your Life Path number is derived from your full date of birth by reducing its digits to a single digit (with 11, 22 and 33 kept as master numbers). It’s deterministic arithmetic — the same date always gives the same number — not a random or hand-written result.'],
    ['Are Western and Vedic zodiac signs the same thing?',
     'No — and it’s worth being honest about this. Your Western (tropical) sun sign is based on the season; your Vedic (sidereal) Rashi is based on the Moon’s actual constellation and often comes out as a different sign. This page shows the Western side; the Vedic Rashi lives on the Vedic Astrology page, computed from real sidereal astronomy.'],
    ['How is this different from a generic daily horoscope?',
     'A generic horoscope writes one paragraph per sun-sign for millions of people. Here, your numerology is computed from your own birth date and your zodiac from your exact day — calculated each time, not a pre-written template recycled for everyone born that month.'],
  ];

  return (
    <div data-testid="mystic-corner-page" style={{ background: '#fff', color: INK, fontFamily: sans }}>
      <SEO
        title="Mystic Corner — Numerology, Zodiac & Chinese Sign | BornClock"
        description="The mystical side of your birth date: numerology Life Path, Western zodiac, Chinese zodiac, tarot and compatibility — each one actually computed, not a templated horoscope."
        keywords="numerology, life path number, western zodiac, chinese zodiac, tarot by birthday, name numerology, compatibility"
        canonicalUrl="/mystic-corner"
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

      {/* 1 · HERO */}
      <section style={{ background: IVORY, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-9 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Mystic Corner</div>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: serif, color: INK }}>
              The mystical side of your birth date.
            </h1>
            <p className="mt-3 text-lg" style={{ color: INK2 }}>
              Numerology, your zodiac sign, and more — multiple systems, each one actually computed,
              not copy-pasted from a generic horoscope.
            </p>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#fff', border: `1px solid ${DIV}` }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: INK }}>Your date of birth</label>
            <DobInput value={dob} onChange={setDob} label="" idPrefix="mc" />
            <button data-testid="mc-hero-submit" onClick={onSubmit} disabled={!valid}
              className="mt-4 w-full py-3 rounded font-semibold disabled:opacity-50" style={{ background: NAVY, color: '#fff' }}>
              Reveal my numbers &amp; signs →
            </button>
            <p className="mt-2 text-xs text-center" style={{ color: MUTE }}>Numerology &amp; zodiac computed from your date</p>
          </div>
        </div>
      </section>

      {/* 2 · WHAT YOU GET (real tools) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>What you get</h2>
          <DenseRow testid="mc-what-you-get" items={[
            { title: 'Numerology (Life Path)', desc: 'Your Life Path number, computed from your date.', to: '/numerology' },
            { title: 'Western Zodiac', desc: 'Your sun sign, its element and traits.', to: '/zodiac' },
            { title: 'Chinese Zodiac', desc: 'Your animal sign and its meaning.', to: '/chinese-zodiac' },
            { title: 'Tarot by Birthday', desc: 'Your birth-card from your date.', to: '/tarot-card-by-birthday' },
            { title: 'Name Numerology', desc: 'The numbers behind your name.', to: '/name-numerology' },
          ]} />
        </div>
      </section>

      {/* 3 · GO DEEPER (thin — only what's genuinely real beyond the basics) */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>Go deeper</h2>
          <DenseRow testid="mc-go-deeper" items={[
            { title: 'Name Numerology', desc: 'Beyond Life Path — your name’s numbers.', to: '/name-numerology' },
            { title: 'Compatibility', desc: 'How two dates line up, by the numbers.', to: '/compatibility' },
          ]} />
        </div>
      </section>

      {/* 4 · HOW IT WORKS */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['1', 'Enter your birth date', 'Just your date — the systems do the rest.'],
            ['2', 'See your numbers & signs', 'Life Path, zodiac and more, actually computed.'],
            ['3', 'Go deeper into any system', 'Name numerology, Chinese zodiac, tarot or compatibility.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ borderLeft: `2px solid ${GOLD}` }} className="pl-4">
              <div className="text-2xl font-bold" style={{ color: GOLD, fontFamily: serif }}>{n}</div>
              <div className="mt-1 text-lg font-semibold" style={{ fontFamily: serif }}>{t}</div>
              <div className="mt-1 text-sm" style={{ color: '#C7CFDA' }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · SEE A REAL EXAMPLE (real: Sachin Tendulkar 24 Apr 1973) */}
      <section style={{ background: IVORY }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: serif, color: INK }}>See a real example</h2>
          <div data-testid="mc-example" className="grid grid-cols-1 sm:grid-cols-3" style={{ border: `1px solid ${DIV}` }}>
            {([
              ['Born', 'Sachin Tendulkar · 24 Apr 1973'],
              ['Western zodiac', 'Taurus ♉'],
              ['Life Path number', '3'],
            ] as Array<[string, string]>).map(([label, value], i) => (
              <div key={label} className="p-4" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${DIV}`, background: '#fff' }}>
                <div className="text-[11px] uppercase tracking-wider" style={{ color: MUTE }}>{label}</div>
                <div className="mt-1 font-semibold" style={{ color: INK, fontFamily: serif }}>{value}</div>
              </div>
            ))}
            <p className="col-span-1 sm:col-span-3 px-4 py-3 text-sm" style={{ color: INK2, background: IVORY, borderTop: `1px solid ${DIV}` }}>
              Real person, real date, real math — the zodiac and Life Path here are computed from an actual, verifiable birth date, not invented.
            </p>
          </div>
        </div>
      </section>

      {/* 6 · PROOF OF SUBSTANCE */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-base md:text-lg" style={{ color: INK2 }}>
            <strong style={{ color: INK }}>Real calculations, not templated horoscopes</strong> — your numerology is
            computed from your actual birth date, every time.
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
          <p className="text-base leading-loose" data-testid="mc-explore">
            {([
              ['Numerology', '/numerology'], ['Name Numerology', '/name-numerology'], ['Western Zodiac', '/zodiac'],
              ['Chinese Zodiac', '/chinese-zodiac'], ['Tarot by Birthday', '/tarot-card-by-birthday'], ['Compatibility', '/compatibility'],
            ] as Array<[string, string]>).map(([label, to], i, arr) => (
              <span key={label}>
                <Link to={to} className="font-medium hover:underline" style={{ color: NAVY }}>{label}</Link>
                {i < arr.length - 1 && <span style={{ color: MUTE }}> · </span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 9 · CROSS-LINKS BOTH DIRECTIONS */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ borderLeft: `2px solid ${GOLD}` }} className="pl-4">
            <h3 className="text-lg font-bold" style={{ fontFamily: serif, color: INK }}>Want the classical, computed version?</h3>
            <p className="mt-1 text-sm" style={{ color: INK2 }}>Your Vedic chart uses real sidereal astronomy — Rashi, Nakshatra, Dasha timing.</p>
            <Link to="/vedic-astrology" className="mt-2 inline-block font-semibold hover:underline" style={{ color: NAVY }}>Explore Vedic Astrology →</Link>
          </div>
          <div style={{ borderLeft: `2px solid ${GOLD}` }} className="pl-4">
            <h3 className="text-lg font-bold" style={{ fontFamily: serif, color: INK }}>Curious who shares your birthday?</h3>
            <p className="mt-1 text-sm" style={{ color: INK2 }}>Find your celebrity birthday twins and what your date says about you.</p>
            <Link to="/celebrity-birthday" className="mt-2 inline-block font-semibold hover:underline" style={{ color: NAVY }}>Birthday &amp; Celebrity Twins →</Link>
          </div>
        </div>
      </section>

      {/* 10 · FINAL CTA — real applicable product (Birthday Blueprint includes numerology) */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: serif }}>Want it all in one report?</h2>
          <p className="mt-2 max-w-2xl mx-auto" style={{ color: '#C7CFDA' }}>
            Your numerology, zodiac and more come together in the full Birthday Blueprint — one personalised report for your date.
          </p>
          <Link to="/birthday-report" data-testid="mc-final-cta" className="mt-4 inline-block px-6 py-3 rounded font-semibold" style={{ background: GOLD, color: NAVY }}>
            Get your Birthday Blueprint — ₹199 →
          </Link>
          <p className="mt-3 text-sm" style={{ color: '#C7CFDA' }}>Premium members: covered by your monthly credits.</p>
        </div>
      </section>

      <footer style={{ background: NAVY, color: '#C7CFDA' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>© {'2026'} BornClock · Real calculations, not templated horoscopes.</span>
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
