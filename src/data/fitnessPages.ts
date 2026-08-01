// Config for the 6 fitness / rhythm SEO pages (Phase B). Content is written in the
// HONESTY REGISTER (see rhythmFraming.ts): rhythm-awareness / daily check-in, never a
// prescription. NO claims of performance, injury prevention, hormonal/medical effects,
// or weight loss. Where real science exists (consistency, chronotype, sleep) it is
// stated plainly and kept separate from the rhythm layer.

export interface FitnessSection { h2: string; paragraphs: string[]; }
export interface FitnessFAQ { question: string; answer: string; }

export interface FitnessPage {
  slug: string;                 // e.g. 'biorhythm-workout-calculator'
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  h1: string;
  directAnswer: string;         // 2-3 sentence snippet target under the H1
  widgetVariant: 'today' | 'forecast' | 'habit' | 'energy';
  widgetCtaLabel: string;
  isApp: boolean;               // emit SoftwareApplication/WebApplication schema
  sections: FitnessSection[];
  faqs: FitnessFAQ[];
}

export const FITNESS_PAGES: FitnessPage[] = [
  {
    slug: 'biorhythm-workout-calculator',
    seoTitle: 'Biorhythm Workout Calculator — A Daily Training Check-In | BornClock',
    seoDescription: 'A free biorhythm workout check-in: enter your birth date to see today’s physical, emotional and mental rhythm plus a 7-day outline. A reflection prompt, not a training prescription.',
    keywords: 'biorhythm workout calculator, biorhythm training, workout rhythm check-in, biorhythm exercise',
    h1: 'Biorhythm Workout Calculator',
    directAnswer: 'This is a rhythm-awareness tool, not a training plan. Enter your date of birth and it shows your biorhythm reading for today — the classic 23-day physical, 28-day emotional and 33-day mental cycles — with a 7-day outline you can use as a daily prompt to check in with how your body actually feels before you train.',
    widgetVariant: 'today',
    widgetCtaLabel: 'Show my rhythm →',
    isApp: true,
    sections: [
      {
        h2: 'How do you use biorhythm for workouts?',
        paragraphs: [
          'Use it as a check-in, not a command. Read today’s physical number, then ask the only question that matters: how do I actually feel right now? Many people find a simple daily prompt like this helps them notice fatigue they would otherwise push through, or energy they would otherwise waste.',
          'If the chart reads high and your body agrees, you might lean into movement you enjoy. If it reads low, that is just an invitation to consider a gentler day. Neither is a rule — your own signals always win over the chart.',
        ],
      },
      {
        h2: 'What actually improves training — honestly',
        paragraphs: [
          'The biorhythm model dates from the early 20th century and controlled research has not found it predictive. What the evidence does support is unglamorous and reliable: consistency over time, adequate sleep, gradual progression, and recovery. Those are the levers that matter.',
          'Think of the rhythm layer as a gentle daily journaling prompt sitting alongside the real fundamentals — never a replacement for them.',
        ],
      },
    ],
    faqs: [
      { question: 'Is the biorhythm workout calculator scientifically accurate?', answer: 'No. The three-cycle biorhythm model has not been found predictive in controlled studies. This tool is a self-reflection prompt, not a validated way to time or plan exercise.' },
      { question: 'Should I skip a workout if my physical rhythm is low?', answer: 'There is no evidence the chart can tell you that. Use it only as a reminder to check in with how you genuinely feel, and make movement choices based on your body and, where relevant, professional advice.' },
      { question: 'What actually helps me train better?', answer: 'Consistency, sleep, sensible progression, and recovery — all well supported by evidence. The rhythm reading is just a daily awareness prompt alongside those.' },
      { question: 'Does biorhythm predict injury or performance?', answer: 'No. Studies examining biorhythm predictions for accidents and athletic performance did not find statistically significant effects.' },
    ],
  },
  {
    slug: 'best-day-to-start-a-habit',
    seoTitle: 'Best Day to Start a Habit — Timing vs. Consistency | BornClock',
    seoDescription: 'When is the best day to start a new habit? The honest answer is “the next day you’ll actually do it.” See your next rhythm upswing as a gentle nudge, and the real science of habit formation.',
    keywords: 'best day to start a habit, when to start a new habit, habit timing, fresh start effect',
    h1: 'The Best Day to Start a Habit',
    directAnswer: 'The best day to start a habit is the next day you will actually follow through — research on habit formation points to consistency and repetition, not a magic start date. As a gentle nudge, the widget below shows your next day when both physical and emotional rhythms read positive, which some people find an easier moment to begin.',
    widgetVariant: 'habit',
    widgetCtaLabel: 'Find my next upswing →',
    isApp: false,
    sections: [
      {
        h2: 'When should you really start a new habit?',
        paragraphs: [
          'Sooner than you think, and on a day that repeats. Studies on how habits form (for example, work by Phillippa Lally and colleagues) suggest it takes anywhere from about three weeks to several months of repetition for a behaviour to feel automatic — the number varies widely by person and habit. What consistently helps is starting small, attaching the new habit to an existing routine, and simply not missing twice.',
          'There is a real, mild effect called the “fresh start effect,” where temporal landmarks — a Monday, the first of the month, a birthday — make people feel more motivated to begin. That is worth using if it helps you start, but it is a psychological nudge, not a requirement.',
        ],
      },
      {
        h2: 'Where does biorhythm fit in?',
        paragraphs: [
          'Only as a nudge. The rhythm upswing date above is a rhythm-awareness cue, not a prediction that you will succeed. Many people find beginning on a day they feel a bit more energetic is pleasant, but the evidence is clear that showing up repeatedly matters far more than the calendar day you chose.',
        ],
      },
    ],
    faqs: [
      { question: 'What is the best day of the week to start a habit?', answer: 'There is no single best day. The “fresh start effect” means Mondays and month-firsts can feel motivating, but the day that works is the one you will repeat consistently.' },
      { question: 'How long does it take to form a habit?', answer: 'It varies a lot — research suggests roughly three weeks to a few months of repetition, depending on the person and the behaviour. There is no fixed “21 days” rule.' },
      { question: 'Does biorhythm tell me the best day to start?', answer: 'No. The upswing date here is only a gentle rhythm-awareness nudge. It cannot predict whether a habit will stick — consistency does that.' },
      { question: 'What is the single most useful habit tip?', answer: 'Start small and don’t miss twice in a row. Attaching the new habit to something you already do every day helps it stick.' },
    ],
  },
  {
    slug: 'cycle-syncing-for-men',
    seoTitle: 'Cycle Syncing for Men — Rhythm Awareness for Everyone | BornClock',
    seoDescription: 'Cycle syncing isn’t only about the menstrual cycle. Everyone has daily and longer rhythms worth noticing. A plain, honest look at rhythm awareness for men — with a birth-date rhythm check-in.',
    keywords: 'cycle syncing for men, male rhythms, do men have cycles, rhythm awareness men',
    h1: 'Cycle Syncing for Men',
    directAnswer: 'Cycle syncing usually refers to planning around the menstrual cycle, but the underlying idea — noticing your body’s rhythms and adjusting gently — applies to everyone. Men have well-established daily (circadian) rhythms and natural day-to-day variation in energy; the biorhythm chart below is simply a birth-date version you can use as a check-in prompt.',
    widgetVariant: 'today',
    widgetCtaLabel: 'Check my rhythm →',
    isApp: false,
    sections: [
      {
        h2: 'Do men have cycles too?',
        paragraphs: [
          'Yes, in the everyday sense of rhythms. The strongest evidence is for circadian rhythms — the roughly 24-hour cycle that shapes alertness, body temperature and sleep for everyone. There is also natural daily variation in energy and mood that most people notice if they pay attention. None of this requires a special theory; it just requires checking in.',
          'What men do not have is a monthly hormonal cycle equivalent to menstruation, and this page makes no claims about hormones. The point is simpler: the timing instinct behind “cycle syncing” — do more when you feel resourced, less when you don’t — is sensible for anyone.',
        ],
      },
      {
        h2: 'Biorhythm as the birth-date version',
        paragraphs: [
          'The biorhythm model offers a light, structured way to prompt that check-in from your date of birth. Treat it exactly as that: a reflection prompt. It dates from the early 20th century and has not been found predictive in controlled research, so nothing here is a hormonal, medical, or performance claim — just an invitation to notice how you feel.',
        ],
      },
    ],
    faqs: [
      { question: 'Is cycle syncing real for men?', answer: 'Men don’t have a monthly hormonal cycle like menstruation, but everyone has circadian rhythms and day-to-day energy variation worth noticing. “Cycle syncing” for men is best understood as general rhythm awareness.' },
      { question: 'Do men have hormonal cycles?', answer: 'Men have daily hormonal rhythms (for example, testosterone tends to be higher in the morning), but not a monthly cycle. This page makes no hormonal or medical claims.' },
      { question: 'What is biorhythm’s role here?', answer: 'It’s a birth-date reflection prompt — a structured way to check in with your physical, emotional and mental state. It is not a validated predictor of anything.' },
      { question: 'How can men use rhythm awareness day to day?', answer: 'Notice your energy, protect your sleep and morning light, and do more demanding things when you feel resourced. Simple awareness, not a rigid schedule.' },
    ],
  },
  {
    slug: 'why-am-i-tired-some-days',
    seoTitle: 'Why Am I Tired Some Days and Not Others? | BornClock',
    seoDescription: 'Why do some days feel low-energy for no clear reason? An honest look at sleep, circadian rhythm and natural day-to-day variation — plus a birth-date rhythm check-in to notice your own pattern.',
    keywords: 'why am I tired some days, low energy some days, daily energy variation, tired for no reason',
    h1: 'Why Am I Tired Some Days and Not Others?',
    directAnswer: 'Day-to-day tiredness usually comes down to well-understood factors: sleep quantity and quality, your circadian rhythm and chronotype, stress, hydration, movement and what you ate. Natural variation is normal — not every low day has a dramatic cause. The rhythm check-in below is a light way to notice your own pattern over a week.',
    widgetVariant: 'energy',
    widgetCtaLabel: 'See my week →',
    isApp: false,
    sections: [
      {
        h2: 'What actually causes daily tiredness?',
        paragraphs: [
          'Most everyday energy swings trace back to sleep debt, circadian timing (being active against your natural chronotype), psychological stress, dehydration, low movement, blood-sugar swings, and simply the accumulated load of the week. Persistent or severe fatigue can have medical causes — thyroid, anaemia, sleep apnoea, depression and more — and is worth discussing with a doctor rather than a chart.',
          'It is also genuinely normal to have low days for no single reason. Bodies fluctuate. Expecting every day to feel identical sets you up to treat ordinary variation as a problem.',
        ],
      },
      {
        h2: 'Where rhythm awareness helps (and where it doesn’t)',
        paragraphs: [
          'A daily check-in can help you spot patterns and be kinder to yourself on low days — that is its real value. The biorhythm reading below offers one structured prompt for that reflection, but it cannot diagnose or explain your tiredness. It has not been found predictive in controlled research; use it only to notice, never to conclude.',
        ],
      },
    ],
    faqs: [
      { question: 'Why am I tired some days and full of energy on others?', answer: 'Mostly sleep, circadian timing, stress, hydration, movement and food — plus normal day-to-day variation. Not every low day has a single cause.' },
      { question: 'Is it normal to have random low-energy days?', answer: 'Yes. Natural fluctuation is normal. Persistent or severe fatigue, though, is worth checking with a doctor.' },
      { question: 'Can biorhythm explain why I’m tired?', answer: 'No. It’s a reflection prompt, not a diagnostic tool, and it hasn’t been found predictive. Use it to notice patterns, not to explain fatigue.' },
      { question: 'When should I see a doctor about tiredness?', answer: 'If fatigue is persistent, severe, or comes with other symptoms, see a healthcare professional — several treatable conditions can cause it.' },
    ],
  },
  {
    slug: 'best-time-to-work-out',
    seoTitle: 'Best Time to Work Out — What the Science Actually Says | BornClock',
    seoDescription: 'Morning or evening workouts? The honest answer: the best time is the one you’ll do consistently. A clear look at chronotype, consistency and sleep — with a rhythm check-in alongside.',
    keywords: 'best time to work out, morning vs evening workout, best time to exercise, workout timing science',
    h1: 'The Best Time to Work Out',
    directAnswer: 'The best time to work out is the time you’ll actually do consistently. Research shows people can adapt to training at most times of day, and consistency matters far more than the clock. Your chronotype (whether you’re a morning or evening person) and your sleep are the factors worth respecting — the rhythm check-in below sits alongside them as a light daily prompt.',
    widgetVariant: 'today',
    widgetCtaLabel: 'Check today’s rhythm →',
    isApp: false,
    sections: [
      {
        h2: 'Morning or evening — what does the science say?',
        paragraphs: [
          'The strongest, most repeatable finding is that consistency beats timing. Studies comparing morning and evening training show people can adapt to whichever they practise regularly, and adherence — actually turning up — is the biggest predictor of results. If mornings are the only time you’ll be reliable, mornings are your best time.',
          'Chronotype is real and worth respecting: some people are genuinely sharper and stronger-feeling later in the day, others early. And guard your sleep — training so late that it disrupts your rest usually isn’t worth it. These are the evidence-based levers.',
        ],
      },
      {
        h2: 'And the rhythm layer?',
        paragraphs: [
          'The biorhythm reading is not one of those levers, and this page won’t pretend otherwise. It has not been found predictive in controlled research. It sits alongside the real factors purely as a daily awareness prompt — a way to check in with how you feel before you decide, never a reason to skip a session or claim a performance edge.',
        ],
      },
    ],
    faqs: [
      { question: 'What is the best time of day to exercise?', answer: 'The time you’ll do consistently. Evidence shows people adapt to most training times, and adherence matters far more than the specific hour.' },
      { question: 'Are morning or evening workouts better?', answer: 'Neither is clearly superior for most goals. Respect your chronotype and protect your sleep, and pick the slot you’ll actually keep.' },
      { question: 'Does biorhythm tell me when to train?', answer: 'No. It’s a reflection prompt, not a validated timing tool. Use consistency, chronotype and sleep to decide; use the rhythm reading only to check in with how you feel.' },
      { question: 'Does working out late at night hurt sleep?', answer: 'For some people intense late exercise can disrupt sleep; for others it’s fine. If it affects your rest, shift it earlier — sleep is a genuine performance and health factor.' },
    ],
  },
  {
    slug: 'energy-forecast',
    seoTitle: 'Energy Forecast — Your 7-Day Rhythm Check-In | BornClock',
    seoDescription: 'When will you have energy this week? A birth-date rhythm check-in that outlines your next 7 days as a gentle awareness prompt — plus the real drivers of weekly energy. Not a prediction.',
    keywords: 'energy forecast, when will I have energy this week, weekly energy rhythm, biorhythm energy',
    h1: 'Your 7-Day Energy Forecast',
    directAnswer: 'This is a rhythm-awareness check-in, not a prediction. Enter your date of birth and it outlines the classic biorhythm cycles across your next 7 days, so you can use each day as a gentle prompt to notice your energy. Real weekly energy is driven far more by sleep, stress and recovery — hold the chart lightly.',
    widgetVariant: 'energy',
    widgetCtaLabel: 'Outline my week →',
    isApp: true,
    sections: [
      {
        h2: 'When will I have energy this week?',
        paragraphs: [
          'Honestly, your sleep this week will tell you more than any chart. Weekly energy tracks with how well and how much you’ve slept, your stress and workload, hydration, movement and recovery. If you want a real forecast, look at your sleep and your calendar.',
          'The rhythm outline below is a structured way to check in each morning — a prompt to ask “what do I have for today?” rather than a claim about what you’ll have. Many people find that small ritual useful regardless of what the numbers say.',
        ],
      },
      {
        h2: 'How to read the outline honestly',
        paragraphs: [
          'Treat “high” and “low” days as conversation starters with yourself, not instructions. The biorhythm model dates from the early 20th century and hasn’t been found predictive, so nothing here forecasts your actual energy. Use it to build the habit of checking in — that habit, not the chart, is the real benefit.',
        ],
      },
      {
        h2: 'How to read your 7 days',
        paragraphs: [
          'The outline marks three kinds of day, and each is a prompt rather than a prediction. On a peak day, the cycle is high — a fine cue to ask what you’d like to spend energy on, then check whether you actually feel up to it. On a low day, the cycle dips — treat it as a nudge to be a little kinder to yourself and to notice why you might feel flat, not as a verdict that you will.',
          'The most interesting marker is the critical day, when a cycle crosses its midline. These were traditionally framed as “unstable” days — but there is no evidence they carry any real risk, so read a critical day simply as a natural transition point: a good moment to pause and take stock. One honest action per state is plenty — lean into something demanding on a high, protect your rest on a low, and slow down to reflect on a crossing.',
        ],
      },
      {
        h2: 'The three cycles, and why those lengths',
        paragraphs: [
          'Classic biorhythm tracks three cycles counted from your birth date: a physical cycle of about 23 days, an emotional cycle of about 28 days, and an intellectual cycle of about 33 days. The physical cycle is the traditional stand-in for stamina and strength, the emotional cycle for mood and sensitivity, and the intellectual cycle for focus and mental sharpness.',
          'Those specific lengths come from the model’s early-1900s origins, not from anything measurable in the body — nothing physiological actually ticks on a rigid 23, 28 or 33-day schedule keyed to your birthday. We keep the cycles because they give the weekly check-in a shape, and we say plainly that the shape is arithmetic, not biology. The value is the ritual of looking, not the numbers themselves.',
        ],
      },
      {
        h2: 'Turn the week into a check-in you’ll keep',
        paragraphs: [
          'Here is the reframe that makes this worthwhile: use the outline as a daily journaling prompt. Each morning, glance at the day’s marker, then write one honest line — how is my energy right now, how did I sleep, what’s my stress like today? Over a few weeks those notes reveal real patterns from your own life, like dips after short-sleep nights, that no fixed cycle could have told you.',
          'Let a low marker be a question, not a sentence: am I actually low today, and if so, why — and is it something I can respond to? Used this way the forecast builds a genuinely useful habit of attention. It won’t change your body or predict your performance, and it isn’t a substitute for medical advice if fatigue persists — its entire, modest value is prompting you to notice.',
        ],
      },
    ],
    faqs: [
      { question: 'Can you forecast my energy for the week?', answer: 'Not literally — no chart can. This is a rhythm-awareness outline. Your sleep, stress and recovery are the real drivers of weekly energy.' },
      { question: 'What really affects my energy day to day?', answer: 'Sleep quantity and quality, circadian timing, stress, hydration, movement and food. These matter far more than any birth-date cycle.' },
      { question: 'What is a “critical” day, and should I worry?', answer: 'A critical day is just when a cycle crosses its midline. There’s no evidence it carries any real risk — read it as a natural transition point and a good moment to pause and take stock, nothing more.' },
      { question: 'How do I use this to plan my week?', answer: 'Lightly. Use the markers as prompts: lean into demanding tasks when you feel up to it, protect rest when you’re flat, and slow down to reflect on a crossing day. Your real schedule, sleep and energy always override the chart.' },
      { question: 'Is the biorhythm energy forecast accurate?', answer: 'No. It hasn’t been found predictive in controlled research. It’s useful only as a daily check-in prompt.' },
      { question: 'How can I actually have more energy this week?', answer: 'Prioritise consistent sleep, manage stress, move a little each day, hydrate and eat regularly. Simple, boring, and genuinely effective.' },
    ],
  },
];

export function getFitnessPage(slug: string): FitnessPage | undefined {
  return FITNESS_PAGES.find(p => p.slug === slug.toLowerCase());
}
