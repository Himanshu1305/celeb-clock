/**
 * /remedies and /remedies/:slug (English) · /hi/upay and /hi/upay/:slug (Hindi).
 * One page per finding BornClock detects, plus a hub — Batch 5, goal d.
 * Content comes from src/lib/vedic/remedies (sourced, calm, free remedies first).
 */
import { Link, useParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { RemedyActions, RemedyMeaning, remedyPath } from '@/components/vedic/Remedies';
import { REMEDIES, remedyBySlug, type Lang, type RemedyEntry, type RemedyKind } from '@/lib/vedic/remedies';

const SITE = 'https://bornclock.com';

const KIND_LABEL: Record<RemedyKind, { en: string; hi: string }> = {
  dosha: { en: 'Doshas in your chart', hi: 'कुंडली के दोष' },
  nakshatra: { en: 'Birth star', hi: 'जन्म नक्षत्र' },
  transit: { en: 'Saturn transits', hi: 'शनि गोचर' },
  matching: { en: 'Kundali matching', hi: 'कुंडली मिलान' },
  planet: { en: 'Planets — Mahadasha or a weak planet', hi: 'ग्रह — महादशा या कमज़ोर ग्रह' },
};
const KIND_ORDER: RemedyKind[] = ['dosha', 'nakshatra', 'transit', 'matching', 'planet'];

const TOOL_LABEL: Record<string, { en: string; hi: string }> = {
  '/manglik': { en: 'Check Manglik in your chart', hi: 'अपनी कुंडली में मांगलिक जाँचें' },
  '/kaal-sarp-dosha': { en: 'Check Kaal Sarp in your chart', hi: 'अपनी कुंडली में कालसर्प जाँचें' },
  '/pitra-dosha': { en: 'Check Pitra Dosha in your chart', hi: 'अपनी कुंडली में पितृ दोष जाँचें' },
  '/grahan-dosha': { en: 'Check Grahan Dosha in your chart', hi: 'अपनी कुंडली में ग्रहण दोष जाँचें' },
  '/mool-dosha': { en: 'Check your birth star', hi: 'अपना जन्म नक्षत्र जाँचें' },
  '/sade-sati': { en: 'Check your Sade Sati and Dhaiya dates', hi: 'अपनी साढ़ेसाती और ढैया की तिथियाँ जाँचें' },
  '/kundali-match': { en: 'Match two charts', hi: 'दो कुंडलियों का मिलान करें' },
  '/dasha-calculator': { en: 'See your current Mahadasha', hi: 'अपनी वर्तमान महादशा देखें' },
};

export function remedyMeta(e: RemedyEntry, lang: Lang): { title: string; description: string } {
  if (lang === 'hi') {
    return {
      title: `${e.name.hi} — अर्थ और उपाय | BornClock`,
      description: `${e.name.hi}: आपके लिए इसका सरल अर्थ, यह कितना आम है, और शांत पारंपरिक उपाय — मंत्र, दान, पूजा, मंदिर और रत्न (सावधानी सहित)। हर उपाय का स्रोत दिया गया है।`,
    };
  }
  return {
    title: `${e.name.en} — Meaning & Remedies | BornClock`,
    description: `${e.name.en}: what it means for you in plain language, how common it is, and calm traditional remedies — mantra, daan, puja, temples and gemstone (with caution). Every remedy cites its source.`,
  };
}

export default function RemediesPage({ lang = 'en' }: { lang?: Lang }) {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? remedyBySlug(slug) : undefined;
  const hubPath = lang === 'hi' ? '/hi/upay' : '/remedies';
  const otherLangHub = lang === 'hi' ? '/remedies' : '/hi/upay';

  if (!entry) {
    const title = lang === 'hi'
      ? 'ज्योतिषीय उपाय — दोष, साढ़ेसाती, मिलान और ग्रहों के उपाय | BornClock'
      : 'Vedic Remedies — Doshas, Sade Sati, Matching & Planets | BornClock';
    const description = lang === 'hi'
      ? 'मांगलिक, कालसर्प, पितृ दोष, साढ़ेसाती, नाड़ी दोष और नवग्रहों के शांत, स्रोत-सहित उपाय — पहले निःशुल्क उपाय, फिर दान, पूजा, मंदिर और सावधानी के साथ रत्न।'
      : 'Calm, sourced remedies for Manglik, Kaal Sarp, Pitra Dosha, Sade Sati, Nadi dosha and the nine planets — free remedies first, then daan, puja, temples and gemstones with caution.';
    return (
      <ToolLayout
        theme="vedic"
        testId="remedies-hub"
        seo={<SEO title={title} description={description} canonicalUrl={hubPath} ogImage="https://bornclock.com/og/vedic.png"
          hreflang={[{ lang: 'en', url: `${SITE}/remedies/` }, { lang: 'hi', url: `${SITE}/hi/upay/` }]} />}
        breadcrumb={{ trail: [{ label: lang === 'hi' ? 'वैदिक ज्योतिष' : 'Vedic Astrology', to: '/vedic-astrology' }], current: lang === 'hi' ? 'उपाय' : 'Remedies' }}
        footer={{ tagline: lang === 'hi' ? 'शांत, स्रोत-सहित उपाय।' : 'Calm, sourced remedies.', nav: [{ label: lang === 'hi' ? 'निःशुल्क कुंडली' : 'Free Kundli', to: '/kundali' }, { label: lang === 'hi' ? 'कुंडली मिलान' : 'Kundali Match', to: lang === 'hi' ? '/hi/kundli-milan' : '/kundali-match' }, { label: lang === 'hi' ? 'रत्न' : 'Gemstones', to: '/gemstones' }] }}
        eyebrow={lang === 'hi' ? 'उपाय' : 'Remedies'}
        h1={lang === 'hi' ? 'ज्योतिषीय उपाय — सरल, शांत और स्रोत-सहित' : 'Vedic remedies — plain, calm and sourced'}
        lead={lang === 'hi'
          ? 'जब BornClock आपकी कुंडली में कुछ पाता है, तो यहाँ बताया गया है कि उसका अर्थ क्या है और आप क्या कर सकते हैं — पहले निःशुल्क उपाय। कोई भी उपाय अनिवार्य नहीं और कोई भी परिणाम की गारंटी नहीं देता।'
          : 'When BornClock finds something in your chart, this is what it means and what you can do — free remedies first. None is required, and none guarantees a result.'}
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <p className="text-xs text-muted-foreground mb-4">
              <Link to={otherLangHub} className="underline" data-testid="remedies-lang-switch">{lang === 'hi' ? 'Read in English' : 'हिंदी में पढ़ें'}</Link>
            </p>
            {KIND_ORDER.map(kind => (
              <div key={kind} className="mb-6">
                <h2 className="font-semibold text-foreground mb-2">{KIND_LABEL[kind][lang]}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {REMEDIES.filter(r => r.kind === kind).map(r => (
                    <Link key={r.slug} to={remedyPath(r, lang)} data-testid={`remedies-hub-${r.slug}`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                      <div className="font-semibold text-foreground">{r.name[lang]}</div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.meaning.plain[lang]}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-amber-700">
              {lang === 'hi'
                ? 'ये पारंपरिक प्रथाएँ हैं — कभी पक्की नहीं, कभी अनिवार्य नहीं, और चिकित्सीय सलाह नहीं। BornClock कोई पूजा या रत्न नहीं बेचता।'
                : 'These are traditional customs — never guaranteed, never required, and not medical advice. BornClock sells no pujas or gemstones.'}
            </p>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const meta = remedyMeta(entry, lang);
  const path = remedyPath(entry, lang);
  const tool = TOOL_LABEL[entry.toolPath];
  const others = REMEDIES.filter(r => r.slug !== entry.slug && r.kind === entry.kind);
  const planetLinks = entry.planets.map(p => REMEDIES.find(r => r.key === `planet:${p}`)).filter((r): r is RemedyEntry => !!r && r.slug !== entry.slug);

  const faqItems = lang === 'hi'
    ? [
        { question: `${entry.name.hi} का अर्थ क्या है?`, answer: entry.meaning.plain.hi },
        { question: `${entry.name.hi} कितना आम है?`, answer: entry.meaning.howCommon.hi },
        { question: 'क्या कोई उपाय परिणाम की गारंटी देता है?', answer: 'नहीं। ये पारंपरिक प्रथाएँ हैं, जो चिंतन और मन की शांति के लिए दी गई हैं। पहले निःशुल्क उपाय करें; कोई भी महँगा अनुष्ठान अनिवार्य नहीं है।' },
        { question: 'क्या मुझे रत्न पहनना चाहिए?', answer: `${entry.gemstone.note.hi} 18 वर्ष से कम आयु में कभी नहीं।` },
      ]
    : [
        { question: `What does ${entry.name.en} mean?`, answer: entry.meaning.plain.en },
        { question: `How common is ${entry.name.en}?`, answer: entry.meaning.howCommon.en },
        { question: 'Does any remedy guarantee a result?', answer: 'No. These are traditional customs offered for reflection and comfort. Start with the free remedies; no expensive ritual is ever required.' },
        { question: 'Should I wear a gemstone?', answer: `${entry.gemstone.note.en} Never for anyone under 18.` },
      ];

  return (
    <ToolLayout
      theme="vedic"
      testId="remedy-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogImage="https://bornclock.com/og/vedic.png" ogType="article"
        hreflang={[{ lang: 'en', url: `${SITE}/remedies/${entry.slug}/` }, { lang: 'hi', url: `${SITE}/hi/upay/${entry.slug}/` }]} />}
      breadcrumb={{ trail: [{ label: lang === 'hi' ? 'वैदिक ज्योतिष' : 'Vedic Astrology', to: '/vedic-astrology' }, { label: lang === 'hi' ? 'उपाय' : 'Remedies', to: hubPath }], current: entry.name[lang] }}
      footer={{ tagline: lang === 'hi' ? 'शांत, स्रोत-सहित उपाय।' : 'Calm, sourced remedies.', nav: [{ label: lang === 'hi' ? 'सभी उपाय' : 'All remedies', to: hubPath }, { label: lang === 'hi' ? 'निःशुल्क कुंडली' : 'Free Kundli', to: '/kundali' }], note: lang === 'hi' ? 'उपाय पारंपरिक प्रथाएँ हैं — कभी पक्की नहीं। BornClock कोई पूजा या रत्न नहीं बेचता।' : 'Remedies are traditional customs — never guaranteed. BornClock sells no pujas or gemstones.' }}
      eyebrow={lang === 'hi' ? `उपाय · ${KIND_LABEL[entry.kind].hi}` : `Remedies · ${KIND_LABEL[entry.kind].en}`}
      h1={lang === 'hi' ? `${entry.name.hi} — अर्थ और उपाय` : `${entry.name.en} — meaning and remedies`}
      lead={entry.meaning.plain[lang]}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to={lang === 'hi' ? `/remedies/${entry.slug}` : `/hi/upay/${entry.slug}`} className="underline" data-testid="remedy-lang-switch">{lang === 'hi' ? 'Read in English' : 'हिंदी में पढ़ें'}</Link>
          </p>
          <div className="rounded-xl border border-border p-5 mb-4">
            <h2 className="font-semibold text-foreground mb-2">{lang === 'hi' ? 'आपके लिए इसका अर्थ' : 'What this means for you'}</h2>
            <RemedyMeaning entry={entry} lang={lang} />
            {tool && (
              <Link to={entry.toolPath} data-testid="remedy-tool-link" className="mt-3 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold">{tool[lang]} →</Link>
            )}
          </div>
          <div className="rounded-xl border border-border p-5 mb-6">
            <h2 className="font-semibold text-foreground mb-1">{lang === 'hi' ? 'आप क्या कर सकते हैं' : 'What you can do'}</h2>
            <RemedyActions entry={entry} lang={lang} />
          </div>

          {planetLinks.length > 0 && (
            <>
              <h2 className="font-semibold text-foreground mb-2">{lang === 'hi' ? 'संबंधित ग्रह' : 'Related planets'}</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {planetLinks.map(r => <Link key={r.slug} to={remedyPath(r, lang)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{r.name[lang]}</Link>)}
              </div>
            </>
          )}
          <h2 className="font-semibold text-foreground mb-2">{lang === 'hi' ? 'अन्य उपाय' : 'Other remedies'}</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {others.map(r => <Link key={r.slug} to={remedyPath(r, lang)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{r.name[lang]}</Link>)}
            <Link to={hubPath} className="px-3 py-1.5 rounded-lg border border-border text-sm text-primary hover:bg-primary/5">{lang === 'hi' ? 'सभी उपाय' : 'All remedies'} →</Link>
          </div>

          <PageFAQ items={faqItems} title={lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'} />
        </div>
      </section>
    </ToolLayout>
  );
}
