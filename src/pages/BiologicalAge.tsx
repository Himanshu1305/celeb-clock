import { useState, type ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SEO } from '@/components/SEO';
import { Activity, ArrowRight, RefreshCw, Share2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { BIO_QUESTIONS, calculateBiologicalAge } from '@/services/BiologicalAgeService';

function MedTerm({ term, plain }: { term: string; plain: string }) {
  return (
    <span>
      <span className="group relative inline-block">
        <span className="underline decoration-dotted decoration-primary/60 cursor-help font-semibold">
          {term}
        </span>
        <span
          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            hidden lg:group-hover:block bg-slate-800 text-white text-xs leading-relaxed
            rounded-lg px-3 py-2 w-52 text-center z-20 shadow-xl"
        >
          {plain}
        </span>
      </span>
      {' '}
      <span className="text-muted-foreground">({plain})</span>
    </span>
  );
}

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: 'How is biological age calculated?',
    a: <>Biological age is estimated by comparing your performance on validated physical and cognitive markers — <MedTerm term="resting heart rate" plain="cardiovascular fitness proxy" />, <MedTerm term="muscular endurance" plain="how long your muscles work without fatiguing" />, <MedTerm term="proprioception" plain="your body's self-positioning sense" />, <MedTerm term="arterial stiffness proxy" plain="flexibility as a measure of vascular health" />, <MedTerm term="glymphatic function" plain="your brain's overnight waste-clearance" />, <MedTerm term="psychomotor reaction time" plain="how fast your brain triggers physical response" />, body composition, and energy levels — against population norms for your chronological age. Each marker has a known adjustment factor derived from longitudinal aging research.</>,
  },
  {
    q: 'Is this scientifically accurate?',
    a: 'This quiz uses validated biomarkers from peer-reviewed research to produce a statistical estimate. It is not a clinical test. Results should be treated as directional, not diagnostic. For clinical biological age assessments, consult a healthcare professional.',
  },
  {
    q: 'Can biological age be reversed?',
    a: <>Yes — biological age is highly responsive to lifestyle changes. Regular exercise, quality sleep, a whole-food diet, and strong social connections are the most evidence-backed interventions. Studies show <MedTerm term="epigenetic age" plain="how old your DNA methylation patterns suggest your cells are" /> can decrease by 1–3 years within 8–12 weeks of consistent positive lifestyle changes.</>,
  },
  {
    q: 'Why is there a floor of 18?',
    a: 'The adjustment factors are calibrated for adults. The floor of 18 prevents the model from producing a physiologically meaningless biological age below adulthood, since the markers used are designed for adult populations.',
  },
  {
    q: 'What is the most impactful factor?',
    a: <>Sleep quality and resting heart rate are among the most impactful single markers. Resting heart rate is strongly predictive of all-cause mortality (Filipiak et al., 2012). Sleep below 6 hours is consistently associated with 12–25% higher mortality risk (Walker, 2017) — partly because poor sleep impairs your <MedTerm term="glymphatic system" plain="your brain's overnight waste-clearance system" />. <MedTerm term="Waist-to-height ratio" plain="central adiposity and visceral fat proxy" /> is the single strongest metabolic marker.</>,
  },
  {
    q: 'How often should I retake this quiz?',
    a: <>Every 4–8 weeks gives meaningful data on change. Biological age is not fixed — significant lifestyle interventions (starting exercise, improving sleep, losing <MedTerm term="visceral fat" plain="deep organ fat, not the fat under your skin" />) typically produce measurable changes within 8–12 weeks, reducing <MedTerm term="allostatic load" plain="cumulative stress burden on the body" /> and lowering biological age markers.</>,
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-2xl mx-auto mb-16">
      <h2 className="text-xl font-bold mb-5 text-foreground">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <Card key={i} className="glass-card">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm text-foreground">{item.q}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

export { calculateBiologicalAge } from '@/services/BiologicalAgeService';

// ── Page component ────────────────────────────────────────────────────────────

type Step = 'intro' | 'quiz' | 'result';

const BiologicalAge = () => {
  const [step, setStep] = useState<Step>('intro');
  const [chronoAge, setChronoAge] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bioAge, setBioAge] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    if (!chronoAge || parseInt(chronoAge) < 18 || parseInt(chronoAge) > 120) return;
    setStep('quiz');
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (current < BIO_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const result = calculateBiologicalAge(parseInt(chronoAge), next);
      setBioAge(result);
      setStep('result');
    }
  };

  const reset = () => {
    setStep('intro');
    setCurrent(0);
    setAnswers({});
    setBioAge(null);
    setChronoAge('');
    setCopied(false);
  };

  const handleShare = async () => {
    if (bioAge === null) return;
    const text = `My biological age is ${bioAge} (chronological: ${age}). Find yours at bornclock.com/biological-age`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard unavailable */ }
  };

  const age = parseInt(chronoAge) || 0;
  const diff = bioAge !== null ? Math.round((bioAge - age) * 10) / 10 : 0;
  const diffColor = diff <= 0 ? 'text-green-500' : diff <= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Biological Age Calculator — Test Your Body's True Age"
        description="Take our 10-question biological age quiz to find out if your body is younger or older than your chronological age. Based on fitness, sleep, flexibility, and metabolic markers."
        keywords="biological age calculator, body age test, real age, fitness age, metabolic age"
        canonicalUrl="/biological-age"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 pt-8 pb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span>10-question fitness &amp; wellness quiz</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black gradient-text-primary leading-tight">
            Biological Age Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your calendar age tells one story. Your body tells another. Answer 10 questions to discover your true biological age — and how to lower it.
          </p>
        </section>

        <div className="max-w-2xl mx-auto mb-16">
          {step === 'intro' && (
            <Card className="glass-card card-party-border">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chrono" className="text-base font-semibold">
                    Your Chronological Age
                  </Label>
                  <p className="text-sm text-muted-foreground">Enter your age in years to start</p>
                  <Input
                    id="chrono"
                    type="number"
                    min={18}
                    max={120}
                    placeholder="e.g. 35"
                    value={chronoAge}
                    onChange={e => setChronoAge(e.target.value)}
                    className="text-xl text-center max-w-[160px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {[
                    'Resting heart rate (cardiovascular fitness proxy)',
                    'Push-up capacity (muscular endurance)',
                    'Balance (proprioceptive control)',
                    'Sleep quality (glymphatic function)',
                    'Flexibility (arterial stiffness proxy)',
                    'Mental sharpness (cognitive aging marker)',
                    'Energy levels (allostatic load indicator)',
                    'Waist-to-height ratio (central adiposity proxy)',
                  ].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  disabled={!chronoAge || parseInt(chronoAge) < 18 || parseInt(chronoAge) > 120}
                  onClick={handleStart}
                >
                  Start Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'quiz' && (
            <Card className="glass-card">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {current + 1} of {BIO_QUESTIONS.length}</span>
                    <span>{Math.round((current / BIO_QUESTIONS.length) * 100)}% complete</span>
                  </div>
                  <Progress value={(current / BIO_QUESTIONS.length) * 100} className="h-2" />
                </div>
                <h2 className="text-xl font-bold text-foreground leading-snug">
                  {BIO_QUESTIONS[current].question}
                </h2>
                {BIO_QUESTIONS[current].instruction && (
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 italic leading-relaxed">
                    {BIO_QUESTIONS[current].instruction}
                  </p>
                )}
                <div className="space-y-3">
                  {BIO_QUESTIONS[current].options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(BIO_QUESTIONS[current].id, opt.id)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="block text-sm font-medium">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-xs text-muted-foreground font-normal mt-1 leading-relaxed">
                          {opt.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {BIO_QUESTIONS[current].source && (
                  <p className="text-xs text-muted-foreground/60 border-t pt-3 italic">
                    Source: {BIO_QUESTIONS[current].source}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'result' && bioAge !== null && (
            <div className="space-y-6">
              <Card className="glass-card card-party-border">
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Your Biological Age</p>
                  <div className="text-8xl font-black text-primary leading-none">{bioAge}</div>
                  <p className="text-2xl font-semibold text-muted-foreground">years old</p>
                  <div className={`text-lg font-semibold ${diffColor}`}>
                    {diff === 0
                      ? '✓ Your biological age matches your calendar age'
                      : diff < 0
                      ? `🎉 Your body is ${Math.abs(diff).toFixed(1)} years younger than your age`
                      : `⚠️ Your body is ${diff.toFixed(1)} years older than your age`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chronological age: {age} · Biological age: {bioAge}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-base">What this means</h3>
                  {diff <= -5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-green-600">Your body is genuinely firing younger on every marker.</strong> Your cardiovascular fitness, muscle endurance, and energy efficiency all point well below your calendar age. In scientific terms: your markers reflect low allostatic load (cumulative stress burden on the body), strong VO₂ max proxy (aerobic efficiency), and epigenetic age (how old your DNA methylation patterns suggest your cells are) well below your chronological age.
                    </p>
                  )}
                  {diff > -5 && diff <= 0 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-green-600">Your body is aging well.</strong> Your fitness markers show you're ahead of your calendar age. To push this further: keep allostatic load (cumulative stress burden on the body) low through consistent sleep, and maintain VO₂ max proxy (aerobic efficiency) with regular movement — the two highest-leverage levers.
                    </p>
                  )}
                  {diff > 0 && diff <= 5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-amber-600">You have clear room to improve — and biology is on your side.</strong> Focus on sleep first (your glymphatic system (your brain's overnight waste-clearance) needs consistent deep sleep), then movement to counter sarcopenia (age-related muscle loss), then reducing central adiposity (belly fat around your organs). Small, consistent changes compound quickly.
                    </p>
                  )}
                  {diff > 5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-red-500">The good news: biological age is highly plastic.</strong> Reducing visceral fat (deep organ fat), improving sleep quality, and regular exercise have been shown to lower biological age by 1–3 years within 8–12 weeks — measurably reducing allostatic load (cumulative stress burden on the body) and improving epigenetic age (how old your DNA methylation patterns suggest your cells are).
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground border-t pt-3">
                    ⚠️ This is a self-reported screening tool, not a medical test. Consult a healthcare professional for clinical assessment.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={reset}>
                  <RefreshCw className="w-4 h-4" />
                  Retake Quiz
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share Result'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <FAQSection />
      </div>
      <Footer />
    </div>
  );
};

export default BiologicalAge;
