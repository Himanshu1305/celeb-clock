import { useParams, Navigate, Link } from 'react-router-dom';
import { CollectionLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import {
  VEDIC_SIGN_EXTENDED,
  RASHI_SLUG_TO_NAME,
  RASHI_SLUGS_ORDER,
  RASHI_NAME_TO_SLUG,
} from '@/services/VedicZodiacExtended';
import { VEDIC_SIGNS, currentAyanamsaDeg } from '@/services/VedicZodiacService';
import { RASHI_NAMES } from '@/lib/vedic/engine/vedicEngine';
// Batch 6: real Moon-sign examples (scripts/gen-rashi-moon-examples.mts), replacing
// the old list that was picked by Western SUN sign.
import RASHI_MOON_EXAMPLES from '@/data/rashiMoonExamples.json';

// N12: live Lahiri ayanamsa from the chart engine (not a fixed 23.85°).
const AYANAMSA_NOW = currentAyanamsaDeg().toFixed(2);

export default function VedicZodiacSign() {
  const { rashi } = useParams<{ rashi: string }>();
  const slug = (rashi || '').toLowerCase();
  const rashiName = RASHI_SLUG_TO_NAME[slug];
  const data = VEDIC_SIGN_EXTENDED[slug];

  if (!data || !rashiName) return <Navigate to="/vedic-zodiac" replace />;

  const signInfo = VEDIC_SIGNS.find((s) => s.name === rashiName);
  if (!signInfo) return <Navigate to="/vedic-zodiac" replace />;
  const engineRashi = RASHI_NAMES[VEDIC_SIGNS.indexOf(signInfo)];
  const moonExamples = (RASHI_MOON_EXAMPLES as Record<string, { global: { name: string; slug: string; born: number }[] }>)[engineRashi]?.global ?? [];

  const idx = RASHI_SLUGS_ORDER.indexOf(slug);
  const prevSlug = RASHI_SLUGS_ORDER[(idx - 1 + 12) % 12];
  const nextSlug = RASHI_SLUGS_ORDER[(idx + 1) % 12];
  const prevName = RASHI_SLUG_TO_NAME[prevSlug];
  const nextName = RASHI_SLUG_TO_NAME[nextSlug];
  const prevSign = VEDIC_SIGNS.find((s) => s.name === prevName);
  const nextSign = VEDIC_SIGNS.find((s) => s.name === nextName);

  // N12: sign-based gemstone answers are replaced by a pointer to the chart-based tool.
  const faq = data.faq.map((item) => (/gemstone|ratna/i.test(item.q)
    ? { q: item.q, a: `In Jyotish a gemstone is chosen from the whole birth chart (Lagna, house lordships and the running Dasha), not from the Rashi alone — so there is no single gemstone for every ${rashiName} native. Use BornClock's chart-based gemstone tool at /gemstones with your birth date, time and place, and consult a qualified astrologer before wearing any stone.` }
    : item));
  const faqItems = faq.map((item) => ({ question: item.q, answer: item.a }));

  return (
    <CollectionLayout
      theme="vedic"
      testId="vedic-zodiac-sign-page"
      seo={(
        <SEO
          title={`${rashiName} Rashi (${signInfo.english}) — Vedic Astrology Guide | BornClock`}
          description={`${rashiName} Rashi in Jyotish: personality, ruling planet ${signInfo.ruling_planet}, compatibility, and Ayurveda connection. Complete Vedic astrology guide.`}
          keywords={`${rashiName.toLowerCase()} rashi, ${slug} rashi, vedic ${signInfo.english.toLowerCase()}, jyotish ${rashiName.toLowerCase()}, ${signInfo.english.toLowerCase()} vedic astrology`}
          canonicalUrl={`/vedic-zodiac/${slug}`}
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Indian Zodiac (Vedic)', to: '/vedic-zodiac' }], current: `${rashiName} Rashi` }}
      footer={{
        tagline: `${rashiName} Rashi in Jyotish — personality, ruling planet, and Ayurveda connection.`,
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Moon Sign', to: '/moon-sign' },
          { label: 'Gemstones (chart-based)', to: '/gemstones' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
      eyebrow={`${signInfo.english} in Western Astrology`}
      h1={`${rashiName} Rashi`}
      lead={(
        <>
          Jyotish (Sanskrit: ज्योतिष) uses the sidereal zodiac corrected for the precession of equinoxes
          (Lahiri ayanamsa ≈ {AYANAMSA_NOW}° today) — making your Vedic rashi typically one sign earlier than your Western sign.
        </>
      )}
    >
      <FAQSchema items={faqItems} />
      <section className="section container mx-auto px-4 py-8">

        {/* Jyotish Authority Box */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-5 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🕉️</span>
            <div>
              <p className="text-sm font-semibold text-orange-800 mb-1">Vedic Jyotish — Ancient Indian Astrology</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Jyotish (Sanskrit: ज्योतिष) is the ancient Indian science of light and time, predating Western astrology by millennia.
                Unlike Western astrology, Jyotish uses the <strong>sidereal zodiac</strong> corrected for the precession of equinoxes
                (Lahiri ayanamsa ≈ {AYANAMSA_NOW}° today) — making your Vedic rashi typically one sign earlier than your Western sign.
              </p>
            </div>
          </div>
        </div>

        {/* Sign emblem + chips */}
        <div className="text-center py-8 max-w-3xl mx-auto mb-8">
          <div className="text-7xl mb-4">{signInfo.emoji}</div>
          <div className="text-3xl mb-2">{signInfo.symbol}</div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {signInfo.element} Element
            </span>
            <span className="px-3 py-1.5 bg-[#6E5AA6]/10 text-[#6E5AA6] rounded-full text-sm font-medium">
              Ruled by {signInfo.ruling_planet}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {signInfo.quality}
            </span>
            <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Sign {idx + 1} of 12
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">

          {/* Western comparison note */}
          <Card className="border-blue-200 bg-blue-50/40">
            <CardContent className="p-5">
              <p className="text-sm text-blue-900">
                <strong>Western vs Vedic:</strong> {rashiName} corresponds to Western {signInfo.english}, but due to the ~24° ayanamsa offset,
                your Vedic rashi spans different dates than your Western sun sign. Most people born under Western {signInfo.english} will find
                their Vedic rashi is actually <strong>{VEDIC_SIGNS[Math.max(0, idx - 1)]?.name ?? rashiName}</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Personality & Character</h2>
              {data.full_description.split('\n\n').map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{para}</p>
              ))}
            </CardContent>
          </Card>

          {/* Jyotish Tradition */}
          <Card className="glass-card border-amber-200 bg-amber-50/30">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-amber-900">📿 Jyotish Tradition</h2>
              <p className="text-amber-800 leading-relaxed">{data.jyotish_tradition}</p>
            </CardContent>
          </Card>

          {/* Strengths / Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 text-green-700">✅ Strengths</h2>
                <p className="text-muted-foreground leading-relaxed">{data.strengths_detail}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 text-amber-700">⚠️ Challenges</h2>
                <p className="text-muted-foreground leading-relaxed">{data.challenges_detail}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ruling Planet */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">🪐 Ruling Planet: {signInfo.ruling_planet}</h2>
              <p className="text-muted-foreground leading-relaxed">{data.ruling_planet_detail}</p>
            </CardContent>
          </Card>

          {/* Gemstones — N12: no sign-based gemstone advice; point to the chart-based tool */}
          <Card className="border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50" data-testid="vedic-sign-gemstone-pointer">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2 text-yellow-900">💎 Gemstones</h2>
              <p className="text-yellow-800 leading-relaxed">
                In Jyotish a gemstone is chosen from the whole birth chart — the Ascendant (Lagna), which planets
                rule helpful houses, and the running Dasha — not from a Sun sign or a single Rashi. A stone that
                suits one {rashiName} native can be wrong for another, so we don't give a {rashiName} gemstone here.
              </p>
              <Link to="/gemstones" className="inline-block mt-3 text-sm font-semibold text-yellow-900 underline">
                Get chart-based gemstone guidance from your birth details →
              </Link>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs font-medium text-yellow-700">Favorable Days:</span>
                {data.favorable_days.map((d) => (
                  <span key={d} className="px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded text-xs">{d}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ayurveda Connection */}
          <Card className="glass-card border-green-200 bg-green-50/30">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-green-800">🌿 Ayurveda Connection</h2>
              <p className="text-green-900 leading-relaxed">{data.ayurveda_connection}</p>
            </CardContent>
          </Card>

          {/* Love / Career */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">❤️ In Love</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.in_love}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">💼 In Career</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.in_career}</p>
              </CardContent>
            </Card>
          </div>

          {/* Compatible Rashis */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Compatible Rashis</h2>
              <div className="flex flex-wrap gap-2">
                {data.compatible_rashis.map((name) => {
                  const compatSlug = RASHI_NAME_TO_SLUG[name];
                  const compatSign = VEDIC_SIGNS.find((s) => s.name === name);
                  return (
                    <Link
                      key={name}
                      to={`/vedic-zodiac/${compatSlug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {compatSign?.emoji} {name}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Famous People */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Famous People with the Moon in {rashiName}</h2>
              <p className="text-xs text-muted-foreground mb-6">
                {rashiName} Rashi means the Moon (not the Sun) was in {rashiName} at birth. These people are listed only because the
                Moon stayed in {rashiName} for their whole birth date, so their birth time does not change it.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {moonExamples.map((p) => (
                  <Link key={p.slug} to={`/celebrity/${p.slug}`} className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50">
                    <div className="text-2xl mb-1">{signInfo.emoji}</div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">b. {p.born}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faq.map((item, i) => (
                  <div key={i} className="border-b border-border/40 pb-5 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prev / Next navigation */}
          <div className="flex justify-between items-center pt-4 pb-8">
            <Link
              to={`/vedic-zodiac/${prevSlug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              ← {prevSign?.emoji} {prevName}
            </Link>
            <Link to="/vedic-zodiac" className="text-sm text-muted-foreground hover:text-foreground">
              All Vedic Rashis
            </Link>
            <Link
              to={`/vedic-zodiac/${nextSlug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              {nextSign?.emoji} {nextName} →
            </Link>
          </div>
        </div>
      </section>
    </CollectionLayout>
  );
}
