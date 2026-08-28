import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';

const EditorialPolicy = () => (
  <div className="min-h-screen bg-gradient-cosmic">
    <SEO
      title="Editorial Policy — Accuracy, Sources & Corrections"
      description="BornClock's editorial policy: how we source data, review content for accuracy, disclose limitations, and handle corrections — built on Google E-E-A-T principles."
      keywords="editorial policy, EEAT, fact checking, corrections"
      canonicalUrl="/editorial-policy"
    />
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="flex justify-between items-center mb-8">
        <Navigation />
        <AuthNav />
      </header>
      <h1 className="text-4xl font-bold mb-6 gradient-text-primary text-center">Editorial Policy</h1>
      <Card className="glass-card">
        <CardContent className="p-6 space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Our standard</h2>
            <p>BornClock follows Google’s E-E-A-T framework — Experience, Expertise, Authoritativeness, Trustworthiness. Every calculator and article is built on verifiable public data and reviewed by the BornClock Editorial Team before publishing.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sources we trust</h2>
            <p>WHO, CDC, NIH, NASA, Wikipedia, peer-reviewed journals (The Lancet, BMJ, JAMA), and official almanacs. We cite primary sources whenever a claim is non-obvious.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Review process</h2>
            <p>Each new calculator is independently tested against known cases before launch. Blog articles are fact-checked and reviewed for clarity. Major updates are dated; minor edits are tracked internally.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Medical disclaimer</h2>
            <p>Health-related tools (Life Expectancy, BMI) are informational only and never a substitute for professional medical advice, diagnosis, or treatment.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Corrections</h2>
            <p>Spotted an error? Email us via the <a href="/contact" className="text-primary hover:underline">contact page</a> and we will investigate within 5 business days. Confirmed corrections are applied promptly and noted in the page footer.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Independence</h2>
            <p>We do not accept payment to alter editorial content. Sponsored or affiliate links, when present, are clearly disclosed.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Data sources</h2>
            <p>BornClock uses primary data sources exclusively: WHO Global Health Observatory, UN World Population Prospects, NASA JPL Horizons (astronomical calculations), US Naval Observatory Astronomical Almanac, peer-reviewed journals (The Lancet, Genome Biology, Circulation, Aging Cell), and official national statistics agencies. We do not aggregate from secondary sources without citing the original.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">AI and automated content</h2>
            <p>Some BornClock pages use AI-assisted drafting, reviewed and verified by our editorial team before publication. All factual claims — statistics, research citations, historical dates — are independently verified against primary sources. AI is a writing tool here, not a fact source.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Calculator methodology</h2>
            <p>Every calculator on BornClock has a dedicated methodology page explaining the data sources, calculation method, and known limitations. We publish our methodology so users can evaluate our approach. Calculators are tested against known cases before launch and re-verified when underlying data sources update. See <a href="/how-it-works" className="text-primary hover:underline">/how-it-works</a> for full methodology details.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Update policy</h2>
            <p>Pages are reviewed when: (1) an underlying data source publishes updated figures, (2) a reader submits a correction that is confirmed, or (3) our annual content audit identifies a material change. The “Last reviewed” date shown on each page reflects the most recent review, not the original publication date.</p>
          </section>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
);

export default EditorialPolicy;
