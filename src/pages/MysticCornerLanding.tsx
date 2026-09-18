/**
 * Mystic Corner category landing page (Part AA) — /mystic-corner.
 * Shared <CategoryLandingPage> template. Exact approved hero copy (rebuilt final
 * version). DELIBERATELY lighter-weight, framed around cultural longevity / tradition —
 * NO "precisely computed" / "rigorously verified" language (reserved for Vedic Astrology).
 * Smallest category: 3 core tools only, NOT padded. Honest 2-stat strip (no false
 * precision — the tarot tool maps 12 life-path cards, so no "78 cards" claim).
 */
import { Sparkles } from 'lucide-react';
import { CategoryLandingPage, type CategoryLandingConfig } from '@/components/landing/CategoryLandingPage';

const CONFIG: CategoryLandingConfig = {
  seo: {
    title: 'Mystic Corner — Numerology, Name Numerology & Tarot | BornClock',
    description: 'Discover your Life Path number, your name numerology, and the tarot card tied to your birthday. Traditions that cultures worldwide have found meaning in for thousands of years — explore what yours reveals.',
    keywords: 'numerology, life path number, name numerology, tarot by birthday, birthday tarot card, numerology by date of birth',
    canonicalUrl: '/mystic-corner',
  },
  schema: {
    name: 'BornClock Mystic Corner',
    description: 'Numerology, name numerology and birthday tarot — traditions of meaning drawn from thousands of years of cultural practice.',
    url: '/mystic-corner',
  },
  testid: 'mystic',
  badge: { label: 'Mystic Corner', icon: Sparkles },
  headline: { lead: 'Your birthday carries a number.', accent: 'Your name carries a code.' },
  directAnswer: 'For thousands of years, cultures across the world have found meaning in exactly these patterns — long before charts and algorithms existed. Discover your Life Path number, your birthday’s tarot card, and what centuries of tradition say about who you are. Curious what yours reveals?',
  cta: { label: 'Discover my Life Path number', to: '/numerology' },
  savedProfileHintTo: '/numerology',
  stats: [
    { value: 3, label: 'Traditions of meaning, in one place' },
    { value: 9, label: 'Life Path numbers to discover' },
  ],
  tiers: [
    { key: 'core', heading: 'Explore your patterns', variant: 'flagship', tools: [
      { to: '/numerology', emoji: '🔢', name: 'Numerology', desc: 'Your Life Path number and what a tradition thousands of years old associates with it.' },
      { to: '/name-numerology', emoji: '✍️', name: 'Name Numerology', desc: 'The number your name adds up to, read through the classic Chaldean and Pythagorean systems.' },
      { to: '/tarot-card-by-birthday', emoji: '🃏', name: 'Tarot by Birthday', desc: 'The tarot card traditionally tied to your birth date, and the meaning it has carried for centuries.' },
    ] },
  ],
  closing: (
    <p className="text-base md:text-lg text-foreground leading-relaxed">
      These are traditions of reflection, not prediction — patterns people have turned to
      for meaning across many cultures and many centuries.
      <strong className="text-indigo-700"> Take them as a mirror for thinking about yourself, and see what resonates.</strong>
    </p>
  ),
};

export default function MysticCornerLanding() {
  return <CategoryLandingPage config={CONFIG} />;
}
