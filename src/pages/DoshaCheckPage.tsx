/**
 * Standalone dosha explainers — Growth P2 (P2-9 / GP2-DOSHAS): Pitra, Mool
 * (Mula) Nakshatra, Grahan and Nadi. One component, four routes. Reads the
 * shared /api/kundali endpoint and computes client-side via lib/vedic/moreDoshas
 * (no engine/cache change). Calm, non-fear tone throughout (Rule 7); classical
 * readings disclosed as tradition (Rule 8).
 */
import { useState } from 'react';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import {
  doshaInputFromKundali, computePitraDosha, computeMoolDosha,
  computeGrahanDosha, computeNadiInfo, type DoshaGrade,
} from '@/lib/vedic/moreDoshas';

export type DoshaKind = 'pitra' | 'mool' | 'grahan' | 'nadi';

interface KindConfig {
  title: string;
  description: string;
  canonical: string;
  eyebrow: string;
  h1: string;
  intro: string;
  faq: { q: string; a: string }[];
}

const CONFIG: Record<DoshaKind, KindConfig> = {
  pitra: {
    title: 'Pitra Dosha Calculator — Check Your Chart Free | BornClock',
    description: 'Free Pitra Dosha calculator from your real birth chart: whether the classical ancestral-karma signatures are present, graded calmly and honestly — no fear, no paid "fix".',
    canonical: '/pitra-dosha',
    eyebrow: 'Ancestral karma · Sun & 9th house',
    h1: 'Pitra Dosha Calculator.',
    intro: 'Pitra Dosha is a classical reading of the Sun, the nodes and the 9th house — the chart\'s lineage and ancestry axis. We check whether the traditional signatures are present, grade them honestly, and explain what the tradition means by it — calmly, never as a threat.',
    faq: [
      { q: 'What is Pitra Dosha?', a: 'Pitra Dosha is a Vedic reading associated with the ancestral/father line — classically indicated when the Sun sits with a node (Rahu/Ketu) or Saturn, or when a natural malefic occupies the 9th house of lineage and dharma. It is a symbolic reading of karma carried from the family line, not a medical or factual claim.' },
      { q: 'Is Pitra Dosha harmful?', a: 'No. It is a chart pattern to understand, not a verdict on your life. The tradition frames it as an invitation to honour and reflect on one\'s ancestors — not something to fear, and nothing you must pay to "remove".' },
      { q: 'How do I remove Pitra Dosha?', a: 'Honestly: nothing is required. Traditionally people offer gratitude to ancestors (tarpan, feeding others, acts of service) during Pitru Paksha. We present that as optional custom and reflection, never as a fear-based paid remedy.' },
    ],
  },
  mool: {
    title: 'Mool Nakshatra Dosha — Gandanta Birth Star Check | BornClock',
    description: 'Free Mool (Mula) Nakshatra dosha check: whether your Moon falls in one of the six gandanta birth stars, with calm, honest, tradition-only framing (no medical meaning).',
    canonical: '/mool-dosha',
    eyebrow: 'Birth star · Gandanta',
    h1: 'Mool Nakshatra Dosha.',
    intro: 'Mool (or Mula) Nakshatra dosha is simply being born under one of the six "gandanta" birth stars. We work out your Moon\'s nakshatra and pada and tell you plainly whether it applies — with calm, tradition-only framing and no medical meaning whatsoever.',
    faq: [
      { q: 'What are the mool nakshatras?', a: 'Six nakshatras sit at the sensitive water-fire "gandanta" junctions: Ashwini, Ashlesha, Magha, Jyeshtha, Mula and Revati. Being born under one is called Mool Nakshatra dosha.' },
      { q: 'Is Mool Nakshatra dosha bad for the baby?', a: 'No — and this matters: it has no medical meaning at all. It is a cultural/astrological tradition. A baby born in a mool nakshatra is just as healthy as any other. Never let an astrological note influence any medical or parenting decision; always follow your paediatrician.' },
      { q: 'What is Mool Shanti?', a: 'A simple traditional observance some families do in the first month after a mool-nakshatra birth. It is a cultural custom offered for reflection, not a requirement and not a fear-based paid ritual.' },
    ],
  },
  grahan: {
    title: 'Grahan Dosha Calculator — Sun/Moon with Rahu-Ketu | BornClock',
    description: 'Free Grahan (eclipse) dosha calculator: whether the Sun (Surya) or Moon (Chandra) sits with Rahu or Ketu in your chart, graded by closeness. Calm, honest reading.',
    canonical: '/grahan-dosha',
    eyebrow: 'Eclipse · Luminaries & nodes',
    h1: 'Grahan Dosha Calculator.',
    intro: 'Grahan ("eclipse") dosha is the classical reading when the Sun or Moon shares its sign with Rahu or Ketu — the same geometry that creates an eclipse. We check both luminaries and grade the pattern by how close the degrees sit, calmly and without fear.',
    faq: [
      { q: 'What is Grahan Dosha?', a: 'When the Sun sits with Rahu or Ketu it is called Surya Grahan dosha; when the Moon does, Chandra Grahan dosha. It mirrors the geometry of a solar or lunar eclipse. Traditionally it is read as a note on clarity and emotional weather, not a disaster.' },
      { q: 'Is Grahan Dosha serious?', a: 'It is a pattern to understand, graded here by closeness of the degrees. Many well-functioning charts carry it. It is never a verdict, and no fear-based remedy is needed.' },
      { q: 'How is the intensity graded?', a: 'By the angular gap between the luminary and the node within the shared sign: a tight conjunction reads as strong, a wide one as mild. The grade is shown with the result.' },
    ],
  },
  nadi: {
    title: 'Nadi Dosha — Your Nadi & What It Means in Matching | BornClock',
    description: 'Find your own Nadi (Adi/Madhya/Antya) from your birth star, and understand Nadi dosha in marriage matching — honestly framed, never an affliction you carry alone.',
    canonical: '/nadi-dosha',
    eyebrow: 'Matching · Constitution',
    h1: 'Nadi Dosha & Your Nadi.',
    intro: 'Nadi is read from your birth star and matters mainly in marriage matching: "Nadi dosha" only arises between two people who share the same Nadi. We tell you your own Nadi and explain the matching rule honestly — it says nothing negative about you on your own.',
    faq: [
      { q: 'What is Nadi in matching?', a: 'Nadi is one of the eight kootas of Ashtakoota (Guna Milan) matching, worth 8 of the 36 points — the heaviest single factor. It is linked to the three Ayurvedic constitutions (Vata/Pitta/Kapha).' },
      { q: 'Is having a Nadi a dosha?', a: 'No. Everyone has a Nadi. "Nadi dosha" is a compatibility note that arises only when two partners share the same Nadi — and even then it is often cancelled by standard classical exceptions.' },
      { q: 'How is Nadi dosha cancelled?', a: 'Common classical cancellations: the pair share the same nakshatra but different padas, or the same Moon sign but different nakshatras, or their Moon-sign lords are friends. Our Kundli-matching tool shows this for a specific couple.' },
    ],
  },
};

const gradeBadge = (g: DoshaGrade) =>
  g === 'strong' ? 'text-amber-700' : g === 'moderate' ? 'text-amber-600' : g === 'mild' ? 'text-emerald-700' : 'text-emerald-700';

interface Computed {
  present: boolean;
  grade: DoshaGrade;
  headline: string;
  body: string;
  extra?: string;
}

export default function DoshaCheckPage({ kind }: { kind: DoshaKind }) {
  const cfg = CONFIG[kind];
  const { profile, save } = useSavedProfile();
  const [computed, setComputed] = useState<Computed | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setComputed(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      const [y, m, day] = d.dob.split('-'); const [h, min] = (d.time || '12:00').split(':');
      const p = new URLSearchParams({ y, m, d: day, h, min, lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz) });
      const res = await fetch(`/api/kundali?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      const input = doshaInputFromKundali(data);
      if (!input) throw new Error('unavailable');

      let c: Computed;
      if (kind === 'pitra') {
        const r = computePitraDosha(input);
        c = { present: r.present, grade: r.grade, headline: r.present ? `Pitra Dosha is present (${r.grade})` : 'No Pitra Dosha in this chart', body: r.detail };
      } else if (kind === 'mool') {
        const r = computeMoolDosha(input);
        c = { present: r.present, grade: r.grade, headline: r.present ? `Born in ${r.nakshatra} — a mool nakshatra (${r.grade})` : `Not a mool nakshatra (${r.nakshatra})`, body: r.detail };
      } else if (kind === 'grahan') {
        const r = computeGrahanDosha(input);
        c = { present: r.present, grade: r.grade, headline: r.present ? `Grahan Dosha is present (${r.grade})` : 'No Grahan Dosha in this chart', body: r.detail };
      } else {
        const r = computeNadiInfo(input);
        c = { present: false, grade: 'none', headline: `Your Nadi is ${r.nadi}`, body: r.detail };
      }
      setComputed(c);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cfg.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId={`dosha-${kind}-page`}
      seo={<SEO title={cfg.title} description={cfg.description} canonicalUrl={cfg.canonical} ogType="website" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: cfg.h1.replace(/\.$/, '') }}
      footer={{
        tagline: 'Computed from your real planetary positions — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Manglik', to: '/manglik' },
          { label: 'Kaal Sarp', to: '/kaal-sarp-dosha' },
          { label: 'How It Works', to: '/how-it-works' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <JsonLd data={faqJsonLd} id={`dosha-${kind}-faq`} />

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">{cfg.eyebrow}</span><h1>{cfg.h1}</h1></div>
          <p>{cfg.intro}</p>
        </div>
        <TrustStrip claim="Every planet's position is worked out from your real birth chart, then read against the classical rule for this pattern — shown calmly and honestly." href="/how-it-works#vedic" />

        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>Your birth details</h3><p className="small muted">We need the Moon&rsquo;s birth star and the planetary positions from your chart.</p></div>
          <BirthDetailsForm
            initial={initial}
            submitLabel={`Check ${kind === 'nadi' ? 'my Nadi' : 'this dosha'}`}
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix={`dosha-${kind}`}
          />
        </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {computed && (
          <div data-testid={`dosha-${kind}-result`} className="mt-6 space-y-4">
            <div className={`rounded-xl border p-5 text-center ${computed.present ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className={`text-2xl font-black ${computed.present ? gradeBadge(computed.grade) : 'text-emerald-700'}`}>{computed.headline}</div>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-sm text-foreground leading-relaxed">{computed.body}</p>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-3">Frequently asked</h2>
          <div className="space-y-3">
            {cfg.faq.map((f, i) => (
              <div key={i}>
                <div className="font-semibold text-foreground text-sm">{f.q}</div>
                <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Computed from your planetary positions using the same <TermTip id="ayanamsa">Lahiri-ayanamsa engine</TermTip> as the rest of BornClock.
          See also: <a href="/kundali" className="text-primary hover:underline">Full Kundali</a> · <a href="/manglik" className="text-primary hover:underline">Manglik</a> · <a href="/kaal-sarp-dosha" className="text-primary hover:underline">Kaal Sarp</a> · <a href="/kundali-match" className="text-primary hover:underline">Matching</a>.
        </p>
      </section>
    </PajPage>
  );
}
