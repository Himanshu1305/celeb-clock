import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  PLANETS, PLANET_SLUGS, HOUSES, placementInHouse, type PlanetSlug,
} from '@/lib/vedic/planetPlacements';

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function PlanetInHousePage() {
  const { planet: planetParam, house: houseParam } = useParams<{ planet: string; house: string }>();
  const planetValid = PLANET_SLUGS.includes(planetParam as PlanetSlug);
  const houseNum = Number(houseParam);
  const houseValid = Number.isInteger(houseNum) && houseNum >= 1 && houseNum <= 12;
  const data = planetValid && houseValid ? placementInHouse(planetParam as PlanetSlug, houseNum) : null;

  // Hub
  if (!planetParam || !houseParam || !data) {
    return (
      <ToolLayout
        theme="vedic"
        testId="planet-in-house-hub"
        seo={<SEO title="Planet in House — All 9 Planets Through 12 Houses | BornClock" description="What each of the 9 Vedic planets means in each of the 12 houses (bhavas) — the life area it activates, what it gives and the care points. 108 placements, plain language." canonicalUrl="/planet-in-house" ogImage="https://bornclock.com/og/vedic.png" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Planet in house' }}
        footer={{ tagline: 'Every planet in every house (bhava).', nav: [{ label: 'Planet in sign', to: '/planet-in-sign' }, { label: 'Free Kundli', to: '/kundali' }] }}
        eyebrow="Vedic placements"
        h1="Planet in House — all 108 placements"
        lead="Choose a planet and house to see which life area it activates, what it gives at its best, and where to take care."
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {PLANET_SLUGS.map(p => (
              <div key={p} className="mb-5">
                <h2 className="font-semibold text-foreground mb-2">{PLANETS[p].name} <span className="text-muted-foreground font-normal text-sm">({PLANETS[p].sanskrit}) — {PLANETS[p].karaka}</span></h2>
                <div className="flex flex-wrap gap-2">
                  {HOUSES.map(h => (
                    <Link key={h.num} to={`/planet-in-house/${p}/${h.num}`} className="px-2.5 py-1 rounded-lg border border-border text-xs text-foreground hover:bg-primary/5" title={h.theme}>
                      {ORD[h.num]} house
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </ToolLayout>
    );
  }

  const { planet, house } = data;
  const title = `${planet.name} in the ${ORD[house.num]} House — Vedic Meaning | BornClock`;
  const description = `${planet.name} in the ${ORD[house.num]} house (${house.sanskrit}): the life areas it activates (${house.areas.slice(0, 3).join(', ')}), what it gives and where to take care — a plain-language Vedic reading.`;

  const faqItems = [
    { question: `What does ${planet.name} in the ${ORD[house.num]} house mean?`, answer: `${data.sections[0].text}` },
    { question: `How do I know which house my ${planet.name} is in?`, answer: `It depends on your Ascendant (Lagna), which needs your birth date, time and place. Generate a free Kundli and it shows the house of every planet.` },
    { question: `Is this a prediction?`, answer: `No. It is a general, tradition-based reading. In your chart it is modified by the sign on the house, the house lord, aspects and your running Dasha. It never fixes an outcome and never names dates for sensitive events.` },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="planet-in-house"
      seo={<SEO title={title} description={description} canonicalUrl={`/planet-in-house/${planet.slug}/${house.num}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Planet in house', to: '/planet-in-house' }], current: data.headline }}
      footer={{ tagline: 'Traditional Vedic placements, read honestly.', nav: [{ label: 'All placements', to: '/planet-in-house' }, { label: 'Planet in sign', to: '/planet-in-sign' }, { label: 'Free Kundli', to: '/kundali' }], note: 'A general, tradition-based reading — modified in your chart by sign, aspects and Dasha. Not a fixed prediction.' }}
      eyebrow="Vedic placement"
      h1={data.headline}
      lead={`${house.name} · ${house.theme}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <p className="text-foreground leading-relaxed mb-6">{data.themeLine}</p>

          {data.sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-border p-4 mb-4">
              <h2 className="font-semibold text-foreground mb-1">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}

          <p className="text-xs text-muted-foreground my-6">
            Read by the classical significations of the <TermTip id="rashi">bhava</TermTip> (house) and the planet’s karaka.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">{planet.name} in other houses</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {HOUSES.filter(h => h.num !== house.num).map(h => (
              <Link key={h.num} to={`/planet-in-house/${planet.slug}/${h.num}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{ORD[h.num]}</Link>
            ))}
          </div>

          <h2 className="font-semibold text-foreground mb-2">Other planets in the {ORD[house.num]} house</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {PLANET_SLUGS.filter(p => p !== planet.slug).map(p => (
              <Link key={p} to={`/planet-in-house/${p}/${house.num}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{PLANETS[p].name}</Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-foreground mb-3">Find which house {planet.name} occupies in <em>your</em> chart.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
