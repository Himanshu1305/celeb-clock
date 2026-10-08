import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { YOGAS, yogaBySlug } from '@/data/yogaExplainers';

const CATEGORY_STYLE: Record<string, string> = {
  'Raja (power)': 'border-amber-300 bg-amber-50',
  'Dhana (wealth)': 'border-emerald-300 bg-emerald-50',
  'Pancha Mahapurusha': 'border-indigo-300 bg-indigo-50',
  'Intellect': 'border-sky-300 bg-sky-50',
  'Challenging': 'border-rose-300 bg-rose-50',
  'Special': 'border-slate-300 bg-slate-50',
};

export default function YogaPage() {
  const { slug } = useParams<{ slug: string }>();
  const yoga = slug ? yogaBySlug(slug) : undefined;

  // Hub
  if (!slug || !yoga) {
    const cats = Array.from(new Set(YOGAS.map(y => y.category)));
    return (
      <ToolLayout
        theme="vedic"
        testId="yoga-hub"
        seo={<SEO title="Vedic Yogas — Raja, Dhana & Pancha Mahapurusha | BornClock" description="The important Vedic yogas (planetary combinations) explained plainly — Raja Yoga, Dhana Yoga, Gaja Kesari, the five Pancha Mahapurusha yogas, Neecha Bhanga and more. Check yours free." canonicalUrl="/yoga" ogImage="https://bornclock.com/og/vedic.png" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Yogas' }}
        footer={{ tagline: 'The important Vedic yogas, explained honestly.', nav: [{ label: 'Free Kundli', to: '/kundali' }, { label: 'Planet in house', to: '/planet-in-house' }] }}
        eyebrow="Vedic yogas"
        h1="Vedic Yogas — planetary combinations"
        lead="A yoga is a specific combination of planets that the tradition reads as a distinct result. Here are the important ones, explained plainly — and a free Kundli checks which actually form in your chart."
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {cats.map(cat => (
              <div key={cat} className="mb-6">
                <h2 className="font-semibold text-foreground mb-2">{cat}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {YOGAS.filter(y => y.category === cat).map(y => (
                    <Link key={y.slug} to={`/yoga/${y.slug}`} className={`rounded-xl border p-4 hover:shadow-sm transition ${CATEGORY_STYLE[y.category] || 'border-border'}`}>
                      <div className="font-semibold text-foreground">{y.name} {y.sanskrit && <span className="text-muted-foreground font-normal text-sm">{y.sanskrit}</span>}</div>
                      <p className="text-sm text-muted-foreground mt-1">{y.oneLine}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mt-4">
              <p className="text-muted-foreground mb-3">Your free Kundli computes which of these yogas actually form in your chart — and grades how strongly.</p>
              <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const title = `${yoga.name} — Formation, Meaning & Strength | BornClock`;
  const description = `${yoga.name}: ${yoga.oneLine} How it forms, what the Vedic tradition reads into it, how strongly it actually delivers, and a balanced reading. Check yours with a free Kundli.`;
  const others = YOGAS.filter(y => y.slug !== yoga.slug);

  const faqItems = [
    { question: `How does ${yoga.name} form?`, answer: yoga.howItForms },
    { question: `Does having ${yoga.name} guarantee the result?`, answer: `No. ${yoga.strengthNote} ${yoga.care}` },
    { question: `How do I know if I have it?`, answer: `Generate a free Kundli — BornClock computes whether ${yoga.name} actually forms in your chart and grades how strongly it delivers, rather than just listing it.` },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="yoga"
      seo={<SEO title={title} description={description} canonicalUrl={`/yoga/${yoga.slug}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Yogas', to: '/yoga' }], current: yoga.name }}
      footer={{ tagline: 'Vedic yogas, explained honestly.', nav: [{ label: 'All yogas', to: '/yoga' }, { label: 'Free Kundli', to: '/kundali' }], note: 'A yoga describes potential, read by the tradition — not a fixed outcome. Strength depends on planetary dignity and your Dasha.' }}
      eyebrow={`Yoga · ${yoga.category}`}
      h1={yoga.name}
      lead={yoga.oneLine}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">How it forms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{yoga.howItForms}</p>
          </div>
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">What it signifies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{yoga.signifies}</p>
          </div>
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">How strongly it really delivers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{yoga.strengthNote}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 mb-6">
            <h2 className="font-semibold text-foreground mb-1">A balanced reading</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{yoga.care}</p>
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            Formation follows the classical (Parashari) rule. In your chart the result is shaped by each planet’s dignity, aspects and the running <TermTip id="dasha">Dasha</TermTip>.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">Other yogas</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {others.map(y => (
              <Link key={y.slug} to={`/yoga/${y.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{y.name}</Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Does {yoga.name} form in <em>your</em> chart? Find out free — computed and graded.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
