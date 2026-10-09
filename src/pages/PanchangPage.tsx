import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { computeDayPanchang, PANCHANG_CITIES, type TimeWindow } from '@/lib/vedic/panchangDay';

const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];
const KARANA_FIXED_END = ['Shakuni', 'Chatushpada', 'Naga'];
function karanaName(i: number): string {
  if (i <= 0) return 'Kimstughna';
  if (i >= 57) return KARANA_FIXED_END[Math.min(2, i - 57)];
  return KARANA_MOVABLE[(i - 1) % 7];
}

const QUALITY_STYLE: Record<TimeWindow['quality'], string> = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  neutral: 'bg-slate-50 border-slate-200 text-slate-700',
  bad: 'bg-rose-50 border-rose-200 text-rose-800',
};

function ChoghadiyaRow({ c }: { c: TimeWindow }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${QUALITY_STYLE[c.quality]}`}>
      <span className="font-medium">{c.name}</span>
      <span className="tabular-nums">{c.start}–{c.end}</span>
    </div>
  );
}

export default function PanchangPage() {
  const { city: cityParam } = useParams<{ city?: string }>();
  const initial = PANCHANG_CITIES.find(c => c.slug === cityParam) || PANCHANG_CITIES[0];
  const [citySlug, setCitySlug] = useState(initial.slug);
  const city = PANCHANG_CITIES.find(c => c.slug === citySlug) || PANCHANG_CITIES[0];

  const todayKey = new Date().toISOString().slice(0, 10);
  const p = useMemo(
    () => computeDayPanchang(new Date(), city.lat, city.lon, city.tz, city.name),
    [city.slug, todayKey],
  );

  const dateNice = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const faqItems = [
    { question: 'What is Panchang?', answer: 'Panchang ("five limbs") is the Vedic almanac for a day: the Tithi (lunar day), Nakshatra (Moon\'s star), Yoga, Karana and Vara (weekday). It is used to understand the quality of a day and to choose auspicious timing.' },
    { question: 'What is Rahu Kaal?', answer: 'Rahu Kaal is a roughly 90-minute window each day traditionally considered inauspicious for starting important work. It is one of the eight equal parts of daylight, with the part depending on the weekday — so it is computed here from the real sunrise and sunset for your city.' },
    { question: 'What is Choghadiya?', answer: 'Choghadiya divides the day and night into eight parts each, labelled Amrit, Shubh, Labh (good), Char (neutral) and Udveg, Kaal, Rog (avoid). It is a quick, popular way to pick a good hour for a task.' },
    { question: 'How accurate are the timings?', answer: 'Sunrise, sunset and all derived windows are computed from the real astronomical position of the Sun for your city\'s latitude and longitude. Compare against an established Panchang (e.g. Drik Panchang) and they should agree to within a minute or two.' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="panchang-page"
      seo={<SEO
        title={`Today's Panchang${city ? ` for ${city.name}` : ''} — Tithi, Nakshatra, Rahu Kaal & Choghadiya | BornClock`}
        description={`Today's Panchang for ${city.name}: Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, Rahu Kaal, Gulika, Yamaganda and the day & night Choghadiya — computed from real sunrise/sunset.`}
        canonicalUrl={cityParam ? `/panchang/${city.slug}` : '/panchang'}
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: `Panchang · ${city.name}` }}
      footer={{ tagline: 'Daily Panchang computed from real sunrise and sunset.', nav: [{ label: 'Muhurat', to: '/muhurat' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Free Kundli', to: '/kundali' }] }}
      eyebrow="Panchang"
      h1={`Today's Panchang — ${city.name}`}
      lead={dateNice}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <p className="text-sm mb-4">
            <Link to="/hi/panchang" className="text-primary hover:underline">हिन्दी में देखें →</Link>
          </p>
          {/* City selector */}
          <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="panchang-cities">
            <span className="text-sm text-muted-foreground">City:</span>
            {PANCHANG_CITIES.map(c => (
              <button
                key={c.slug}
                onClick={() => setCitySlug(c.slug)}
                className={`px-3 py-1 rounded-lg border text-sm ${c.slug === city.slug ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Five limbs */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="panchang-limbs">
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="tithi">Tithi</TermTip></div>
              <div className="font-semibold text-foreground">{p.tithiName} <span className="text-muted-foreground font-normal">(<TermTip id="paksha">{p.paksha} Paksha</TermTip>)</span></div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="nakshatra">Nakshatra</TermTip></div>
              <div className="font-semibold text-foreground">{p.nakshatra}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="panchangYoga">Yoga</TermTip></div>
              <div className="font-semibold text-foreground">{p.yoga}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">Karana · Vara</div>
              <div className="font-semibold text-foreground">{karanaName(p.karana)} · {p.weekday}</div>
            </div>
          </div>

          {/* Sun + inauspicious windows */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-border p-4" data-testid="panchang-sun">
              <h2 className="font-semibold text-foreground mb-2">Sun</h2>
              <div className="text-sm text-muted-foreground">Sunrise <strong className="text-foreground tabular-nums">{p.sunrise}</strong> · Sunset <strong className="text-foreground tabular-nums">{p.sunset}</strong></div>
            </div>
            <div className="rounded-xl border border-border p-4" data-testid="panchang-windows">
              <h2 className="font-semibold text-foreground mb-2">Inauspicious windows</h2>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between"><span><TermTip id="rahuKalam">Rahu Kaal</TermTip></span><span className="tabular-nums text-rose-700">{p.rahuKaal.start}–{p.rahuKaal.end}</span></li>
                <li className="flex justify-between"><span>Gulika Kaal</span><span className="tabular-nums">{p.gulikaKaal.start}–{p.gulikaKaal.end}</span></li>
                <li className="flex justify-between"><span>Yamaganda</span><span className="tabular-nums">{p.yamaganda.start}–{p.yamaganda.end}</span></li>
              </ul>
            </div>
          </div>

          {/* Choghadiya */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8" data-testid="panchang-choghadiya">
            <div>
              <h2 className="font-semibold text-foreground mb-2">Day <TermTip id="choghadiya">Choghadiya</TermTip></h2>
              <div className="space-y-1">{p.dayChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} />)}</div>
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-2">Night Choghadiya</h2>
              <div className="space-y-1">{p.nightChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} />)}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            Sunrise, sunset and every window are computed from the real astronomical position of the Sun for {city.name}'s coordinates, and the five limbs from the sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) Sun and Moon — the same engine behind your Kundli.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Choosing a date for something important? Find an auspicious muhurat.</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat finder →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
