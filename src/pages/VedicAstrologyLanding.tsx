/**
 * Vedic Astrology category landing page (Part W) — /vedic-astrology.
 *
 * Part X/Y refactor: now rendered via the shared <CategoryLandingPage> template so all
 * four category pages (Vedic, Science, Birthday, Mystic) are one coherent family. Same
 * rendered output as the original Part W page. Real verified stats (Phase 0): 5 classical
 * yogas, 8 divisional charts, 14 Vedic tools. See docs/part-w-touchpoints.md.
 */
import { Moon } from 'lucide-react';
import { CategoryLandingPage, type CategoryLandingConfig } from '@/components/landing/CategoryLandingPage';

const CONFIG: CategoryLandingConfig = {
  seo: {
    title: 'Free Vedic Astrology — Kundali, Birth Chart & Dasha | BornClock',
    description: "Free Vedic astrology done right: a real sidereal Kundali (birth chart), Kundali matching, AI astrologer, Dasha timing, yogas and divisional charts — computed with the Swiss Ephemeris, not guessed. 14 tools in one place.",
    keywords: 'vedic astrology, free kundali, birth chart, janam kundali, kundali matching, dasha, nakshatra, moon sign, sidereal astrology, ashtakoota',
    canonicalUrl: '/vedic-astrology',
  },
  schema: {
    name: 'BornClock Vedic Astrology',
    description: 'Free Vedic astrology tools — real sidereal Kundali, Kundali matching, AI astrologer, Dasha timing, yogas and divisional charts, computed with the Swiss Ephemeris.',
    url: '/vedic-astrology',
  },
  testid: 'vedic',
  badge: { label: 'Vedic astrology', icon: Moon },
  headline: { lead: 'Most Kundali generators guess.', accent: 'Ours computes.' },
  directAnswer: "BornClock's Vedic astrology is a free suite of birth-chart tools that use real sidereal (Lahiri) astronomy — a genuine Kundali, Kundali matching, an AI astrologer, Dasha timing, classical yogas and divisional charts — rigorously tested against birth charts spanning over a century, cross-verified against independent professional platforms for accuracy.",
  cta: { label: 'Get my free Kundali', to: '/kundali' },
  savedProfileHintTo: '/kundali',
  stats: [
    { value: 5, label: 'Classical yogas detected' },
    { value: 8, label: 'Divisional charts computed' },
    { value: 14, label: 'Vedic tools, all in one place' },
  ],
  tiers: [
    { key: 'core', heading: 'Your core chart', variant: 'flagship', tools: [
      { to: '/kundali', emoji: '🪔', name: 'Free Kundali', desc: 'Your full Vedic birth chart — planets, houses, Nakshatra and Vimshottari Dasha, precisely computed with the Swiss Ephemeris.' },
      { to: '/kundali-match', emoji: '💑', name: 'Kundali Matching', desc: 'Ashtakoota (Guna Milan) compatibility between two charts, with the real point-by-point breakdown.' },
      { to: '/astrologer', emoji: '💬', name: 'Ask an Astrologer (AI)', desc: 'A private, judgment-free conversation grounded in your own birth chart — traditional guidance, offered gently.' },
    ] },
    { key: 'timing', heading: 'Timing and life guidance', variant: 'medium', tools: [
      { to: '/sade-sati', emoji: '🪐', name: 'Sade Sati Calculator' },
      { to: '/muhurat', emoji: '🗓️', name: 'Muhurat Finder' },
      { to: '/career-report', emoji: '💼', name: 'Career Analysis' },
      { to: '/gemstones', emoji: '💍', name: 'Gemstone Suggestions' },
    ] },
    { key: 'signs', heading: 'Signs and compatibility', variant: 'dense', tools: [
      { to: '/zodiac', emoji: '♈', name: 'Western Zodiac' },
      { to: '/chinese-zodiac', emoji: '🐉', name: 'Chinese Zodiac' },
      { to: '/vedic-zodiac', emoji: '🕉️', name: 'Indian Zodiac (Vedic)' },
      { to: '/moon-sign', emoji: '🌙', name: 'Moon Sign Calculator' },
      { to: '/compatibility', emoji: '💕', name: 'Compatibility Calculator' },
      { to: '/sun-vs-moon-sign', emoji: '☀️', name: 'Sun Sign vs Moon Sign' },
      { to: '/rashi-ratna', emoji: '💎', name: 'Rashi Ratna' },
    ] },
  ],
  closing: (
    <p className="text-base md:text-lg text-foreground leading-relaxed">
      We detect real classical planetary combinations (yogas), compute your exact
      Dasha timing down to the month, and never guess where a shortcut would do.
      <strong className="text-indigo-700"> This isn't a horoscope. It's your actual birth chart, done right.</strong>
    </p>
  ),
};

export default function VedicAstrologyLanding() {
  return <CategoryLandingPage config={CONFIG} />;
}
