/**
 * Science & Longevity category landing page (Part Y) — /science-longevity.
 * Renders via the shared <CategoryLandingPage> template (same family as Part W).
 * Exact approved hero copy. Real verified stats (Phase 0): the longevity model surfaces
 * 14 factors across 20 health/lifestyle inputs (so "15+" is honest), the country
 * comparison covers 54 countries (BIRTH_BASELINES — NOT the site's stale "57" copy),
 * and 3 real data sources (UN, WHO, GBD). See docs/part-x-flags.md.
 */
import { Activity } from 'lucide-react';
import { CategoryLandingPage, type CategoryLandingConfig } from '@/components/landing/CategoryLandingPage';

const CONFIG: CategoryLandingConfig = {
  seo: {
    title: 'Life Expectancy & Longevity — A Real Statistical Model | BornClock',
    description: 'Not a guess, not a horoscope — a real actuarial-style life-expectancy model factoring your exercise, stress, diet, sleep and 15+ health variables, benchmarked against UN, WHO and GBD data across 54 countries. See exactly which factors move your number.',
    keywords: 'life expectancy calculator, longevity, biological age, how long will i live, actuarial life expectancy, life expectancy by country, healthspan',
    canonicalUrl: '/science-longevity',
  },
  schema: {
    name: 'BornClock Science & Longevity',
    description: 'A real statistical life-expectancy and biological-age model benchmarked against UN, WHO and GBD population data — shows which health factors move your life expectancy and where each number comes from.',
    url: '/science-longevity',
  },
  testid: 'science',
  badge: { label: 'Science & Longevity', icon: Activity },
  headline: { lead: 'Not a guess.', accent: 'Not a horoscope.' },
  directAnswer: "A real statistical model, built the way actuaries do it — factoring in your exercise habits, stress levels, diet, sleep, and 15+ other real health variables, benchmarked against population data from the UN, WHO, and global health studies covering millions of real lives across 54 countries. Exercise regularly? That's +2.3 years. Chronic stress? That's real too, and we'll show you the number. See exactly which factors move your life expectancy — and exactly where every number comes from.",
  cta: { label: 'See my life expectancy', to: '/life-expectancy' },
  savedProfileHintTo: '/life-expectancy',
  stats: [
    { value: 15, suffix: '+', label: 'Health factors considered' },
    { value: 54, label: 'Countries in the comparison data' },
    { value: 3, label: 'Real data sources (UN · WHO · GBD)' },
  ],
  tiers: [
    { key: 'core', heading: 'Core tools', variant: 'flagship', tools: [
      { to: '/life-expectancy', emoji: '❤️', name: 'Life Expectancy', desc: 'A real statistical forecast from your exercise, stress, diet, sleep and 15+ health variables — with every factor and its source shown.' },
      { to: '/biological-age', emoji: '🧬', name: 'Biological Age', desc: 'Is your body younger or older than your birthday? A WHO-aligned, evidence-based estimate from your real habits.' },
    ] },
    { key: 'supporting', heading: 'Go deeper', variant: 'medium', tools: [
      { to: '/coach', emoji: '🧘', name: 'Longevity Coach' },
      { to: '/country-comparison', emoji: '🌍', name: 'Country Comparison (54 countries)' },
    ] },
  ],
  closing: (
    <div className="space-y-2">
      <p className="text-base md:text-lg text-foreground leading-relaxed">
        Every number here is traceable. Our model is benchmarked against UN, WHO and
        Global Burden of Disease (GBD) population data, and each factor shows its
        published source.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        This is a statistical estimate for reflection and planning — not a medical
        prediction or diagnosis, and not a guarantee. It shows how population-level
        research maps onto your habits, so you can see which changes move the number most.
      </p>
    </div>
  ),
};

export default function ScienceLongevityLanding() {
  return <CategoryLandingPage config={CONFIG} />;
}
