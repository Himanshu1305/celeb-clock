import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';

const Methodology = () => (
  <div className="min-h-screen bg-gradient-cosmic">
    <SEO
      title="Methodology — How Celeb Clock Calculates Its Results"
      description="Transparent methodology behind Celeb Clock's age calculator, life expectancy estimates, celebrity birthday matching, zodiac, birthstone, numerology, and planetary age tools."
      keywords="methodology, data sources, life expectancy methodology, age calculator accuracy"
      canonicalUrl="/methodology"
    />
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="flex justify-between items-center mb-8">
        <Navigation />
        <AuthNav />
      </header>
      <h1 className="text-4xl font-bold mb-6 gradient-text-primary text-center">Methodology</h1>
      <Card className="glass-card">
        <CardContent className="p-6 space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Age Calculator</h2>
            <p>Uses the JavaScript Date specification with full leap-year and time-zone handling. Calculations run in your browser; no date of birth is stored.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Life Expectancy</h2>
            <p>Baseline life expectancy comes from WHO and CDC mortality tables. Each lifestyle factor (smoking, alcohol, BMI, exercise, sleep, stress, diabetes, cardiac history) applies a weighted adjustment drawn from peer-reviewed epidemiological studies. Results are population-level estimates, not medical predictions.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Celebrity Birthday Match</h2>
            <p>Live queries to Wikipedia plus a curated database of 1,000+ top celebrities. Entries are cross-referenced for accuracy and updated daily.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Zodiac & Birthstone</h2>
            <p>Standard tropical zodiac date ranges and the Jewelers of America 1912 (updated) birthstone list, with traditional alternatives shown alongside.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Numerology</h2>
            <p>Pythagorean digit reduction with master numbers (11, 22, 33) preserved. For reflection and entertainment only.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Planetary Age</h2>
            <p>NASA orbital-period data: Earth age divided by each planet’s orbital period in Earth years.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Updates & corrections</h2>
            <p>We review data sources quarterly and on any reader-reported correction. <a href="/contact" className="text-primary hover:underline">Contact us</a> to report an issue.</p>
          </section>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
);

export default Methodology;
