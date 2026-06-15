import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TOC_ITEMS = [
  { id: 'life-expectancy', label: 'Life Expectancy Calculator' },
  { id: 'celebrity-birthday', label: 'Celebrity Birthday Matching' },
  { id: 'planetary-age', label: 'Planetary Age Calculator' },
  { id: 'zodiac', label: 'Zodiac Signs' },
  { id: 'numerology', label: 'Numerology — Life Path Number' },
  { id: 'birthstone', label: 'Birthstone' },
  { id: 'generation', label: 'Generation Classification' },
  { id: 'accuracy', label: 'Accuracy and Limitations' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function TOCSidebar() {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">On This Page</p>
      {TOC_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className="block w-full text-left text-sm text-muted-foreground hover:text-blue-500 py-1 px-2 rounded transition-colors"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function TOCDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg mb-8">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
      >
        <span>On This Page</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1 border-t border-border pt-3">
          {TOC_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setOpen(false); scrollToSection(item.id); }}
              className="block w-full text-left text-sm text-muted-foreground hover:text-blue-500 py-1"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CitationBadge({ children }: { children: string }) {
  return (
    <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full ml-1">
      {children}
    </span>
  );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 dark:bg-slate-950 text-green-400 rounded-lg px-5 py-4 my-4 font-mono text-sm leading-relaxed overflow-x-auto">
      {children}
    </div>
  );
}

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Our Methodology — How BornClock Calculates Its Results | BornClock"
        description="Transparent, source-cited methodology behind BornClock's life expectancy calculator, celebrity birthday matching, planetary age, zodiac, numerology, and birthstone tools."
        keywords="BornClock methodology, life expectancy methodology, how life expectancy is calculated, planetary age formula, zodiac methodology"
        canonicalUrl="/methodology"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            How BornClock Works
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Methodology &amp; Data Sources</p>

          {/* Blue intro box */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-10 text-blue-900 dark:text-blue-200 text-sm leading-relaxed">
            <strong>Full transparency.</strong> Every number BornClock produces has a source and a formula. This page explains exactly how each tool works, what data it uses, and what its limitations are. If you spot something that needs correcting, email{' '}
            <a href="mailto:hello@bornclock.com" className="underline hover:opacity-80">hello@bornclock.com</a>.
          </div>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TOCDropdown />
          </div>

          <div className="flex gap-12">
            {/* Desktop sticky TOC */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-8 bg-card border border-border rounded-xl p-4">
                <TOCSidebar />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* ── LIFE EXPECTANCY ── */}
              <section id="life-expectancy" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Life Expectancy Calculator
                </h2>

                {/* Three-Pillar Framework */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">The Three-Pillar Framework</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    BornClock's{' '}
                    <Link to="/life-expectancy" className="text-indigo-600 hover:underline font-medium">life expectancy</Link>{' '}
                    estimate is built on three pillars that are calculated sequentially and then combined:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {[
                      { title: 'Pillar 0 — Baseline', desc: 'Age-conditional life expectancy from WHO/UN WPP 2024 tables, adjusted for current age, sex, and country.' },
                      { title: 'Pillar 1 — Genetics', desc: 'Family longevity bonus based on the age at which parents and grandparents died, drawn from twin studies and centenarian research.' },
                      { title: 'Pillar 2 — Epigenetics', desc: 'Modifiable lifestyle factors — habits, community, and social bonds — that research shows can shift biological age independently of genetics.' },
                    ].map(p => (
                      <div key={p.title} className="bg-muted/40 rounded-lg p-4">
                        <p className="font-semibold text-foreground text-sm mb-1">{p.title}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 1 — Age-Conditional Baseline
                    <CitationBadge>UN WPP 2024</CitationBadge>
                    <CitationBadge>WHO GHO</CitationBadge>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Raw life-expectancy-at-birth figures are misleading once a person is already alive. BornClock uses <em>age-conditional</em> life expectancy: given that you are already age <em>x</em>, how many more years do you statistically have?
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The baseline is sourced from the UN World Population Prospects 2024 revision for 54 countries plus WHO regional averages. For each country, we store male and female period life-table values at ages 0, 5, 10, 15 … 100.
                  </p>
                  <FormulaBlock>
                    {`conditionalBaseline = lifeTable[country][sex][ageGroup] + currentAge`}
                  </FormulaBlock>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Countries are classified as <strong className="text-foreground">HIGH</strong> or <strong className="text-foreground">LOW</strong> longevity based on whether their life-expectancy-at-birth exceeds the global median (~73.4 years, WHO 2024). A multiplier calibrates the baseline:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm text-muted-foreground">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-foreground">Age group</th>
                            <th className="text-left px-3 py-2 font-semibold text-foreground">HIGH multiplier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[['0–34', '1.02'], ['35–49', '1.015'], ['50–64', '1.01'], ['65–79', '1.005'], ['80+', '1.00']].map(([age, mult]) => (
                            <tr key={age} className="odd:bg-muted/20">
                              <td className="px-3 py-2">{age}</td>
                              <td className="px-3 py-2 font-mono">{mult}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm text-muted-foreground">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-foreground">Age group</th>
                            <th className="text-left px-3 py-2 font-semibold text-foreground">LOW multiplier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[['0–34', '0.97'], ['35–49', '0.975'], ['50–64', '0.98'], ['65–79', '0.985'], ['80+', '1.00']].map(([age, mult]) => (
                            <tr key={age} className="odd:bg-muted/20">
                              <td className="px-3 py-2">{age}</td>
                              <td className="px-3 py-2 font-mono">{mult}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 2 — Health and Lifestyle Adjustments
                    <CitationBadge>GBD 2019</CitationBadge>
                    <CitationBadge>Lancet 2018</CitationBadge>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Twelve lifestyle factors each apply a year-based adjustment to the baseline, drawn from peer-reviewed epidemiological literature (primarily GBD 2019 and IHME meta-analyses):
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm text-muted-foreground">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-foreground">Factor</th>
                          <th className="text-left px-3 py-2 font-semibold text-foreground">Range (years)</th>
                          <th className="text-left px-3 py-2 font-semibold text-foreground">Key source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          ['Smoking', '−10 to 0', 'GBD 2019 / Jha et al., NEJM 2013'],
                          ['Alcohol', '−5 to 0', 'GBD 2016; Wood et al., Lancet 2018'],
                          ['Exercise frequency', '−3 to +4', 'Wen et al., Lancet 2011'],
                          ['Sleep quality', '−3 to +1', 'Cappuccio et al., Sleep 2010'],
                          ['BMI / obesity', '−4 to 0', 'Berrington de Gonzalez et al., NEJM 2010'],
                          ['Fruit & vegetable diet', '−2 to +2', 'Wang et al., IJHPM 2014'],
                          ['Chronic stress', '−5 to 0', 'Kivimäki et al., Lancet 2012'],
                          ['Social connections', '−4 to +4', 'Holt-Lunstad et al., PLOS Med 2010'],
                          ['Diabetes (Type 2)', '−5 to 0', 'GBD 2019'],
                          ['Heart disease history', '−7 to 0', 'GBD 2019'],
                          ['Air quality / pollution', '−3 to 0', 'GBD 2019 — attributable mortality'],
                          ['Mental health', '−5 to 0', 'Walker et al., World Psychiatry 2015'],
                        ].map(([factor, range, source], i) => (
                          <tr key={factor} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="px-3 py-2 font-medium text-foreground">{factor}</td>
                            <td className="px-3 py-2 font-mono">{range}</td>
                            <td className="px-3 py-2 text-xs">{source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 3 — Genetic Adjustment (Pillar 1)
                    <CitationBadge>Sebastiani &amp; Perls 2012</CitationBadge>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Heritability of human lifespan is estimated at 25–30% (Polderman et al., Nature Genetics, 2015). BornClock implements this as a bonus derived from how long your parents and grandparents lived. Longer-lived relatives produce a larger positive adjustment, capped to prevent unrealistic outliers.
                  </p>
                  <FormulaBlock>
                    {`geneticBonus = avg(parentAges) × parentWeight\n              + avg(grandparentAges) × grandparentWeight\nfinalBaseline = adjustedBaseline + clamp(geneticBonus, -5, +10)`}
                  </FormulaBlock>
                </div>

                {/* Step 4 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 4 — Epigenetic Habits (Pillar 2)
                    <CitationBadge>Horvath 2013</CitationBadge>
                    <CitationBadge>Belsky et al. 2020</CitationBadge>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    DNA methylation clocks (Horvath 2013; GrimAge, Lu et al. 2019) demonstrate that specific daily habits can slow biological aging independently of genetics. BornClock tracks a set of high-frequency habits and applies a multiplicative bonus.
                  </p>
                  <FormulaBlock>
                    {`habitsBonus = min(habitCount × 0.15, 1.0)  // max +1.0 year\nepigeneticContribution = baseLifestyleAdjustment × (1 + habitsBonus)`}
                  </FormulaBlock>
                </div>

                {/* Step 5 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 5 — Community Anchor Bonus (Pillar 2)
                    <CitationBadge>Buettner Blue Zones 2008</CitationBadge>
                    <CitationBadge>Roseto Effect</CitationBadge>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The Roseto Effect (Wolf &amp; Bruhn, 1993) and Blue Zones research (Buettner, 2008) show strong community ties independently extend lifespan. BornClock adds a community anchor bonus based on three signals: having a life mentor aged 85+, being part of a tight-knit social group, and regular multi-generational contact.
                  </p>
                  <FormulaBlock>
                    {`baseBonus   = mentorAge ≥ 85 ? 0.8 : 0\nhabitsBonus = min(communityHabitCount × 0.15, 1.0)\ncommunityBonus = min(baseBonus + habitsBonus, 1.5)  // hard cap`}
                  </FormulaBlock>
                </div>

                {/* Step 6 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Step 6 — Survival Minimum Guard
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    After all adjustments are summed, BornClock applies a survival-minimum guard: the estimated age at death never falls below the user's current age plus a biological buffer (4 years). This prevents the calculator from returning a death date in the past for extremely unhealthy profiles.
                  </p>
                  <FormulaBlock>
                    {`survivalMinimum = currentAge + 4\nestimatedAge    = max(rawEstimate, survivalMinimum)`}
                  </FormulaBlock>
                </div>
              </section>

              {/* ── CELEBRITY BIRTHDAY ── */}
              <section id="celebrity-birthday" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Celebrity Birthday Matching
                </h2>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Source</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Celebrity birth dates are drawn from a curated database cross-referenced against Wikipedia, IMDb, and official biographies. Entries are reviewed for accuracy and updated when corrections are reported. The database covers 1,000+ notable individuals across film, music, sport, science, politics, and literature.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Celebrity Ranking Algorithm</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    BornClock ranks celebrities by their <strong className="text-foreground">Wikipedia sitelinks count</strong> — the number of Wikipedia language editions that have an article about that person. This serves as a proxy for global cultural significance.
                  </p>
                  <div className="bg-muted/40 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-foreground text-sm mb-2">How it works:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed">
                      <li>• Each celebrity in our database has a sitelinks score from Wikidata</li>
                      <li>• Higher sitelinks = more globally recognized</li>
                      <li>• <strong className="text-foreground">Country boost:</strong> celebrities matching the user's country get a +500 point boost to surface locally relevant names</li>
                      <li>• <em>Example:</em> An Indian user searching June 13 birthdays will see Virat Kohli ranked higher than a lesser-known international celebrity with more global sitelinks</li>
                    </ul>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-foreground text-sm mb-2">Why sitelinks?</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Wikipedia sitelinks correlate strongly with global name recognition. A celebrity with articles in 50 language editions is genuinely more globally recognized than one with 5. This avoids subjective "fame" rankings and uses objective, verifiable data.
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Source: <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">Wikidata (wikidata.org)</a> — CC BY 4.0 License
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Only the day and month of your birth date are used for matching. The year is never transmitted. Visit the{' '}
                    <Link to="/celebrity-birthday" className="text-indigo-600 hover:underline font-medium">Celebrity Birthday Match</Link>{' '}
                    tool to see this in action.
                  </p>
                </div>
              </section>

              {/* ── PLANETARY AGE ── */}
              <section id="planetary-age" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Planetary Age Calculator
                  <span className="ml-2"><CitationBadge>NASA JPL 2024</CitationBadge></span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your age on another planet is the number of complete orbits that planet has made around the Sun since your birth. BornClock's{' '}
                  <Link to="/planetary-age" className="text-indigo-600 hover:underline font-medium">Planetary Age Calculator</Link>{' '}
                  uses mean sidereal orbital periods from the NASA JPL Planetary Fact Sheet (Williams, D.R., NASA GSFC, 2024).
                </p>
                <FormulaBlock>
                  {`daysSinceBirth = (today − birthDate) in Earth days\nplanetAge     = daysSinceBirth / orbitalPeriod[planet]`}
                </FormulaBlock>
                <div className="overflow-x-auto rounded-lg border border-border mt-6">
                  <table className="w-full text-sm text-muted-foreground">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">Planet</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">Orbital period (Earth days)</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">~Earth years</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ['Mercury', '87.969', '0.241'],
                        ['Venus', '224.701', '0.615'],
                        ['Mars', '686.971', '1.881'],
                        ['Jupiter', '4,332.589', '11.862'],
                        ['Saturn', '10,759.22', '29.457'],
                        ['Uranus', '30,688.5', '84.011'],
                        ['Neptune', '60,182.0', '164.79'],
                      ].map(([planet, days, years], i) => (
                        <tr key={planet} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="px-4 py-2 font-medium text-foreground">{planet}</td>
                          <td className="px-4 py-2 font-mono">{days}</td>
                          <td className="px-4 py-2 font-mono">{years}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-xs mt-3">
                  Source: NASA JPL Planetary Fact Sheet — nssdc.gsfc.nasa.gov/planetary/factsheet/ (Williams, 2024). All values are mean sidereal periods.
                </p>
              </section>

              {/* ── ZODIAC ── */}
              <section id="zodiac" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Zodiac Signs
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  BornClock's{' '}
                  <Link to="/zodiac" className="text-indigo-600 hover:underline font-medium">Zodiac Analysis</Link>{' '}
                  uses the <strong className="text-foreground">Western tropical zodiac</strong> — the twelve equal 30° divisions of the ecliptic, fixed to the vernal equinox. Date ranges follow the standard astronomical calendar boundaries that have been used since classical antiquity.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The calculator handles cusp dates using conventional fixed-date cutoffs rather than the precise Sun-position at the hour of birth, since most users do not know their exact birth time.
                </p>
              </section>

              {/* ── NUMEROLOGY ── */}
              <section id="numerology" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Numerology — Life Path Number
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  BornClock's{' '}
                  <Link to="/numerology" className="text-indigo-600 hover:underline font-medium">Numerology Calculator</Link>{' '}
                  computes the <strong className="text-foreground">Pythagorean Life Path Number</strong>: reduce the full birth date (day + month + year) to a single digit by repeatedly summing its digits. Master numbers 11, 22, and 33 are preserved without further reduction.
                </p>
                <p className="text-muted-foreground font-medium mb-2">Example — 15 June 1990:</p>
                <FormulaBlock>
                  {`day   = 15  → 1 + 5 = 6\nmonth = 6\nyear  = 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1\n\nlife path = 6 + 6 + 1 = 13 → 1 + 3 = 4\n\nLife Path Number = 4`}
                </FormulaBlock>
                <p className="text-muted-foreground text-sm mt-3">
                  Numerology is provided for entertainment and reflection only. BornClock does not endorse predictive claims derived from numerological systems.
                </p>
              </section>

              {/* ── BIRTHSTONE ── */}
              <section id="birthstone" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Birthstone
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  BornClock's{' '}
                  <Link to="/birthstone" className="text-indigo-600 hover:underline font-medium">Birthstone</Link>{' '}
                  tool uses the <strong className="text-foreground">American Gem Society / Jewelers of America official birthstone list</strong>, updated in 2002 (Tanzanite added for December) and 2016 (Spinel added for August). Where a month has multiple modern stones, all alternatives are displayed with their historical provenance.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional and Ayurvedic alternative stones are shown as supplementary information, clearly labelled to distinguish them from the modern standardised list.
                </p>
              </section>

              {/* ── GENERATION ── */}
              <section id="generation" className="mb-14 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Generation Classification
                  <span className="ml-2"><CitationBadge>Pew Research 2019</CitationBadge></span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  BornClock's{' '}
                  <Link to="/generation" className="text-indigo-600 hover:underline font-medium">Generation Classification</Link>{' '}
                  tool classifies birth years into generational cohorts using Pew Research Center (2019) definitions:
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm text-muted-foreground">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">Generation</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">Birth years</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ['Silent Generation', '1928–1945', 'Also called the Traditionalists'],
                        ['Baby Boomers', '1946–1964', 'Post-WWII population surge'],
                        ['Generation X', '1965–1980', 'Sometimes 1965–1979'],
                        ['Millennials', '1981–1996', 'Also called Gen Y'],
                        ['Generation Z', '1997–2012', 'First digital-native generation'],
                        ['Generation Alpha', '2013–present', 'Children of Millennials'],
                      ].map(([gen, years, notes], i) => (
                        <tr key={gen} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="px-4 py-2 font-medium text-foreground">{gen}</td>
                          <td className="px-4 py-2 font-mono">{years}</td>
                          <td className="px-4 py-2 text-xs">{notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-xs mt-3">
                  Source: Pew Research Center, "Defining generations: Where Millennials end and Generation Z begins" (2019).
                </p>
              </section>

              {/* ── ACCURACY ── */}
              <section id="accuracy" className="mb-12 scroll-mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  Accuracy and Limitations
                </h2>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-6 text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
                  <strong>Not medical advice.</strong> BornClock's life expectancy estimates are statistical projections at a population level. They do not account for individual medical history, genetics not captured in the inputs, or future medical advances. Always consult a qualified healthcare professional for personal health guidance.
                </div>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Life expectancy</strong> — population-level actuarial estimates with ±5–8 year uncertainty at the individual level. Suitable for motivation and comparison, not medical planning.</li>
                  <li><strong className="text-foreground">Planetary age</strong> — exact to the day of calculation, using verified NASA JPL orbital period constants.</li>
                  <li><strong className="text-foreground">Celebrity birthdays</strong> — verified from multiple public sources; birth dates disputed in historical records are noted.</li>
                  <li><strong className="text-foreground">Zodiac / birthstone / numerology</strong> — based on established traditional systems. Provided for cultural enrichment and entertainment only.</li>
                  <li><strong className="text-foreground">Data currency</strong> — life expectancy baselines are reviewed annually against the latest UN WPP release. Last review: 2024.</li>
                </ul>
              </section>

            </div>
          </div>

          {/* ── RELATED TOOLS ── */}
          <section className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              Explore Our Methodology in Action
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-6">
              Try the tools described above
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: '🔬', label: 'Life Expectancy Calculator', to: '/life-expectancy' },
                { icon: '🧬', label: 'Biological Age Test', to: '/biological-age' },
                { icon: '♓', label: 'Zodiac Analysis', to: '/zodiac' },
                { icon: '🔢', label: 'Numerology Calculator', to: '/numerology' },
                { icon: '🪐', label: 'Planetary Age', to: '/planetary-age' },
                { icon: '🌍', label: 'Country Comparison', to: '/country-comparison' },
              ].map(tool => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="text-sm font-medium text-foreground">{tool.label}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
