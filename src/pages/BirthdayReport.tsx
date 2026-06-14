import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { FileText, Download, Lock, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/hooks/useAuth';
import { useBirthDate } from '@/context/BirthDateContext';
import { getZodiacByDate } from '@/data/zodiacData';
import { getBirthstoneByMonth } from '@/data/birthstoneData';
import { getNumerologyByNumber } from '@/data/numerologyData';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import {
  getQuotaLimit,
  getUsageCount,
  recordPDFGeneration,
  type QuotaTier,
} from '@/services/PDFQuotaService';
import { Link } from 'react-router-dom';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLANETS = [
  { name: 'Mercury', symbol: '☿', period: 87.97 },
  { name: 'Venus',   symbol: '♀', period: 224.70 },
  { name: 'Mars',    symbol: '♂', period: 686.97 },
  { name: 'Jupiter', symbol: '♃', period: 4332.59 },
  { name: 'Saturn',  symbol: '♄', period: 10759.22 },
  { name: 'Uranus',  symbol: '♅', period: 30688.50 },
  { name: 'Neptune', symbol: '♆', period: 60182.0 },
];

function calcLifePathNumber(date: Date): number {
  const s = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  let sum = s.split('').reduce((a, c) => a + parseInt(c), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, c) => a + parseInt(c), 0);
  }
  return sum;
}

function ageOnPlanet(ageYears: number, orbitalDays: number): string {
  return (ageYears * 365.25 / orbitalDays).toFixed(1);
}

function getGeneration(birthYear: number): { name: string; range: string; desc: string } {
  if (birthYear >= 2012) return { name: 'Generation Alpha', range: '2012–present', desc: 'Digital natives born into a world of AI and smartphones.' };
  if (birthYear >= 1997) return { name: 'Generation Z', range: '1997–2012', desc: 'The first true digital generation — pragmatic, inclusive, and entrepreneurial.' };
  if (birthYear >= 1981) return { name: 'Millennial', range: '1981–1996', desc: 'Shaped by the internet revolution and economic uncertainty.' };
  if (birthYear >= 1965) return { name: 'Generation X', range: '1965–1980', desc: 'Independent, self-reliant, and the first latchkey generation.' };
  if (birthYear >= 1946) return { name: 'Baby Boomer', range: '1946–1964', desc: 'Grew up in post-war prosperity; redefined culture and commerce.' };
  return { name: 'Silent Generation', range: 'Before 1946', desc: 'Shaped by the Great Depression and World War II — disciplined and resilient.' };
}

// ── PDF Generator ─────────────────────────────────────────────────────────────

interface PDFData {
  date: Date;
  name: string;
  celebs: { name: string; profession?: string }[];
}

function generateBirthdayPDF(data: PDFData): void {
  const { date, name, celebs } = data;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const pageH = 297;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const ageYears = new Date().getFullYear() - year;
  const monthName = date.toLocaleString('default', { month: 'long' });
  const dateStr = `${monthName} ${day}, ${year}`;

  const zodiac = getZodiacByDate(month, day);
  const birthstone = getBirthstoneByMonth(month);
  const lifePathNum = calcLifePathNumber(date);
  const numerology = getNumerologyByNumber(lifePathNum);
  const generation = getGeneration(year);

  const purple = [88, 28, 135] as [number, number, number];
  const pink   = [236, 72, 153] as [number, number, number];
  const gold   = [217, 119, 6] as [number, number, number];
  const white  = [255, 255, 255] as [number, number, number];
  const dark   = [15, 10, 40] as [number, number, number];
  const light  = [245, 240, 255] as [number, number, number];

  const addPage = (bg: [number, number, number] = dark) => {
    pdf.setFillColor(...bg);
    pdf.rect(0, 0, W, pageH, 'F');
  };

  // ── PAGE 1: COVER ──────────────────────────────────────────────────────────
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 80, 'F');
  pdf.setFillColor(...pink);
  pdf.circle(W - 30, 20, 40, 'F');
  pdf.setFillColor(...dark);
  pdf.circle(W - 30, 20, 38, 'F');

  pdf.setTextColor(...white);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Birthday', 20, 35);
  pdf.text('Personality Report', 20, 50);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 180, 255);
  pdf.text(`For: ${name || 'You'}`, 20, 68);
  pdf.text(`Born: ${dateStr}`, 20, 76);

  pdf.setTextColor(...white);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('What\'s inside:', 20, 110);

  const sections = [
    '🌟 Famous people who share your birthday',
    `${zodiac?.unicode ?? '♈'} Your zodiac sign & personality`,
    `🔢 Life path number ${lifePathNum} — what it means`,
    `💎 Your birthstone: ${birthstone?.primaryStone ?? monthName}`,
    '🪐 Your age on every planet',
    `👥 Your generation: ${generation.name}`,
  ];
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  sections.forEach((s, i) => {
    pdf.setTextColor(200, 180, 255);
    pdf.text(s, 25, 122 + i * 12);
  });

  pdf.setFillColor(...purple);
  pdf.roundedRect(15, 255, W - 30, 20, 3, 3, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('BornClock.com — Your Birthday Intelligence Platform', W / 2, 267, { align: 'center' });

  pdf.setTextColor(150, 130, 200);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Generated ${new Date().toLocaleDateString()}`, W / 2, 285, { align: 'center' });

  // ── PAGE 2: CELEBRITY TWINS ────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(`Famous Birthdays — ${monthName} ${day}`, W / 2, 22, { align: 'center' });

  pdf.setTextColor(200, 180, 255);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('You share your birthday with these remarkable people:', W / 2, 32, { align: 'center' });

  if (celebs.length === 0) {
    pdf.setTextColor(180, 160, 220);
    pdf.setFontSize(11);
    pdf.text('No celebrity data available for this date.', W / 2, 80, { align: 'center' });
  } else {
    celebs.slice(0, 6).forEach((c, i) => {
      const y = 50 + i * 28;
      pdf.setFillColor(...purple);
      pdf.setDrawColor(...pink);
      pdf.roundedRect(15, y, W - 30, 22, 2, 2, 'FD');
      pdf.setTextColor(...white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(c.name, 25, y + 9);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(200, 180, 255);
      if (c.profession) pdf.text(c.profession, 25, y + 17);
    });
  }

  pdf.setFillColor(...purple);
  pdf.roundedRect(15, 255, W - 30, 16, 2, 2, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.text(`Being born on ${monthName} ${day} puts you in remarkable company.`, W / 2, 265, { align: 'center' });

  // ── PAGE 3: ZODIAC ─────────────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Your Zodiac Sign', W / 2, 22, { align: 'center' });

  if (zodiac) {
    pdf.setFillColor(40, 20, 80);
    pdf.roundedRect(15, 42, W - 30, 50, 3, 3, 'F');
    pdf.setTextColor(...gold);
    pdf.setFontSize(36);
    pdf.text(zodiac.unicode, 35, 75);
    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(zodiac.name, 65, 62);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    pdf.text(zodiac.dateRange, 65, 72);
    pdf.text(`Element: ${zodiac.element}  ·  Planet: ${zodiac.rulingPlanet}`, 65, 82);

    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Core Traits', 20, 108);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    const traitText = zodiac.coreTraits.slice(0, 5).join('  ·  ');
    pdf.text(traitText, 20, 118, { maxWidth: W - 40 });

    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Personality Overview', 20, 135);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    const desc = zodiac.fullDescription.substring(0, 600);
    const lines = pdf.splitTextToSize(desc, W - 40);
    pdf.text(lines.slice(0, 8), 20, 145);
  } else {
    pdf.setTextColor(180, 160, 220);
    pdf.text('Zodiac data unavailable.', W / 2, 80, { align: 'center' });
  }

  // ── PAGE 4: NUMEROLOGY ─────────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Life Path Number', W / 2, 22, { align: 'center' });

  pdf.setFillColor(40, 20, 80);
  pdf.roundedRect(15, 42, W - 30, 60, 3, 3, 'F');
  pdf.setTextColor(...gold);
  pdf.setFontSize(48);
  pdf.text(String(lifePathNum), W / 2, 82, { align: 'center' });
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(numerology?.name ?? `Life Path ${lifePathNum}`, W / 2, 96, { align: 'center' });

  if (numerology) {
    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Personality', 20, 118);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    pdf.text(pdf.splitTextToSize(numerology.personality, W - 40).slice(0, 5), 20, 128);

    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Key Strengths', 20, 162);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    numerology.strengths.slice(0, 4).forEach((s, i) => pdf.text(`• ${s}`, 22, 172 + i * 9));
  }

  // ── PAGE 5: BIRTHSTONE ─────────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Your Birthstone', W / 2, 22, { align: 'center' });

  if (birthstone) {
    pdf.setFillColor(40, 20, 80);
    pdf.roundedRect(15, 42, W - 30, 40, 3, 3, 'F');
    pdf.setTextColor(...gold);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`💎 ${birthstone.primaryStone}`, W / 2, 57, { align: 'center' });
    pdf.setTextColor(200, 180, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`${monthName} Birthstone  ·  Color: ${birthstone.color}`, W / 2, 68, { align: 'center' });
    if (birthstone.alternateStones.length > 0) {
      pdf.text(`Alternates: ${birthstone.alternateStones.join(', ')}`, W / 2, 77, { align: 'center' });
    }

    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Meaning & Symbolism', 20, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 180, 255);
    pdf.text(pdf.splitTextToSize(birthstone.meaning, W - 40).slice(0, 4), 20, 110);

    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Properties', 20, 140);
    birthstone.properties.slice(0, 5).forEach((p, i) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(200, 180, 255);
      pdf.text(`• ${p}`, 22, 150 + i * 9);
    });
  }

  // ── PAGE 6: PLANETARY AGES ────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Your Age Across the Solar System', W / 2, 22, { align: 'center' });

  pdf.setTextColor(200, 180, 255);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`On Earth you are ${ageYears} years old. Here's your age on every planet:`, W / 2, 32, { align: 'center' });

  PLANETS.forEach((p, i) => {
    const y = 50 + i * 28;
    const pa = ageOnPlanet(ageYears, p.period);
    pdf.setFillColor(40, 20, 80);
    pdf.roundedRect(15, y, W - 30, 22, 2, 2, 'F');
    pdf.setTextColor(...gold);
    pdf.setFontSize(16);
    pdf.text(p.symbol, 28, y + 14);
    pdf.setTextColor(...white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(p.name, 42, y + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(180, 160, 220);
    pdf.text(`${p.period.toFixed(0)} Earth days / orbit`, 42, y + 18);
    pdf.setTextColor(...gold);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(`${pa} years`, W - 20, y + 14, { align: 'right' });
  });

  // ── PAGE 7: GENERATION + LONGEVITY ────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, 35, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Your Generation & Longevity', W / 2, 22, { align: 'center' });

  pdf.setFillColor(40, 20, 80);
  pdf.roundedRect(15, 42, W - 30, 50, 3, 3, 'F');
  pdf.setTextColor(...gold);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(generation.name, W / 2, 62, { align: 'center' });
  pdf.setTextColor(200, 180, 255);
  pdf.setFontSize(11);
  pdf.text(generation.range, W / 2, 74, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(pdf.splitTextToSize(generation.desc, W - 50), W / 2, 84, { align: 'center' });

  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('Longevity Insights', 20, 108);
  const insights = [
    'Lifestyle factors control 70–75% of your lifespan (Karolinska Institute, 2017).',
    'Daily walking for 30+ minutes adds ~1.5 years on average (JAMA Internal Medicine).',
    'Strong social connections are the #1 predictor of healthy aging (Harvard, 80-year study).',
    'Mediterranean diet reduces cardiovascular events by 30% (PREDIMED, NEJM 2013).',
    'A sense of purpose (ikigai) is associated with 7 additional healthy years.',
  ];
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(200, 180, 255);
  insights.forEach((ins, i) => {
    pdf.text(pdf.splitTextToSize(`• ${ins}`, W - 40), 20, 118 + i * 16);
  });

  pdf.setFillColor(40, 100, 40);
  pdf.roundedRect(15, 218, W - 30, 22, 2, 2, 'F');
  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Calculate your personalised life expectancy at bornclock.com/life-expectancy', W / 2, 231, { align: 'center' });

  // ── PAGE 8: BACK COVER ─────────────────────────────────────────────────────
  pdf.addPage();
  addPage(dark);
  pdf.setFillColor(...purple);
  pdf.rect(0, 0, W, pageH, 'F');
  pdf.setFillColor(...dark);
  pdf.circle(30, 30, 60, 'F');
  pdf.circle(W - 20, pageH - 30, 80, 'F');

  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.text('BornClock', W / 2, 100, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 180, 255);
  pdf.text('Your Birthday Intelligence Platform', W / 2, 115, { align: 'center' });

  const tools = [
    '🧬 Life Expectancy Calculator',
    '🌍 Country Longevity Comparison',
    '🔬 Biological Age Test',
    '🪐 Planetary Age Calculator',
    '♈ Zodiac & Birthstone Finder',
    '🔢 Numerology Calculator',
  ];
  pdf.setFontSize(11);
  tools.forEach((t, i) => {
    pdf.setTextColor(220, 200, 255);
    pdf.text(t, W / 2, 140 + i * 13, { align: 'center' });
  });

  pdf.setFontSize(14);
  pdf.setTextColor(...gold);
  pdf.setFont('helvetica', 'bold');
  pdf.text('bornclock.com', W / 2, 240, { align: 'center' });

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 130, 180);
  const disclaimer = 'This report is for entertainment and educational purposes only. Celebrity data sourced from public records. Astrological and numerological content is based on traditional systems and does not constitute medical or scientific advice.';
  pdf.text(pdf.splitTextToSize(disclaimer, W - 40), W / 2, 268, { align: 'center' });

  // Save
  const fname = name ? `${name.replace(/\s+/g, '_')}_Birthday_Report.pdf` : 'Birthday_Report.pdf';
  pdf.save(fname);
}

// ── Page component ────────────────────────────────────────────────────────────

const BirthdayReport = () => {
  const { user, isPremium, isInTrial } = useAuth();
  const { birthDate, setBirthDate } = useBirthDate();

  const [manualDate, setManualDate] = useState('');
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<{ limit: number; used: number } | null>(null);

  const tier: QuotaTier = isPremium ? 'premium' : isInTrial ? 'trial' : 'free';

  const effectiveBirthDate = birthDate ?? (manualDate ? new Date(manualDate) : null);

  useEffect(() => {
    if (!user) return;
    getUsageCount(user.id, tier).then(used => {
      setQuotaInfo({ limit: getQuotaLimit(tier), used });
    });
  }, [user, tier]);

  const handleGenerate = async () => {
    if (!effectiveBirthDate) { setError('Please enter your birth date.'); return; }
    setError('');
    setGenerating(true);
    try {
      if (user && quotaInfo) {
        if (quotaInfo.used >= quotaInfo.limit) {
          setError(`You've used all ${quotaInfo.limit} PDF report${quotaInfo.limit === 1 ? '' : 's'} for this tier. Upgrade for more.`);
          return;
        }
      }

      const month = effectiveBirthDate.getMonth() + 1;
      const day = effectiveBirthDate.getDate();
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');

      const rawCelebs = await getRankedBirthdayCelebrities(`${mm}-${dd}`, null, 6);
      const celebs = rawCelebs.map(c => ({ name: c.name, profession: c.displayName ?? undefined }));

      generateBirthdayPDF({ date: effectiveBirthDate, name, celebs });

      if (user) {
        await recordPDFGeneration(user.id, 'birthday');
        setQuotaInfo(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
      }
    } catch (e) {
      setError('Failed to generate PDF. Please try again.');
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = !user || !quotaInfo || quotaInfo.used < quotaInfo.limit;
  const quotaLabel = quotaInfo
    ? `${quotaInfo.used}/${quotaInfo.limit} ${tier === 'premium' ? 'this month' : 'lifetime'} used`
    : null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Birthday Personality PDF Report — Download Your Birthday Report"
        description="Download a personalised 8-page PDF birthday report: celebrity twins, zodiac, numerology, birthstone, planetary ages, generation, and longevity insights."
        keywords="birthday report PDF, birthday personality report, zodiac PDF, numerology PDF, birthstone report"
        canonicalUrl="/birthday-report"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 pt-6 pb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-muted-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>8-page personalised PDF · Free to generate</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black gradient-text-primary leading-tight">
            Birthday Personality Report
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download a beautifully designed PDF packed with your zodiac traits, life path number, birthstone meaning, celebrity twins, planetary ages, and more.
          </p>
        </section>

        <div className="max-w-xl mx-auto mb-16 space-y-6">

          {/* What's included */}
          <Card className="glass-card">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-bold text-base">What's in your report</h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
                {[
                  '🌟 Celebrity twins',
                  `♈ Zodiac personality`,
                  '🔢 Life path number',
                  '💎 Birthstone meaning',
                  '🪐 Planetary ages',
                  '👥 Your generation',
                  '🧬 Longevity insights',
                  '📄 8 full pages',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="glass-card card-party-border">
            <CardContent className="p-6 space-y-5">
              {!birthDate && (
                <div className="space-y-2">
                  <Label htmlFor="bday">Your Birth Date</Label>
                  <Input
                    id="bday"
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
              {birthDate && (
                <div className="text-sm text-muted-foreground bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                  Birth date: <strong>{birthDate.toLocaleDateString()}</strong>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pname">Your Name (optional)</Label>
                <Input
                  id="pname"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Quota info */}
              {user && quotaLabel && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  <span>PDF reports: {quotaLabel}</span>
                  {!canGenerate && (
                    <Link to="/upgrade" className="text-primary font-medium hover:underline">Upgrade →</Link>
                  )}
                </div>
              )}
              {!user && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign in to track quota and get more reports.</span>
                  <Link to="/auth?signup=true" className="text-primary font-medium hover:underline ml-auto">Sign in →</Link>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>
              )}

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={generating || !effectiveBirthDate || (!canGenerate && !!user)}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                ) : (
                  <><Download className="w-4 h-4" /> Download PDF Report</>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Free for everyone · PDF downloads to your device instantly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BirthdayReport;
