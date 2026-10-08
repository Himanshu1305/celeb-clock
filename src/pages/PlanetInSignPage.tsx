import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  PLANETS, PLANET_SLUGS, SIGNS, placementInSign,
  type Strength, type PlanetSlug,
} from '@/lib/vedic/planetPlacements';

const STRENGTH_STYLE: Record<Strength, string> = {
  strong: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  moderate: 'bg-sky-100 text-sky-800 border-sky-300',
  mild: 'bg-slate-100 text-slate-700 border-slate-300',
  challenged: 'bg-amber-100 text-amber-800 border-amber-300',
};

export default function PlanetInSignPage() {
  const { planet: planetParam, sign: signParam } = useParams<{ planet: string; sign: string }>();
  const planetValid = PLANET_SLUGS.includes(planetParam as PlanetSlug);
  const data = planetValid && signParam ? placementInSign(planetParam as PlanetSlug, signParam) : null;

  // Hub
  if (!planetParam || !signParam || !data) {
    return (
      <ToolLayout
        theme="vedic"
        testId="planet-in-sign-hub"
        seo={<SEO title="Planet in Sign — All 9 Planets Through 12 Rashis | BornClock" description="What each of the 9 Vedic planets means in each of the 12 signs — dignity (exalted, debilitated, own), strength and a graded, plain-language reading. 108 placements." canonicalUrl="/planet-in-sign" ogImage="https://bornclock.com/og/vedic.png" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Planet in sign' }}
        footer={{ tagline: 'Every planet in every sign, with real dignity.', nav: [{ label: 'Planet in house', to: '/planet-in-house' }, { label: 'Free Kundli', to: '/kundali' }] }}
        eyebrow="Vedic placements"
        h1="Planet in Sign — all 108 placements"
        lead="Choose a planet and sign to see its dignity (exalted, own, friendly, debilitated), its strength, and what the tradition reads into it."
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {PLANET_SLUGS.map(p => (
              <div key={p} className="mb-5">
                <h2 className="font-semibold text-foreground mb-2">{PLANETS[p].name} <span className="text-muted-foreground font-normal text-sm">({PLANETS[p].sanskrit}) — {PLANETS[p].karaka}</span></h2>
                <div className="flex flex-wrap gap-2">
                  {SIGNS.map(s => {
                    const pl = placementInSign(p, s.slug)!;
                    return (
                      <Link key={s.slug} to={`/planet-in-sign/${p}/${s.slug}`} className={`px-2.5 py-1 rounded-lg border text-xs ${STRENGTH_STYLE[pl.strength]}`} title={pl.dignityLine}>
                        {s.english}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-4">Colour shows strength: <span className="text-emerald-700">green = strong</span> (exalted / own / Moolatrikona), sky = friendly, grey = neutral, <span className="text-amber-700">amber = challenged</span> (enemy / debilitated).</p>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const { planet, sign, dignity, strength } = data;
  const title = `${planet.name} in ${sign.english} (${sign.sanskrit}) — Vedic Meaning | BornClock`;
  const description = `${planet.name} in ${sign.english}: ${data.dignityLine} Its strength, how ${sign.english} colours it, what it gives and the care points — a graded, plain-language Vedic reading.`;

  const otherSigns = SIGNS.filter(s => s.slug !== sign.slug);
  const faqItems = [
    { question: `Is ${planet.name} good or bad in ${sign.english}?`, answer: `${data.sections[0].text}` },
    { question: `Is this about my Sun sign or Moon sign?`, answer: `It applies wherever ${planet.name} actually sits in your birth chart — which you find from your date, time and place, not your Western Sun sign. Generate a free Kundli to see your real ${planet.name} sign.` },
    { question: `Does a debilitated planet always give bad results?`, answer: `No. Debilitation means the planet works harder, but a Neecha-Bhanga (cancellation of debilitation) can turn it into a source of strength. Vedic astrology always reads a placement in the context of the whole chart, never in isolation.` },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="planet-in-sign"
      seo={<SEO title={title} description={description} canonicalUrl={`/planet-in-sign/${planet.slug}/${sign.slug}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Planet in sign', to: '/planet-in-sign' }], current: data.headline }}
      footer={{ tagline: 'Traditional Vedic placements, read honestly.', nav: [{ label: 'All placements', to: '/planet-in-sign' }, { label: 'Planet in house', to: '/planet-in-house' }, { label: 'Free Kundli', to: '/kundali' }], note: 'A general, tradition-based reading — modified in your chart by house, aspects and Dasha. Not a fixed prediction.' }}
      eyebrow="Vedic placement"
      h1={data.headline}
      lead={data.dignityLine}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${STRENGTH_STYLE[strength]}`}>{strength} · {dignity}</span>
          </div>
          <p className="text-foreground leading-relaxed mb-6">{data.themeLine}</p>

          {data.sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-border p-4 mb-4">
              <h2 className="font-semibold text-foreground mb-1">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}

          <p className="text-xs text-muted-foreground my-6">
            Dignity is computed from the classical exaltation table and natural (<TermTip id="grahaMaitri">graha maitri</TermTip>) friendships.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">{planet.name} in other signs</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {otherSigns.map(s => (
              <Link key={s.slug} to={`/planet-in-sign/${planet.slug}/${s.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{s.english}</Link>
            ))}
          </div>

          <h2 className="font-semibold text-foreground mb-2">Other planets in {sign.english}</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {PLANET_SLUGS.filter(p => p !== planet.slug).map(p => (
              <Link key={p} to={`/planet-in-sign/${p}/${sign.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{PLANETS[p].name}</Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See where {planet.name} actually sits in <em>your</em> chart — sign, house and Dasha.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
