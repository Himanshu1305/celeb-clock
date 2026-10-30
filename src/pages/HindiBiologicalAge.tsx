import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO, WebApplicationSchema } from '@/components/SEO';
import BioAgeQuizHindi from '@/components/biological-age/BioAgeQuizHindi';
import { HINDI_BIO_AGE_TITLE, HINDI_BIO_AGE_DESC } from '@/content/biologicalAgeMeta';

const RELATED = [
  { path: '/biological-age/', label: 'Biological Age Calculator' },
  { path: '/life-expectancy/', label: 'Life Expectancy Calculator' },
  { path: '/biological-age-vs-chronological-age/', label: 'Biological vs Chronological Age' },
  { path: '/coach/', label: 'Longevity Coach' },
];

const HindiBiologicalAge = () => {
  return (
    <ToolLayout
      theme="science"
      seo={(
        <>
          <SEO
            title={HINDI_BIO_AGE_TITLE}
            description={HINDI_BIO_AGE_DESC}
            keywords="biological age hindi, body age calculator hindi, jism ki umar, biological age calculator hindi"
            canonicalUrl="/biological-age-hindi"
            ogImage="https://bornclock.com/og/calculator.png"
          />
          <WebApplicationSchema
            name="Biological Age Calculator हिंदी में"
            description={HINDI_BIO_AGE_DESC}
            url="/biological-age-hindi"
          />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity/' }], current: 'Biological Age (Hindi)' }}
      eyebrow="Biological Age"
      h1="Biological Age Calculator हिंदी में — आपका शरीर कितना पुराना है?"
      lead={<>15 आसान सवालों से जानें कि आपकी फ़िटनेस, वज़न, ब्लड प्रेशर, नींद और आदतें आपकी उम्र के हिसाब से कैसी हैं। यह प्रकाशित शोध पर आधारित एक lifestyle और fitness अंदाज़ा है — कोई लैब टेस्ट या epigenetic clock नहीं।</>}
    >
      <div className="container mx-auto px-4 py-8">

        <section className="max-w-3xl mx-auto mb-12 px-4" aria-labelledby="hi-quiz-heading">
          <h2 id="hi-quiz-heading" className="text-xl font-bold text-foreground mb-4 text-center">अपनी Biological Age अभी जानें</h2>
          <p className="text-sm text-muted-foreground mb-5 text-center">मुफ़्त, बिना sign-up — आपके जवाब आपके फ़ोन/कंप्यूटर में ही रहते हैं।</p>
          <BioAgeQuizHindi />
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-3 mt-6">
            ⚕️ केवल सामान्य जानकारी के लिए। यह आपके अपने जवाबों से बना अंदाज़ा है — लैब टेस्ट, epigenetic clock, बीमारी की जाँच या डॉक्टरी सलाह नहीं। किसी भी स्वास्थ्य चिंता के लिए डॉक्टर से बात करें।
          </p>
          <p className="text-sm text-center mt-4"><Link to="/biological-age/" className="text-primary underline">English version और पूरी sources सूची →</Link></p>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Biological Age और Chronological Age में क्या फर्क है?</h2>
            <p className="text-muted-foreground leading-relaxed">Chronological age वह है जो आपके birth certificate पर लिखी है। Biological age इस बात का अंदाज़ा है कि आपका शरीर उसी उम्र के आम लोगों की तुलना में कैसा काम कर रहा है। Lab में इसे DNA methylation (epigenetic clock) जैसे टेस्ट से मापा जाता है; यह calculator ऐसा कोई टेस्ट नहीं करता — यह आपके जवाबों से एक मोटा अंदाज़ा देता है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Biological Age क्या तय करती है?</h2>
            <p className="text-muted-foreground leading-relaxed">फ़िटनेस, वज़न और कमर का नाप, ब्लड प्रेशर, नींद, धूम्रपान, शराब और व्यायाम — ये सब सेहत पर असर डालते हैं, और इनमें से ज़्यादातर बदले जा सकते हैं। बड़े लंबे अध्ययनों में धूम्रपान न करना (Doll व अन्य, BMJ 2004), रोज़ कम से कम 15 मिनट व्यायाम (Wen व अन्य, Lancet 2011) और कम शराब (Wood व अन्य, Lancet 2018) लंबी उम्र से जुड़े पाए गए हैं।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">क्या Biological Age कम हो सकती है?</h2>
            <p className="text-muted-foreground leading-relaxed">शुरुआती शोध उम्मीद जगाता है। 2021 में Aging journal में छपे एक छोटे pilot trial (Fitzgerald व अन्य; 50–72 साल के 43 स्वस्थ पुरुष) में 8 हफ़्ते के खान-पान और lifestyle कार्यक्रम के बाद control group की तुलना में Horvath DNA methylation age 3.23 साल कम पाई गई। शोधकर्ताओं के अनुसार बड़े और लंबे trials की ज़रूरत है।</p>
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

export default HindiBiologicalAge;
