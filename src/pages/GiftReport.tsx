import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { getConditionalBase, QUIZ_COUNTRIES } from '@/services/LongevityCalculationService';

const PLANETS = [
  { name: 'Mercury', days: 87.97 },
  { name: 'Venus', days: 224.7 },
  { name: 'Earth', days: 365.25 },
  { name: 'Mars', days: 686.97 },
  { name: 'Jupiter', days: 4332.59 },
  { name: 'Saturn', days: 10759.22 },
  { name: 'Uranus', days: 30688.5 },
  { name: 'Neptune', days: 60195.0 },
];

const ZODIAC = [
  { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
];

const LIFE_PATH_NAMES: Record<number, string> = {
  1: 'The Leader', 2: 'The Mediator', 3: 'The Communicator',
  4: 'The Builder', 5: 'The Freedom Seeker', 6: 'The Nurturer',
  7: 'The Seeker', 8: 'The Achiever', 9: 'The Humanitarian',
  11: 'The Visionary', 22: 'The Master Builder', 33: 'The Teacher',
};

const BIRTHSTONES: Record<number, string> = {
  1: 'Garnet', 2: 'Amethyst', 3: 'Aquamarine', 4: 'Diamond',
  5: 'Emerald', 6: 'Pearl', 7: 'Ruby', 8: 'Peridot',
  9: 'Sapphire', 10: 'Opal', 11: 'Topaz', 12: 'Turquoise',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getZodiacSign(month: number, day: number): string {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm <= em) {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z.sign;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed) ||
          (month > sm) || (month < em)) return z.sign;
    }
  }
  return 'Capricorn';
}

function getLifePath(dob: string): number {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
  }
  return sum;
}

async function generateGiftPDF(
  recipientData: { name: string; dob: string; gender: string; country: string },
  message: string
) {
  const dob = new Date(recipientData.dob);
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  const year = dob.getFullYear();
  const today = new Date();
  const ageMs = today.getTime() - dob.getTime();
  const age = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
  const totalDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const dayName = DAYS[dob.getDay()];

  const nextBirthday = new Date(today.getFullYear(), month - 1, day);
  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const daysUntilBirthday = Math.floor(
    (nextBirthday.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const zodiac = getZodiacSign(month, day);
  const lifePath = getLifePath(recipientData.dob);
  const birthstone = BIRTHSTONES[month];
  const g = recipientData.gender === 'female' ? 'female' : 'male';
  const { base: baselineLE } = getConditionalBase(recipientData.country || 'Unknown', g, age);
  const optimisticLE = Math.round((baselineLE + 10) * 10) / 10;

  // Fetch celebrities
  const celebs = await getRankedBirthdayCelebrities(monthDay, null, 6);
  const top3 = celebs.slice(0, 3);

  const ageHealth = age < 30 ? 'Focus on building strong sleep habits now'
    : age < 40 ? 'This decade, strength training becomes crucial'
    : age < 50 ? 'Annual health checkups now have the highest ROI'
    : age < 60 ? 'Social connections become your most powerful longevity factor'
    : 'Community and purpose extend life more than any other factor at this stage';

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const cyan = [0, 150, 180] as [number, number, number];
  const indigo = [79, 70, 229] as [number, number, number];
  const gray = [100, 100, 100] as [number, number, number];
  const light = [240, 240, 255] as [number, number, number];

  const addPage = () => {
    doc.addPage();
    doc.setFillColor(248, 248, 255);
    doc.rect(0, 0, W, 297, 'F');
  };

  const hLine = (y: number) => {
    doc.setDrawColor(...indigo);
    doc.setLineWidth(0.3);
    doc.line(20, y, W - 20, y);
  };

  const section = (title: string, y: number) => {
    doc.setFillColor(...light);
    doc.roundedRect(15, y - 5, W - 30, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...indigo);
    doc.text(title, 20, y + 1);
    return y + 10;
  };

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────
  doc.setFillColor(248, 248, 255);
  doc.rect(0, 0, W, 297, 'F');

  // Header banner
  doc.setFillColor(...indigo);
  doc.rect(0, 0, W, 55, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('Birthday Report', W / 2, 28, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 255);
  doc.text('A personalized gift from BornClock', W / 2, 42, { align: 'center' });

  // Recipient
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...indigo);
  doc.text(recipientData.name, W / 2, 90, { align: 'center' });

  hLine(100);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...gray);
  doc.text(
    dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    W / 2, 112, { align: 'center' }
  );
  doc.text(`Born on a ${dayName}`, W / 2, 122, { align: 'center' });
  doc.text(`Currently ${age} years old · ${totalDays.toLocaleString()} days on Earth`, W / 2, 132, { align: 'center' });

  if (message) {
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(25, 148, W - 50, 44, 3, 3, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(...gray);
    const msgLines = doc.splitTextToSize(`"${message}"`, W - 60);
    doc.text(msgLines, W / 2, 164, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...cyan);
  doc.text('bornclock.com', W / 2, 265, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text('Prepared with love', W / 2, 272, { align: 'center' });

  // ── PAGE 2: Birthday Identity ──────────────────────────────────────────────
  addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...indigo);
  doc.text('Birthday Identity', W / 2, 25, { align: 'center' });
  hLine(30);

  let y = 42;

  if (top3.length > 0) {
    y = section('Celebrity Birthday Twins', y);
    for (const c of top3) {
      const initials = c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      doc.setFillColor(...indigo);
      doc.circle(28, y + 4, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(initials, 28, y + 5.5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(c.name, 38, y + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text(c.occupation || '', 38, y + 8);
      y += 17;
    }
    y += 4;
  }

  y = section('Quick Facts', y);
  const facts = [
    ['Zodiac Sign', zodiac],
    ['Life Path Number', `${lifePath} — ${LIFE_PATH_NAMES[lifePath] || 'The Seeker'}`],
    ['Birthstone', birthstone],
    ['Days Until Next Birthday', `${daysUntilBirthday} days`],
  ];
  for (const [label, value] of facts) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...indigo);
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, 75, y);
    y += 8;
  }

  // ── PAGE 3: Planetary Ages ─────────────────────────────────────────────────
  addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...indigo);
  doc.text('Age Across the Solar System', W / 2, 25, { align: 'center' });
  hLine(30);

  y = 42;
  y = section('Your Age on Every Planet', y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...indigo);
  doc.text('Planet', 20, y);
  doc.text('Orbital Period', 70, y);
  doc.text('Your Age', 130, y);
  doc.text('Next Birthday In', 165, y);
  hLine(y + 2);
  y += 8;

  for (const p of PLANETS) {
    const planetAge = ageMs / (p.days * 24 * 60 * 60 * 1000);
    const fraction = planetAge - Math.floor(planetAge);
    const daysToNext = Math.round(fraction === 0 ? p.days : (1 - fraction) * p.days);
    doc.setFont('helvetica', p.name === 'Earth' ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(p.name, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(`${p.days.toLocaleString()} days`, 70, y);
    doc.setTextColor(30, 30, 30);
    doc.text(planetAge.toFixed(2) + ' yrs', 130, y);
    doc.text(`${daysToNext.toLocaleString()} days`, 165, y);
    y += 9;
  }

  // ── PAGE 4: Longevity Snapshot ─────────────────────────────────────────────
  addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...indigo);
  doc.text('Longevity Snapshot', W / 2, 25, { align: 'center' });
  hLine(30);

  y = 42;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(
    'Baseline estimate based on country and age. Take the full BornClock quiz for your personalized forecast.',
    W / 2, y, { align: 'center', maxWidth: W - 40 }
  );
  y += 14;

  y = section('Your Longevity Numbers', y);
  const leNumbers = [
    ['Country average life expectancy', `${baselineLE} years (${recipientData.country || 'Global avg'})`],
    ['Age-conditional baseline', `${Math.round((baselineLE + 2) * 10) / 10} years (age ${age} adjusted)`],
    ['Potential with optimal lifestyle', `${optimisticLE} years`],
  ];
  for (const [label, value] of leNumbers) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('• ' + label + ':', 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...indigo);
    doc.text(value, 20, y + 6);
    y += 15;
  }

  y = section('Health Tips for Your Stage of Life', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const tipLines = doc.splitTextToSize('💡 ' + ageHealth, W - 40);
  doc.text(tipLines, 20, y);
  y += tipLines.length * 6 + 8;

  // Back cover footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...cyan);
  doc.text('Take the full longevity quiz at bornclock.com', W / 2, 265, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('BornClock · Personalised birthday intelligence', W / 2, 273, { align: 'center' });

  doc.save(`${recipientData.name.replace(/\s+/g, '-')}-birthday-report-bornclock.pdf`);
}

export default function GiftReport() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: '',
    dob: '',
    gender: 'male',
    country: 'India',
    message: 'Happy Birthday! May this year bring you health, happiness, and many more to come.',
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    try {
      await generateGiftPDF(
        { name: form.name, dob: form.dob, gender: form.gender, country: form.country },
        form.message
      );
      setDone(true);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Gift a Birthday Longevity Report | BornClock"
        description="Give the perfect birthday gift — a personalized BornClock birthday report with celebrity twin, zodiac, numerology, planetary ages, and longevity snapshot. Instant PDF download."
        canonicalUrl="/gift"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Gift a Birthday Longevity Report</h1>
          <p className="text-muted-foreground">
            The most personal birthday gift imaginable — a complete birthday profile including their celebrity twin,
            zodiac sign, life path number, planetary ages, and longevity snapshot.
          </p>
        </div>

        {done ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Report Downloaded!</h2>
              <p className="text-muted-foreground mb-6">
                Your gift report has been downloaded! Share the PDF with{' '}
                <strong>{form.name}</strong> on their special day.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={() => { setDone(false); setStep(1); setForm(f => ({ ...f, name: '', dob: '' })); }} variant="outline">
                  Generate Another Report
                </Button>
                <Button asChild>
                  <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Step 1 */}
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">1</span>
                  Their Details
                </h2>
                <div>
                  <Label>Recipient's Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Priya"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country</Label>
                  <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {QUIZ_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">2</span>
                  Your Message
                </h2>
                <div>
                  <Label>Personal Message (max 200 characters)</Label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value.slice(0, 200) }))}
                    rows={3}
                    placeholder="Happy Birthday! May this year bring you health, happiness, and many more to come."
                    className="mt-1 resize-none"
                  />
                  <div className="text-xs text-muted-foreground text-right mt-1">
                    {form.message.length}/200
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">3</span>
                  Generate
                </h2>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={generating || !form.name || !form.dob}
                >
                  {generating ? (
                    <>Generating PDF…</>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate Birthday Report PDF
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Free during beta · Usually ₹199 · Payment coming soon
                </p>
              </CardContent>
            </Card>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
