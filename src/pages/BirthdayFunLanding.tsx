/**
 * Birthday Fun & Celebrity Twins category landing page (Part Z) — /birthday-fun.
 * Shared <CategoryLandingPage> template. Exact approved hero copy (NO "waste your time"
 * framing — explicitly rejected). Real verified celebrity count: celebrities.json holds
 * 3,107 entries → "3,000+" (the Part V-resolved number, not the stale "50,000+").
 * 7 tools in this category.
 */
import { Cake } from 'lucide-react';
import { CategoryLandingPage, type CategoryLandingConfig } from '@/components/landing/CategoryLandingPage';

const CONFIG: CategoryLandingConfig = {
  seo: {
    title: 'Birthday Fun & Celebrity Twins — Who Shares Your Birthday | BornClock',
    description: "Find your celebrity birthday twin and the real depth most sites skip — their Nakshatra, zodiac sign and numerology. See who's celebrating today, your exact age to the second, planetary age and more. 3,000+ celebrities.",
    keywords: 'celebrity birthday twin, who shares my birthday, famous birthdays today, age calculator, age in seconds, planetary age, birthday countdown',
    canonicalUrl: '/birthday-fun',
  },
  schema: {
    name: 'BornClock Birthday Fun & Celebrity Twins',
    description: "Find your celebrity birthday twin with real depth — Nakshatra, zodiac and numerology — plus today's birthdays, exact age tools and planetary age. 3,000+ celebrities.",
    url: '/birthday-fun',
  },
  testid: 'birthday',
  badge: { label: 'Birthday Fun & Celebrity Twins', icon: Cake },
  headline: { lead: '3,000+ celebrities, and', accent: 'real depth most sites skip.' },
  directAnswer: "Not just who shares your birthday — their actual Nakshatra, their zodiac sign, their numerology. See who's celebrating today, check back daily, and discover connections nobody else shows you. Your age, down to the second. Your birthday twin, waiting to be found.",
  cta: { label: 'Find my birthday twin', to: '/celebrity-birthday' },
  savedProfileHintTo: '/celebrity-birthday',
  stats: [
    { value: 3000, suffix: '+', label: 'Celebrities in the database' },
    { value: 7, label: 'Birthday & age tools' },
    { value: 366, label: 'Days of birthdays covered' },
  ],
  tiers: [
    { key: 'core', heading: 'Start here', variant: 'flagship', tools: [
      { to: '/age-calculator', emoji: '⏰', name: 'Age Calculator', desc: 'Your exact age — years, days, hours, right down to the second, updating live.' },
      { to: '/celebrity-birthday', emoji: '🌟', name: 'Celebrity Match', desc: 'Find the famous faces who share your birthday — with their real Nakshatra, zodiac and numerology.' },
      { to: '/todays-birthdays', emoji: '🎂', name: "Today's Birthdays", desc: "See who's celebrating today, and check back daily for a fresh cast of famous birthdays." },
    ] },
    { key: 'supporting', heading: 'More birthday tools', variant: 'medium', tools: [
      { to: '/birthday-countdown', emoji: '🎉', name: 'Birthday Countdown' },
      { to: '/age-in-days', emoji: '📅', name: 'Age in Days' },
      { to: '/age-in-seconds', emoji: '⏱️', name: 'Age in Seconds' },
      { to: '/planetary-age', emoji: '🌏', name: 'Planetary Age' },
    ] },
  ],
  closing: (
    <p className="text-base md:text-lg text-foreground leading-relaxed">
      Most birthday sites stop at a name and a photo. We go further — the Nakshatra,
      zodiac and numerology behind every celebrity twin, your age to the exact second,
      and a fresh set of birthdays every single day.
      <strong className="text-indigo-700"> Come find who you share your day with.</strong>
    </p>
  ),
};

export default function BirthdayFunLanding() {
  return <CategoryLandingPage config={CONFIG} />;
}
