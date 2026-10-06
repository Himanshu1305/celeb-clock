import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO, WebApplicationSchema } from '@/components/SEO';

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/life-expectancy-india', label: 'Life Expectancy in India' },
  { path: '/coach', label: 'Longevity Coach' },
];

const HindiLifeExpectancy = () => {
  return (
    <ToolLayout
      theme="science"
      seo={(
        <>
          <SEO
            title="जीवन काल Calculator — Life Expectancy in Hindi | BornClock"
            description="आप कितने साल जिएंगे? BornClock का मुफ्त life expectancy calculator आपकी lifestyle के आधार पर आपका जीवन काल बताता है।"
            keywords="jivan kal calculator, life expectancy hindi, kitne saal jienge, umra calculator hindi"
            canonicalUrl="/jivan-kal-calculator"
            ogImage="https://bornclock.com/og/calculator.png"
          />
          <WebApplicationSchema
            name="जीवन काल Calculator — Life Expectancy in Hindi"
            description="BornClock का मुफ्त हिंदी life expectancy calculator — आपकी lifestyle के आधार पर आपका जीवन काल।"
            url="/jivan-kal-calculator"
          />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity' }], current: 'जीवन काल Calculator' }}
      eyebrow="Life Expectancy"
      h1="आप कितने साल जिएंगे?"
      lead={<>आपका जीवन काल आपकी जन्म तिथि नहीं, आपकी lifestyle तय करती है। Harvard के एक अध्ययन में 1.23 लाख लोगों को 30 साल तक track किया गया। नतीजा: 5 healthy habits अपनाने वाले लोग औसतन 14 साल ज्यादा जीते हैं।</>}
    >
      <div className="container mx-auto px-4 py-8">

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">अपना जीवन काल अभी calculate करें</h2>
            <p className="text-sm text-muted-foreground mb-4">WHO life tables और peer-reviewed research के आधार पर — आपकी habits के हिसाब से personalised forecast।</p>
            <Link to="/life-expectancy" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Life Expectancy Calculator खोलें →
            </Link>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">जीवन काल क्या होता है?</h2>
            <p className="text-muted-foreground leading-relaxed">Life expectancy वह औसत उम्र है जितनी एक इंसान जीने की उम्मीद कर सकता है। भारत में यह 70.9 साल है (2023)। लेकिन यह एक औसत है — आपकी personal life expectancy आपकी habits पर निर्भर करती है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">भारत में औसत जीवन काल</h2>
            <p className="text-muted-foreground leading-relaxed">Kerala में life expectancy 75-77 साल है जो कई European देशों जितनी है। Bihar और UP में यह 64-66 साल है। यह फर्क genetics में नहीं, healthcare access और lifestyle में है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">जीवन काल बढ़ाने के 5 तरीके</h2>
            <p className="text-muted-foreground leading-relaxed">Harvard research के अनुसार: (1) smoking न करें, (2) रोज 30 मिनट exercise करें, (3) healthy diet लें, (4) healthy weight बनाए रखें, (5) alcohol सीमित रखें। इन पांचों को अपनाने से 14 साल ज्यादा जीने की संभावना बढ़ती है।</p>
          </section>
        </article>

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">और भी Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ToolLayout>
  );
};

export default HindiLifeExpectancy;
