/**
 * B21 (SEO): the core free tools, linked from EVERY page's footer so each hub is one click from
 * anywhere on the site. Search Console showed most hubs as "Discovered – currently not indexed":
 * Google knew them from the sitemap but saw few internal links pointing at them.
 */
export const POPULAR_TOOLS: Array<{ label: string; to: string }> = [
  { label: 'Free Kundli', to: '/kundali/' },
  { label: 'Kundli Matching', to: '/kundali-match/' },
  { label: 'Today’s Rashifal', to: '/rashifal/' },
  { label: 'Today’s Panchang', to: '/panchang/' },
  { label: 'Nakshatras', to: '/nakshatra/' },
  { label: 'Planets in houses', to: '/planet-in-house/' },
  { label: 'Dasha calculator', to: '/dasha-calculator/' },
  { label: 'Sade Sati', to: '/sade-sati/' },
  { label: 'Manglik Dosha', to: '/manglik/' },
  { label: 'Lal Kitab', to: '/lal-kitab/' },
  { label: 'Varshphal', to: '/varshphal/' },
  { label: 'Muhurat', to: '/muhurat/' },
  { label: 'Prashna (horary)', to: '/prashna/' },
  { label: 'Numerology', to: '/numerology/' },
  { label: 'Astrology glossary', to: '/glossary/' },
];
