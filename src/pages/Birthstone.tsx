import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { RASHI_RATNA_DATA, NAVRATNA_INFO } from '@/data/rashiRatnaData';

const FAQ_ITEMS = [
  { q: 'What is a birthstone?', a: 'A birthstone is a gemstone traditionally associated with the month of one\'s birth. The modern birthstone list was standardized by the American National Association of Jewelers in 1912 and updated by the American Gem Trade Association in 2002 and 2016 to add tanzanite (December), spinel (August), and blue zircon (December).' },
  { q: 'Where does the birthstone tradition come from?', a: 'The tradition is ancient — the Hebrew High Priest\'s breastplate described in Exodus contained twelve gems, one for each tribe of Israel. The connection between these twelve stones and the twelve months of the year (or the twelve signs of the zodiac) developed gradually, with Josephus (1st century CE) and St. Jerome (5th century CE) making early associations. The practice of individuals wearing the stone of their birth month became popular in 18th-century Poland and spread throughout Europe. [Kunz, G.F., 1913. The Curious Lore of Precious Stones].' },
  { q: 'Who decides the official birthstone list?', a: 'In the United States, the list is maintained by the Jewelers of America (formerly American National Association of Jewelers), in collaboration with the American Gem Trade Association (AGTA). BornClock uses the current American Gem Society / Jewelers of America modern list.' },
  { q: 'What is the Mohs hardness scale?', a: 'The Mohs scale (1–10) measures a mineral\'s resistance to scratching, devised by Friedrich Mohs in 1812. Diamond (10) is the hardest natural substance; talc (1) is the softest. Most jewelry-quality gemstones rate 7 or above. Gems below 7 require more careful handling. [Source: GIA, gia.edu]' },
  { q: 'Are birthstone properties (healing, luck) scientifically supported?', a: 'No. Attributed properties — healing, luck, emotional benefits — are traditional and cultural, not scientifically validated. BornClock presents these as cultural tradition. The geology, chemistry, and history of each stone are factually documented.' },
  { q: 'What months have multiple birthstones?', a: 'Several months have multiple birthstones: June (pearl, alexandrite, moonstone), August (peridot, spinel, sardonyx), October (opal, pink tourmaline), November (topaz, citrine), December (tanzanite, zircon, turquoise). Multiple options often arose from historical availability or affordability concerns.' },
  { q: 'What is the rarest birthstone?', a: 'Alexandrite (June alternate) is among the rarest — it is prized for its dramatic color change (green in daylight, red under incandescent light) and fine specimens are extremely scarce. Red diamonds (April) are technically rarer, but alexandrite\'s rarity is more relevant to the jewelry market. Tanzanite (December), found only in a 4km zone near Kilimanjaro, is also extraordinarily rare.' },
  { q: 'Can I wear any birthstone regardless of my birth month?', a: 'Absolutely. While birthstones are traditionally associated with one\'s birth month, there is no rule against wearing any gemstone you are drawn to. The association is cultural and personal — gemstones are worn for their beauty, meaning, and significance to the individual.' },
];

export default function Birthstone() {
  const [activeTab, setActiveTab] = useState<'western' | 'indian'>('western');
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Birthstones by Month',
    itemListElement: BIRTHSTONE_DATA.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${b.month} — ${b.primaryStone}`,
      url: `https://bornclock.com/birthstone/${b.slug}`,
      description: `${b.month} birthstone: ${b.primaryStone}. ${b.meaning}.`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Birthstone by Month — History, Meaning & Geology | BornClock"
        description="Complete guide to birthstones for all 12 months — history, geology, mythology, and what makes each stone unique. Sources: GIA, Kunz (1913), American Gem Society."
        keywords="birthstone by month, birthstones, January birthstone garnet, birthstone meaning, birthstone history, gemstone guide"
        canonicalUrl="/birthstone"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Birthstone Guide — Western & Indian Traditions
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Two great traditions. Western birthstones are assigned by birth month; Indian Rashi Ratna are assigned by Vedic zodiac sign and ruling planet. This guide covers both.
          </p>

          {/* Tab toggle */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('western')}
              className={`flex flex-col items-start px-5 py-3 rounded-xl border-2 text-left transition-all min-w-[160px] ${
                activeTab === 'western'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="text-xl mb-0.5">🌍</span>
              <span className="font-bold text-sm">Western</span>
              <span className={`text-xs leading-tight ${activeTab === 'western' ? 'text-indigo-200' : 'text-gray-400'}`}>By birth month</span>
            </button>
            <button
              onClick={() => setActiveTab('indian')}
              className={`flex flex-col items-start px-5 py-3 rounded-xl border-2 text-left transition-all min-w-[160px] ${
                activeTab === 'indian'
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <span className="text-xl mb-0.5">🇮🇳</span>
              <span className="font-bold text-sm">Indian (Rashi Ratna)</span>
              <span className={`text-xs leading-tight ${activeTab === 'indian' ? 'text-orange-100' : 'text-gray-400'}`}>By Vedic zodiac sign</span>
            </button>
          </div>
        </div>

        {/* Indian Rashi Ratna tab */}
        {activeTab === 'indian' && (
          <div className="mb-12">
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-5 mb-8">
              <p className="text-base font-semibold text-orange-900 leading-relaxed">
                In the Indian Vedic tradition, your birthstone is determined by your Rashi (zodiac sign) and its ruling planet — not by birth month. These Rashi Ratna gemstones have been used for 2,000+ years to strengthen planetary energies and bring prosperity, health, and clarity.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {RASHI_RATNA_DATA.map(rr => (
                <Link key={rr.rashi} to="/rashi-ratna"
                  className="border border-gray-200 rounded-2xl p-4 hover:border-orange-300 hover:bg-orange-50/50 transition-all">
                  <div className="text-2xl mb-1">{rr.symbol}</div>
                  <div className="font-bold text-gray-900 text-sm">{rr.rashi} ({rr.rashiEnglish})</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rr.hex }} />
                    <div className="text-xs font-medium text-gray-700">{rr.primaryStone}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">({rr.primaryStoneHindi})</div>
                  <div className="text-xs text-gray-500 mt-1">{rr.rulingPlanet}</div>
                </Link>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-amber-900 mb-2">{NAVRATNA_INFO.title}</h3>
              <p className="text-sm text-amber-800 leading-relaxed mb-4">{NAVRATNA_INFO.description}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {NAVRATNA_INFO.gems.map(({ gem, planet, rashi }) => (
                  <div key={gem} className="flex items-center gap-2 text-sm">
                    <span className="text-amber-500">•</span>
                    <span className="font-medium text-amber-900">{gem}</span>
                    <span className="text-amber-600">— {planet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link to="/rashi-ratna"
                className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                Explore Full Rashi Ratna Guide →
              </Link>
            </div>
          </div>
        )}

        {/* Western Birthstone tab */}
        {activeTab === 'western' && (
          <>

        {/* History Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">The History of Birthstones</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The birthstone tradition has ancient roots. The twelve gems set in the Breastplate of Aaron — described in the Book of Exodus — were the original twelve-stone system, though these were associated with the twelve tribes of Israel rather than calendar months. The connection to months and zodiac signs developed gradually through the work of early theologians: Josephus (1st century CE) and St. Jerome (5th century CE) each drew parallels between the breastplate gems, the months, and the zodiac [Kunz, G.F., 1913. The Curious Lore of Precious Stones. J.B. Lippincott].
            </p>
            <p>
              The modern practice of wearing a single gem corresponding to one's birth month became popular in 18th-century Poland and spread throughout Europe over the following century. In 1912, the American National Association of Jewelers (now Jewelers of America) standardized the first modern birthstone list — the most widely used version today. The list was updated in 2002 to add tanzanite as a December birthstone and in 2016 to add spinel as an August stone [American Gem Society, ags.org].
            </p>
            <p>
              Every stone on the list has a story that predates the 1912 standardization by centuries or millennia. Garnet has been worn as a talisman for 5,000 years. Diamond adorned the sword hilts of medieval warriors. Pearl was found in the tombs of Egyptian pharaohs. The standardization organized an already-ancient human habit.
            </p>
          </div>
        </section>

        {/* Birthstone Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">All 12 Birthstones by Month</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BIRTHSTONE_DATA.map(stone => (
              <Link key={stone.slug} to={`/birthstone/${stone.slug}`}
                className="block rounded-xl border border-border bg-card hover:shadow-md transition-all hover:scale-[1.01] overflow-hidden">
                <div className="h-2 w-full" style={{ backgroundColor: stone.hexColor }} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: `${stone.hexColor}44`, border: `2px solid ${stone.hexColor}` }} />
                    <div>
                      <p className="font-bold text-foreground">{stone.month}</p>
                      <p className="text-sm text-muted-foreground">{stone.primaryStone}</p>
                    </div>
                  </div>
                  {stone.alternateStones.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-2">Also: {stone.alternateStones.join(', ')}</p>
                  )}
                  <p className="text-xs text-muted-foreground italic mb-2">{stone.meaning}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">{stone.color}</span>
                    <span className="text-xs text-muted-foreground">· Mohs {stone.hardness.split(' ')[0]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Science of Gemstones */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">The Science of Gemstones</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A gemstone is any mineral (or organic material, in the case of pearl, amber, and coral) with sufficient beauty, durability, and rarity to be used in jewelry. The Gemological Institute of America (GIA) — the world's leading authority on gemological standards — evaluates gems using four criteria: cut, clarity, color, and carat weight, known as the "4 Cs."
            </p>
            <p>
              The chemistry behind gem color is fascinating. Rubies and sapphires are the same mineral (corundum, aluminum oxide) — the difference is trace elements. Chromium gives ruby its red; iron and titanium give sapphire its blue. Emerald and aquamarine are both beryl — chromium creates emerald's green, iron creates aquamarine's blue-green. The connection between the same mineral and such different visual experiences illustrates how dramatically trace elements can transform a stone's appearance.
            </p>
            <p>
              Gem hardness (measured by the Mohs scale) affects how a stone should be worn and cared for. Diamond at Mohs 10 is the hardest natural substance on Earth. Topaz (Mohs 8) is hard but cleaves easily. Pearl (Mohs 2.5–4.5) is soft and requires gentle handling. Knowing the hardness of your birthstone tells you a great deal about how to treat it. [Source: GIA Gem Encyclopedia, gia.edu]
            </p>
          </div>
        </section>

        {/* Hardness Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Birthstone Hardness Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold text-foreground">Month</th>
                  <th className="text-left py-3 pr-4 font-semibold text-foreground">Stone</th>
                  <th className="text-left py-3 pr-4 font-semibold text-foreground">Hardness (Mohs)</th>
                  <th className="text-left py-3 font-semibold text-foreground">Wearability</th>
                </tr>
              </thead>
              <tbody>
                {BIRTHSTONE_DATA.map((stone, i) => {
                  const h = parseFloat(stone.hardness.split('–')[0].replace(/[^0-9.]/g, ''));
                  const wear = h >= 8 ? 'Excellent' : h >= 7 ? 'Good' : h >= 6 ? 'Fair' : 'Delicate';
                  const wearColor = h >= 8 ? 'text-green-600 dark:text-green-400' : h >= 7 ? 'text-blue-600 dark:text-blue-400' : h >= 6 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
                  return (
                    <tr key={stone.slug} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                      <td className="py-2 pr-4">
                        <Link to={`/birthstone/${stone.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {stone.month}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{stone.primaryStone}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{stone.hardness.split(' on')[0]}</td>
                      <td className={`py-2 font-medium ${wearColor}`}>{wear}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Culture and History */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Birthstones in Culture & History</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Every major human civilization has assigned meaning to gemstones. Ancient Egyptians buried their royalty with garnet necklaces and emerald amulets. The Romans ranked pearls above all other gems and passed laws restricting who could wear them. Medieval European clergy wore sapphires to represent Heaven. Mughal emperors commissioned emeralds engraved with prayers from the Quran. Hawaiian tradition holds that the green olivine crystals on certain beaches are the tears of Pele, the volcano goddess.
            </p>
            <p>
              These meanings — accumulated across millennia of human attention and attribution — are what makes gemstones more than beautiful rocks. They carry cultural weight that has compounded through time. Whether or not a ruby literally confers courage or a pearl genuinely promotes wisdom, the accumulated human belief in those properties is itself a historical fact worth knowing.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center mb-8">
          <p className="text-muted-foreground text-sm mb-4">Explore more BornClock tools</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="inline-block bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              Find My Birthstone
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/zodiac" className="text-primary hover:underline">Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/numerology" className="text-primary hover:underline">Numerology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/generation" className="text-primary hover:underline">Which Generation Are You?</Link>
          </div>
        </div>

        {/* About This Content */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> Gemological data sourced from GIA (gia.edu) and Mindat.org mineralogy database. Historical and cultural content draws on Kunz, G.F. (1913), <em>The Curious Lore of Precious Stones</em>. Birthstone list: American Gem Society / Jewelers of America (modern list, updated 2016). Attributed properties are traditional and cultural, not medical claims.
        </div>
        </>
        )}
      </div>

      <Footer />
    </div>
  );
}
