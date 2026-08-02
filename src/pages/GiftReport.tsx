import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PageFAQ } from '@/components/PageFAQ';
import { SharePageBar } from '@/components/SharePageBar';
import { useReportPrice } from '@/hooks/useCurrency';
import { postsForTags } from '@/lib/mesh';
import { PLANET_COUNT } from '@/lib/reportFacts';
import { ArrowRightCircle, Gift, Check, Clock, ShieldCheck, Infinity as InfinityIcon } from 'lucide-react';

// What the recipient actually receives — the 9 numbered sections the report emits
// (enumerated in src/lib/reportFacts.ts from the ReportView section banners).
const SECTIONS: { n: string; title: string; sub: string }[] = [
  { n: '01', title: 'Celebrity Birthday Twins', sub: 'The famous people who share their exact date, ranked' },
  { n: '02', title: 'Zodiac Profile', sub: 'Western, Chinese & Vedic — plus moon sign & nakshatra' },
  { n: '03', title: 'Numerology & Life Path', sub: 'Life Path number and Personal Year forecast' },
  { n: '04', title: 'Name Numerology', sub: 'What the letters of their name add up to' },
  { n: '05', title: 'Tarot Arcana', sub: 'The Major Arcana card tied to their birth' },
  { n: '06', title: 'Cosmic Connections', sub: 'Birthstone & birth flower, with the lore behind them' },
  { n: '07', title: 'Solar System Ages', sub: `Their age across all ${PLANET_COUNT} planets` },
  { n: '08', title: 'Generation Portrait', sub: 'Where they fit in history' },
  { n: '09', title: 'Life Rhythms', sub: 'Their biorhythm cycles, framed honestly' },
];

const OCCASIONS = [
  { emoji: '🎂', label: 'Milestone birthdays', note: '18th, 21st, 30th, 40th, 50th, 60th — the ones that deserve more than a card' },
  { emoji: '👵', label: 'Parents & grandparents', note: 'People who already have everything they need' },
  { emoji: '❤️', label: 'Partners', note: 'A gift that says you pay attention to who they are' },
  { emoji: '✈️', label: 'Long-distance friends', note: 'Instant delivery, no shipping, arrives the moment you send it' },
];

// Concrete emotional moments — the whole point is the FEELING, not the object.
// Specific, warm, and true to what the report is (a keepsake, never a prediction).
const MOMENTS = [
  { emoji: '👴', title: 'A father reads his own story', body: 'He opens it expecting a novelty and finds his birth date laid out like a life — the twins who share it, the era he was shaped by, the small cosmic facts of the day he arrived. He goes quiet. That quiet is the gift.' },
  { emoji: '🌏', title: 'A friend abroad opens it on the day', body: 'You couldn’t be there for the birthday. But at midnight their time, a link lands — proof you counted the hours and thought about exactly who they are, not just that a date rolled around.' },
  { emoji: '💐', title: 'A partner sees you noticed', body: 'They scroll to their birth flower and birthstone and realise you didn’t just buy something — you looked up the details of the day they were born. It’s the difference between a present and being paid attention to.' },
];

export default function GiftReport() {
  const reportPrice = useReportPrice();
  const meshPosts = postsForTags(['celebrity', 'birthday', 'gift', 'zodiac'], 2);

  const faqs = [
    { question: 'Is the Birthday Blueprint a good gift?', answer: `It is a personalised, ${9}-section keepsake built from one person's birth date — celebrity twins, zodiac, numerology, birthstone, tarot, planetary ages and more, from ${reportPrice}. It works best as a thoughtful gift for someone hard to shop for, because it shows real care — the kind of attention that makes someone feel genuinely seen. It is a keepsake and conversation starter, not a prediction.` },
    { question: 'How is it delivered?', answer: 'Instantly, online. You generate it from their birth date and get a private link (and a downloadable PDF) — nothing ships, so it works for last-minute and long-distance gifts.' },
    { question: 'Do they need an account?', answer: 'No. They open the link and read it. There is nothing to sign up for.' },
    { question: 'What if I am not happy with it?', answer: 'There is a 7-day guarantee — if the report is not what you expected, contact us within 7 days for a refund.' },
    { question: 'Is any of it a prediction about their future?', answer: 'No. The report is a keepsake and a conversation starter drawn from birth-date facts, astrology and numerology traditions, and playful cosmic maths. It is explicitly not a forecast of what will happen to them.' },
    { question: 'How much does it cost?', answer: `A one-time ${reportPrice} — no subscription, permanent access to the link.` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Gift a Birthday Blueprint — A Gift That Makes Them Feel Truly Special | BornClock"
        description="A birthday gift that says: I pay attention to you. The Birthday Blueprint is a personalised 9-section keepsake built from their birth date — celebrity twins, zodiac, numerology, birthstone and more. Instant delivery."
        keywords="birthday gift, personalised birthday gift, meaningful birthday gift, thoughtful gift, gift that shows you care, gift for someone who has everything, birthday keepsake"
        canonicalUrl="/gift"
      />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* 1 — HERO */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-5">
          <Gift className="w-4 h-4" /> The Birthday Blueprint
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          A gift that makes them feel truly special
        </h1>
        {/* Answer-first (AEO) */}
        <p className="text-lg text-gray-700 leading-relaxed mb-6 max-w-2xl mx-auto">
          The Birthday Blueprint is a personalised, 9-section keepsake built from one person's
          birth date — celebrity twins, zodiac, numerology, birthstone, tarot and more, from{' '}
          <strong className="text-gray-900">{reportPrice}</strong>, delivered instantly. It's a way to
          say <em>I pay attention to you</em> — a gift built entirely around them, so they open it and
          feel noticed, valued and cared for. A keepsake and conversation starter, never a prediction.
        </p>
        <Link to="/birthday-report" className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-7 py-3.5 font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowRightCircle className="w-5 h-5" /> Create their Blueprint — {reportPrice}
        </Link>
        <div className="mt-6"><SharePageBar path="/gift" title="Gift a Birthday Blueprint" text="A birthday gift that makes them feel truly seen — a personalised keepsake from BornClock" className="justify-center" /></div>
      </section>

      {/* 2 — THE PROBLEM */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-lg text-gray-800 leading-relaxed">
            Most gifts are about the occasion. This one is about <em>them</em>. Anyone can buy a present;
            a Blueprint says <em>"I pay attention to you"</em> — built from the one date that's entirely
            theirs, so what they feel when they open it isn't "nice, a gift," but "someone really sees me."
          </p>
        </div>
      </section>

      {/* 2.5 — EMOTIONAL MOMENTS (the feeling, not the object) */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What it actually feels like to give</h2>
        <p className="text-gray-500 text-center mb-6 max-w-xl mx-auto">The Blueprint isn’t really about zodiac charts. It’s about the moment someone realises you <em>saw</em> them.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {MOMENTS.map(m => (
            <div key={m.title} className="border border-gray-200 rounded-2xl p-5">
              <div className="text-3xl mb-2">{m.emoji}</div>
              <p className="font-semibold text-gray-900 mb-1">{m.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — WHAT THEY RECEIVE */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What they actually receive</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SECTIONS.map(s => (
            <div key={s.n} className="flex gap-3 border border-gray-200 rounded-xl p-4">
              <span className="text-sm font-black text-indigo-300">{s.n}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — VISUAL / LIVE EXAMPLE */}
      <section className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8">
          <p className="text-sm text-gray-600 mb-3">Every Blueprint is a designed, shareable keepsake — a private web page plus a downloadable PDF.</p>
          <Link to="/birthday-report" className="text-indigo-600 font-semibold hover:underline">See what's inside a Birthday Blueprint →</Link>
        </div>
      </section>

      {/* 5 — OCCASIONS */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">When it lands best</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {OCCASIONS.map(o => (
            <div key={o.label} className="border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1">{o.emoji} {o.label}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{o.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 — TESTIMONIALS (PLACEHOLDER — founder to fill) */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-400">
          <p className="text-sm font-semibold uppercase tracking-wide mb-1">Testimonials — placeholder</p>
          <p className="text-sm">Founder to add real customer quotes here. (No invented testimonials.)</p>
        </div>
      </section>

      {/* 7 — OBJECTION HANDLING */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">Instant delivery</p>
            <p className="text-xs text-gray-500">A private link the moment you create it — nothing ships.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <ShieldCheck className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">7-day guarantee</p>
            <p className="text-xs text-gray-500">Not what you expected? Contact us within 7 days for a refund.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <InfinityIcon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">Permanent access</p>
            <p className="text-xs text-gray-500">The link keeps working — a keepsake, not a one-time view.</p>
          </div>
        </div>
      </section>

      {/* 8 — REPEAT CTA */}
      <section className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Give a gift only you could give</h2>
        <p className="text-gray-600 mb-5">One-time {reportPrice}. No subscription. Delivered instantly.</p>
        <Link to="/birthday-report" className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-7 py-3.5 font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowRightCircle className="w-5 h-5" /> Create their Blueprint — {reportPrice}
        </Link>
      </section>

      {/* 9 — FAQ (visible + in-body FAQPage schema) */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <PageFAQ title="Gifting a Birthday Blueprint — FAQ" items={faqs} />
      </div>

      {/* Mesh */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related reading</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {meshPosts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ {p.title}</Link>
          ))}
          <Link to="/birthday-report" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Create a Birthday Report</Link>
          <Link to="/celebrity-birthday" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Celebrity birthday match</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
