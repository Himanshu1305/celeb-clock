/**
 * /kua-number-calculator — Feng Shui Kua number + lucky directions (Batch 10).
 * Formula, year boundary (exact Lichun) and direction table + sources: src/lib/kuaNumber.ts.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import { kuaNumber, kuaStep1, DIRECTION_NAMES, type Gender, type KuaReading } from '@/lib/kuaNumber';

export const KUA_PATH = '/kua-number-calculator';
export const KUA_META = {
  title: 'Kua Number Calculator — Feng Shui Lucky Directions | BornClock',
  description: 'Find your Kua (Gua) number from your birth date and gender, counted from the exact Chinese solar new year (Lichun), with your East or West group and four best directions.',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const nice = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

const FAQ = [
  { q: 'How is the Kua number calculated?', a: 'Take your birth year — counted from the Chinese solar new year, Lichun, around 4 February — add its last two digits and reduce to one digit. Women add 5 (born before 2000) or 6 (2000 onwards); men subtract it from 10 (before 2000) or from 9 (2000 onwards); reduce again. A Kua of 5 becomes 2 for men and 8 for women.' },
  { q: 'Why does a January birthday use the previous year?', a: 'The Feng Shui year starts at Lichun, the moment the Sun reaches 315° along the ecliptic — usually 3, 4 or 5 February. Anyone born before that moment belongs to the previous solar year. We compute the exact Lichun date each year instead of assuming 4 February.' },
  { q: 'What are the East and West groups?', a: 'Kua 1, 3, 4 and 9 form the East group, whose good directions are North, South, East and South-east. Kua 2, 5, 6, 7 and 8 form the West group, whose good directions are West, South-west, North-west and North-east.' },
  { q: 'How do I use my lucky directions?', a: 'Lightly and practically: face your best wealth direction at your desk, sleep with your head towards your health direction, and so on, when it is easy to arrange. It is a tradition for reflection — never a reason for costly renovation.' },
  { q: 'Is the Kua number the same for a man and a woman born the same year?', a: 'No — the formula differs by gender, so a brother and sister born in the same solar year usually have different Kua numbers and sometimes different groups.' },
];

function Directions({ r }: { r: KuaReading }) {
  const rows: Array<[string, string, string]> = [
    ['Wealth & success', 'Sheng Chi', r.lucky.wealth],
    ['Health', 'Tien Yi', r.lucky.health],
    ['Love & relationships', 'Nien Yen', r.lucky.love],
    ['Personal growth', 'Fu Wei', r.lucky.growth],
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="kua-directions">
      {rows.map(([area, star, dir]) => (
        <div key={area} className="rounded-lg border border-border p-3 text-sm">
          <div className="text-xs text-muted-foreground">{area} <span className="italic">({star})</span></div>
          <div className="font-semibold text-foreground text-lg">{DIRECTION_NAMES[dir as keyof typeof DIRECTION_NAMES]}</div>
        </div>
      ))}
    </div>
  );
}

export default function KuaNumberPage() {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob >= '1900-03-01' && dob <= '2099-12-31' && !!gender;
  const res = useMemo(() => (valid ? kuaNumber(dob, gender as Gender) : null), [dob, gender, valid]);
  const m = res?.main;

  return (
    <ToolLayout
      theme="mystic"
      testId="kua-page"
      seo={<SEO title={KUA_META.title} description={KUA_META.description}
        keywords="kua number calculator, gua number, feng shui lucky directions, kua number female, kua number male, east west group"
        canonicalUrl={KUA_PATH} />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Kua number' }}
      footer={{ tagline: 'Feng Shui Kua number, for reflection only.', nav: [{ label: 'Lo Shu grid', to: '/lo-shu-grid-calculator' }, { label: 'Chinese zodiac', to: '/chinese-zodiac' }, { label: 'Numerology', to: '/numerology' }] }}
      eyebrow="Feng Shui"
      h1="Kua Number Calculator & Lucky Directions"
      lead={<>Your <TermTip id="kuaNumber">Kua number</TermTip> comes from your birth year and gender, and names your four best directions for work, health, love and personal growth.</>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-muted-foreground mb-1">Date of birth</span>
              <input data-testid="kua-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
            </label>
            <fieldset className="text-sm">
              <legend className="block text-muted-foreground mb-1">The formula differs for</legend>
              <div className="flex gap-4 py-2">
                {(['female', 'male'] as const).map(g => (
                  <label key={g} className="flex items-center gap-2">
                    <input data-testid={`kua-${g}`} type="radio" name="kua-gender" checked={gender === g} onChange={() => setGender(g)} /> {g === 'female' ? 'Woman' : 'Man'}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {res && m && (
            <div data-testid="kua-result" className="mb-8">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-4">
                <div className="text-xs text-muted-foreground mb-1">Your Kua number</div>
                <div className="text-4xl font-black text-primary mb-1" data-testid="kua-number">{m.kua}</div>
                <p className="text-foreground" data-testid="kua-answer">
                  {m.group} group. Your best direction for work and money is <strong>{DIRECTION_NAMES[m.lucky.wealth]}</strong>, and for health <strong>{DIRECTION_NAMES[m.lucky.health]}</strong>.
                  {res.boundary === 'on' && res.alternative ? <> Born on the day the solar year turns — see the note below.</> : null}
                </p>
              </div>

              <Directions r={m} />
              <p className="text-sm text-muted-foreground mt-3 mb-4">The other four directions ({m.others.map(d => DIRECTION_NAMES[d]).join(', ')}) belong to the {m.group === 'East' ? 'West' : 'East'} group and are read as less supportive for you — no need to worry about them, just prefer your four.</p>

              <ul className="text-sm text-muted-foreground space-y-1 mb-6" data-testid="kua-working">
                <li><strong className="text-foreground">Solar year used:</strong> {m.solarYear}. Lichun (the Chinese solar new year) in {dob.slice(0, 4)} was on {nice(res.lichunDateCST)} at {res.lichunTimeCST} China time ({res.lichunTimeIST} India time); {res.boundary === 'before' ? 'you were born before it, so the previous year counts.' : res.boundary === 'after' ? 'you were born after it.' : 'you were born that same day.'}</li>
                <li><strong className="text-foreground">Working:</strong> last two digits of {m.solarYear}: {String(m.solarYear).slice(2).split('').join(' + ')} → {kuaStep1(m.solarYear)}; {gender === 'female' ? `${kuaStep1(m.solarYear)} + ${m.solarYear >= 2000 ? 6 : 5}` : `${m.solarYear >= 2000 ? 9 : 10} − ${kuaStep1(m.solarYear)}`} → {m.raw}{m.reassigned ? ` → Kua 5 is not used: ${gender === 'female' ? 'women take 8' : 'men take 2'}` : ''}.</li>
              </ul>

              {res.boundary === 'on' && res.alternative && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm mb-6" data-testid="kua-boundary">
                  You were born on the Lichun date itself. If you were born <strong>after {res.lichunTimeIST} India time</strong> ({res.lichunTimeCST} China time), your Kua is <strong>{m.kua}</strong>; if before, it is <strong>{res.alternative.kua}</strong> ({res.alternative.group} group: wealth {DIRECTION_NAMES[res.alternative.lucky.wealth]}, health {DIRECTION_NAMES[res.alternative.lucky.health]}).
                </div>
              )}
            </div>
          )}

          <ToolFaq items={FAQ} title="Questions about the Kua number" testId="kua-faq" />
          <ToolSources testId="kua-sources" items={[
            { label: 'LoveToKnow — How to calculate your Kua number', href: 'https://www.lovetoknow.com/home/design-decor/how-calculate-kua-number', note: 'formula before and after 2000, worked examples' },
            { label: 'LoveToKnow — Lucky Feng Shui directions', href: 'https://www.lovetoknow.com/home/design-decor/how-find-your-lucky-feng-shui-directions', note: 'East/West groups and the four lucky directions per Kua' },
            { label: 'South China Morning Post — Head right direction', href: 'https://www.scmp.com/article/709737/head-right-direction', note: 'year counted from the solar new year; Kua 5 → 2 for men, 8 for women' },
            { label: 'Lichun = Sun at 315° ecliptic longitude', note: 'computed for each year with astronomy-engine; checked against the Hong Kong Observatory tables' },
          ]} />
          <p className="text-sm text-muted-foreground mb-8">Also from your date: <Link to="/lo-shu-grid-calculator" className="underline">Lo Shu grid</Link> · <Link to="/chinese-zodiac" className="underline">Chinese zodiac animal</Link>.</p>
        </div>
      </section>
    </ToolLayout>
  );
}
