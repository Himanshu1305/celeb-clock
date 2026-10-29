/**
 * /vehicle-number-numerology — car / bike number plate numerology (Batch 10), on the same
 * digit-sum pattern as /mobile-number-numerology. Methods + sources: vehicleNumber() in
 * src/lib/numerologyTools.ts.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import { vehicleNumber, vehicleOwnerHarmony, VEHICLE_MEANINGS, NUMBER_PLANET, type VehicleNumberResult } from '@/lib/numerologyTools';
import { mulank } from '@/lib/numerologyExtra';

export const VEHICLE_PATH = '/vehicle-number-numerology';
export const VEHICLE_META = {
  title: 'Vehicle Number Numerology — Car & Bike Number Plate | BornClock',
  description: 'Vehicle number numerology calculator: reduce your car or bike number plate to one digit three ways (all digits, last four, full plate with Chaldean letters) and see how it sits with your birth number.',
};

const FAQ = [
  { q: 'How is a vehicle number calculated in numerology?', a: 'The most common way is to add every digit on the number plate and reduce the total to one digit. Some people use only the last four digits (the registration number itself), and some also give the letters their Chaldean values (A=1, B=2, C=3, D=4, E=5, U=6, O=7, F=8 and so on) and add them in. We show all three, clearly labelled, so you can use the one your family follows.' },
  { q: 'Which vehicle number is lucky for me?', a: 'The tradition compares the plate’s number with your Mulank (birth-day number) using the friendly-number table: the same number or a friendly one is read as a good fit. Treat it as a light preference only — please never pay a premium or delay a purchase for a “lucky” plate.' },
  { q: 'Is the state code counted?', a: 'In the full-plate method, yes — the whole plate is read, letters and all. In the digits-only methods, only the numbers count, and the letters are ignored.' },
  { q: 'Does a vehicle number affect safety?', a: 'No. Safe driving, a well-maintained vehicle and following traffic rules are what keep you safe on the road. Numerology is a symbolic tradition for reflection only.' },
];

const HARMONY_TEXT = {
  same: 'Same as your Mulank — read as a natural fit.',
  harmonious: 'A friendly number for your Mulank — read as a comfortable fit.',
  neutral: 'Not on your Mulank’s friendly list — read as neutral. It is still just a number; drive with care and enjoy the vehicle.',
} as const;

export default function VehicleNumberNumerologyPage() {
  const [plate, setPlate] = useState('');
  const [day, setDay] = useState('');
  const [r, setR] = useState<VehicleNumberResult | null>(null);

  const calc = () => {
    const v = vehicleNumber(plate);
    if (!v.allDigits.digits.length && !v.fullPlate.letters.length) return;
    setR(v);
  };
  const d = Number(day);
  const mul = d >= 1 && d <= 31 ? mulank(d).number : null;

  return (
    <ToolLayout
      theme="mystic"
      testId="vehicle-number-page"
      seo={<SEO title={VEHICLE_META.title} description={VEHICLE_META.description}
        keywords="vehicle number numerology, car number numerology, bike number numerology, lucky vehicle number, number plate numerology"
        canonicalUrl={VEHICLE_PATH} />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Vehicle Number' }}
      footer={{ tagline: 'Vehicle-number numerology, for reflection only.', nav: [{ label: 'Mobile number', to: '/mobile-number-numerology' }, { label: 'House number', to: '/house-number-numerology' }, { label: 'Numerology', to: '/numerology' }] }}
      eyebrow="Numerology"
      h1="Vehicle Number Numerology"
      lead="Reduce your car or bike number plate to a single digit — three common ways, each labelled — and see how it sits with your birth number. A light reflection, never a reason to pay for a ‘lucky’ plate."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">Number plate</span>
                <input data-testid="vn-input" value={plate} onChange={e => setPlate(e.target.value)} placeholder="e.g. MH 12 PK 4521" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground uppercase" />
              </label>
              <label className="text-sm w-36">
                <span className="block text-muted-foreground mb-1">Your birth day <span className="text-xs">(optional)</span></span>
                <input data-testid="vn-day" type="number" min={1} max={31} value={day} onChange={e => setDay(e.target.value)} placeholder="1–31" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="vn-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Analyse</button>
            </div>
          </div>

          {r && (
            <div className="mb-8" data-testid="vn-result">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-4" data-testid="vn-main">
                <div className="text-xs text-muted-foreground mb-1">Vehicle number (all digits)</div>
                <div className="text-4xl font-black text-primary mb-1">{r.allDigits.root || '—'}</div>
                <div className="text-sm text-muted-foreground">{r.allDigits.digits.join(' + ')} = {r.allDigits.sum} → {r.allDigits.root} · ruled by {NUMBER_PLANET[r.allDigits.root]}</div>
                <p className="text-sm text-foreground mt-2">{VEHICLE_MEANINGS[r.allDigits.root]}</p>
                {mul && r.allDigits.root > 0 && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="vn-harmony">With your <TermTip id="mulank">Mulank</TermTip> {mul}: {HARMONY_TEXT[vehicleOwnerHarmony(r.allDigits.root, mul)]}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                {r.lastBlock && (
                  <div className="rounded-lg border border-border p-3" data-testid="vn-last">
                    <div className="text-xs text-muted-foreground">Last block only (registration number)</div>
                    <div className="font-semibold text-foreground text-lg">{r.lastBlock.root}</div>
                    <div className="text-xs text-muted-foreground">{r.lastBlock.digits.join(' + ')} = {r.lastBlock.sum} → {r.lastBlock.root}</div>
                  </div>
                )}
                <div className="rounded-lg border border-border p-3" data-testid="vn-full">
                  <div className="text-xs text-muted-foreground">Full plate, letters in <TermTip id="chaldean">Chaldean</TermTip> values</div>
                  <div className="font-semibold text-foreground text-lg">{r.fullPlate.root}</div>
                  <div className="text-xs text-muted-foreground break-words">{[...r.fullPlate.letters.map(l => `${l.ch}${l.value}`), ...r.fullPlate.digits.map(String)].join(' + ')} = {r.fullPlate.total} → {r.fullPlate.root}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Different methods can give different numbers — that is normal. Use the one your family follows.</p>
            </div>
          )}

          <ToolFaq items={FAQ} title="Questions about vehicle number numerology" testId="vn-faq" />
          <ToolSources testId="vn-sources" items={[
            { label: 'Astroyogi — lucky vehicle number', href: 'https://www.astroyogi.com/blog/lucky-vehicle-number-numerology.aspx', note: '“Add all the digits present on the number plate … reduce it to a single digit”' },
            { label: 'Astromitra — lucky vehicle number calculator', href: 'https://www.astromitra.com/numerology/lucky-vehicle-number-calculator.php', note: 'full plate with Chaldean letters: MH 12 PK 4521 → 34 → 7' },
            { label: 'Garware — lucky car number as per numerology in India', href: 'https://www.garwarehitechfilms.com/paint-protection-films/blog/lucky-car-number-as-per-numerology-in-india', note: '“Most people only calculate the digits in the registration number”' },
          ]} />
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mb-8">
            <p className="text-muted-foreground mb-3">The same method for your phone and home:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/mobile-number-numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Mobile number →</Link>
              <Link to="/house-number-numerology" className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">House number →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
